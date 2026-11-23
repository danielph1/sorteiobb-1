let loaded='';
export function loadPixel(id){
 if(!id||loaded===id||typeof window==='undefined')return;loaded=id;
 window.fbq=window.fbq||function(){(window.fbq.q=window.fbq.q||[]).push(arguments)};
 if(!document.querySelector('script[data-meta-pixel]')){const s=document.createElement('script');s.dataset.metaPixel='1';s.async=true;s.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(s)}
 window.fbq('init',id);window.fbq('track','PageView');
}
export function track(event,params={},custom=false){try{if(window.fbq)window.fbq(custom?'trackCustom':'track',event,params)}catch{}}
