import SiteChrome from '../components/SiteChrome.jsx';import {Link} from 'react-router-dom';
export default function NotFound(){return <SiteChrome><section className="band wrap center"><h1>Página não encontrada</h1><p>Esta página não existe.</p><Link to="/" className="btn">Voltar ao início</Link></section></SiteChrome>}
