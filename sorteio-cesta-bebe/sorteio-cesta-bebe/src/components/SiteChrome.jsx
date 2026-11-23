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
        <nav aria-label="Links do rodapé"><Link to="/">Início</Link><Link to="/inscricao">Inscrição</Link><Link to="/resultado">Resultado</Link><Link to="/resultado#regulamento">Regulamento</Link></nav>
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

export default function SiteChrome({ children }) { return <div className="site"><Header /><main>{children}</main><Footer /></div>; }
