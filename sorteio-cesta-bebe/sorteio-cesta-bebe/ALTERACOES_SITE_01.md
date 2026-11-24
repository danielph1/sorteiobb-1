# Primeiro site — identificador e verificação do Meta Pixel

Este ZIP contém **o primeiro site completo**, preservando páginas, painel administrativo e arquivos do Supabase.

## Alterações pontuais

1. `src/lib/origem.js`: identificador **SITE_01**; captura opcional de UTMs (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `utm_id`).
2. `src/components/RegistrationForm.jsx`: envia `source: getCadastroSource()` para a RPC **já existente** `register_entry(p jsonb)`. Nenhum SQL de alteração é necessário. Em CPF já cadastrado, o backend devolve a inscrição existente e mantém a origem original.
3. Meta Pixel do primeiro site: corrigido o evento **Lead**, que antes disparava só ao começar o formulário. Agora **FormStart** permanece na primeira interação e **Lead** só dispara após uma inscrição *nova* confirmada. `CompleteRegistration` e `InscricaoConcluida` continuam sendo emitidos após o sucesso.
4. `src/lib/pixel.js`: não envia eventos quando a preferência de medição foi recusada.

Não foram alterados o ID do Pixel do primeiro site (`1735980434763367`), as funções/tabelas Supabase nem o visual.

O **segundo site** continua com Pixel `1095628273514721` e usa o identificador `sorteio_independente`.
No segundo site, a autorização é um checkbox opcional; no primeiro, um aviso no rodapé. Ambos só carregam o Pixel após consentimento.

## Publicação

O ZIP foi preparado **com `package.json` na raiz**. Substitua no GitHub os arquivos do diretório real do primeiro site pelo conteúdo do ZIP, preservando qualquer configuração específica da Vercel. Não coloque todos os arquivos dentro de uma subpasta adicional.

## Consulta no SQL Editor do Supabase (somente leitura)

```sql
select
  split_part(coalesce(nullif(source, ''), 'sem_identificador'), '|', 1) as site,
  count(*) as inscricoes
from public.entries
group by 1
order by inscricoes desc;
```

As inscrições **anteriores** à atualização conservam os valores antigos de `source` (por exemplo, URL de referência). Um CPF repetido **não** é contado como nova inscrição.

## Como validar o Meta Pixel

Em Meta Events Manager > Eventos de teste, selecione o Pixel correspondente.
Aceite a medição no site, em navegador sem bloqueio de rastreadores.
Deverá haver `PageView`; `Lead` deve ocorrer somente depois de um cadastro **novo** com sucesso.
O primeiro e o segundo sites usam IDs de Pixel distintos, portanto teste o Pixel correspondente a cada projeto.

## Testes

- Geração do identificador SITE_01 e sanitização de UTMs: passaram em Node.
- Verificações estáticas da chamada register_entry e posicionamento de Lead: passaram.
- `npm install` não concluiu neste ambiente (requisições ao registro npm excederam o tempo limite), portanto o build completo precisa ser validado em Vercel.
