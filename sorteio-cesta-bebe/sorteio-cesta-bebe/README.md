# Sorteio Cesta Bebê — V4: uma cesta, um sorteio

Projeto React/Vite + Supabase + Vercel.

- Página inicial com **uma única cesta** como prêmio, sem cinco cartões de kits.
- Carrossel leve de ambientação com troca a cada 3 segundos.
- Uma inscrição por CPF, número de cinco dígitos e protocolo.
- Resultado com **um único número vencedor**, conforme regra configurada para a Loteria Federal.
- Área administrativa com edição da cesta única, contatos opcionais, usuários, inscrições e apuração.

## Banco de dados

Execute `SQL_COMPLETO_UNICO_GANHADOR.sql` no Supabase **do sorteio**, com backup prévio. Serve para atualizar V2/V3 e para um banco novo. Não apaga inscrições nem usuários. Para evitar migração indevida, resultados de cinco colocações já publicados interrompem a execução. A migração retira os campos antigos `ranked_results` e `settings.prizes`.

## Publicação

Envie o **conteúdo** deste pacote para o repositório que a Vercel realmente usa. O arquivo `package.json` deve estar na raiz configurada como Root Directory. Instalação: `npm install`; build: `npm run build`; saída: `dist`. O SQL não altera a interface — ela exige novo deploy.

**Importante:** um número calculado pode não ter participante inscrito. A existência de um ganhador real deve ser confirmada antes da divulgação de qualquer resultado.
