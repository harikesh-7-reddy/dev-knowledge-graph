import {useEffect,useState} from 'react'; import {api} from '../api/client.js';
export function useHealth(){const[down,setDown]=useState(false);useEffect(()=>{const run=()=>api.health().then(()=>setDown(false)).catch(()=>setDown(true));run();const t=setInterval(run,15000);return()=>clearInterval(t);},[]);return down;}
