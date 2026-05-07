const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');
let paren = 0;
let brace = 0;
let bracket = 0;
for (let i = 0; i < content.length; i++) {
  if (content[i] === '(') paren++;
  if (content[i] === ')') paren--;
  if (content[i] === '{') brace++;
  if (content[i] === '}') brace--;
  if (content[i] === '[') bracket++;
  if (content[i] === ']') bracket--;
}
console.log('Parens:', paren);
console.log('Braces:', brace);
console.log('Brackets:', bracket);
