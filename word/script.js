const canvas = document.getElementById('game-canvas');
const PauseText =document.getElementById('pause-text');
const ctx = canvas.getContext('2d');

let recognition;
let score = 0;
let words = [];
let mode = 'free'; // Default mode
let difficulty = 'normal'; // Default difficulty
let isGameOver = false;
let isPaused = false; // To track if the game is paused

let backgroundImage = new Image();
backgroundImage.src = 'image/background.png'; // Replace with your background image path

let backgroundMusic = new Audio('sound/background.mp3');
backgroundMusic.loop = true; // Enable looping for background music
backgroundMusic.volume = 0.02; // Set the volume to 50%

const gravity = 0.8;
const wordInterval = 2000;

const wordSets = {
    easy: ["cat", "dog", "bat", "hat", "rat"],
    normal: ["start", "jump", "run", "fly", "stop", "go", "up", "down", "left", "right"],
    hard: ["elephant", "giraffe", "hippopotamus", "rhinoceros", "crocodile"]
};

let wordList = wordSets[difficulty];

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function setDefaults() {
    mode = getUrlParameter('mode') || 'free';
    difficulty = getUrlParameter('difficulty') || 'normal';
    wordList = wordSets[difficulty];
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8; // Adjust height as needed
}

function startGame() {
    resizeCanvas();
    score = 0;
    words = [];
    isGameOver = false;
    isPaused = false;
    setDefaults();
    document.getElementById('score-text').innerText = `Score: ${score}`;
    document.getElementById('status').innerText = '';
    document.getElementById('replay-button').style.display = 'none';
    document.getElementById('back-button').style.display = 'none';
    
    backgroundMusic.play(); // Start the background music
    
    startVoiceRecognition();
    generateWords();
    gameLoop();
}

function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Your browser does not support speech recognition. Please try another browser.");
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = true; // Continue listening even after getting results
    recognition.interimResults = false; // Only finalize results
    recognition.lang = "en-US"; // Set the language

    recognition.onstart = function () {
        document.getElementById('status').innerText = "Listening...";
    };

    recognition.onresult = function (event) {
        const spokenCommand = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        document.getElementById('status').innerText = `You said: ${spokenCommand}`;
        checkWord(spokenCommand); // Check the word spoken
    };

    recognition.onerror = function (event) {
        document.getElementById('status').innerText = `Error: ${event.error}`;
        if (event.error === 'no-speech') {
            // Optional: Restart recognition or give feedback to user
            recognition.stop();
            // recognition.start();
        }
    };

    recognition.onspeechend = function() {
        recognition.stop(); // Stop recognition after speech ends
    };

    recognition.onend = function () {
        // Automatically restart recognition to keep listening
        if (!isGameOver) {
            recognition.start();
        }
    };

    recognition.start(); // Start the recognition service
}

function generateWords() {
    setInterval(() => {
        if (!isGameOver && !isPaused) {
            const word = wordList[Math.floor(Math.random() * wordList.length)];
            const fontSize = 20;
            const textWidth = ctx.measureText(word).width;
            const x = Math.random() * (canvas.width - textWidth);
            const y = -fontSize;
            words.push({ text: word, x: x, y: y, color: '#2980b9', isActive: true, fontSize: fontSize });
        }
    }, wordInterval);
}

function checkWord(spokenCommand) {
    words.forEach(word => {
        if (word.text === spokenCommand && word.isActive) {
            score += 10;
            document.getElementById('score-text').innerText = `Score: ${score}`;
            word.isActive = false;
            playCorrectSound();
        }
    });
}

function drawBackground() {
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        backgroundImage.onload = function () {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        };
    }
}

function gameLoop() {
    if(!isPaused){
        drawBackground();
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // Update and draw words
        for (let i = 0; i < words.length; i++) {
            if (words[i].isActive) {
                words[i].y += gravity;
    
                if (words[i].y > canvas.height) {
                    words[i].color = 'red';
                    words[i].isActive = false;
    
                    if (mode === 'challenge') {
                        endGame();
                        return;
                    }
                }
    
                ctx.fillStyle = 'red';
                const boxRadius = 5; // Fixed radius
                const boxPadding = 7;
                const boxWidth = ctx.measureText(words[i].text).width + boxPadding * 2;
                const boxHeight = words[i].fontSize + boxPadding * 2;
    
                // Draw rounded rectangle
                ctx.beginPath();
                ctx.moveTo(words[i].x + boxRadius, words[i].y);
                ctx.arcTo(words[i].x + boxWidth, words[i].y, words[i].x + boxWidth, words[i].y + boxHeight, boxRadius);
                ctx.arcTo(words[i].x + boxWidth, words[i].y + boxHeight, words[i].x, words[i].y + boxHeight, boxRadius);
                ctx.arcTo(words[i].x, words[i].y + boxHeight, words[i].x, words[i].y, boxRadius);
                ctx.arcTo(words[i].x, words[i].y, words[i].x + boxWidth, words[i].y, boxRadius);
                ctx.closePath();
                ctx.fill();
    
                ctx.fillStyle = 'white';
                ctx.font = `bold ${words[i].fontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(words[i].text, words[i].x + boxWidth / 2, words[i].y + boxHeight / 2);
            }
        }
    
        words = words.filter(word => word.isActive || word.y <= canvas.height);
    
        if (!isGameOver) {
            requestAnimationFrame(gameLoop);
        }
    }
}

function togglePauseGame() {
    isPaused = !isPaused;
    if (!isPaused) {
        PauseText.textContent = "Pause";
        backgroundMusic.play();
        gameLoop(); // Resume the game loop if unpaused
        document.getElementById('replay-button').style.display = 'none';
        document.getElementById('back-button').style.display = 'none';
    }else{
        PauseText.textContent = "Play";
        backgroundMusic.pause();
        document.getElementById('replay-button').style.display = 'inline-block';
        document.getElementById('back-button').style.display = 'inline-block';
    }
}

function endGame() {
    isGameOver = true;
    playGameOverSound();
    document.getElementById('status').innerText = "Game Over!";
    document.getElementById('replay-button').style.display = 'inline-block';
    document.getElementById('back-button').style.display = 'inline-block';

    backgroundMusic.pause(); // Pause background music on game over
}

function playCorrectSound() {
    const audio = new Audio('sound/success.mp3');
    audio.play();
}

function playGameOverSound() {
    const audio = new Audio('sound/gameover.mp3');
    audio.play();
}

window.onresize = resizeCanvas;

window.onload = function () {
    startGame();
    setDefaults();
};
