const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let recognition;
let score = 0;
let words = [];
let targetWord = '';
const wordInterval = 2000; // Time interval between words (milliseconds)
const gravity = 0.8; // Gravity effect
const canvasWidth = canvas.width = 500;
const canvasHeight = canvas.height = 400;

const wordList = [
    "start", "jump", "run", "fly", "stop", "go", "up", "down", "left", "right"
];

function startGame() {
    score = 0;
    words = [];
    targetWord = wordList[Math.floor(Math.random() * wordList.length)]; // Select initial target word
    document.getElementById('score-text').innerText = `Score: ${score}`;
    updateTargetWordDisplay(); // Update target word display
    document.getElementById('status').innerText = '';
    document.getElementById('start-button').style.display = 'none';
    startVoiceRecognition();
    generateWords();
    gameLoop();
}

function updateTargetWordDisplay() {
    const targetWordElement = document.createElement('p');
    targetWordElement.id = 'target-word';
    targetWordElement.style.fontSize = '24px';
    targetWordElement.style.fontWeight = 'bold';
    targetWordElement.style.color = '#3498db'; // Set initial color
    targetWordElement.style.margin = '20px 0';
    targetWordElement.innerText = `Target Word: ${targetWord}`;

    const existingTargetWord = document.getElementById('target-word');
    if (existingTargetWord) {
        existingTargetWord.replaceWith(targetWordElement);
    } else {
        document.querySelector('.container').insertBefore(targetWordElement, document.querySelector('#game-info'));
    }
}

function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Your browser does not support speech recognition. Please try another browser.");
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = function() {
        document.getElementById('status').innerText = "Listening...";
    };

    recognition.onresult = function(event) {
        const spokenCommand = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        document.getElementById('status').innerText = `You said: ${spokenCommand}`;
        checkWord(spokenCommand);
    };

    recognition.onerror = function(event) {
        document.getElementById('status').innerText = `Error: ${event.error}`;
    };

    recognition.start();
}

function generateWords() {
    setInterval(() => {
        const word = wordList[Math.floor(Math.random() * wordList.length)];
        const fontSize = 20; // Font size for the word
        const textWidth = ctx.measureText(word).width;
        const x = Math.random() * (canvasWidth - textWidth); // Random x position within canvas
        const y = -fontSize; // Start above the canvas
        words.push({ text: word, x: x, y: y, color: '#2980b9', isActive: true, fontSize: fontSize });
    }, wordInterval);
}

function checkWord(spokenCommand) {
    if (spokenCommand === targetWord) {
        score += 10;
        document.getElementById('score-text').innerText = `Score: ${score}`;
        targetWord = wordList[Math.floor(Math.random() * wordList.length)]; // Set new target word
        updateTargetWordDisplay(); // Update target word display
    }
    words.forEach(word => {
        if (word.text === spokenCommand) {
            word.color = 'blue'; // Mark the word as correctly spoken
            word.isActive = false; // Deactivate the word
        }
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Update and draw words
    for (let i = 0; i < words.length; i++) {
        if (words[i].isActive) {
            words[i].y += gravity; // Apply gravity

            // Check if word is off screen
            if (words[i].y > canvasHeight) {
                words[i].color = 'red'; // Missed word
                words[i].isActive = false;
            }

            // Draw word
            ctx.fillStyle = words[i].color;
            ctx.font = `bold ${words[i].fontSize}px Arial`; // Make the word bold
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(words[i].text, words[i].x, words[i].y);
        }
    }

    // Remove inactive words
    words = words.filter(word => word.isActive || word.y <= canvasHeight);

    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

window.onload = function() {
    document.getElementById('start-button').style.display = 'inline-block';
};
