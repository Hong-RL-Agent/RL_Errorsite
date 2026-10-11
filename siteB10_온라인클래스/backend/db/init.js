const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const dbPath = path.join(__dirname, "..", "data", "skillorbit.sqlite");
function openDb(){return new sqlite3.Database(dbPath);}
function run(db,sql,params=[]){return new Promise((resolve,reject)=>db.run(sql,params,function done(error){error?reject(error):resolve(this);}));}
function all(db,sql,params=[]){return new Promise((resolve,reject)=>db.all(sql,params,(error,rows)=>error?reject(error):resolve(rows)));}
function get(db,sql,params=[]){return new Promise((resolve,reject)=>db.get(sql,params,(error,row)=>error?reject(error):resolve(row)));}
async function createSchema(db){
  await run(db,"CREATE TABLE IF NOT EXISTS instructors(id INTEGER PRIMARY KEY,name TEXT,bio TEXT)");
  await run(db,"CREATE TABLE IF NOT EXISTS learners(id INTEGER PRIMARY KEY,name TEXT,email TEXT)");
  await run(db,"CREATE TABLE IF NOT EXISTS courses(id TEXT PRIMARY KEY,instructorId INTEGER,title TEXT,category TEXT,level TEXT,hours INTEGER,summary TEXT,createdAt TEXT,popularity INTEGER)");
  await run(db,"CREATE TABLE IF NOT EXISTS sections(id TEXT PRIMARY KEY,courseId TEXT,title TEXT,sortOrder INTEGER)");
  await run(db,"CREATE TABLE IF NOT EXISTS lessons(id TEXT PRIMARY KEY,courseId TEXT,sectionId TEXT,title TEXT,contentType TEXT,duration INTEGER,sortOrder INTEGER)");
  await run(db,"CREATE TABLE IF NOT EXISTS enrollments(id TEXT PRIMARY KEY,learnerId INTEGER,courseId TEXT,status TEXT,createdAt TEXT)");
  await run(db,"CREATE TABLE IF NOT EXISTS progress(id TEXT PRIMARY KEY,learnerId INTEGER,courseId TEXT,lessonId TEXT,status TEXT,seconds INTEGER,updatedAt TEXT)");
  await run(db,"CREATE TABLE IF NOT EXISTS notes(id TEXT PRIMARY KEY,learnerId INTEGER,courseId TEXT,body TEXT,updatedAt TEXT)");
  await run(db,"CREATE TABLE IF NOT EXISTS quizzes(id TEXT PRIMARY KEY,courseId TEXT,title TEXT,answer TEXT)");
  await run(db,"CREATE TABLE IF NOT EXISTS quiz_submissions(id TEXT PRIMARY KEY,quizId TEXT,learnerId INTEGER,answer TEXT,score INTEGER,createdAt TEXT)");
  await run(db,"CREATE TABLE IF NOT EXISTS assignments(id TEXT PRIMARY KEY,courseId TEXT,title TEXT,prompt TEXT,dueAt TEXT)");
  await run(db,"CREATE TABLE IF NOT EXISTS assignment_submissions(id TEXT PRIMARY KEY,assignmentId TEXT,learnerId INTEGER,body TEXT,attachmentName TEXT,status TEXT,updatedAt TEXT)");
  await run(db,"CREATE TABLE IF NOT EXISTS certificates(id TEXT PRIMARY KEY,learnerId INTEGER,courseId TEXT,issuedAt TEXT)");
  await run(db,"CREATE TABLE IF NOT EXISTS notifications(id TEXT PRIMARY KEY,learnerId INTEGER,message TEXT,createdAt TEXT)");
  await run(db,"CREATE TABLE IF NOT EXISTS activity(id TEXT PRIMARY KEY,learnerId INTEGER,message TEXT,createdAt TEXT)");
}
async function clearData(db){for(const table of["activity","notifications","certificates","assignment_submissions","assignments","quiz_submissions","quizzes","notes","progress","enrollments","lessons","sections","courses","learners","instructors"]){await run(db,`DELETE FROM ${table}`);}}
module.exports={openDb,run,all,get,createSchema,clearData};
