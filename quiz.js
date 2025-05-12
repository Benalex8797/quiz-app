let currentQuestion = 0;
let score = 0;
let questions = []; // This will hold the questions from the API
let timer;
let timeLeft = 15;

// DOM elements
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const nextBtn = document.getElementById("next-btn");
const endScreen = document.getElementById("end-screen");
const finalScoreEl = document.getElementById("final-score");

const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");
const completeSound = document.getElementById("complete-sound");
const bgMusic = document.getElementById("bg-music");

// Start music on first interaction (some browsers block autoplay)
document.body.addEventListener(
  "click",
  () => {
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {});
    }
  },
  { once: true }
);

// Fetch quiz questions from the Open Trivia Database API
async function fetchQuizQuestions() {
  const url = "https://opentdb.com/api.php?amount=20&type=multiple";

  try {
    const response = await fetch(url);
    const data = await response.json();
    questions = data.results.map((q) => ({
      question: q.question,
      answers: [...q.incorrect_answers, q.correct_answer].sort(
        () => Math.random() - 0.5
      ), // Randomize the answers
      correct: q.correct_answer,
    }));
    startQuestion(); // Start the game after questions are loaded
  } catch (error) {
    console.error("Error fetching questions:", error);
  }
}

// Start the first question
function startQuestion() {
  clearInterval(timer);
  timeLeft = 15;
  timerEl.textContent = timeLeft;
  timer = setInterval(updateTimer, 1000);

  if (questions.length === 0) {
    alert("No questions loaded!");
    return;
  }

  const current = questions[currentQuestion];
  questionEl.innerHTML = current.question;
  answersEl.innerHTML = "";

  current.answers.forEach((answer) => {
    const btn = document.createElement("button");
    btn.textContent = answer;
    btn.onclick = () => checkAnswer(answer);
    answersEl.appendChild(btn);
  });

  nextBtn.style.display = "none";
}

function updateTimer() {
  timeLeft--;
  timerEl.textContent = timeLeft;
  if (timeLeft === 0) {
    clearInterval(timer);
    showAnswer(null); // Time is up, show the answer
  }
}

// Check if the selected answer is correct
function checkAnswer(answer) {
  clearInterval(timer);
  const correct = questions[currentQuestion].correct;
  showAnswer(answer === correct);
}

// Display the result of the answer and update score
function showAnswer(isCorrect) {
  const allBtns = answersEl.querySelectorAll("button");
  allBtns.forEach((btn) => {
    if (btn.textContent === questions[currentQuestion].correct) {
      btn.style.backgroundColor = "green";
    } else {
      btn.style.backgroundColor = "red";
    }
    btn.disabled = true;
  });

  if (isCorrect) {
    score++;
    correctSound.play();
  } else {
    wrongSound.play();
  }

  scoreEl.textContent = score;
  nextBtn.style.display = "inline-block";
}

nextBtn.addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    startQuestion();
  } else {
    showEndScreen();
  }
});

// Show the end screen when quiz finishes
function showEndScreen() {
  saveScore(score);
  document.querySelector(".quiz-container").innerHTML = `
      <h2>Quiz Finished!</h2>
      <p>Your final score: <span id="final-score">${score}</span></p>
      <button onclick="location.reload()">Restart</button>
      <br /><br />
      <a href="admin.html">Go to Admin Page</a>
    `;
  completeSound.play();
}

// Save the score in localStorage
function saveScore(score) {
  const scores = JSON.parse(localStorage.getItem("quizScores")) || [];
  scores.push({ date: new Date().toLocaleString(), score });
  localStorage.setItem("quizScores", JSON.stringify(scores));
}

// Fetch questions when the page loads
window.onload = fetchQuizQuestions;
