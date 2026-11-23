// Um único sorteio, um único número vencedor.
// Os resultados da Loteria Federal são a fonte para calcular APENAS um número.
export const pad5 = (n) => (n === null || n === undefined || n === '' ? '-----' : String(n).padStart(5, '0'));

export function cleanDezenas(list) {
  return (list || []).map((d) => String(d).replace(/\D/g, '')).filter(Boolean).slice(0, 5);
}

// Mantém os dois métodos já existentes no banco para não modificar critérios silenciosamente.
// soma_modulo: soma os últimos 4 dígitos de cada resultado e calcula módulo 100000.
// primeira_dezena: usa os últimos 5 dígitos do primeiro resultado.
export function computeWinning(dezenas, mode = 'soma_modulo') {
  const d = cleanDezenas(dezenas);
  if (mode === 'primeira_dezena') {
    if (!d.length || d[0].length < 5 || d[0].length > 6) return null;
    return Number(d[0].slice(-5)) % 100000;
  }
  if (mode !== 'soma_modulo' || d.length !== 5 || d.some((value) => value.length < 5 || value.length > 6)) return null;
  return d.reduce((sum, value) => sum + Number(value.slice(-4)), 0) % 100000;
}
