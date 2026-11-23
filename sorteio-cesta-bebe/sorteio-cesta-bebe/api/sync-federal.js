// Sincronização do sorteio único com a Loteria Federal.
import { serviceClient, requireAdmin, isCron, send, fetchFederal } from './_lib.js';
import { computeWinning } from '../src/lib/raffle.js';

export default async function handler(req, res) {
  let db;
  try { db = serviceClient(); } catch (error) { return send(res, 500, { error: error.message }); }
  const cron = isCron(req);
  const admin = cron ? null : await requireAdmin(req, db);
  if (!cron && !admin) return send(res, 401, { error: 'Não autorizado.' });
  const who = cron ? 'rotina' : admin.username;
  const mode = new URL(req.url, 'http://localhost').searchParams.get('mode');

  try {
    const { data: draw, error } = await db.from('draws').select('*').eq('id', 1).single();
    if (error) throw error;
    if (mode === 'detect') {
      const last = await fetchFederal();
      let concurso = last.proximo;
      if (draw.registration_closes_at && last.data && new Date(last.data + 'T23:59:59-03:00') > new Date(draw.registration_closes_at)) concurso = last.concurso;
      return send(res, 200, { concurso, ultimo: last.concurso, dataProximo: last.dataProximo });
    }
    // Um resultado já publicado nunca pode ser alterado pela sincronização.
    if (draw.status === 'published') return send(res, 200, { skipped: true, reason: 'resultado já publicado' });
    if (cron && !draw.auto_publish) return send(res, 200, { skipped: true, reason: 'publicação automática desligada' });
    if (cron && draw.status === 'open' && (!draw.registration_closes_at || new Date(draw.registration_closes_at) > new Date())) {
      return send(res, 200, { skipped: true, reason: 'inscrições ainda abertas ou encerramento não configurado' });
    }
    if (!draw.federal_concurso) return send(res, 400, { error: 'Defina o concurso antes de apurar.' });

    let result;
    try { result = await fetchFederal(draw.federal_concurso); }
    catch (error) { return send(res, 200, { pending: true, message: `Concurso ${draw.federal_concurso} ainda não disponível: ${error.message}` }); }
    if (result.concurso !== draw.federal_concurso || result.dezenas.length < 5) {
      return send(res, 200, { pending: true, message: `Concurso ${draw.federal_concurso} ainda não apurado.` });
    }
    const winning = computeWinning(result.dezenas, draw.calc_mode);
    if (winning === null) return send(res, 422, { error: 'Resultado da Loteria Federal incompleto ou inválido.' });

    const { error: hErr } = await db.from('federal_history').upsert({
      concurso: result.concurso, data: result.data, dezenas: result.dezenas, consultado_em: new Date().toISOString(),
    });
    if (hErr) throw hErr;

    const { data: winner, error: wErr } = await db.from('entries')
      .select('id, protocol').eq('raffle_number', winning).neq('status', 'invalidada').maybeSingle();
    if (wErr) throw wErr;
    const patch = {
      federal_dezenas: result.dezenas,
      federal_data: result.data,
      synced_at: new Date().toISOString(),
      winning_number: winning,
      winner_entry_id: winner?.id ?? null,
    };
    if (cron && draw.auto_publish) {
      patch.status = 'published';
      patch.published_at = new Date().toISOString();
    } else if (draw.status === 'open') patch.status = 'closed';

    const { error: upErr } = await db.from('draws').update(patch).eq('id', 1);
    if (upErr) throw upErr;
    await db.from('audit_log').insert({ who, action: 'draw.syncFederal', details: {
      concurso: result.concurso, winning_number: winning, winner_protocol: winner?.protocol || null,
      published: patch.status === 'published',
    } });
    return send(res, 200, {
      ok: true, concurso: result.concurso, winning_number: winning,
      winner: winner?.protocol || null, published: patch.status === 'published',
    });
  } catch (error) { return send(res, 500, { error: error.message || String(error) }); }
}
