# V4 — um sorteio e uma cesta

1. No Supabase do sorteio, faça backup e execute somente `SQL_COMPLETO_UNICO_GANHADOR.sql` no SQL Editor. Ele também cria estruturas ausentes e preserva inscrições/administradores. Se houver resultado antigo de cinco colocações publicado, o SQL interrompe para evitar alteração de histórico.
2. O script substitui apenas informações padrão e migra o **primeiro** cartão antigo para os campos da cesta; elimina as colunas legadas `ranked_results` e `settings.prizes`.
3. No GitHub conectado à Vercel, substitua os arquivos pelo conteúdo desta pasta, mantendo o `package.json` na raiz. Não envie o ZIP como um arquivo único.
4. Configuração da Vercel: Vite, Root Directory vazio ou `./` quando o `package.json` estiver na raiz, Install `npm install`, Build `npm run build`, Output `dist`.
5. Em `/admin?aba=config`, edite título, descrição e foto do **prêmio único**. A página inicial mostra apenas a cesta e o carrossel de ambientação.
6. Revise o regulamento. A regra atual calcula **um número vencedor** com a Loteria Federal; pode ocorrer de esse número não estar atribuído a um participante válido.

O SQL NÃO remove os cartões sozinho: a alteração visual depende da publicação da V4.
