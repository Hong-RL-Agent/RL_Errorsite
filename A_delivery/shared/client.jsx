'use client';
import {useEffect,useState} from 'react';
export function useService(base) {
  const [state,setState]=useState(null),[message,setMessage]=useState('');
  async function refresh(){const r=await fetch(base,{cache:'no-store'});if(!r.ok)throw new Error('데이터를 불러올 수 없습니다.');setState(await r.json());}
  useEffect(()=>{refresh().catch(e=>setMessage(e.message));},[base]);
  async function send(operation,body={},method='POST') {
    const r=await fetch(`${base}/${operation}`,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await r.json();if(data.message)setMessage(data.message);else setMessage('처리되었습니다.');
    if(!data.message||Object.keys(data).length>1)setState(data);
    return data;
  }
  async function reset(){const r=await fetch('/api/test/reset',{method:'POST'});if(!r.ok)throw new Error('초기화에 실패했습니다.');window.location.assign('/');}
  return {state,send,reset,refresh,message};
}
export function Frame({name,children,service}) {
  return <><header><a href="/">{name}</a><button onClick={service.reset}>처음부터</button></header><main><h1>{name}</h1>{service.state?children:<p>불러오는 중…</p>}<p role="status">{service.message}</p></main><footer>개인 실습 서비스 · 2026</footer></>;
}
