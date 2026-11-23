# V3 — Sorteio único

- Existe um **único prêmio: a cesta completa**.
- Os cartões clicáveis mostram a cesta e seus detalhes visuais; não representam colocações.
- O painel administrativo e a API calculam somente `winning_number` e `winner_entry_id`.
- A tabela `draws` continua restrita ao identificador 1.
- O campo anterior `ranked_results` foi removido pela migração V3.
- A lista com os cinco resultados da Loteria Federal é usada **somente como insumo do cálculo**, não como cinco sorteios.
- Configurações de imagens e contato opcionais continuam disponíveis.

## Instalação

Banco existente: executar `supabase/migracao-v3-sorteio-unico.sql` e publicar este código. Banco novo: executar `supabase/schema.sql`.

## Atenção

Caso haja resultado já publicado, a migração é cancelada de forma segura para não reescrever um resultado histórico sem aprovação.
