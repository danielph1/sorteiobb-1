/**
 * Identificador fixo do primeiro site, distinto do formulário independente.
 * O Supabase já possui a coluna entries.source, preenchida pela RPC register_entry.
 * Exemplo salvo: SITE_01|utm_source=instagram|utm_campaign=blackfriday
 * A origem não muda quando a função retorna uma inscrição já existente.
 */
export const SITE_ID = 'SITE_01';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id'];
const MAX_LENGTH = 300;

function clean(value) {
  return String(value).trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/_+/g, '_').slice(0, 45);
}

export function buildCadastroSource(search = '') {
  const params = new URLSearchParams(search);
  let source = SITE_ID;
  for (const key of UTM_KEYS) {
    const raw = params.get(key);
    if (!raw) continue;
    const value = clean(raw);
    if (!value) continue;
    const part = `|${key}=${value}`;
    if (source.length + part.length > MAX_LENGTH) break;
    source += part;
  }
  return source;
}

export function getCadastroSource() {
  return typeof window === 'undefined' ? SITE_ID : buildCadastroSource(window.location.search);
}
