import {createContext,useContext,useEffect,useState,useCallback} from 'react';
import {supabase,configured} from './supabase.js';
import {loadPixel} from './pixel.js';
const Ctx=createContext({status:null,settings:{},reload:()=>{}});
export const useSite=()=>useContext(Ctx);
export function SiteProvider({children}){
 const [status,setStatus]=useState(null);
 const reload=useCallback(async()=>{if(!configured)return;const {data,error}=await supabase.rpc('public_status');if(!error&&data){setStatus(data);if(data.settings?.meta_pixel_id)loadPixel(data.settings.meta_pixel_id)}},[]);
 useEffect(()=>{reload()},[reload]);
 return <Ctx.Provider value={{status,settings:status?.settings||{},reload}}>{children}</Ctx.Provider>
}
