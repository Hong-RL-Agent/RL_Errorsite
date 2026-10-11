const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { openDb, run, all, get, createSchema } = require("./db/init");
const { seed } = require("./db/seed");

const PORT = 9724;
fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
const db = openDb();
const app = express();
app.use(cors({ origin: "http://localhost:5325" }));
app.use(express.json());
const now = () => new Date().toISOString();
const uid = (p) => `${p}${Date.now()}${Math.floor(Math.random() * 10000)}`;
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
async function log(learnerId, message){ await run(db,"INSERT INTO activity VALUES(?,?,?,?)",[uid("AC"),learnerId||1,message,now()]); }
async function bootstrap(){ await createSchema(db); const row=await get(db,"SELECT COUNT(*) AS count FROM courses"); if(!row||row.count===0) await seed(db); }

async function completion(courseId, learnerId){
  const total = await get(db,"SELECT COUNT(*) AS count FROM lessons WHERE courseId=?",[courseId]);
  const done = await get(db,"SELECT COUNT(DISTINCT lessonId) AS count FROM progress WHERE courseId=? AND learnerId=? AND status='completed'",[courseId,learnerId]);
  const quiz = await get(db,"SELECT COUNT(*) AS count FROM quiz_submissions qs JOIN quizzes q ON q.id=qs.quizId WHERE q.courseId=? AND qs.learnerId=? AND qs.score>=70",[courseId,learnerId]);
  const assignment = await get(db,"SELECT COUNT(*) AS count FROM assignment_submissions s JOIN assignments a ON a.id=s.assignmentId WHERE a.courseId=? AND s.learnerId=? AND s.status='submitted'",[courseId,learnerId]);
  const progressPercent = total.count ? Math.round((done.count / total.count) * 100) : 0;
  return { totalLessons: total.count, completedLessons: done.count, progressPercent, quizPassed: quiz.count > 0, assignmentSubmitted: assignment.count > 0, eligible: progressPercent >= 80 && quiz.count > 0 && assignment.count > 0 };
}

app.get("/api/health",(req,res)=>res.json({ok:true,siteId:"B-10",name:"SkillOrbit",use:"Unseen Test"}));
app.get("/api/courses", asyncHandler(async(req,res)=>{
  const p=[]; const c=[];
  if(req.query.q){c.push("(co.title LIKE ? OR co.summary LIKE ?)");p.push(`%${req.query.q}%`,`%${req.query.q}%`);}
  if(req.query.category){c.push("co.category=?");p.push(req.query.category);}
  if(req.query.level){c.push("co.level=?");p.push(req.query.level);}
  const where=c.length?`WHERE ${c.join(" AND ")}`:"";
  const order=req.query.sort==="latest"?"co.createdAt DESC":"co.popularity DESC";
  const items=await all(db,`SELECT co.*, i.name AS instructorName FROM courses co JOIN instructors i ON i.id=co.instructorId ${where} ORDER BY ${order} LIMIT 60`,p);
  res.json({items});
}));
app.get("/api/courses/:id", asyncHandler(async(req,res)=>{const course=await get(db,"SELECT co.*, i.name AS instructorName, i.bio AS instructorBio FROM courses co JOIN instructors i ON i.id=co.instructorId WHERE co.id=?",[req.params.id]); if(!course)return res.status(404).json({error:"강의를 찾을 수 없습니다."}); res.json({course});}));
app.get("/api/courses/:id/syllabus", asyncHandler(async(req,res)=>{const learnerId=req.query.learnerId||1; const items=await all(db,"SELECT l.*, EXISTS(SELECT 1 FROM progress p WHERE p.lessonId=l.id AND p.learnerId=? AND p.status='completed') AS completed FROM lessons l WHERE l.courseId=? ORDER BY l.sortOrder LIMIT 20",[learnerId,req.params.id]); res.json({items:items.map(i=>({...i,completed:Boolean(i.completed)}))});}));
app.get("/api/instructors", asyncHandler(async(req,res)=>res.json({items:await all(db,"SELECT * FROM instructors ORDER BY id")})));
app.get("/api/instructors/:id", asyncHandler(async(req,res)=>res.json({instructor:await get(db,"SELECT * FROM instructors WHERE id=?",[req.params.id])})));
app.get("/api/learners", asyncHandler(async(req,res)=>res.json({items:await all(db,"SELECT * FROM learners ORDER BY id")})));
app.get("/api/learners/:id", asyncHandler(async(req,res)=>res.json({learner:await get(db,"SELECT * FROM learners WHERE id=?",[req.params.id])})));
app.get("/api/enrollments", asyncHandler(async(req,res)=>res.json({items:await all(db,"SELECT e.*, c.title AS courseTitle FROM enrollments e JOIN courses c ON c.id=e.courseId WHERE e.learnerId=? ORDER BY e.createdAt DESC",[req.query.learnerId||1])})));
app.post("/api/enrollments", asyncHandler(async(req,res)=>{const exists=await get(db,"SELECT id FROM enrollments WHERE learnerId=? AND courseId=? AND status='active'",[req.body.learnerId,req.body.courseId]); if(exists)return res.json({id:exists.id,exists:true}); const id=uid("E"); await run(db,"INSERT INTO enrollments VALUES(?,?,?,?,?)",[id,req.body.learnerId,req.body.courseId,"active",now()]); await log(req.body.learnerId,"수강 신청을 완료했습니다."); res.status(201).json({id});}));
app.delete("/api/enrollments/:id", asyncHandler(async(req,res)=>{await run(db,"UPDATE enrollments SET status='cancelled' WHERE id=?",[req.params.id]); res.json({ok:true});}));
app.get("/api/lessons/:id", asyncHandler(async(req,res)=>res.json({lesson:await get(db,"SELECT * FROM lessons WHERE id=?",[req.params.id])})));
app.get("/api/lessons/:id/slides", asyncHandler(async(req,res)=>{const lesson=await get(db,"SELECT * FROM lessons WHERE id=?",[req.params.id]); const items=Array.from({length:8},(_,i)=>({id:`${req.params.id}-SL${i+1}`,lessonId:req.params.id,title:`${lesson?.title||"강의"} 슬라이드 ${i+1}`,body:`핵심 개념과 실습 단계 ${i+1}을 설명합니다.`,index:i+1,total:8})); res.json({items});}));
app.get("/api/learning-progress", asyncHandler(async(req,res)=>res.json({items:await all(db,"SELECT * FROM progress WHERE learnerId=? AND (?='' OR courseId=?)",[req.query.learnerId||1,req.query.courseId||"",req.query.courseId||""])})));
app.post("/api/learning-progress", asyncHandler(async(req,res)=>{const existing=await get(db,"SELECT * FROM progress WHERE learnerId=? AND lessonId=?",[req.body.learnerId,req.body.lessonId]); if(existing){await run(db,"UPDATE progress SET status=?, seconds=?, updatedAt=? WHERE id=?",[req.body.status,req.body.seconds||existing.seconds,now(),existing.id]); return res.json({id:existing.id});} const id=uid("P"); await run(db,"INSERT INTO progress VALUES(?,?,?,?,?,?,?)",[id,req.body.learnerId,req.body.courseId,req.body.lessonId,req.body.status,req.body.seconds||0,now()]); res.status(201).json({id});}));
app.patch("/api/learning-progress/:id", asyncHandler(async(req,res)=>{await run(db,"UPDATE progress SET status=COALESCE(?,status), seconds=COALESCE(?,seconds), updatedAt=? WHERE id=?",[req.body.status,req.body.seconds,now(),req.params.id]); res.json({ok:true});}));
app.get("/api/study-notes", asyncHandler(async(req,res)=>res.json({items:await all(db,"SELECT * FROM notes WHERE learnerId=? AND courseId=? ORDER BY updatedAt DESC",[req.query.learnerId||1,req.query.courseId])})));
app.post("/api/study-notes", asyncHandler(async(req,res)=>{const id=uid("N"); await run(db,"INSERT INTO notes VALUES(?,?,?,?,?)",[id,req.body.learnerId,req.body.courseId,req.body.body,now()]); res.status(201).json({note:await get(db,"SELECT * FROM notes WHERE id=?",[id])});}));
app.patch("/api/study-notes/:id", asyncHandler(async(req,res)=>{await run(db,"UPDATE notes SET body=?, updatedAt=? WHERE id=?",[req.body.body,now(),req.params.id]); res.json({note:await get(db,"SELECT * FROM notes WHERE id=?",[req.params.id])});}));
app.delete("/api/study-notes/:id", asyncHandler(async(req,res)=>{await run(db,"DELETE FROM notes WHERE id=?",[req.params.id]); res.json({ok:true});}));
app.get("/api/quizzes", asyncHandler(async(req,res)=>res.json({items:await all(db,"SELECT * FROM quizzes WHERE (?='' OR courseId=?)",[req.query.courseId||"",req.query.courseId||""])})));
app.get("/api/quizzes/:id", asyncHandler(async(req,res)=>res.json({quiz:await get(db,"SELECT * FROM quizzes WHERE id=?",[req.params.id])})));
app.post("/api/quizzes/:id/submissions", asyncHandler(async(req,res)=>{const quiz=await get(db,"SELECT * FROM quizzes WHERE id=?",[req.params.id]); const score=quiz&&quiz.answer===req.body.answer?100:0; const id=uid("QS"); await run(db,"INSERT INTO quiz_submissions VALUES(?,?,?,?,?,?)",[id,req.params.id,req.body.learnerId,req.body.answer,score,now()]); res.status(201).json({id,score});}));
app.get("/api/assignments", asyncHandler(async(req,res)=>res.json({items:await all(db,"SELECT a.*, c.title AS courseTitle FROM assignments a JOIN courses c ON c.id=a.courseId ORDER BY a.id LIMIT 40")})));
app.get("/api/assignments/:id", asyncHandler(async(req,res)=>res.json({assignment:await get(db,"SELECT * FROM assignments WHERE id=?",[req.params.id])})));
app.post("/api/assignments/:id/submissions", asyncHandler(async(req,res)=>{const id=uid("AS"); await run(db,"INSERT INTO assignment_submissions VALUES(?,?,?,?,?,?,?)",[id,req.params.id,req.body.learnerId,req.body.body,req.body.attachmentName,"submitted",now()]); res.status(201).json({id});}));
app.patch("/api/assignments/:id/submissions/:submissionId", asyncHandler(async(req,res)=>{await run(db,"UPDATE assignment_submissions SET body=?, attachmentName=?, updatedAt=? WHERE id=?",[req.body.body,req.body.attachmentName,now(),req.params.submissionId]); res.json({ok:true});}));
app.delete("/api/assignments/:id/submissions/:submissionId", asyncHandler(async(req,res)=>{await run(db,"DELETE FROM assignment_submissions WHERE id=?",[req.params.submissionId]); res.json({ok:true});}));
app.get("/api/completion-rules/:courseId", asyncHandler(async(req,res)=>res.json({rules:{courseId:req.params.courseId,minProgress:80,quizRequired:true,assignmentRequired:true}})));
app.get("/api/completion-status/:courseId", asyncHandler(async(req,res)=>res.json({status:await completion(req.params.courseId,req.query.learnerId||1)})));
app.get("/api/certificates", asyncHandler(async(req,res)=>res.json({items:await all(db,"SELECT ct.*, c.title AS courseTitle FROM certificates ct JOIN courses c ON c.id=ct.courseId WHERE ct.learnerId=? ORDER BY ct.issuedAt DESC",[req.query.learnerId||1])})));
app.post("/api/certificates", asyncHandler(async(req,res)=>{const status=await completion(req.body.courseId,req.body.learnerId); if(!status.eligible)return res.status(409).json({error:"수료 조건을 충족하지 못했습니다.",status}); const id=uid("CT"); await run(db,"INSERT INTO certificates VALUES(?,?,?,?)",[id,req.body.learnerId,req.body.courseId,now()]); res.status(201).json({id});}));
app.get("/api/learning-activity", asyncHandler(async(req,res)=>res.json({items:await all(db,"SELECT * FROM activity WHERE learnerId=? ORDER BY createdAt DESC",[req.query.learnerId||1])})));
app.get("/api/notifications", asyncHandler(async(req,res)=>res.json({items:await all(db,"SELECT * FROM notifications WHERE learnerId=? ORDER BY createdAt DESC",[req.query.learnerId||1])})));
app.post("/api/test/reset", asyncHandler(async(req,res)=>{await seed(db); res.json({ok:true,restored:true,siteId:"B-10"});}));
app.use((error,req,res,next)=>res.status(500).json({error:"서버 요청 처리 중 오류가 발생했습니다."}));
bootstrap().then(()=>app.listen(PORT,()=>console.log(`SkillOrbit B-10 API listening on http://localhost:${PORT}`))).catch((error)=>{console.error(error);process.exit(1);});
