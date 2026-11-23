# Sorteio Cesta Bebê — V3 (um único sorteio)

Site React + Vite, Supabase e Vercel. Versão completa, com **um único sorteio, uma cesta e um número vencedor**. As cinco imagens clicáveis apresentam uma vista geral da cesta e detalhes de seu conteúdo: não são cinco sorteios, colocações ou ganhadores.

## Atualização do site já existente

1. **Antes do deploy**, acesse o Supabase do sorteio e execute **somente** `supabase/migracao-v3-sorteio-unico.sql` no SQL Editor. O arquivo não recria o banco, nem apaga `entries`, usuários, protocolos ou administradores. Descarta exclusivamente apurações **ainda não publicadas** da versão de cinco colocações, pois a regra única precisa ser recalculada.
2. Se já existir resultado publicado, o SQL **interrompe sem aplicar as alterações**; revise a apuração já divulgada antes de continuar.
3. Envie o conteúdo deste pacote (com `package.json` na raiz) para a branch `main` do seu repositório do GitHub vinculado à Vercel.
4. Em Vercel: Vite, Root Directory `./`, build `npm run build`, output `dist`. Preserve suas variáveis atuais: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `CRON_SECRET`.
5. Confira o novo deployment como `Ready` e revise o regulamento em `/admin?aba=sorteio`. **A regra de apuração do sorteio único não pode ser alterada depois da publicação** sem a avaliação do concurso.

**Não execute novamente** `supabase/schema.sql` no banco existente. Ele serve **somente para uma instalação nova, vazia**.

## O que foi preservado

- Home de tons delicados, fotografias em WebP, carrossel automático de 3 segundos e controles manuais.
- Cinco imagens clicáveis que crescem no desktop e se destacam no celular, agora representando detalhes de **uma única cesta**.
- Cadastro, protocolo, consulta individual de resultado, painel, planilha de participantes, administradores e contatos opcionais no rodapé.
- Integração com a Loteria Federal e atualização automática, agora calculando apenas um número vencedor.

## Cálculo do número vencedor

O administrador pode usar um dos dois métodos que já existiam no banco, aplicados a **um único sorteio**:

- `soma_modulo`: soma os quatro últimos dígitos de cada um dos cinco resultados de referência da Loteria Federal, aplicando módulo 100000.
- `primeira_dezena`: últimos cinco dígitos do primeiro resultado oficial.

A regra escolhida precisa estar alinhada ao regulamento. Se o número calculado não estiver atribuído a uma inscrição válida, o sistema informa que não houve contemplado; não inventa ganhador nem altera números.

## Desenvolvimento local

```bash
npm install
npm run build
npm run dev
```

As APIs em `/api` são funções serverless da Vercel. Em desenvolvimento local, execute com `vercel dev` caso precise testar essas rotas.

> Atenção: verifique a regulamentação aplicável às promoções comerciais no Brasil antes de divulgar uma campanha real.
