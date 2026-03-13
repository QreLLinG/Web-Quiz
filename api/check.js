const fs = require("fs");

export default function handler(req, res) {
  const questions = JSON.parse(fs.readFileSync("public/questions.json"));
  function shuffle(arr){ return arr.sort(()=>Math.random()-0.5); }
  const selected = shuffle([...questions]).slice(0,5);
  const quiz = selected.map(q=>{
    let answers = shuffle([...q.answers]).slice(0,4);
    if(!answers.some(a=>a.correct)) answers[0] = q.answers.find(a=>a.correct);
    answers = shuffle(answers);
    return { id: q.id, question: q.question, answers: answers.map(a=>a.text) };
  });
  res.status(200).json(quiz);
}