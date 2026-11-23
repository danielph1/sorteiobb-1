import logo from '../assets/logo.svg';
import { Link, NavLink } from 'react-router-dom';
import { useSite } from '../lib/site.jsx';

export function Header() {
  const { settings } = useSite();
  return (
    <header className="site-header new-site-header">
      <Link to="/" className="brand"><img src={logo} alt="" width="38" height="38" /><span>{settings.site_name || 'Sorteio Cesta Bebê'}</span></Link>
      <nav aria-label="Navegação principal">
        <Link className="desktop-nav" to="/">Início</Link>
        <a className="desktop-nav" href="/#premios">A cesta</a>
        <NavLink className="desktop-nav" to="/resultado">Resultado</NavLink>
        <Link to="/resultado#regulamento" className="desktop-nav">Regulamento</Link>
        <Link to="/privacidade" className="desktop-nav">Privacidade</Link>
        <Link to="/inscricao" className="btn btn-sm">Quero participar</Link>
      </nav>
    </header>
  );
}

export function Footer() {
  const { settings } = useSite();
  const phone = String(settings.contact_phone || '').trim();
  const digits = phone.replace(/\D/g, '');
  const email = String(settings.contact_email || '').trim();
  const instagram = String(settings.instagram || '').replace('@', '').trim();
  const contactVisible = (settings.show_contact_email && email) || (settings.show_contact_phone && digits);
  return (
    <footer className="site-footer new-site-footer">
      <div className="wrap new-footer-inner">
        <div className="new-footer-brand"><img src={logo} alt="" width="32" height="32"/><strong>{settings.site_name || 'Sorteio Cesta Bebê'}</strong></div>
        <nav aria-label="Links do rodapé"><Link to="/">Início</Link><Link to="/inscricao">Inscrição</Link><Link to="/resultado">Resultado</Link><Link to="/resultado#regulamento">Regulamento</Link><Link to="/privacidade">Termos e privacidade</Link></nav>
        {contactVisible && <div className="new-footer-contact">
          {settings.show_contact_email && email && <a href={`mailto:${email}`}>E-mail: {email}</a>}
          {settings.show_contact_phone && digits && <a href={`tel:+${digits.startsWith('55') ? digits : `55${digits}`}`}>Telefone: {phone}</a>}
        </div>}
        {instagram && <a href={`https://instagram.com/${encodeURIComponent(instagram)}`} target="_blank" rel="noopener noreferrer">Instagram</a>}
      </div>
      <div className="wrap new-footer-legal">Sorteio organizado de forma independente. A Loteria Federal é utilizada como referência pública de apuração, sem vínculo com a Caixa Econômica Federal. Consulte o regulamento e as condições de participação.</div>
    </footer>
  );
}

function CookieNotice() {
  const { pixelConsent, setPixelConsent } = useSite();
  if (pixelConsent !== 'unset') return null;
  return (
    <aside className="cookie-notice" aria-label="Preferências de privacidade">
      <div className="cookie-notice-copy">
        <strong>Privacidade e tecnologias de medição</strong>
        <p>Com sua autorização, usamos o Meta Pixel para medir anúncios e visitas. Você pode aceitar ou recusar. Saiba mais no <Link to="/privacidade#cookies-e-meta-pixel">Aviso de Privacidade</Link>.</p>
      </div>
      <div className="cookie-notice-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPixelConsent('rejected')}>Recusar</button>
        <button type="button" className="btn btn-sm" onClick={() => setPixelConsent('accepted')}>Aceitar medição</button>
      </div>
    </aside>
  );
}

export default function SiteChrome({ children }) { return <div className="site"><Header /><main>{children}</main><Footer /><CookieNotice /></div>; }
