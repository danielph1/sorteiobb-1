import {supabase} from './supabase.js';
export async function callApi(path,{method='GET',body}={}){
 const {data:{session}}=await supabase.auth.getSession();
 const r=await fetch(path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(session?{Authorization:`Bearer ${session.access_token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await r.json().catch(()=>({error:'Resposta inválida do servidor.'}));
 if(!r.ok)throw new Error(data.error||'Erro de comunicação.');return data;
}
export async function audit(action,details={}){
 try{const {data:{user}}=await supabase.auth.getUser();if(user)await supabase.from('audit_log').insert({who:user.email||'admin',action,details});}catch{}
}
