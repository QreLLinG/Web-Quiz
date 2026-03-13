let quizData = [];
let currentQuestion = 0;
let userAnswers = [];

async function startQuiz() {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("quizScreen").style.display = "block";
  document.getElementById("resultScreen").style.display = "none";

  const res = await fetch("/quiz");
  quizData = await res.json();

  currentQuestion = 0;
  userAnswers = [];
  showQuestion();
}

function showQuestion() {
  updateProgress();
  const container = document.getElementById("quiz");

  container.classList.remove("show");
  container.classList.add("hide");

  setTimeout(() => {
    container.innerHTML = "";

    const q = quizData[currentQuestion];
    const title = document.createElement("h2");
    title.textContent = q.question;
    container.appendChild(title);

    q.answers.forEach(answer => {
      const label = document.createElement("label");
      label.classList.add("answer");

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "answer";
      radio.value = answer;

      radio.addEventListener("change", () => {
        document.querySelectorAll(".answer").forEach(a => a.classList.remove("selected"));
        label.classList.add("selected");
      });

      label.appendChild(radio);
      label.appendChild(document.createTextNode(answer));
      container.appendChild(label);
    });

    container.classList.remove("hide");
    container.classList.add("show");
  }, 200);
}

function updateProgress() {
  const total = quizData.length;
  const current = currentQuestion + 1;
  document.getElementById("progressText").innerText = "Вопрос " + current + " / " + total;
  const percent = (currentQuestion / total) * 100;
  document.getElementById("progressBar").style.width = percent + "%";
}

function nextQuestion() {
  const selected = document.querySelector("input[name='answer']:checked");
  if (!selected) { alert("Пожалуйста, выберите вариант ответа"); return; }

  userAnswers.push({ id: quizData[currentQuestion].id, answer: selected.value });
  currentQuestion++;

  if (currentQuestion < quizData.length) showQuestion();
  else finishQuiz();
}

async function finishQuiz() {
  const res = await fetch("/check", {
    method:"POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(userAnswers)
  });

  const data = await res.json();

  document.getElementById("quizScreen").style.display = "none";
  document.getElementById("resultScreen").style.display = "block";

  document.getElementById("finalScore").innerText =
    "Результат: " + data.score + " / " + quizData.length;

  const details = document.getElementById("details");
  details.innerHTML = "";

  data.details.forEach((d, i) => {
    const div = document.createElement("div");
    div.classList.add("result-card");
    div.innerHTML =
      "<p><b>" + (i+1) + ". " + d.question + "</b></p>" +
      "<p class='" + (d.correct ? "correct":"wrong") + "'>" +
      (d.correct ? "✔ Правильно":"❌ Неправильно") + "</p>";
    details.appendChild(div);

    setTimeout(()=>{
      div.classList.add("visible");
      if(i === data.details.length-1){
        document.querySelector("#resultScreen button").classList.add("visible");
      }
    }, i*300);
  });
}

function restartQuiz() {
  quizData=[]; currentQuestion=0; userAnswers=[];
  document.getElementById("resultScreen").style.display="none";
  const btn = document.querySelector("#resultScreen button");
  btn.classList.remove("visible");
  document.getElementById("startScreen").style.display="block";
}

window.onload = () => {
  document.getElementById("startScreen").style.display="block";
};