import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SiteChrome from '../components/SiteChrome.jsx';
import { useSite } from '../lib/site.jsx';
import { supabase, configured, errMsg } from '../lib/supabase.js';
import { pad5 } from '../lib/raffle.js';
import { fmtDate } from '../lib/format.js';

export default function Resultado() {
  const { status } = useSite();
  const loc = useLocation();
  const [prot, setProt] = useState('');
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const published = status?.status === 'published';

  useEffect(() => {
    if (loc.hash === '#regulamento') setTimeout(() => document.getElementById('regulamento')?.scrollIntoView({ behavior: 'smooth' }), 200);
  }, [loc.hash, status]);

  async function lookup(e) {
    e.preventDefault();
    if (!prot.trim() || !configured) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('lookup_protocol', { p_protocol: prot.trim() });
    setBusy(false);
    setRes(error ? { error: errMsg(error) } : data);
  }

  return (
    <SiteChrome>
      <section className="band">
        <div className="wrap result-grid">
          <div className="card single-result-card">
            <p className="kicker">Uma cesta, um único resultado</p>
            <h1>Resultado do sorteio</h1>
            {published ? <p className="muted">Apuração com base na Loteria Federal, concurso {status.federal_concurso}{status.federal_data ? ` · ${fmtDate(status.federal_data)}` : ''}.</p>
              : <p className="muted">O número vencedor será exibido aqui após a apuração e publicação do resultado.</p>}
            <div className="single-result-display">
              <span className="single-result-label">Número vencedor</span>
              <div className="digits" aria-label={published ? `Número vencedor ${pad5(status.winning_number)}` : 'Resultado ainda não publicado'}>
                {pad5(published ? status.winning_number : null).split('').map((d, i) => <span key={i}>{d}</span>)}
              </div>
              <p className="muted small">O sorteio contempla apenas uma cesta. Consulte o regulamento para saber como o número é calculado.</p>
            </div>
          </div>
          <form className="card" onSubmit={lookup}>
            <p className="kicker">Sua inscrição</p>
            <h2>Consultar número e protocolo</h2>
            <label>Digite seu protocolo de inscrição
              <input value={prot} onChange={(e) => { setProt(e.target.value.toUpperCase()); setRes(null); }} placeholder="SB2026…" className="mono" />
            </label>
            <button className="btn" disabled={busy}>{busy ? 'Consultando…' : 'Consultar'}</button>
            {res && <div className={`answer ${res.winner ? 'win' : ''}`} role="status">
              {res.error ? res.error : !res.found
                ? `Não encontramos o protocolo ${prot}. Confira se digitou igual ao recebido.`
                : res.winner ? <><strong>Parabéns, {res.first_name}! Seu número foi o sorteado!</strong> A organização poderá entrar em contato pelo WhatsApp cadastrado para confirmar a premiação.</>
                : res.published ? <>Seu número é <strong className="mono">{pad5(res.raffle_number)}</strong>. Não foi contemplado nesta edição. Obrigada por participar!</>
                : <>Seu número é <strong className="mono">{pad5(res.raffle_number)}</strong>. Número reservado. Aguarde a publicação do resultado.</>}
            </div>}
          </form>
          <div className="card full" id="regulamento">
            <h2>Regulamento</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{status?.rules_notes || 'Carregando…'}</p>
            {status?.registration_closes_at && <p className="muted">Inscrições até {new Date(status.registration_closes_at).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}.</p>}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
