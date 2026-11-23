import { useEffect, useState, useCallback } from 'react';
import { supabase, errMsg } from '../lib/supabase.js';
import { callApi, audit } from '../lib/api.js';
import { computeWinning, pad5, cleanDezenas } from '../lib/raffle.js';
import { fmtDate, fmtDateTime } from '../lib/format.js';
import { toast } from '../components/Toast.jsx';
import { useSite } from '../lib/site.jsx';

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function DrawPanel() {
  const { reload: reloadSite } = useSite();
  const [draw, setDraw] = useState(null);
  const [form, setForm] = useState(null);
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [manual, setManual] = useState(['', '', '', '', '']);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase.from('draws').select('*').eq('id', 1).single();
    if (loadError) { setError(errMsg(loadError)); return; }
    setError('');
    setDraw(data);
    setForm({
      federal_concurso: data.federal_concurso || '',
      registration_closes_at: toLocalInput(data.registration_closes_at),
      calc_mode: data.calc_mode || 'soma_modulo',
      status: data.status,
      auto_publish: data.auto_publish,
      rules_notes: data.rules_notes || '',
    });
    setManual([0, 1, 2, 3, 4].map((i) => data.federal_dezenas?.[i] || ''));
    if (data.winner_entry_id) {
      const { data: entry } = await supabase.from('entries').select('full_name,protocol,raffle_number,phone,city,state').eq('id', data.winner_entry_id).maybeSingle();
      setWinner(entry || null);
    } else setWinner(null);
    const { data: h } = await supabase.from('federal_history').select('*').order('concurso', { ascending: false }).limit(20);
    setHistory(h || []);
  }, []);

  useEffect(() => { load(); }, [load]);
  const set = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  async function patch(values, action, message) {
    const { error: updateError } = await supabase.from('draws').update(values).eq('id', 1);
    if (updateError) { toast.error(errMsg(updateError)); return false; }
    await audit(action, values);
    toast.success(message);
    await load();
    reloadSite();
    return true;
  }

  async function saveConfig(e) {
    e.preventDefault();
    if (form.status === 'published' && draw.winning_number === null) return toast.error('Calcule o único número vencedor antes de publicar.');
    if (draw.status === 'published' && (String(form.federal_concurso) !== String(draw.federal_concurso || '') || form.calc_mode !== draw.calc_mode)) {
      return toast.error('Não é possível trocar concurso ou regra com resultado publicado. Revise antes de reabrir.');
    }
    const changedRule = String(form.federal_concurso) !== String(draw.federal_concurso || '') || form.calc_mode !== draw.calc_mode;
    if (form.status === 'published' && changedRule) return toast.error('Calcule novamente o número vencedor antes de publicar com outra regra ou concurso.');
    setBusy('save');
    await patch({
      federal_concurso: form.federal_concurso ? Number(form.federal_concurso) : null,
      registration_closes_at: form.registration_closes_at ? new Date(form.registration_closes_at).toISOString() : null,
      calc_mode: form.calc_mode,
      status: form.status,
      auto_publish: form.auto_publish,
      rules_notes: form.rules_notes,
      ...(changedRule ? { winning_number: null, winner_entry_id: null, federal_dezenas: null, federal_data: null, synced_at: null, published_at: null } : {}),
    }, 'draw.update', 'Configuração do sorteio salva.');
    setBusy('');
  }

  async function detect() {
    setBusy('detect');
    try {
      const result = await callApi('/api/sync-federal?mode=detect');
      set('federal_concurso', result.concurso || '');
      toast.success(`Concurso ${result.concurso} detectado. Salve para confirmar.`);
    } catch (err) { toast.error(err.message); }
    setBusy('');
  }

  async function syncFederal() {
    setBusy('sync');
    try {
      const result = await callApi('/api/sync-federal', { method: 'POST' });
      if (result.pending) toast.info(result.message);
      else if (result.skipped) toast.info(result.reason);
      else toast.success(`Número vencedor calculado: ${pad5(result.winning_number)}.`);
      await load();
      reloadSite();
    } catch (err) { toast.error(err.message); }
    setBusy('');
  }

  async function applyManual() {
    if (draw.status === 'published') return toast.error('Resultado já publicado. Não pode ser alterado sem reabrir o sorteio.');
    const dezenas = cleanDezenas(manual);
    const winning = computeWinning(dezenas, form.calc_mode);
    if (winning === null) return toast.error(form.calc_mode === 'soma_modulo'
      ? 'Preencha os cinco resultados oficiais da Loteria Federal para calcular um único número.'
      : 'Preencha o primeiro resultado oficial da Loteria Federal.');
    setBusy('manual');
    try {
      const { data: entry, error: searchError } = await supabase.from('entries')
        .select('id').eq('raffle_number', winning).neq('status', 'invalidada').maybeSingle();
      if (searchError) throw searchError;
      if (form.federal_concurso && dezenas.length === 5) {
        const { error: historyError } = await supabase.from('federal_history').upsert({
          concurso: Number(form.federal_concurso), dezenas, consultado_em: new Date().toISOString(),
        });
        if (historyError) throw historyError;
      }
      await patch({
        federal_dezenas: dezenas,
        winning_number: winning,
        winner_entry_id: entry?.id || null,
        synced_at: new Date().toISOString(),
        federal_concurso: form.federal_concurso ? Number(form.federal_concurso) : null,
        calc_mode: form.calc_mode,
        status: draw.status === 'open' ? 'closed' : draw.status,
      }, 'draw.manualResult', `Resultado único calculado: ${pad5(winning)}.`);
    } catch (err) { toast.error(errMsg(err)); }
    setBusy('');
  }

  async function publish() {
    if (draw.winning_number === null) return toast.error('Calcule um número vencedor antes de publicar.');
    if (draw.status === 'published') return;
    setBusy('publish');
    await patch({ status: 'published', published_at: new Date().toISOString() }, 'draw.publish', 'Resultado único publicado no site.');
    setBusy('');
  }

  async function reopen() {
    if (!window.confirm('Reabrir as inscrições e limpar a apuração deste sorteio? Os cadastros serão mantidos.')) return;
    setBusy('reopen');
    await patch({
      status: 'open', published_at: null, winning_number: null, winner_entry_id: null,
      federal_dezenas: null, federal_data: null, synced_at: null,
    }, 'draw.reopen', 'Inscrições reabertas. A apuração foi limpa; as inscrições permanecem.');
    setBusy('');
  }

  if (error) return <div className="card"><h2>Não foi possível carregar o sorteio</h2><p className="err">{error}</p><p>Confira se a migração V3 foi executada no Supabase.</p></div>;
  if (!draw || !form) return <p className="muted">Carregando…</p>;
  const preview = computeWinning(manual, form.calc_mode);
  return <>
    <h1>Sorteio e resultado</h1>
    <p className="muted small">Um único sorteio e um único número vencedor. A Loteria Federal fornece os resultados de referência para o cálculo, conforme o regulamento.</p>
    <div className="panel-grid">
      <div className="card">
        <h2>Resultado único</h2>
        <div className="single-result-display">
          <span className="single-result-label">Número vencedor</span>
          <div className="digits">{pad5(draw.winning_number).split('').map((d, i) => <span key={i}>{d}</span>)}</div>
          <p>{winner ? <><strong>{winner.full_name}</strong> · {winner.protocol} · {winner.city}/{winner.state}</> : draw.winning_number !== null ? 'Nenhuma inscrição válida correspondeu ao número.' : 'Aguardando apuração.'}</p>
        </div>
        <dl className="kv"><dt>Concurso da Federal</dt><dd>{draw.federal_concurso || '—'}{draw.federal_data ? ` · ${fmtDate(draw.federal_data)}` : ''}</dd><dt>Publicado em</dt><dd>{fmtDateTime(draw.published_at)}</dd><dt>Última sincronização</dt><dd>{fmtDateTime(draw.synced_at)}</dd></dl>
        <div className="row-btns">
          <button className="btn btn-ghost" onClick={syncFederal} disabled={!!busy || draw.status === 'published'}>{busy === 'sync' ? 'Buscando…' : 'Buscar resultado oficial'}</button>
          <button className="btn" onClick={publish} disabled={!!busy || draw.status === 'published' || draw.winning_number === null}>Publicar resultado</button>
        </div>
        {draw.status !== 'open' && <button className="link" onClick={reopen} disabled={!!busy}>Reabrir inscrições</button>}
      </div>
      <div className="card">
        <h2>Inserir resultado oficial manualmente</h2>
        <p className="muted small">Digite os resultados da Loteria Federal para calcular apenas um número vencedor. São resultados de referência, não cinco sorteios diferentes.</p>
        <div className="manual">
          {manual.map((value, i) => <label key={i}>Resultado {i + 1}<input className="mono" inputMode="numeric" value={value} onChange={(e) => setManual((values) => values.map((old, j) => j === i ? e.target.value.replace(/\D/g, '').slice(0, 6) : old))} /></label>)}
        </div>
        <p>Prévia do número vencedor: <strong className="mono">{pad5(preview)}</strong></p>
        <button className="btn btn-ghost" onClick={applyManual} disabled={!!busy || draw.status === 'published'}>Calcular e salvar resultado único</button>
      </div>
    </div>

    <form className="card" onSubmit={saveConfig}>
      <h2>Configuração</h2>
      <div className="grid3">
        <label>Concurso da Federal<span className="inline"><input inputMode="numeric" value={form.federal_concurso} onChange={(e) => set('federal_concurso', e.target.value.replace(/\D/g, ''))} /><button type="button" className="btn btn-sm btn-ghost" onClick={detect} disabled={!!busy}>Detectar</button></span></label>
        <label>Encerramento das inscrições<input type="datetime-local" value={form.registration_closes_at} onChange={(e) => set('registration_closes_at', e.target.value)} /></label>
        <label>Regra para o número único<select value={form.calc_mode} onChange={(e) => set('calc_mode', e.target.value)}>
          <option value="soma_modulo">Soma dos 4 últimos dígitos dos 5 resultados</option>
          <option value="primeira_dezena">5 últimos dígitos do primeiro resultado</option>
        </select></label>
        <label>Status<select value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="open">Inscrições abertas</option><option value="closed">Inscrições encerradas</option>
          {draw.status === 'published' && <option value="published">Resultado publicado</option>}
        </select></label>
        <label className="check sw"><input type="checkbox" checked={form.auto_publish} onChange={(e) => set('auto_publish', e.target.checked)} /><span>Publicação automática (rotina manhã e noite)</span></label>
        <label className="full">Regulamento<textarea rows="8" value={form.rules_notes} onChange={(e) => set('rules_notes', e.target.value)} /></label>
      </div>
      <button className="btn" disabled={!!busy}>{busy === 'save' ? 'Salvando…' : 'Salvar configuração'}</button>
    </form>
    <div className="card"><h2>Histórico dos concursos consultados</h2>{history.length === 0 ? <p className="muted">Nenhum concurso consultado.</p> : <table className="sheet stack"><thead><tr><th>Concurso</th><th>Data</th><th>Resultados de referência</th><th>Consultado em</th></tr></thead><tbody>{history.map((h) => <tr key={h.concurso}><td data-l="Concurso">{h.concurso}</td><td data-l="Data">{fmtDate(h.data)}</td><td data-l="Resultados" className="mono">{h.dezenas.join(' · ')}</td><td data-l="Consultado em">{fmtDateTime(h.consultado_em)}</td></tr>)}</tbody></table>}</div>
  </>;
}
