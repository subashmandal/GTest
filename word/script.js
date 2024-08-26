const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let recognition;
let score = 0;
let words = [];
const wordInterval = 2000; // Time interval between words (milliseconds)
const gravity = 0.8; // Gravity effect
let backgroundImage = new Image();
backgroundImage.src = 'image/background.jpg'; // Replace with your background image path

const wordList = [
    "start", "jump", "run", "fly", "stop", "go", "up", "down", "left", "right"
];

// Load a sound to play when the word is correctly spoken
let correctSound = new Audio('sound/success.mp3'); // Replace with your sound file path

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; // Adjust height as needed
}

function startGame() {
    resizeCanvas(); // Set initial canvas size
    score = 0;
    words = [];
    document.getElementById('score-text').innerText = `Score: ${score}`;
    document.getElementById('status').innerText = '';
    document.getElementById('start-button').style.display = 'none';
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
        const x = Math.random() * (canvas.width - textWidth); // Random x position within canvas
        const y = -fontSize; // Start above the canvas
        words.push({ text: word, x: x, y: y, color: 'red', isActive: true, fontSize: fontSize });
    }, wordInterval);
}

function checkWord(spokenCommand) {
    let foundMatch = false;

    words.forEach(word => {
        if (word.text === spokenCommand && word.isActive) {
            word.color = 'blue'; // Mark the word as correctly spoken
            word.isActive = false; // Deactivate the word
            foundMatch = true;
        }
    });

    if (foundMatch) {
        score += 10;
        document.getElementById('score-text').innerText = `Score: ${score}`;
        correctSound.play(); // Play the correct sound
    }
}

function drawRoundedRect(x, y, width, height, radius, color) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function gameLoop() {
    // Draw the background image
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Update and draw words
    for (let i = 0; i < words.length; i++) {
        if (words[i].isActive) {
            words[i].y += gravity; // Apply gravity

            // Check if word is off screen
            if (words[i].y > canvas.height) {
                words[i].color = 'red'; // Mark missed word in red
                words[i].isActive = false;
            }

            // Draw rounded rectangle (box) around the word
            const boxPadding = 10; // Padding around the word
            const boxWidth = ctx.measureText(words[i].text).width + boxPadding * 2;
            const boxHeight = words[i].fontSize + boxPadding * 2;
            const boxX = words[i].x - boxPadding;
            const boxY = words[i].y - words[i].fontSize - boxPadding;

            drawRoundedRect(boxX, boxY, boxWidth, boxHeight, 10, words[i].color);

            // Calculate position to center the text inside the box
            const textX = words[i].x + (boxWidth - ctx.measureText(words[i].text).width) / 2 - boxPadding;
            const textY = words[i].y - words[i].fontSize / 2 - boxPadding / 2;

            // Draw the word
            ctx.fillStyle = 'white';
            ctx.font = `bold ${words[i].fontSize}px Arial`; // Make the word bold
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(words[i].text, textX, textY);
        }
    }

    // Remove inactive words
    words = words.filter(word => word.isActive || word.y <= canvas.height);

    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Adjust canvas size on window resize
window.onresize = resizeCanvas;

window.onload = function() {
    document.getElementById('start-button').style.display = 'inline-block';
};
