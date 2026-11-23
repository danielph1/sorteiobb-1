import {useEffect,useState} from 'react';
const listeners=new Set();
function emit(type,msg){for(const cb of listeners)cb({type,msg,id:Math.random()})}
export const toast={success:(msg)=>emit('ok',msg),error:(msg)=>emit('err',msg),info:(msg)=>emit('info',msg)};
export function Toaster(){const [items,setItems]=useState([]);useEffect(()=>{const fn=i=>{setItems(x=>[...x.slice(-3),i]);setTimeout(()=>setItems(x=>x.filter(t=>t.id!==i.id)),5000)};listeners.add(fn);return()=>listeners.delete(fn)},[]);return <div className="toasts" role="status" aria-live="polite">{items.map(i=><div key={i.id} className={'toast toast-'+i.type}>{i.msg}</div>)}</div>}
