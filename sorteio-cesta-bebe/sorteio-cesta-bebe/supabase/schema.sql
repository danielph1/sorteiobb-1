-- BASE COMPLETA PARA UM NOVO PROJETO SUPABASE.
-- SE O BANCO SORTEIODEBEBE JA EXISTE, NAO EXECUTE ESTE ARQUIVO:
-- EXECUTE APENAS supabase/migracao-v3-sorteio-unico.sql NO BANCO EXISTENTE.
create extension if not exists pgcrypto;
create table if not exists public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 username text not null, name text not null default '', role text not null default 'admin',
 last_login timestamptz, created_at timestamptz not null default now()
);
create sequence if not exists public.entry_seq;
create table if not exists public.entries (
 id bigint generated always as identity primary key,
 protocol text not null unique,
 raffle_number int not null unique check(raffle_number between 0 and 99999),
 full_name text not null, cpf text not null unique, phone text not null,
 email text, city text not null, state text not null,
 gestation_weeks int not null check(gestation_weeks between 1 and 45), due_date date,
 formal_job boolean not null, discovery_source text,
 privacy_consent boolean not null default false,
 marketing_consent boolean not null default false,
 whatsapp_confirmation_consent boolean not null default false,
 source text,
 status text not null default 'pendente' check(status in ('pendente','validada','invalidada')),
 notes text, phone_fix text, created_at timestamptz not null default now()
);
create index if not exists entries_created_at_idx on public.entries (created_at desc);
create index if not exists entries_status_idx on public.entries(status);
create table if not exists public.draws (
 id int primary key default 1 check(id=1), slug text not null default 'cesta-bebe',
 title text not null default 'SORTEIO de prêmios para o seu bebê.',
 subtitle text not null default 'Preencha o cadastro gratuitamente, receba seu número na hora e concorra a uma ajudinha carinhosa para o começo dessa nova fase.',
 prize_title text not null default 'Cesta para bebê', prize_description text, prize_image_url text,
 status text not null default 'open' check(status in ('open','closed','published')),
 registration_closes_at timestamptz,
 rules_notes text not null default 'Participação gratuita e exclusiva para gestantes. Uma inscrição por CPF. Um único sorteio e uma única cesta como prêmio. Um número vencedor calculado a partir do concurso da Loteria Federal indicado pela organização, conforme regulamento.',
 calc_mode text not null default 'soma_modulo' check(calc_mode in ('soma_modulo','primeira_dezena')),
 federal_concurso int, federal_dezenas text[], federal_data date, synced_at timestamptz,
 winning_number int, winner_entry_id bigint references public.entries(id) on delete set null,
 published_at timestamptz, auto_publish boolean not null default true
);
insert into public.draws(id) values(1) on conflict do nothing;
create table if not exists public.federal_history (
 concurso int primary key, data date, dezenas text[] not null, consultado_em timestamptz not null default now()
);
create table if not exists public.settings (
 id int primary key default 1 check(id=1), site_name text not null default 'Sorteio Cesta Bebê',
 meta_pixel_id text default '', whatsapp_number text default '',
 whatsapp_message text default 'Olá! Fiz minha inscrição no Sorteio Cesta Bebê.',
 instagram text default '', contact_email text default '', contact_phone text not null default '', show_contact_email boolean not null default false, show_contact_phone boolean not null default false, prize_image_url text default '', hero_image_url text default '', prizes jsonb not null default '[{"title":"Cesta Bebê Completa","description":"Cesta para os primeiros cuidados.","image":"/media/cesta-maternidade.webp"},{"title":"Kit Enxoval Conforto","description":"Itens de enxoval.","image":"/media/enxoval.webp"},{"title":"Kit Higiene e Cuidados","description":"Itens de higiene.","image":"/media/cuidados.webp"},{"title":"Kit Roupinhas do Bebê","description":"Roupinhas.","image":"/media/roupinhas.webp"},{"title":"Kit Diversão e Estímulo","description":"Brinquedos.","image":"/media/brinquedos.webp"}]'::jsonb
);
insert into public.settings(id) values(1) on conflict do nothing;
create table if not exists public.audit_log (
 id bigint generated always as identity primary key, "when" timestamptz not null default now(),
 who text, action text not null, details jsonb
);
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.admin_users where user_id=auth.uid());
$$;
create or replace function public.valid_cpf(p text) returns boolean
language plpgsql immutable as $$
declare d text:=regexp_replace(coalesce(p,''),'\D','','g');s int;r int;i int;
begin
 if length(d)<>11 or d~'^(\d)\1{10}$' then return false;end if;
 s:=0;for i in 1..9 loop s:=s+substr(d,i,1)::int*(11-i);end loop;
 r:=(s*10)%11;if r=10 then r:=0;end if;if r<>substr(d,10,1)::int then return false;end if;
 s:=0;for i in 1..10 loop s:=s+substr(d,i,1)::int*(12-i);end loop;
 r:=(s*10)%11;if r=10 then r:=0;end if;return r=substr(d,11,1)::int;
end $$;
create or replace function public.admin_who() returns text
language sql stable security definer set search_path=public as $$
 select coalesce((select username from public.admin_users where user_id=auth.uid()),'sistema');
$$;
create or replace function public.register_entry(p jsonb) returns jsonb
language plpgsql security definer set search_path=public,extensions,pg_catalog as $$
declare
 v_cpf text:=regexp_replace(coalesce(p->>'cpf',''),'\D','','g');
 v_phone text:=regexp_replace(coalesce(p->>'phone',''),'\D','','g');
 v_name text:=btrim(regexp_replace(coalesce(p->>'full_name',''),'\s+',' ','g'));
 v_email text:=nullif(btrim(coalesce(p->>'email','')),'');
 v_weeks int; v_due date; v_draw public.draws; v_existing public.entries;
 v_num int; v_prot text; v_try int:=0;
begin
 select * into v_draw from public.draws where id=1;
 if v_draw.status<>'open' or (v_draw.registration_closes_at is not null and now()>v_draw.registration_closes_at) then
  raise exception 'Inscrições encerradas.' using errcode='P0001';end if;
 select * into v_existing from public.entries where cpf=v_cpf;
 if found then return jsonb_build_object('existing',true,'raffle_number',v_existing.raffle_number,'protocol',v_existing.protocol);end if;
 if array_length(regexp_split_to_array(v_name,' '),1)<2 then raise exception 'Informe nome e sobrenome.' using errcode='P0001';end if;
 if not public.valid_cpf(v_cpf) then raise exception 'CPF inválido.' using errcode='P0001';end if;
 if length(v_phone)<10 then raise exception 'WhatsApp com DDD inválido.' using errcode='P0001';end if;
 if v_email is not null and v_email!~*'^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'E-mail inválido.' using errcode='P0001';end if;
 if coalesce(btrim(p->>'city'),'')='' then raise exception 'Informe a cidade.' using errcode='P0001';end if;
 if coalesce(p->>'state','')!~'^[A-Z]{2}$' then raise exception 'Informe o estado.' using errcode='P0001';end if;
 begin v_weeks:=(p->>'gestation_weeks')::int; exception when others then v_weeks:=null;end;
 if v_weeks is null or v_weeks<1 or v_weeks>45 then raise exception 'Semanas de gestação: de 1 a 45.' using errcode='P0001';end if;
 begin v_due:=nullif(p->>'due_date','')::date; exception when others then raise exception 'Data prevista do parto inválida.' using errcode='P0001';end;
 if (p->>'formal_job') is null then raise exception 'Responda se trabalha de carteira assinada.' using errcode='P0001';end if;
 if coalesce((p->>'privacy_consent')::boolean,false)=false then raise exception 'É preciso aceitar o regulamento.' using errcode='P0001';end if;
 if (select count(*) from public.entries)>=100000 then raise exception 'Todos os números já foram distribuídos.' using errcode='P0001';end if;
 loop
  v_try:=v_try+1;v_num:=floor(random()*100000)::int;
  exit when not exists(select 1 from public.entries where raffle_number=v_num);
  if v_try>500 then raise exception 'Tente novamente.' using errcode='P0001';end if;
 end loop;
 v_prot:='SB'||to_char(now() at time zone 'America/Sao_Paulo','YYYY')||lpad(nextval('public.entry_seq')::text,5,'0')||upper(substr(encode(gen_random_bytes(2),'hex'),1,4));
 begin
 insert into public.entries(protocol,raffle_number,full_name,cpf,phone,email,city,state,gestation_weeks,due_date,formal_job,discovery_source,privacy_consent,marketing_consent,whatsapp_confirmation_consent,source)
 values(v_prot,v_num,v_name,v_cpf,v_phone,v_email,btrim(p->>'city'),p->>'state',v_weeks,v_due,(p->>'formal_job')::boolean,nullif(p->>'discovery_source',''),true,coalesce((p->>'marketing_consent')::boolean,false),coalesce((p->>'whatsapp_confirmation_consent')::boolean,false),left(coalesce(nullif(p->>'source',''),'acesso direto'),300));
 exception when unique_violation then
 select * into v_existing from public.entries where cpf=v_cpf;
 if found then return jsonb_build_object('existing',true,'raffle_number',v_existing.raffle_number,'protocol',v_existing.protocol);end if;
 raise exception 'Tente novamente.' using errcode='P0001';
 end;
 insert into public.audit_log(who,action,details) values('site','entry.create',jsonb_build_object('protocol',v_prot));
 return jsonb_build_object('existing',false,'raffle_number',v_num,'protocol',v_prot);
end $$;
create or replace function public.public_status() returns jsonb
language sql stable security definer set search_path=public as $$
 select jsonb_build_object('status',d.status,'registration_closes_at',d.registration_closes_at,
 'rules_notes',d.rules_notes,'calc_mode',d.calc_mode,
 'federal_concurso',case when d.status='published' then d.federal_concurso end,
 'federal_dezenas',case when d.status='published' then d.federal_dezenas end,
 'federal_data',case when d.status='published' then d.federal_data end,
 'winning_number',case when d.status='published' then d.winning_number end,
 'published_at',d.published_at,'title',d.title,'subtitle',d.subtitle,'prize_title',d.prize_title,
 'settings',(select (to_jsonb(s)-'id'-'contact_email'-'contact_phone') || jsonb_build_object('contact_email', case when s.show_contact_email then s.contact_email else '' end, 'contact_phone', case when s.show_contact_phone then s.contact_phone else '' end) from public.settings s where s.id=1)) from public.draws d where d.id=1;
$$;
create or replace function public.lookup_protocol(p_protocol text) returns jsonb
language plpgsql stable security definer set search_path=public as $$
declare e public.entries;d public.draws;
begin
 select * into e from public.entries where protocol=upper(btrim(p_protocol));
 if not found then return jsonb_build_object('found',false);end if;
 select * into d from public.draws where id=1;
 return jsonb_build_object('found',true,'raffle_number',e.raffle_number,'first_name',split_part(e.full_name,' ',1),'published',d.status='published','winner',d.status='published' and d.winner_entry_id=e.id);
end $$;
create or replace function public.audit_entries() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if tg_op='UPDATE' then insert into public.audit_log(who,action,details) values(public.admin_who(),'entry.update',jsonb_build_object('protocol',new.protocol,'status',new.status));return new;
 elsif tg_op='DELETE' then insert into public.audit_log(who,action,details) values(public.admin_who(),'entry.remove',jsonb_build_object('protocol',old.protocol));return old;end if;
 return null;
end $$;
drop trigger if exists entries_audit on public.entries;
create trigger entries_audit after update or delete on public.entries for each row execute function public.audit_entries();
alter table public.entries enable row level security;
alter table public.draws enable row level security;
alter table public.federal_history enable row level security;
alter table public.settings enable row level security;
alter table public.audit_log enable row level security;
alter table public.admin_users enable row level security;
do $$ declare t text;begin
 foreach t in array array['entries','draws','federal_history','settings','audit_log'] loop
 execute format('drop policy if exists admin_all on public.%I',t);
 execute format('create policy admin_all on public.%I for all to authenticated using(public.is_admin()) with check(public.is_admin())',t);
 end loop;
end $$;
drop policy if exists admin_read on public.admin_users;
create policy admin_read on public.admin_users for select to authenticated using(public.is_admin());
drop policy if exists self_touch on public.admin_users;
create policy self_touch on public.admin_users for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant execute on function public.register_entry(jsonb) to anon,authenticated;
grant execute on function public.public_status() to anon,authenticated;
grant execute on function public.lookup_protocol(text) to anon,authenticated;
revoke execute on function public.is_admin() from anon;
-- Banco novo: as configurações da cesta e os contatos opcionais já estão incluídos.
-- Banco V2 já existente: execute somente supabase/migracao-v3-sorteio-unico.sql.
-- PRIMEIRO ADMIN: adicione usuário em Authentication > Users; depois:
-- insert into public.admin_users(user_id,username,name)
-- select id,email,'Organização' from auth.users where email='SEU_EMAIL@exemplo.com';
