import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SiteChrome from '../components/SiteChrome.jsx';
import { useSite } from '../lib/site.jsx';

const CONTROLLER_NAME = import.meta.env.VITE_DATA_CONTROLLER_NAME || '';
const CONTROLLER_DOCUMENT = import.meta.env.VITE_DATA_CONTROLLER_DOCUMENT || '';
const PRIVACY_EMAIL = import.meta.env.VITE_PRIVACY_EMAIL || '';
const MARKETING_PARTNERS = import.meta.env.VITE_MARKETING_PARTNERS_LIST || '';

export default function Privacidade() {
  const { settings, pixelConsent, setPixelConsent } = useSite();
  const location = useLocation();
  const controllerName = CONTROLLER_NAME || '[PREENCHER NOME OU RAZÃO SOCIAL DO ORGANIZADOR]';
  const controllerDocument = CONTROLLER_DOCUMENT || '[PREENCHER CPF OU CNPJ DO ORGANIZADOR]';
  const privacyEmail = PRIVACY_EMAIL || settings.contact_email || '[PREENCHER E-MAIL DE PRIVACIDADE]';
  const whatsapp = String(settings.whatsapp_number || '').replace(/\D/g, '');
  const whatsappLink = whatsapp ? `https://wa.me/${whatsapp.startsWith('55') ? whatsapp : `55${whatsapp}`}` : '';

  useEffect(() => {
    if (!location.hash) return;
    const target = location.hash.slice(1);
    const timer = window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' }), 180);
    return () => window.clearTimeout(timer);
  }, [location.hash]);

  return (
    <SiteChrome>
      <section className="band privacy-band">
        <article className="wrap card privacy-document">
          <p className="kicker">Transparência e proteção de dados</p>
          <h1>Termos de Uso e Aviso de Privacidade</h1>
          <p className="muted">Última atualização: 23 de novembro de 2026.</p>
          <p>Este documento explica as condições de uso do site e como os dados pessoais são tratados em conexão com o cadastro e a participação no Sorteio Cesta Bebê. O tratamento deve observar a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais, LGPD) e as demais normas aplicáveis.</p>

          <section>
            <h2>1. Quem é o responsável pelos dados</h2>
            <p>O controlador dos dados pessoais é:</p>
            <div className="privacy-highlight">
              <p><strong>Responsável:</strong> {controllerName}</p>
              <p><strong>CPF/CNPJ:</strong> {controllerDocument}</p>
              <p><strong>Nome do site/campanha:</strong> {settings.site_name || 'Sorteio Cesta Bebê'}</p>
              <p><strong>Canal de privacidade:</strong> {privacyEmail}</p>
              {whatsappLink && <p><strong>WhatsApp:</strong> <a href={whatsappLink} target="_blank" rel="noreferrer">Falar com a organização</a></p>}
            </div>
            {(!CONTROLLER_NAME || !CONTROLLER_DOCUMENT || !PRIVACY_EMAIL) && <p className="privacy-warning"><strong>Atenção antes de publicar:</strong> os dados de identificação e contato do controlador que aparecem entre colchetes precisam ser preenchidos. A identificação do controlador e seu contato são informações exigidas pela LGPD.</p>}
          </section>

          <section>
            <h2>2. Regras de uso do site</h2>
            <p>O site permite consultar as informações da campanha, realizar uma inscrição gratuita quando as inscrições estiverem abertas e consultar o número e o resultado mediante protocolo. Mensagens operacionais por WhatsApp sobre confirmação ou correção da inscrição dependem da opção específica do formulário; essa opção não autoriza publicidade. A pessoa participante deve fornecer informações verdadeiras, completas e atualizadas, utilizar seus próprios dados e não tentar fraudar, manipular ou interferir no cadastro, na apuração ou no funcionamento do site.</p>
            <p>As condições de participação, o prêmio, o período de inscrição, os critérios de validação e a forma de apuração são os descritos no <Link to="/resultado#regulamento">Regulamento do Sorteio</Link>. Em caso de divergência entre uma chamada publicitária e o regulamento, prevalecem as condições do regulamento publicado para a campanha.</p>
            <p>A organização poderá corrigir, suspender ou encerrar funcionalidades por motivos técnicos, de segurança, legais ou relacionados ao próprio encerramento da campanha, preservando os direitos das pessoas participantes.</p>
          </section>

          <section>
            <h2>3. Quais dados podem ser coletados</h2>
            <p>Conforme os campos preenchidos e a utilização do site, poderão ser tratados:</p>
            <ul>
              <li>identificação e contato: nome completo, CPF, telefone/WhatsApp e e-mail, quando informado;</li>
              <li>dados informados para a campanha: cidade, estado, semanas de gestação, data prevista do parto, informação sobre trabalho com carteira assinada e origem pela qual conheceu a campanha;</li>
              <li>dados da inscrição: número da sorte, protocolo, data e hora do cadastro, situação da inscrição, validações e observações administrativas;</li>
              <li>registros de consentimento ou de preferências, como aceite do regulamento, autorização opcional de marketing e escolha sobre tecnologias de medição;</li>
              <li>dados técnicos de navegação, como endereço IP, identificadores de dispositivo ou navegador, páginas acessadas e eventos de navegação, quando as tecnologias de medição forem autorizadas.</li>
            </ul>
            <p>O CPF é solicitado para identificar a participante, evitar inscrições duplicadas e apoiar a validação. Ele não será incluído no compartilhamento para publicidade descrito na seção 6.</p>
          </section>

          <section>
            <h2>4. Para que os dados são utilizados</h2>
            <p>Os dados poderão ser utilizados para:</p>
            <ul>
              <li>receber e administrar a inscrição, gerar número e protocolo e permitir a consulta posterior;</li>
              <li>confirmar informações, validar a inscrição, prevenir duplicidades, fraudes e uso indevido;</li>
              <li>entrar em contato sobre a inscrição, eventuais correções, andamento da campanha, apuração e entrega do prêmio, respeitando as preferências de contato registradas;</li>
              <li>realizar a apuração e divulgar o resultado nos limites previstos no regulamento, evitando a exposição desnecessária de dados pessoais;</li>
              <li>prestar atendimento, cumprir obrigações legais ou regulatórias e exercer ou defender direitos;</li>
              <li>medir o desempenho de campanhas publicitárias e entender a navegação, somente quando a pessoa visitante autorizar o uso do Meta Pixel;</li>
              <li>enviar ofertas e comunicações comerciais da organização e de parceiros, somente quando houver a autorização opcional descrita na seção 6.</li>
            </ul>
            <p>O tratamento necessário à participação pode se apoiar nas bases legais aplicáveis à execução do regulamento e dos procedimentos solicitados pela participante, ao cumprimento de obrigações legais, ao exercício regular de direitos e, quando necessário, no consentimento. Cada finalidade deverá ser limitada ao que for necessário e compatível com este aviso.</p>
          </section>

          <section>
            <h2>5. Compartilhamento necessário à operação</h2>
            <p>Para colocar a campanha em funcionamento, alguns dados poderão ser acessados por fornecedores que prestam serviços à organização, como hospedagem, banco de dados, segurança, suporte técnico, comunicação e envio de mensagens. Esses fornecedores devem tratar os dados conforme as instruções e finalidades contratadas, com medidas de segurança e confidencialidade apropriadas.</p>
            <p>Também poderá haver compartilhamento com autoridades públicas, órgãos reguladores ou terceiros quando isso for exigido por lei, ordem válida, necessário à prevenção de fraude ou ao exercício regular de direitos.</p>
            <p>Esse compartilhamento operacional não autoriza, por si só, o uso dos dados pelos fornecedores para publicidade própria. O uso para ofertas de parceiros comerciais depende da autorização opcional específica da seção seguinte.</p>
          </section>

          <section id="compartilhamento-marketing">
            <h2>6. Compartilhamento com parceiros e ofertas comerciais</h2>
            <p>A participante pode escolher, separadamente e de forma opcional, autorizar que a organização compartilhe seu nome e dados de contato (telefone/WhatsApp e e-mail, quando informado) com parceiros comerciais para o envio de ofertas, promoções e novidades relacionadas a gestação, maternidade, bebês, cuidados, bem-estar e produtos ou serviços correlatos. Cidade e estado poderão ser utilizados para direcionar ofertas relevantes à região.</p>
            <p>Com essa autorização, a própria organização e os parceiros indicados poderão entrar em contato por WhatsApp, telefone ou e-mail. O CPF, o protocolo de inscrição e a data prevista do parto não serão compartilhados para essa finalidade de marketing por este consentimento. A autorização opcional para receber mensagens operacionais sobre a inscrição é independente e não permite o envio de publicidade.</p>
            <div className="privacy-highlight">
              <strong>Parceiros comerciais autorizados</strong>
              {MARKETING_PARTNERS.trim()
                ? <p style={{ whiteSpace: 'pre-line' }}>{MARKETING_PARTNERS}</p>
                : <p className="privacy-warning">A relação nominal dos parceiros, com nome empresarial e identificação suficiente, precisa ser inserida antes de ativar a autorização de compartilhamento. Configure VITE_MARKETING_PARTNERS_LIST no ambiente de publicação.</p>}
            </div>
            <p>A autorização é facultativa, não é condição para participar do sorteio e pode ser recusada sem qualquer prejuízo à inscrição. A pessoa poderá retirar a autorização a qualquer momento, gratuitamente, solicitando a interrupção das comunicações à organização pelo canal de privacidade ou diretamente ao parceiro que a contatar. A revogação não torna ilícitos os tratamentos realizados antes do pedido.</p>
            <p>Ao receber os dados, cada parceiro deverá observar a LGPD e informar suas próprias práticas de privacidade. A pessoa participante poderá solicitar à organização informações sobre as entidades com as quais houve compartilhamento.</p>
          </section>

          <section id="cookies-e-meta-pixel">
            <h2>7. Cookies, Meta Pixel e medição de anúncios</h2>
            <p>O site pode utilizar o Meta Pixel, ferramenta da Meta Platforms, para medir visitas e resultados de anúncios, compreender interações com páginas e apoiar a mensuração de campanhas. Quando autorizado, o Pixel pode transmitir à Meta informações técnicas e eventos de navegação, como visualização de página e início ou conclusão de inscrição, além de identificadores e informações de navegador ou dispositivo. O código de medição não é exibido como conteúdo visual da página.</p>
            <p>O Meta Pixel somente é carregado depois que a pessoa visitante seleciona “Aceitar medição” no aviso de privacidade exibido no site. A opção “Recusar” mantém o site e a inscrição disponíveis, mas impede o carregamento do Pixel por este site. A preferência pode ser alterada nesta página pelo botão abaixo.</p>
            <p>O tratamento realizado pela Meta também está sujeito às políticas e condições próprias da plataforma. Consulte a <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noreferrer">Política de Privacidade da Meta</a>. Conforme a infraestrutura e as políticas dos fornecedores, dados técnicos poderão ser tratados fora do Brasil, observadas as exigências legais aplicáveis à transferência internacional.</p>
            <div className="privacy-cookie-controls">
              <span>Preferência atual: <strong>{pixelConsent === 'accepted' ? 'Medição aceita' : pixelConsent === 'rejected' ? 'Medição recusada' : 'Ainda não escolhida'}</strong></span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPixelConsent('unset')}>Alterar preferência de medição</button>
            </div>
          </section>

          <section>
            <h2>8. Prazo de armazenamento</h2>
            <p>Os dados serão mantidos pelo período necessário à administração da campanha, validação das inscrições, apuração, contato com a pessoa contemplada e atendimento de solicitações. Alguns registros poderão ser conservados pelo prazo necessário ao cumprimento de obrigações legais ou regulatórias, à prevenção de fraude e ao exercício regular de direitos. Quando não houver mais necessidade ou fundamento para conservação, os dados serão eliminados ou anonimizados, conforme viável e exigido pela legislação.</p>
            <p>Os dados utilizados para ofertas comerciais deverão deixar de ser utilizados para essa finalidade quando a autorização for revogada, ressalvados registros mínimos necessários para comprovar a revogação e cumprir obrigações legais.</p>
          </section>

          <section>
            <h2>9. Segurança da informação</h2>
            <p>A organização adota medidas técnicas e administrativas razoáveis para proteger os dados contra acessos não autorizados, perda, alteração, divulgação ou qualquer forma de tratamento inadequado. Nenhum ambiente digital é totalmente livre de riscos; se ocorrer incidente que possa acarretar risco ou dano relevante, serão adotadas as providências e comunicações exigidas pela legislação.</p>
          </section>

          <section>
            <h2>10. Direitos da pessoa titular</h2>
            <p>Nos termos da LGPD, a pessoa titular poderá solicitar, conforme aplicável:</p>
            <ul>
              <li>confirmação da existência de tratamento e acesso aos dados;</li>
              <li>correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei;</li>
              <li>portabilidade, observadas as regras e a regulamentação aplicáveis;</li>
              <li>informações sobre o compartilhamento de dados e sobre a possibilidade de não fornecer consentimento;</li>
              <li>revogação do consentimento e, quando cabível, eliminação dos dados tratados com base nele;</li>
              <li>oposição ao tratamento nos casos previstos na legislação.</li>
            </ul>
            <p>O atendimento poderá exigir confirmação de identidade para evitar que os dados sejam entregues a terceiros. A eliminação não será realizada quando houver fundamento legal para conservar determinadas informações.</p>
          </section>

          <section>
            <h2>11. Como exercer seus direitos</h2>
            <p>Para fazer solicitações sobre dados pessoais, corrigir informações ou retirar uma autorização de marketing, entre em contato com o controlador pelo e-mail <strong>{privacyEmail}</strong>{whatsappLink ? <> ou pelo <a href={whatsappLink} target="_blank" rel="noreferrer">WhatsApp da organização</a></> : ''}. Informe o assunto da solicitação e os dados necessários para localizar a inscrição. Não envie senha ou dados bancários.</p>
            <p>O contato indicado nesta seção deve ser monitorado pela organização. Caso o e-mail ainda apareça entre colchetes, ele precisa ser configurado antes da publicação.</p>
          </section>

          <section>
            <h2>12. Atualizações deste documento</h2>
            <p>Este documento poderá ser atualizado para refletir mudanças na campanha, nos serviços utilizados ou na legislação. Quando uma alteração afetar informações relevantes ou finalidades que dependam de consentimento, a organização apresentará as informações de forma destacada e solicitará nova manifestação quando necessário.</p>
          </section>

          <section>
            <h2>13. Contato e disposições finais</h2>
            <p>Ao utilizar o site, a pessoa visitante declara que teve acesso a este documento. A autorização opcional de marketing e compartilhamento somente será considerada concedida quando a caixa específica do formulário for marcada voluntariamente. A recusa dessa autorização não impede a participação na campanha.</p>
            <p>Este aviso não substitui o <Link to="/resultado#regulamento">Regulamento do Sorteio</Link>, que contém as condições específicas da campanha.</p>
          </section>

          <div className="privacy-bottom-links"><Link to="/">Voltar ao início</Link><Link to="/resultado#regulamento">Consultar regulamento</Link></div>
        </article>
      </section>
    </SiteChrome>
  );
}
