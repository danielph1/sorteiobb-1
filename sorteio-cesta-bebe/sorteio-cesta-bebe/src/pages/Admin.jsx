import logo from '../assets/logo.svg';
import {useEffect,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {supabase,configured} from '../lib/supabase.js';
import LoginCard from '../admin/LoginCard.jsx';
import OverviewPanel from '../admin/OverviewPanel.jsx';
import EntrySheet from '../admin/EntrySheet.jsx';
import DrawPanel from '../admin/DrawPanel.jsx';
import SettingsPanel from '../admin/SettingsPanel.jsx';
import {audit} from '../lib/api.js';
const TABS=[{id:'visao',label:'Visão geral'},{id:'planilha',label:'Planilha de inscritas'},{id:'sorteio',label:'Sorteio e resultado'},{id:'config',label:'Configurações'}];
export default function Admin(){const[session,setSession]=useState(undefined),[admin,setAdmin]=useState(null),[params,setParams]=useSearchParams();const tab=TABS.some(t=>t.id===params.get('aba'))?params.get('aba'):'visao';
useEffect(()=>{if(!configured){setSession(null);return}supabase.auth.getSession().then(({data})=>setSession(data.session));const{data:sub}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>sub.subscription.unsubscribe()},[]);
useEffect(()=>{if(!session){setAdmin(null);return}setAdmin(null);supabase.from('admin_users').select('*').eq('user_id',session.user.id).maybeSingle().then(({data})=>setAdmin(data||false))},[session]);
if(!configured)return <div className="admin-center"><div className="card narrow"><h1>Configuração pendente</h1><p>Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.</p></div></div>;
if(session===undefined||(session&&admin===null))return <div className="admin-center">Carregando…</div>;
if(!session)return <div className="admin-center"><LoginCard/></div>;
if(admin===false)return <div className="admin-center"><div className="card"><h2>Sem permissão</h2><p>Seu usuário entrou, mas não consta na tabela admin_users.</p><button className="btn" onClick={()=>supabase.auth.signOut()}>Sair</button></div></div>;
async function logout(){await audit('logout');await supabase.auth.signOut()}
return <div className="admin"><aside className="side"><Link to="/" className="brand"><img src={logo} alt="" width="30" height="30"/><span>Painel</span></Link><nav>{TABS.map(t=><button key={t.id} className={tab===t.id?'on':''} onClick={()=>setParams({aba:t.id})}>{t.label}</button>)}</nav><p className="side-note">Exporte as inscrições em CSV regularmente.</p><div className="side-user"><span>{admin.name||admin.username}</span><button className="link" onClick={logout}>Sair</button></div></aside><section className="admin-main">{tab==='visao'&&<OverviewPanel go={t=>setParams({aba:t})}/ >}{tab==='planilha'&&<EntrySheet/>}{tab==='sorteio'&&<DrawPanel/>}{tab==='config'&&<SettingsPanel admin={admin}/>}</section></div>}
