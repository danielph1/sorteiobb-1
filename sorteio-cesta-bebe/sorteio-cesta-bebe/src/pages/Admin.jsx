import logo from '../assets/logo.svg';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase, configured } from '../lib/supabase.js';
import LoginCard from '../admin/LoginCard.jsx';
import OverviewPanel from '../admin/OverviewPanel.jsx';
import EntrySheet from '../admin/EntrySheet.jsx';
import DrawPanel from '../admin/DrawPanel.jsx';
import SettingsPanel from '../admin/SettingsPanel.jsx';
import { audit } from '../lib/api.js';

const TABS = [
  { id: 'visao', label: 'Visão geral', description: 'Números do sorteio em tempo real', icon: '▦' },
  { id: 'planilha', label: 'Planilha de inscritas', description: 'Pesquise, valide e exporte os dados', icon: '▤' },
  { id: 'sorteio', label: 'Sorteio e resultado', description: 'Apuração pela Loteria Federal', icon: '♜' },
  { id: 'config', label: 'Configurações', description: 'Pixel, WhatsApp e acessos', icon: '⚙' }
];

export default function Admin() {
  const [session, setSession] = useState(undefined);
  const [admin, setAdmin] = useState(null);
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(item => item.id === params.get('aba')) ? params.get('aba') : 'visao';
  const activeTab = TABS.find(item => item.id === tab) || TABS[0];

  useEffect(() => {
    if (!configured) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, value) => setSession(value));
    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setAdmin(null);
      return;
    }
    setAdmin(null);
    supabase.from('admin_users').select('*').eq('user_id', session.user.id).maybeSingle()
      .then(({ data }) => setAdmin(data || false));
  }, [session]);

  if (!configured) return <div className="admin-center"><div className="card narrow"><h1>Configuração pendente</h1><p>Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.</p></div></div>;
  if (session === undefined || (session && admin === null)) return <div className="admin-center">Carregando…</div>;
  if (!session) return <div className="admin-center"><LoginCard /></div>;
  if (admin === false) return <div className="admin-center"><div className="card"><h2>Sem permissão</h2><p>Seu usuário entrou, mas não consta na tabela admin_users.</p><button className="btn" onClick={() => supabase.auth.signOut()}>Sair</button></div></div>;

  async function logout() {
    await audit('logout');
    await supabase.auth.signOut();
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <Link to="/" className="admin-top-brand">
          <img src={logo} alt="" width="38" height="38" />
          <span><strong>Painel do organizador</strong><small>SORTEIO DE CESTA PARA BEBÊ</small></span>
        </Link>
        <div className="admin-top-actions">
          <span>conectada como <strong>{admin.name || admin.username}</strong></span>
          <Link to="/" className="admin-top-link" target="_blank" rel="noreferrer">↗ <span>Ver o site</span></Link>
          <button type="button" className="admin-top-logout" onClick={logout}>⇥ <span>Sair</span></button>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <nav aria-label="Menu administrativo">
            {TABS.map(item => (
              <button
                type="button"
                key={item.id}
                className={`admin-nav-item${tab === item.id ? ' active' : ''}`}
                onClick={() => setParams({ aba: item.id })}
              >
                <span className="admin-nav-icon" aria-hidden="true">{item.icon}</span>
                <span className="admin-nav-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
              </button>
            ))}
          </nav>
          <div className="admin-sidebar-reminder">
            <strong>Lembrete</strong>
            <p>Exporte a planilha em CSV regularmente para manter um backup das inscrições.</p>
          </div>
        </aside>

        <main className="admin-main admin-main-redesign">
          {tab === 'visao' && <OverviewPanel go={value => setParams({ aba: value })} />}
          {tab === 'planilha' && <EntrySheet />}
          {tab === 'sorteio' && <DrawPanel />}
          {tab === 'config' && <SettingsPanel admin={admin} />}
        </main>
      </div>
    </div>
  );
}
