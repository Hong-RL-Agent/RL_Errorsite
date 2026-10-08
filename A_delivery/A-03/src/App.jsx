'use client';
import React,{useState} from 'react';
import {Frame,useService} from '../../shared/client.jsx';

function Courses(){const svc=useService('/api/enrolments'),s=svc.state;return <Frame name="배움 스튜디오" service={svc}>{s&&<><p>학습 시간을 확인하고 원하는 강의를 신청하세요.</p><table><thead><tr><th>강의</th><th>시간</th><th>신청</th></tr></thead><tbody>{s.courses.map(c=><tr key={c.id}><td>{c.title}</td><td>{c.hours}시간</td><td><button onClick={()=>svc.send('join',{id:c.id})}>{c.title} 수강하기</button><button onClick={()=>svc.send('withdraw',{id:c.id})}>{c.title} 취소</button></td></tr>)}</tbody></table><section className="panel"><h2>내 강의실</h2><ul>{s.enrolled.map((id,i)=><li key={i}>{s.courses.find(c=>c.id===id).title}</li>)}</ul><button onClick={svc.refresh}>신청 내역 조회</button></section></>}</Frame>}
export default Courses;
