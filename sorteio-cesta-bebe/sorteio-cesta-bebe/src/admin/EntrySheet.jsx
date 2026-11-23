import { useEffect, useMemo, useState } from 'react';
import { supabase, errMsg } from '../lib/supabase.js';
import { fmtDate, fmtDateTime, onlyDigits, maskPhone } from '../lib/format.js';
import { toast } from '../components/Toast.jsx';

const COLUMNS = [
  'protocol', 'raffle_number', 'full_name', 'cpf', 'phone', 'email', 'city',
  'state', 'gestation_weeks', 'due_date', 'formal_job', 'discovery_source',
  'status', 'notes', 'phone_fix', 'created_at', 'privacy_consent',
  'marketing_consent', 'whatsapp_confirmation_consent', 'source'
];

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'validada', label: 'Validada' },
  { value: 'invalidada', label: 'Invalidada' }
];

const STATUS_LABEL = Object.fromEntries(STATUS_OPTIONS.map(item => [item.value, item.label]));

function escapeCsv(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function raffleNumber(value) {
  return String(value ?? '').padStart(5, '0');
}

function phoneForWhatsapp(value) {
  const digits = onlyDigits(value);
  if (!digits) return '';
  return digits.startsWith('55') ? digits : `55${digits}`;
}

function Detail({ label, children, wide = false }) {
  return (
    <div className={`entry-detail${wide ? ' entry-detail-wide' : ''}`}>
      <span>{label}</span>
      <strong>{children || '—'}</strong>
    </div>
  );
}

function ConsentText({ value }) {
  return <span className={value ? 'consent-yes' : 'consent-no'}>{value ? 'Aceito' : 'Não aceito'}</span>;
}

function EntryModal({ entry, onClose, onSaved, onRemoved }) {
  const [status, setStatus] = useState(entry.status || 'pendente');
  const [phone, setPhone] = useState(maskPhone(entry.phone_fix || entry.phone || ''));
  const [notes, setNotes] = useState(entry.notes || '');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = event => {
      if (event.key === 'Escape' && !saving && !removing) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose, saving, removing]);

  const whatsappNumber = phoneForWhatsapp(phone || entry.phone_fix || entry.phone);
  const whatsappMessage = `Olá, ${entry.full_name || 'tudo bem'}! Estou entrando em contato sobre sua inscrição no Sorteio Cesta Bebê.`;
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : '';
  const telephoneUrl = whatsappNumber ? `tel:+${whatsappNumber}` : '';
  const sourceUrl = /^https?:\/\//i.test(entry.source || '') ? entry.source : '';

  async function saveChanges() {
    const digits = onlyDigits(phone);
    if (digits.length < 10) {
      toast.error('Informe um telefone válido com DDD.');
      return;
    }
    setSaving(true);
    const correctedPhone = digits === onlyDigits(entry.phone || '') ? null : digits;
    const { error } = await supabase
      .from('entries')
      .update({ status, phone_fix: correctedPhone, notes: notes.trim() || null })
      .eq('id', entry.id);
    setSaving(false);
    if (error) return toast.error(errMsg(error));
    toast.success('Alterações salvas.');
    onSaved({ ...entry, status, phone_fix: correctedPhone, notes: notes.trim() || null });
  }

  async function removeEntry() {
    const confirmed = window.confirm(`Remover a inscrição de ${entry.full_name}? Esta ação não poderá ser desfeita.`);
    if (!confirmed) return;
    setRemoving(true);
    const { error } = await supabase.from('entries').delete().eq('id', entry.id);
    setRemoving(false);
    if (error) return toast.error(errMsg(error));
    toast.success('Inscrição removida.');
    onRemoved(entry.id);
  }

  return (
    <div className="entry-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !saving && !removing) onClose(); }}>
      <section className="entry-modal" role="dialog" aria-modal="true" aria-labelledby="entry-modal-title">
        <div className="entry-modal-scroll">
          <header className="entry-modal-header">
            <div>
              <span className="entry-modal-kicker">DETALHES DA PARTICIPANTE</span>
              <h2 id="entry-modal-title">{entry.full_name || 'Inscrição'}</h2>
              <p>Nº {raffleNumber(entry.raffle_number)} <span>•</span> {entry.protocol || 'Sem protocolo'}</p>
            </div>
            <button type="button" className="entry-icon-close" onClick={onClose} aria-label="Fechar detalhes">×</button>
          </header>

          <div className="entry-detail-grid">
            <Detail label="CPF">{entry.cpf}</Detail>
            <Detail label="E-MAIL">{entry.email}</Detail>
            <Detail label="CIDADE / UF">{entry.city}{entry.city && entry.state ? '/' : ''}{entry.state}</Detail>
            <Detail label="IDADE GESTACIONAL">{entry.gestation_weeks ? `${entry.gestation_weeks} semanas` : '—'}</Detail>
            <Detail label="MESES DE GESTAÇÃO">—</Detail>
            <Detail label="DPP">{fmtDate(entry.due_date)}</Detail>
            <Detail label="PRIMEIRA GESTAÇÃO">—</Detail>
            <Detail label="CARTEIRA ASSINADA">{typeof entry.formal_job === 'boolean' ? (entry.formal_job ? 'Sim' : 'Não') : '—'}</Detail>
            <Detail label="NOME DO BEBÊ">—</Detail>
            <Detail label="INSTAGRAM">—</Detail>
            <Detail label="COMO CONHECEU">{entry.discovery_source}</Detail>
            <Detail label="CONSENTIMENTOS">
              <span className="entry-consent-list">
                <span>Regulamento: <ConsentText value={entry.privacy_consent}/></span>
                <span>Ofertas/parceiros: <ConsentText value={entry.marketing_consent}/></span>
                <span>WhatsApp: <ConsentText value={entry.whatsapp_confirmation_consent}/></span>
              </span>
            </Detail>
            <Detail label="ORIGEM DO CADASTRO" wide>
              {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noreferrer">{entry.source}</a> : (entry.source || 'Acesso direto')}
            </Detail>
            <Detail label="DATA DA INSCRIÇÃO">{fmtDateTime(entry.created_at)}</Detail>
          </div>

          <div className="entry-validation-card">
            <h3><span className="entry-check-icon">✓</span> Verificação da inscrição</h3>
            <div className="entry-status-options" role="group" aria-label="Situação da inscrição">
              {STATUS_OPTIONS.map(option => (
                <button
                  type="button"
                  key={option.value}
                  className={`entry-status-option status-${option.value}${status === option.value ? ' selected' : ''}`}
                  onClick={() => setStatus(option.value)}
                >
                  <span>{status === option.value ? '✓' : option.value === 'invalidada' ? '⊘' : '○'}</span>
                  {option.label}
                </button>
              ))}
            </div>

            <div className="entry-edit-grid">
              <label className="entry-field">
                <span>Telefone (correção)</span>
                <input
                  value={phone}
                  onChange={event => setPhone(maskPhone(event.target.value))}
                  placeholder="(00) 00000-0000"
                  inputMode="tel"
                />
              </label>
              <label className="entry-field">
                <span>Observações internas</span>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={event => setNotes(event.target.value)}
                  placeholder="Anotações sobre a conferência da inscrição"
                />
              </label>
            </div>

            <div className="entry-action-row">
              <button type="button" className="btn entry-save-button" onClick={saveChanges} disabled={saving || removing}>
                <span aria-hidden="true">▣</span> {saving ? 'Salvando…' : 'Salvar alterações'}
              </button>
              {whatsappUrl ? (
                <a className="entry-action-button" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <span aria-hidden="true">◉</span> WhatsApp
                </a>
              ) : (
                <button type="button" className="entry-action-button" disabled title="Telefone não informado">◉ WhatsApp</button>
              )}
              {telephoneUrl ? (
                <a className="entry-action-button" href={telephoneUrl}>
                  <span aria-hidden="true">⌕</span> Ligar
                </a>
              ) : (
                <button type="button" className="entry-action-button" disabled>Ligar</button>
              )}
            </div>
            <div className="entry-site-link-row">
              <a href="/" target="_blank" rel="noopener noreferrer">↗ <span>Ver site</span></a>
            </div>
          </div>

          <footer className="entry-modal-footer">
            <button type="button" className="entry-remove-button" onClick={removeEntry} disabled={saving || removing}>
              {removing ? 'Removendo…' : '▢ Remover inscrição'}
            </button>
            <button type="button" className="entry-close-button" onClick={onClose} disabled={saving || removing}>× <span>Fechar</span></button>
          </footer>
        </div>
      </section>
    </div>
  );
}

export default function EntrySheet() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('recentes');
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(null);

  async function load() {
    setBusy(true);
    let query = supabase
      .from('entries')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: sort === 'antigas' })
      .range(page * perPage, (page + 1) * perPage - 1);

    if (status) query = query.eq('status', status);
    const term = search.trim().replace(/[(),%]/g, '');
    if (term) {
      query = query.or([
        `full_name.ilike.%${term}%`,
        `protocol.ilike.%${term}%`,
        `phone.ilike.%${term}%`,
        `cpf.ilike.%${term}%`,
        `city.ilike.%${term}%`
      ].join(','));
    }

    const { data, error, count } = await query;
    setBusy(false);
    if (error) return toast.error(errMsg(error));
    setEntries(data || []);
    setTotal(count || 0);
  }

  useEffect(() => { load(); }, [page, status, search, perPage, sort]);

  async function exportCsv() {
    setBusy(true);
    const all = [];
    for (let index = 0; index < 1000; index += 1) {
      const { data, error } = await supabase
        .from('entries')
        .select(COLUMNS.join(','))
        .order('id')
        .range(index * 1000, index * 1000 + 999);
      if (error) {
        toast.error(errMsg(error));
        setBusy(false);
        return;
      }
      all.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
    setBusy(false);
    const content = '\ufeff' + COLUMNS.join(';') + '\r\n' + all
      .map(row => COLUMNS.map(column => escapeCsv(row[column])).join(';'))
      .join('\r\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'inscritas-sorteio.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageRange = useMemo(() => {
    if (!total) return '0';
    return `${page * perPage + 1}–${Math.min((page + 1) * perPage, total)}`;
  }, [page, perPage, total]);

  function handleSaved(updated) {
    setEntries(current => current.map(item => item.id === updated.id ? updated : item));
    setSelected(updated);
  }

  function handleRemoved(id) {
    setSelected(null);
    setEntries(current => current.filter(item => item.id !== id));
    setTotal(current => Math.max(0, current - 1));
    if (entries.length === 1 && page > 0) setPage(current => current - 1);
    else load();
  }

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <h1>Planilha de inscritas</h1>
          <p>Pesquise, valide e exporte os dados</p>
        </div>
      </div>
      <p className="entry-sheet-hint">ⓘ <span>Clique em qualquer linha para abrir os dados completos, validar a inscrição ou corrigir um telefone.</span></p>

      <div className="entry-toolbar-card">
        <div className="entry-toolbar">
          <label className="entry-search-box">
            <span aria-hidden="true">⌕</span>
            <input
              placeholder="Nome, número do sorteio, CPF, telefone, protocolo ou cidade"
              value={search}
              onChange={event => { setPage(0); setSearch(event.target.value); }}
            />
            {search && <button type="button" onClick={() => setSearch('')} aria-label="Limpar pesquisa">×</button>}
          </label>
          <label className="entry-filter-select" aria-label="Filtrar por situação">
            <span aria-hidden="true">▽</span>
            <select value={status} onChange={event => { setPage(0); setStatus(event.target.value); }}>
              <option value="">Todas as situações</option>
              {STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="entry-filter-select" aria-label="Ordenar inscrições">
            <select value={sort} onChange={event => { setPage(0); setSort(event.target.value); }}>
              <option value="recentes">Mais recentes</option>
              <option value="antigas">Mais antigas</option>
            </select>
          </label>
          <label className="entry-filter-select entry-page-size" aria-label="Inscrições por página">
            <select value={perPage} onChange={event => { setPage(0); setPerPage(Number(event.target.value)); }}>
              <option value={25}>25 / pág.</option>
              <option value={50}>50 / pág.</option>
              <option value={100}>100 / pág.</option>
            </select>
          </label>
          <button type="button" className="entry-export-button" onClick={exportCsv} disabled={busy}>
            <span aria-hidden="true">⇩</span> Exportar CSV
          </button>
        </div>
        <p className="entry-results-count">{total.toLocaleString('pt-BR')} inscrição(ões) encontrada(s){busy ? ' · carregando…' : ''}</p>
      </div>

      <div className="entry-table-card">
        <div className="entry-table-scroll">
          <table className="entry-table">
            <thead>
              <tr>
                <th>Nº sorteio</th>
                <th>Participante</th>
                <th>Contato</th>
                <th>Cidade</th>
                <th>Gestação</th>
                <th>Carteira</th>
                <th>Situação</th>
                <th>Inscrição</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr
                  key={entry.id}
                  tabIndex={0}
                  onClick={() => setSelected(entry)}
                  onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(entry); } }}
                  aria-label={`Abrir inscrição de ${entry.full_name}`}
                >
                  <td><span className="entry-raffle-number">{raffleNumber(entry.raffle_number)}</span></td>
                  <td>
                    <strong className="entry-participant-name">{entry.full_name}</strong>
                    <span className="entry-protocol">{entry.protocol}</span>
                  </td>
                  <td>
                    <span className="entry-contact-phone">{maskPhone(entry.phone_fix || entry.phone) || '—'}</span>
                    <span className="entry-contact-email">{entry.email || '—'}</span>
                  </td>
                  <td>{entry.city}{entry.state ? `/${entry.state}` : ''}</td>
                  <td>{entry.gestation_weeks ? `${entry.gestation_weeks} sem.` : '—'}</td>
                  <td>{typeof entry.formal_job === 'boolean' ? (entry.formal_job ? 'Sim' : 'Não') : '—'}</td>
                  <td><span className={`entry-status-badge status-${entry.status}`}>{STATUS_LABEL[entry.status] || entry.status}</span></td>
                  <td className="entry-date-cell">{fmtDateTime(entry.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!entries.length && <p className="entry-empty-state">{busy ? 'Carregando inscrições…' : 'Nenhuma inscrição encontrada.'}</p>}
        </div>
      </div>

      <div className="entry-pager">
        <span>Exibindo {pageRange} de {total.toLocaleString('pt-BR')}</span>
        <div>
          <button type="button" onClick={() => setPage(value => Math.max(0, value - 1))} disabled={page === 0}>Anterior</button>
          <span>Página {page + 1} de {totalPages}</span>
          <button type="button" onClick={() => setPage(value => Math.min(totalPages - 1, value + 1))} disabled={page + 1 >= totalPages}>Próxima</button>
        </div>
      </div>

      {selected && (
        <EntryModal
          entry={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
          onRemoved={handleRemoved}
        />
      )}
    </>
  );
}
