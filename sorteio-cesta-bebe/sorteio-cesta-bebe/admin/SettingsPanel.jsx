import { useEffect, useState } from 'react';
import { supabase, errMsg } from '../lib/supabase.js';
import { callApi, audit } from '../lib/api.js';
import { fmtDateTime } from '../lib/format.js';
import { toast } from '../components/Toast.jsx';
import { useSite } from '../lib/site.jsx';
import { DEFAULT_PRIZES, getPrizes } from '../lib/prizes.js';

const FIELDS = [
  ['site_name', 'Nome do sorteio'],
  ['meta_pixel_id', 'Pixel da Meta (ID)'],
  ['whatsapp_number', 'WhatsApp da organização (com DDD, usado após inscrição)'],
  ['whatsapp_message', 'Mensagem padrão do WhatsApp'],
  ['instagram', 'Instagram (opcional)'],
  ['prize_image_url', 'URL da imagem do prêmio principal (opcional)'],
  ['hero_image_url', 'URL da imagem no topo (opcional)'],
];

export default function SettingsPanel({ admin }) {
  const { reload } = useSite();
  const [s, setS] = useState(null);
  const [pw, setPw] = useState({ a: '', b: '' });
  const [users, setUsers] = useState([]);
  const [nu, setNu] = useState({ email: '', name: '', password: '' });
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState('');
  const [loadError, setLoadError] = useState('');

  async function loadUsers() {
    try { const r = await callApi('/api/admin-users'); setUsers(r.users || []); }
    catch {
      const { data } = await supabase.from('admin_users').select('username,name,role,last_login,created_at').order('created_at');
      setUsers(data || []);
    }
  }
  useEffect(() => {
    supabase.from('settings').select('*').eq('id', 1).single().then(({ data, error }) => {
      if (error) setLoadError(errMsg(error)); else setS(data);
    });
    supabase.from('audit_log').select('*').order('when', { ascending: false }).limit(60).then(({ data }) => setLog(data || []));
    loadUsers();
  }, []);

  const set = (key, value) => setS((current) => ({ ...current, [key]: value }));
  const prizes = getPrizes(s || {});
  const setPrize = (i, key, value) => set('prizes', prizes.map((p, n) => n === i ? { ...p, [key]: value } : p));

  async function save(e) {
    e.preventDefault();
    setBusy('s');
    const { id, ...vals } = s;
    const { error } = await supabase.from('settings').update(vals).eq('id', 1);
    setBusy('');
    if (error) return toast.error(errMsg(error));
    await audit('settings.save');
    toast.success('Site e contatos atualizados.');
    reload();
  }

  async function changePw(e) {
    e.preventDefault();
    if (pw.a.length < 6) return toast.error('A nova senha precisa ter pelo menos 6 caracteres.');
    if (pw.a !== pw.b) return toast.error('As senhas não conferem.');
    setBusy('p');
    const { error } = await supabase.auth.updateUser({ password: pw.a });
    setBusy('');
    if (error) return toast.error(errMsg(error));
    await audit('user.changePassword');
    setPw({ a: '', b: '' });
    toast.success('Senha alterada.');
  }

  async function createUser(e) {
    e.preventDefault();
    setBusy('u');
    try {
      await callApi('/api/admin-users', { method: 'POST', body: nu });
      toast.success('Acesso criado.');
      setNu({ email: '', name: '', password: '' });
      loadUsers();
    } catch (err) { toast.error(err.message); }
    setBusy('');
  }

  return (
    <>
      <h1>Configurações</h1>
      {loadError && <p className="err">Erro ao carregar configurações: {loadError}</p>}
      {s && <form className="card" onSubmit={save}>
        <h2>Identidade do sorteio</h2>
        <p className="muted small">Personalize o nome, as imagens e a forma de contato. Campos de contato podem ficar ocultos do público.</p>
        <div className="grid2">
          {FIELDS.map(([k, l]) => <label key={k} className={k === 'whatsapp_message' ? 'full' : ''}>{l}
            {k === 'whatsapp_message'
              ? <textarea rows="2" value={s[k] || ''} onChange={(e) => set(k, e.target.value)} />
              : <input value={s[k] || ''} onChange={(e) => set(k, e.target.value)} />}
          </label>)}
        </div>

        <section className="admin-prizes" aria-label="Personalizar a cesta e seus itens">
          <h2>Cesta única e detalhes do conteúdo</h2>
          <p className="muted small">Estas imagens apresentam um único prêmio: a cesta. A primeira imagem mostra o conjunto; as demais destacam seus possíveis itens. Confirme o conteúdo real no regulamento.</p>
          <div className="admin-prize-grid">
            {prizes.map((p, i) => <div key={i} className="admin-prize-edit">
              <h3>{i === 0 ? 'Imagem geral da cesta' : `Detalhe ${i} da cesta`}</h3>
              <img src={p.image || DEFAULT_PRIZES[i].image} alt="Prévia do prêmio" loading="lazy" />
              <label>Nome<input value={p.title} maxLength={100} onChange={(e) => setPrize(i, 'title', e.target.value)} /></label>
              <label>Descrição<textarea value={p.description} rows="2" maxLength={280} onChange={(e) => setPrize(i, 'description', e.target.value)} /></label>
              <label>Imagem (URL ou /media/...)<input value={p.image} onChange={(e) => setPrize(i, 'image', e.target.value)} /></label>
            </div>)}
          </div>
        </section>

        <section className="admin-prizes">
          <h2>Contato no rodapé</h2>
          <p className="admin-contact-note">Você escolhe se quer exibir e-mail ou telefone. Se a opção estiver desligada, o contato não aparece no site, mesmo preenchido.</p>
          <div className="grid2">
            <label>E-mail público (opcional)<input type="email" value={s.contact_email || ''} onChange={(e) => set('contact_email', e.target.value)} placeholder="contato@seusite.com" /></label>
            <label>Telefone público (opcional)<input value={s.contact_phone || ''} onChange={(e) => set('contact_phone', e.target.value)} placeholder="(21) 99999-9999" /></label>
            <label className="admin-toggle"><input type="checkbox" checked={Boolean(s.show_contact_email)} onChange={(e) => set('show_contact_email', e.target.checked)} /> Mostrar e-mail no site</label>
            <label className="admin-toggle"><input type="checkbox" checked={Boolean(s.show_contact_phone)} onChange={(e) => set('show_contact_phone', e.target.checked)} /> Mostrar telefone no site</label>
          </div>
        </section>
        <button className="btn" disabled={busy === 's'}>{busy === 's' ? 'Salvando…' : 'Salvar configurações'}</button>
      </form>}

      <div className="panel-grid">
        <form className="card" onSubmit={changePw}>
          <h2>Trocar a minha senha</h2><p className="muted small">Conectado como {admin.username}.</p>
          <label>Nova senha<input type="password" value={pw.a} onChange={(e) => setPw({ ...pw, a: e.target.value })} autoComplete="new-password" /></label>
          <label>Repita a nova senha<input type="password" value={pw.b} onChange={(e) => setPw({ ...pw, b: e.target.value })} autoComplete="new-password" /></label>
          <button className="btn" disabled={busy === 'p'}>Trocar senha</button>
        </form>
        <form className="card" onSubmit={createUser}>
          <h2>Acessos ao painel</h2>
          <ul className="users">{users.map((u) => <li key={u.username}><strong>{u.name || u.username}</strong><span className="muted small">{u.username} · último login {fmtDateTime(u.last_login)}</span></li>)}</ul>
          <div className="grid2">
            <label>E-mail (usuário)<input type="email" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} required /></label>
            <label>Nome<input value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} /></label>
            <label className="full">Senha<input type="password" value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })} minLength={6} required autoComplete="new-password" /></label>
          </div><button className="btn btn-ghost" disabled={busy === 'u'}>Criar acesso</button>
        </form>
      </div>
      <div className="card">
        <h2>Histórico de ações</h2><p className="muted small">Últimas 60.</p>
        <table className="sheet stack"><thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Detalhes</th></tr></thead><tbody>
          {log.map((l) => <tr key={l.id}><td data-l="Quando" className="small">{fmtDateTime(l.when)}</td><td data-l="Quem">{l.who}</td><td data-l="Ação" className="mono small">{l.action}</td><td data-l="Detalhes" className="small muted">{l.details ? Object.entries(l.details).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' · ') : ''}</td></tr>)}
        </tbody></table>
      </div>
    </>
  );
}
