// script.js

const QUIZ_URL = "/api/quiz";
const CHECK_URL = "/api/check";

let quizData = [];
let currentQuestion = 0;
let userAnswers = [];

const startScreen = document.getElementById("startScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");
const quizContainer = document.getElementById("quiz");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const finalScore = document.getElementById("finalScore");
const detailsContainer = document.getElementById("details");

// Функция старта квиза
async function startQuiz() {
  startScreen.style.display = "none";
  quizScreen.style.display = "block";
  userAnswers = [];
  currentQuestion = 0;
  await loadQuiz();
  showQuestion();
}

// Загрузка вопросов с сервера
async function loadQuiz() {
  try {
    const res = await fetch(QUIZ_URL);
    quizData = await res.json();
  } catch (err) {
    console.error("Ошибка загрузки вопросов:", err);
  }
}

// Отображение текущего вопроса
function showQuestion() {
  quizContainer.innerHTML = "";
  const q = quizData[currentQuestion];

  const questionEl = document.createElement("h2");
  questionEl.textContent = q.question;
  quizContainer.appendChild(questionEl);

  q.answers.forEach(ans => {
    const btn = document.createElement("button");
    btn.textContent = ans;
    btn.classList.add("answerBtn");
    btn.addEventListener("click", () => selectAnswer(ans, btn));
    quizContainer.appendChild(btn);
  });

  // Обновление прогресс-бара
  progressText.textContent = `Question ${currentQuestion + 1} / ${quizData.length}`;
  progressBar.style.width = `${((currentQuestion) / quizData.length) * 100}%`;
}

// Выбор ответа
function selectAnswer(answer, btn) {
  // Анимация выбора
  btn.classList.add("selected");
  setTimeout(() => btn.classList.remove("selected"), 300);

  // Записываем ответ
  userAnswers[currentQuestion] = { id: quizData[currentQuestion].id, answer };

  // Если есть следующий вопрос, показываем кнопку Next
  if(currentQuestion < quizData.length - 1) {
    const nextBtn = document.querySelector("#quizScreen button");
    nextBtn.style.display = "block";
  } else {
    submitQuiz();
  }
}

// Переход к следующему вопросу
function nextQuestion() {
  currentQuestion++;
  showQuestion();
  const nextBtn = document.querySelector("#quizScreen button");
  nextBtn.style.display = "none";
}

// Отправка ответов на сервер и показ результатов
async function submitQuiz() {
  try {
    const res = await fetch(CHECK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userAnswers)
    });
    const result = await res.json();
    showResults(result);
  } catch (err) {
    console.error("Ошибка отправки ответов:", err);
  }
}

// Отображение результатов
function showResults(result) {
  quizScreen.style.display = "none";
  resultScreen.style.display = "block";

  finalScore.textContent = `You scored ${result.score} / ${result.total}`;

  detailsContainer.innerHTML = "";
  result.details.forEach(d => {
    const p = document.createElement("p");
    p.textContent = `${d.question} — ${d.correct ? "✔ Correct" : "❌ Incorrect"}`;
    // Анимация подпрыгивания
    p.classList.add("resultItem");
    detailsContainer.appendChild(p);
  });

  // Прогресс бар на финальном экране
  progressBar.style.width = "100%";
  progressText.textContent = "Quiz Completed!";
}

// Кнопка Restart
function restartQuiz() {
  resultScreen.style.display = "none";
  startScreen.style.display = "block";
  progressBar.style.width = "0%";
  progressText.textContent = "";
}