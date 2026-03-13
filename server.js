const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.static("public"));
app.use(express.json());

const questions = JSON.parse(fs.readFileSync("questions.json"));

// перемешивание массива
function shuffle(arr){
  return arr.sort(()=>Math.random()-0.5);
}

// выдаем 5 случайных вопросов
app.get("/quiz", (req,res)=>{
  const selected = shuffle([...questions]).slice(0,5);
  
  const quiz = selected.map(q=>{
    let answers = shuffle([...q.answers]).slice(0,4);

    // обязательно добавляем правильный
    if(!answers.some(a=>a.correct)){
      answers[0] = q.answers.find(a=>a.correct);
    }

    answers = shuffle(answers);

    return {
      id: q.id,
      question: q.question,
      answers: answers.map(a=>a.text)
    }
  });

  res.json(quiz);
});

// проверка ответов
app.post("/check", (req,res)=>{
  let results = [];
  let score = 0;

  req.body.forEach(user=>{
    const q = questions.find(ques=>ques.id===user.id);
    const correctAnswer = q.answers.find(a=>a.correct).text;
    const isCorrect = user.answer === correctAnswer;
    if(isCorrect) score++;

    results.push({
      question: q.question,
      correct: isCorrect
    });
  });

  res.json({
    score,
    total: req.body.length,
    details: results
  });
});

app.listen(3000, ()=>console.log("Server started on http://localhost:3000"));