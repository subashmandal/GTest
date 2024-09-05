const puzzles = [
    { question: "What is 5 + 3?", answer: "8" },
    { question: "What is the capital of France?", answer: "Paris" },
    { question: "How many legs does a spider have?", answer: "8" },
    { question: "What is the square root of 16?", answer: "4" },
    { question: "Spell the word 'Hello'", answer: "Hello" }
];

let score = 0;
let currentPuzzleIndex = 0;
let isGamePaused = false;
let timerInterval;
let timeLeft = 20; // Set initial timer to 20 seconds

// DOM Elements
const puzzleQuestion = document.getElementById('puzzle-question');
const feedback = document.getElementById('feedback');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const finalScore = document.getElementById('final-score');

// Start button event listener
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);

function startGame() {
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    restartBtn.classList.add('hidden');
    finalScore.classList.add('hidden');
    isGamePaused = false;
    score = 0;
    scoreDisplay.innerText = `Score: ${score}`;
    currentPuzzleIndex = 0;
    timeLeft = 20;
    loadPuzzle();
    startTimer();
    startSpeechRecognition();
}

function loadPuzzle() {
    if (currentPuzzleIndex < puzzles.length) {
        puzzleQuestion.innerText = puzzles[currentPuzzleIndex].question;
        resetTimer(); // Reset the timer for the new puzzle
    } else {
        gameOver();
    }
}

function togglePause() {
    if (isGamePaused) {
        isGamePaused = false;
        pauseBtn.innerText = 'Pause';
        startTimer();
        startSpeechRecognition();
    } else {
        isGamePaused = true;
        pauseBtn.innerText = 'Resume';
        stopTimer();
        stopSpeechRecognition();
    }
}

function restartGame() {
    startGame();
}

function startTimer() {
    timerDisplay.innerText = `Time Left: ${timeLeft}`;
    timerInterval = setInterval(() => {
        if (!isGamePaused && timeLeft > 0) { // Ensure time doesn't go negative
            timeLeft--;

            // Blink and change color when time left is 5 seconds or less
            if (timeLeft <= 5) {
                timerDisplay.classList.add('blink', 'red');
            } else {
                timerDisplay.classList.remove('blink', 'red');
            }

            if (timeLeft === 0) {
                timerDisplay.innerText = `Time Left: 0`;
                timerDisplay.classList.remove('blink');
                gameOver();
            } else {
                timerDisplay.innerText = `Time Left: ${timeLeft}`;
            }
        }
    }, 1000); // Decrease by 1 second every 1000 milliseconds
}

function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = 20; // Reset time to 20 seconds for each new puzzle
    timerDisplay.innerText = `Time Left: ${timeLeft}`;
    timerDisplay.classList.remove('blink', 'red'); // Remove blink and red classes when timer resets
    startTimer();
}

function stopTimer() {
    clearInterval(timerInterval);
}

// Speech Recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
    const spokenWord = event.results[0][0].transcript.toLowerCase();
    checkAnswer(spokenWord);
};

recognition.onend = () => {
    if (!isGamePaused) recognition.start();
};

function startSpeechRecognition() {
    recognition.start();
}

function stopSpeechRecognition() {
    recognition.stop();
}

function checkAnswer(spokenWord) {
    const correctAnswer = puzzles[currentPuzzleIndex].answer.toLowerCase();

    if (spokenWord === correctAnswer) {
        feedback.innerText = "Correct!";
        score++;
        scoreDisplay.innerText = `Score: ${score}`;
        currentPuzzleIndex++;
        loadPuzzle(); // Load the next puzzle when the current one is solved
    } else {
        feedback.innerText = "Try again!";
    }
}

function gameOver() {
    feedback.innerText = "Game Over!";
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    restartBtn.classList.remove('hidden');
    finalScore.innerText = `Final Score: ${score}`;
    finalScore.classList.remove('hidden');
    stopSpeechRecognition();
    stopTimer();
}
