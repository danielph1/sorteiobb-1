-- SORTEIO CESTA BEBÊ — MIGRAÇÃO V3: SOMENTE UM SORTEIO E UM GANHADOR
-- Para o Supabase já utilizado na V2/V2.1. Não altera entries, auth.users nem admin_users.
-- Execute ANTES do deploy V3, no SQL Editor do projeto do sorteio.
-- Se já houver resultado publicado, esta migração INTERROMPE para preservar o histórico.

begin;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.draws WHERE status = 'published') THEN
    RAISE EXCEPTION 'Existe resultado já publicado. Revise o sorteio publicado antes de migrar; nenhum dado foi alterado.';
  END IF;
END $$;

-- Mantém os dados opcionais e as imagens já configuradas no painel.
alter table public.settings
  add column if not exists contact_phone text not null default '',
  add column if not exists show_contact_email boolean not null default false,
  add column if not exists show_contact_phone boolean not null default false,
  add column if not exists prizes jsonb not null default '[
    {"title":"Cesta Bebê Completa","description":"Uma cesta especial com itens para os primeiros cuidados.","image":"/media/cesta-maternidade.webp"},
    {"title":"Kit Enxoval Conforto","description":"Mantas, toalhas e peças macias para o bebê.","image":"/media/enxoval.webp"},
    {"title":"Kit Higiene e Cuidados","description":"Acessórios delicados para a rotina de cuidados.","image":"/media/cuidados.webp"},
    {"title":"Kit Roupinhas do Bebê","description":"Peças confortáveis para os primeiros meses.","image":"/media/roupinhas.webp"},
    {"title":"Kit Diversão e Estímulo","description":"Brinquedos apropriados para a primeira infância.","image":"/media/brinquedos.webp"}
  ]'::jsonb;

-- Descarta somente a apuração preliminar da versão de cinco colocações.
-- Cadastros, números de inscrição, protocolos, usuários e histórico federal permanecem.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'draws' AND column_name = 'ranked_results'
  ) THEN
    EXECUTE $stmt$
      update public.draws
      set winning_number = null, winner_entry_id = null, federal_dezenas = null,
          federal_data = null, synced_at = null, published_at = null
      where status <> 'published' and jsonb_array_length(coalesce(ranked_results,'[]'::jsonb)) > 0
    $stmt$;
  END IF;
END $$;

alter table public.draws drop column if exists ranked_results;

-- A regra existente por padrão é UM único vencedor.
-- O método pode ser escolhido no painel; não há rankings ou múltiplos sorteios.
update public.draws
set rules_notes = 'Participação gratuita e exclusiva para gestantes. Uma inscrição por CPF. Cada participante recebe um número único de 00000 a 99999. Há um único sorteio e uma única cesta como prêmio. O número vencedor é calculado a partir de um concurso da Loteria Federal pelo método informado pela organização no regulamento. Números não atribuídos a inscrições válidas não geram contemplado. Confira a data de encerramento, a composição da cesta e todas as condições antes da divulgação.'
where id = 1 and rules_notes in (
  'Cada participante recebe um número de 00000 a 99999. O número sorteado é calculado a partir do resultado da Loteria Federal do concurso indicado. Participação gratuita e exclusiva para gestantes. Uma inscrição por CPF.',
  'Participação gratuita e exclusiva para gestantes. Uma inscrição por CPF. Cada participante recebe um número de 00000 a 99999. O resultado utiliza os cinco prêmios do concurso da Loteria Federal indicado pela organização: o 1º colocado corresponde aos cinco últimos dígitos do 1º prêmio da Federal, e assim sucessivamente até o 5º. Números sem inscrição válida não geram contemplado para aquela colocação. Quando dois prêmios da Federal terminarem com os mesmos cinco dígitos, a inscrição poderá ser contemplada somente na primeira colocação. Confirme os itens de cada prêmio, data, critérios de elegibilidade e condições completas antes da divulgação.'
);

-- Corrige também a busca por gen_random_bytes dentro de register_entry.
create extension if not exists pgcrypto;
alter function public.register_entry(jsonb) set search_path = public, extensions, pg_catalog;

-- API pública: um único número, sem ranked_results.
-- Os contatos opcionais não são expostos caso a organização os mantenha ocultos.
create or replace function public.public_status() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'status', d.status,
    'registration_closes_at', d.registration_closes_at,
    'rules_notes', d.rules_notes,
    'calc_mode', d.calc_mode,
    'federal_concurso', case when d.status = 'published' then d.federal_concurso end,
    'federal_data', case when d.status = 'published' then d.federal_data end,
    'winning_number', case when d.status = 'published' then d.winning_number end,
    'published_at', d.published_at,
    'title', d.title, 'subtitle', d.subtitle, 'prize_title', d.prize_title,
    'settings', (select (to_jsonb(s) - 'id' - 'contact_email' - 'contact_phone') || jsonb_build_object(
      'contact_email', case when s.show_contact_email then s.contact_email else '' end,
      'contact_phone', case when s.show_contact_phone then s.contact_phone else '' end
    ) from public.settings s where s.id = 1)
  ) from public.draws d where d.id = 1;
$$;

-- Consulta individual: só o número atribuído como vencedor no sorteio único.
create or replace function public.lookup_protocol(p_protocol text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare e public.entries; d public.draws;
begin
  select * into e from public.entries where protocol = upper(btrim(p_protocol));
  if not found then return jsonb_build_object('found', false); end if;
  select * into d from public.draws where id = 1;
  return jsonb_build_object(
    'found', true,
    'raffle_number', e.raffle_number,
    'first_name', split_part(e.full_name, ' ', 1),
    'published', d.status = 'published',
    'winner', d.status = 'published' and d.winner_entry_id = e.id and e.status <> 'invalidada'
  );
end $$;

revoke execute on function public.public_status() from public;
revoke execute on function public.lookup_protocol(text) from public;
grant execute on function public.public_status() to anon, authenticated;
grant execute on function public.lookup_protocol(text) to anon, authenticated;

commit;

-- Após executar, confirme:
-- SELECT id, status, calc_mode, winning_number, winner_entry_id FROM public.draws WHERE id = 1;
-- SELECT * FROM public.public_status();
