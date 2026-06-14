// QUESTIONS
const questions = [
  { q: "What does HTML stand for?", opts: ["Hyper Text Markup Language","High Tech Modern Language","Hyper Transfer Markup Logic","Home Tool Markup Language"], ans: 0 },
  { q: "Which CSS property changes the text color?", opts: ["font-color","text-color","color","foreground"], ans: 2 },
  { q: "Which language runs directly in the browser?", opts: ["Python","Java","JavaScript","C++"], ans: 2 },
  { q: "What does DOM stand for?", opts: ["Document Object Model","Data Object Management","Display Output Mode","Document Order Map"], ans: 0 },
  { q: "Which HTML tag is used for a hyperlink?", opts: ["<link>","<href>","<url>","<a>"], ans: 3 },
  { q: "Which CSS property controls spacing INSIDE an element?", opts: ["margin","spacing","padding","border"], ans: 2 },
  { q: "What does API stand for?", opts: ["Applied Program Interface","Application Programming Interface","Automated Process Integration","Advanced Protocol Input"], ans: 1 },
  { q: "Which JS method selects an element by its ID?", opts: ["querySelector()","getElement()","getElementById()","findById()"], ans: 2 },
  { q: "Which Bootstrap class creates a full-width container?", opts: ["container","container-xl","container-fluid","container-max"], ans: 2 },
  { q: "Which keyword declares a constant in modern JavaScript?", opts: ["var","let","def","const"], ans: 3 }
];

// STATE
const TOTAL_TIME = 120;
let current = 0, score = 0, timeLeft = TOTAL_TIME, timer = null, answered = false;

const $ = id => document.getElementById(id);

// PARTICIPANT TRACKING
function getTotalParticipants() {
  return parseInt(localStorage.getItem('quizParticipants') || '0');
}
function incrementParticipants() {
  const count = getTotalParticipants() + 1;
  localStorage.setItem('quizParticipants', count);
  return count;
}
function getScoreHistory() {
  return JSON.parse(localStorage.getItem('quizScoreHistory') || '[]');
}
function saveScoreHistory(score) {
  const history = getScoreHistory();
  history.push({ score, total: questions.length, date: new Date().toLocaleDateString() });
  localStorage.setItem('quizScoreHistory', JSON.stringify(history));
}
function getAverageScore() {
  const history = getScoreHistory();
  if (history.length === 0) return 0;
  const sum = history.reduce((acc, h) => acc + h.score, 0);
  return Math.round((sum / history.length / questions.length) * 100);
}

// WELCOME STATS
function updateWelcomeStats() {
  $('totalParticipants').textContent = getTotalParticipants();
  $('avgScore').textContent = getAverageScore() + '%';
}

// TIMER
function formatTime(s) { return Math.floor(s/60) + ':' + (s%60<10?'0':'') + s%60; }

function updateTimerUI() {
  $('timerDisplay').textContent = formatTime(timeLeft);
  $('timerBar').style.width = (timeLeft / TOTAL_TIME * 100) + '%';
  if (timeLeft <= 20) {
    $('timerBar').style.background = 'linear-gradient(90deg,#ef4444,#dc2626)';
    $('timerDisplay').className = 'danger';
  } else if (timeLeft <= 40) {
    $('timerBar').style.background = 'linear-gradient(90deg,#f59e0b,#d97706)';
    $('timerDisplay').className = 'warn';
  } else {
    $('timerBar').style.background = 'linear-gradient(90deg,#667eea,#764ba2)';
    $('timerDisplay').className = '';
  }
}

function startTimer() {
  timeLeft = TOTAL_TIME; updateTimerUI(); clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) { clearInterval(timer); showResult(); }
  }, 1000);
}

// LOAD QUESTION
function loadQuestion() {
  answered = false;
  const q = questions[current];
  $('qCounter').textContent    = (current+1) + ' / ' + questions.length;
  $('qNum').textContent        = 'Question ' + (current+1) + ' of ' + questions.length;
  $('progressBar').style.width = (current / questions.length * 100) + '%';
  $('question').textContent    = q.q;
  $('options').innerHTML = '';
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'opt-btn';
    btn.innerHTML = `<span class="opt-letter">${['A','B','C','D'][i]}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => pickAnswer(btn, i));
    $('options').appendChild(btn);
  });
  const nb = $('nextBtn');
  nb.classList.add('hidden'); nb.disabled = true;
  nb.textContent = current === questions.length - 1 ? '🎉 See Results' : 'Next Question →';
}

// PICK ANSWER
function pickAnswer(btn, idx) {
  if (answered) return;
  answered = true;
  const correct = questions[current].ans;
  document.querySelectorAll('.opt-btn').forEach((b, i) => {
    b.disabled = true;
    if (i === correct) b.classList.add('correct');
    else if (i === idx && idx !== correct) b.classList.add('wrong');
    else b.classList.add('dimmed');
  });
  if (idx === correct) { score++; $('scoreVal').textContent = score; }
  $('nextBtn').disabled = false;
  $('nextBtn').classList.remove('hidden');
}

// SHOW RESULT
function showResult() {
  clearInterval(timer);
  const participantNum = incrementParticipants();
  saveScoreHistory(score);
  const avg = getAverageScore();
  const pct = Math.round(score / questions.length * 100);

  $('quizScreen').classList.add('hidden');
  $('resultScreen').classList.remove('hidden');

  $('participantNum').textContent  = '#' + participantNum;
  $('ringScore').textContent       = score + '/' + questions.length;
  $('correctCount').textContent    = score;
  $('wrongCount').textContent      = questions.length - score;
  $('totalPlayed').textContent     = participantNum;
  $('yourScoreResult').textContent = pct + '%';
  $('avgScoreResult').textContent  = avg + '%';

  $('finalMsg').textContent =
    pct === 100 ? '🏆 Perfect! You are a Web Dev genius!' :
    pct >= 80   ? '🎉 Excellent! You really know your stuff!' :
    pct >= 60   ? '👍 Good job! Keep practicing!' :
    pct >= 40   ? '📚 Keep studying — you\'re getting there!' :
                  '💪 Don\'t give up! Review and try again!';

  const circ = 2 * Math.PI * 50;
  $('scoreRing').style.strokeDasharray  = circ;
  $('scoreRing').style.strokeDashoffset = circ;
  setTimeout(() => {
    $('scoreRing').style.strokeDashoffset = circ - (pct / 100) * circ;
  }, 100);
}

// RESET
function resetQuiz() {
  current = 0; score = 0; answered = false;
  $('scoreVal').textContent = 0;
  $('timerDisplay').className = '';
  $('resultScreen').classList.add('hidden');
  $('quizScreen').classList.remove('hidden');
  startTimer(); loadQuestion();
}

// INIT
updateWelcomeStats();
$('startBtn').addEventListener('click', () => {
  $('welcomeScreen').classList.add('hidden');
  $('quizScreen').classList.remove('hidden');
  startTimer(); loadQuestion();
});
$('nextBtn').addEventListener('click', () => {
  current++;
  if (current < questions.length) loadQuestion(); else showResult();
});
$('restartBtn').addEventListener('click', resetQuiz);
