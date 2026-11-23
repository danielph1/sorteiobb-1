// Fotografias ilustrativas do prêmio único (uma cesta) e seus itens. Mantém o campo settings.prizes para compatibilidade com o Supabase V2.
export const DEFAULT_PRIZES = [
  { title: 'Cesta Bebê Completa', description: 'Uma cesta especial com itens para os primeiros cuidados.', image: '/media/cesta-maternidade.webp' },
  { title: 'Kit Enxoval Conforto', description: 'Mantas, toalhas e peças macias para o bebê.', image: '/media/enxoval.webp' },
  { title: 'Kit Higiene e Cuidados', description: 'Acessórios delicados para a rotina de cuidados.', image: '/media/cuidados.webp' },
  { title: 'Kit Roupinhas do Bebê', description: 'Peças confortáveis para os primeiros meses.', image: '/media/roupinhas.webp' },
  { title: 'Kit Diversão e Estímulo', description: 'Brinquedos apropriados para a primeira infância.', image: '/media/brinquedos.webp' },
];

export function getPrizes(settings = {}) {
  const saved = Array.isArray(settings.prizes) ? settings.prizes : [];
  return DEFAULT_PRIZES.map((p, i) => ({
    title: typeof saved[i]?.title === 'string' ? saved[i].title : p.title,
    description: typeof saved[i]?.description === 'string' ? saved[i].description : p.description,
    image: typeof saved[i]?.image === 'string' && saved[i].image.trim() ? saved[i].image : p.image,
  }));
}
