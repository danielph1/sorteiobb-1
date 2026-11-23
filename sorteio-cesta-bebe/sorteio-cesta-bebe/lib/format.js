export const onlyDigits=v=>String(v||'').replace(/\D/g,'');
export const maskCpf=v=>onlyDigits(v).slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
export const maskPhone=v=>{const d=onlyDigits(v).slice(0,11);if(d.length<3)return d;return `(${d.slice(0,2)}) ${d.length>10?d.slice(2,7):d.slice(2,6)}${d.length>6?'-'+d.slice(d.length>10?7:6):''}`};
export const maskDate=v=>onlyDigits(v).slice(0,8).replace(/(\d{2})(\d)/,'$1/$2').replace(/(\d{2}\/\d{2})(\d)/,'$1/$2');
export function brDateToIso(v){if(!v)return null;const m=v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(!m)return null;const d=new Date(`${m[3]}-${m[2]}-${m[1]}T12:00:00Z`);return d.getUTCDate()===Number(m[1])&&d.getUTCMonth()+1===Number(m[2])?`${m[3]}-${m[2]}-${m[1]}`:null}
export function validCpf(value){const d=onlyDigits(value);if(d.length!==11||/^(\d)\1+$/.test(d))return false;for(let k=9;k<11;k++){let sum=0;for(let i=0;i<k;i++)sum+=Number(d[i])*(k+1-i);let check=(sum*10)%11;if(check===10)check=0;if(check!==Number(d[k]))return false}return true}
export const UFS='AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO'.split(' ');
export const DISCOVERY=['Instagram','Facebook','WhatsApp','Google','Indicação de amigos','Outros'];
export const fmtDate=x=>x?new Date(`${x}T12:00:00`).toLocaleDateString('pt-BR'):'—';
export const fmtDateTime=x=>x?new Date(x).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'—';
