const { run, clearData } = require("./init");
const cats=["프로그래밍","디자인","데이터 분석","AI","마케팅","영상 편집","비즈니스","외국어","자격증","취미"];
const levels=["입문","중급","고급"];
function pad(p,i,w=4){return `${p}${String(i).padStart(w,"0")}`;}
function dateFor(i){return `2026-10-${String((i%28)+1).padStart(2,"0")}T${String(i%24).padStart(2,"0")}:00:00.000Z`;}
async function seed(db){
  await clearData(db);
  for(let i=1;i<=50;i++) await run(db,"INSERT INTO instructors VALUES(?,?,?)",[i,`강사${i}`,`실무 프로젝트를 중심으로 가르치는 강사 ${i}`]);
  for(let i=1;i<=150;i++) await run(db,"INSERT INTO learners VALUES(?,?,?)",[i,i===1?"테스트수강생":`수강생${i}`,`learner${i}@skillorbit.test`]);
  for(let i=1;i<=120;i++) await run(db,"INSERT INTO courses VALUES(?,?,?,?,?,?,?,?,?)",[pad("C",i),((i-1)%50)+1,`${cats[(i-1)%cats.length]} 마스터 클래스 ${i}`,cats[(i-1)%cats.length],levels[i%3],4+(i%40),`실습과 과제로 완성하는 ${cats[(i-1)%cats.length]} 강의입니다.`,dateFor(i),1000-i]);
  for(let i=1;i<=300;i++) await run(db,"INSERT INTO sections VALUES(?,?,?,?)",[pad("S",i),pad("C",((i-1)%120)+1),`섹션 ${i}`,i]);
  for(let i=1;i<=500;i++) await run(db,"INSERT INTO lessons VALUES(?,?,?,?,?,?,?)",[pad("L",i),pad("C",((i-1)%120)+1),pad("S",((i-1)%300)+1),`학습 콘텐츠 ${i}`,i%5===0?"slide":"video",300+(i%900),i]);
  for(let i=1;i<=220;i++) await run(db,"INSERT INTO enrollments VALUES(?,?,?,?,?)",[pad("E",i),i%3===0?1:((i-1)%150)+1,pad("C",((i-1)%120)+1),i%11===0?"cancelled":"active",dateFor(i)]);
  for(let i=1;i<=400;i++) await run(db,"INSERT INTO progress VALUES(?,?,?,?,?,?,?)",[pad("P",i),i%4===0?1:((i-1)%150)+1,pad("C",((i-1)%120)+1),pad("L",((i-1)%500)+1),i%3===0?"completed":"started",400,dateFor(i)]);
  await run(db,"INSERT INTO progress VALUES(?,?,?,?,?,?,?)",["P9001",1,"C0001","L0001","started",120,dateFor(1)]);
  for(let i=1;i<=200;i++) await run(db,"INSERT INTO notes VALUES(?,?,?,?,?)",[pad("N",i),i%5===0?1:((i-1)%150)+1,pad("C",((i-1)%120)+1),`기존 학습 메모 ${i}`,dateFor(i)]);
  for(let i=1;i<=120;i++) await run(db,"INSERT INTO quizzes VALUES(?,?,?,?)",[pad("Q",i),pad("C",((i-1)%120)+1),`퀴즈 ${i}`,"A"]);
  for(let i=1;i<=140;i++) await run(db,"INSERT INTO assignments VALUES(?,?,?,?,?)",[pad("A",i),pad("C",((i-1)%120)+1),`과제 ${i}`,`학습 내용을 적용한 답안을 제출하세요. ${i}`,dateFor(i+10)]);
  for(let i=1;i<=200;i++) await run(db,"INSERT INTO assignment_submissions VALUES(?,?,?,?,?,?,?)",[pad("AS",i),pad("A",((i-1)%140)+1),i%4===0?1:((i-1)%150)+1,`제출 답안 ${i}`,`file${i}.txt`,"submitted",dateFor(i)]);
  for(let i=1;i<=100;i++) await run(db,"INSERT INTO certificates VALUES(?,?,?,?)",[pad("CT",i),i%6===0?1:((i-1)%150)+1,pad("C",((i-1)%120)+1),dateFor(i)]);
  for(let i=1;i<=120;i++) await run(db,"INSERT INTO notifications VALUES(?,?,?,?)",[pad("NO",i),i%4===0?1:((i-1)%150)+1,`학습 알림 ${i}`,dateFor(i)]);
  for(let i=1;i<=150;i++) await run(db,"INSERT INTO activity VALUES(?,?,?,?)",[pad("AC",i),i%3===0?1:((i-1)%150)+1,`학습 활동 로그 ${i}`,dateFor(i)]);
}
module.exports={seed};
