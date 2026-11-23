import {Routes,Route,Navigate} from 'react-router-dom';
import {SiteProvider} from './lib/site.jsx';
import {Toaster} from './components/Toast.jsx';
import Home from './pages/Home.jsx';
import Inscricao from './pages/Inscricao.jsx';
import Resultado from './pages/Resultado.jsx';
import Privacidade from './pages/Privacidade.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';
export default function App(){return <SiteProvider><Routes><Route path="/" element={<Home/>}/><Route path="/inscricao" element={<Inscricao/>}/><Route path="/resultado" element={<Resultado/>}/><Route path="/privacidade" element={<Privacidade/>}/><Route path="/admin" element={<Admin/>}/><Route path="/planilha" element={<Navigate to="/admin?aba=planilha" replace/>}/><Route path="*" element={<NotFound/>}/></Routes><Toaster/></SiteProvider>}
