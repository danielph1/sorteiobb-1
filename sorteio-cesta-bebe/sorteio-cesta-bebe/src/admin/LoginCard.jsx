import logo from '../assets/logo.svg';
import {useState} from 'react';
import {supabase,errMsg} from '../lib/supabase.js';
import {audit} from '../lib/api.js';
export default function LoginCard(){const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
async function submit(e){e.preventDefault();setBusy(true);setErr('');const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password});setBusy(false);if(error){setErr(error.message==='Invalid login credentials'?'Usuário ou senha incorretos.':errMsg(error));return}await supabase.from('admin_users').update({last_login:new Date().toISOString()}).eq('user_id',data.user.id);await audit('login')}
return <form className="card login" onSubmit={submit}><img src={logo} alt="" width="44" height="44"/><h1>Painel do organizador</h1><label>Usuário (e-mail)<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required/></label><label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label>{err&&<p className="err">{err}</p>}<button className="btn" disabled={busy}>{busy?'Entrando…':'Entrar'}</button></form>}
