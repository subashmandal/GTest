// Get DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const voiceCommandOutput = document.getElementById('voiceCommandOutput');
const backButton = document.getElementById('backButton');
const scoreDisplay = document.getElementById('scoreDisplay');

// Load audio files
const backgroundMusic = new Audio('audio/background.mp3'); // Path to your background music
const jumpSound = new Audio('audio/jump.mp3'); // Path to your jump sound effect
const collideSound = new Audio('audio/collision.mp3'); // Path to your collision sound effect

// Function to resize the canvas based on the window size
function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width < 600) { // Smartphone
        canvas.width = width * 0.9;
        canvas.height = height * 0.7;
    } else if (width < 900) { // Tablet
        canvas.width = width * 0.7;
        canvas.height = height * 0.7;
    } else { // Laptops and Desktops
        canvas.width = width * 0.6;
        canvas.height = height * 0.8;
    }

    bird.width = canvas.width * 0.06;  // 6% of canvas width
    bird.height = bird.width;
    bird.x = canvas.width * 0.1;
    bird.y = canvas.height - bird.height;
}

// Listen for window resize events
window.addEventListener('resize', resizeCanvas);

// Load the bird image
const birdImg = new Image();
birdImg.src = 'image/character.png';

// Load obstacle images
const obstacleImgs = [];
const obstacleImagePaths = [
    'image/obstacle1.png',
    'image/obstacle2.png',
    'image/obstacle3.png'
]; // Add your obstacle image paths here

// Load all obstacle images
obstacleImagePaths.forEach((path, index) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
        obstacleImgs[index] = img;
    };
});

// Load the background image
const backgroundImg = new Image();
backgroundImg.src = 'image/background.jpg'; // Path to your background image

const bird = { 
    x: 0, 
    y: 0, 
    width: 20, 
    height: 20, 
    gravity: 0.9, 
    lift: -15, 
    velocity: 0 
};

// Game state variables
let gameStarted = false;
let obstacles = [];
let frameCount = 0;
let initialObstacleSpeed = 2; // Initial speed of obstacles
let obstacleSpeed = initialObstacleSpeed; // Current speed of obstacles
let score = 0; // Initialize score
const fixedObstacleHeight = 25; // Fixed height for obstacle images
let backgroundX = 0; // X position of the background

// Function to draw the bird on the canvas
function drawBird() {
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

// Function to draw the background image
function drawBackground() {
    // Draw the background image at current position
    ctx.drawImage(backgroundImg, backgroundX, 0, canvas.width, canvas.height);
    // Draw the background image again to cover the right edge when scrolling
    ctx.drawImage(backgroundImg, backgroundX + canvas.width, 0, canvas.width, canvas.height);
}

// Function to update the game state
function updateGame() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height;
        bird.velocity = 0;
    }

    updateObstacles();

    if (checkCollision()) {
        handleCollision();
        return; // Stop updating the game after collision
    }

    // Update background position for scrolling effect
    backgroundX -= obstacleSpeed; // Move background left by the speed of the obstacles
    if (backgroundX <= -canvas.width) {
        backgroundX = 0; // Reset background position to create a seamless loop
    }
}

// Function to update obstacles
function updateObstacles() {
    frameCount++;

    if (frameCount % 220 === 0) {
        // Randomly select an obstacle image
        const randomImg = obstacleImgs[Math.floor(Math.random() * obstacleImgs.length)];
        
        // Generate a random width for the obstacle
        const minWidth = randomImg.width * 0.5; // Minimum width as 50% of original
        const maxWidth = randomImg.width * 1.5; // Maximum width as 150% of original
        const width = Math.random() * (maxWidth - minWidth) + minWidth;

        obstacles.push({
            x: canvas.width,
            y: canvas.height - fixedObstacleHeight,
            width: width,
            height: fixedObstacleHeight,
            img: randomImg,
            passed: false
        });

        obstacleSpeed += 0.1;
    }

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    for (const obstacle of obstacles) {
        obstacle.x -= obstacleSpeed;

        if (!obstacle.passed && bird.x > obstacle.x + obstacle.width) {
            obstacle.passed = true;
            score += 1;
            scoreDisplay.textContent = `Score: ${score}`;
        }

        ctx.drawImage(obstacle.img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
}

// Function to check for collisions between the bird and obstacles
function checkCollision() {
    for (const obstacle of obstacles) {
        if (
            bird.x < obstacle.x + obstacle.width &&
            bird.x + bird.width > obstacle.x &&
            bird.y < obstacle.y + obstacle.height &&
            bird.y + bird.height > obstacle.y
        ) {
            return true;
        }
    }
    return false;
}

// Function to handle collisions (end the game)
function handleCollision() {
    gameStarted = false;
    voiceCommandOutput.textContent = "Game Over! Click Restart to play again.";
    restartButton.style.display = 'block';
    backButton.style.display = 'block';

    //pause background sound
    backgroundMusic.pause();
    // Play collision sound
    collideSound.play();
}

// Function to handle the game loop
function gameLoop() {
    if (gameStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        updateGame();
        drawBird();
        requestAnimationFrame(gameLoop);
    }
}

// Function to reset the game state
function resetGame() {
    obstacles = [];
    frameCount = 0;
    bird.velocity = 0;
    bird.y = canvas.height - bird.height;
    obstacleSpeed = initialObstacleSpeed;
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    voiceCommandOutput.textContent = "Speak loudly to move the bird up.";
    restartButton.style.display = 'none';
    backButton.style.display = 'none';

    backgroundX = 0; // Reset background position

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawBird();
}

// Function to handle the end of the game
function endGame() {
    gameStarted = false;
    recognition.stop();

    restartButton.style.display = 'block';
    backButton.style.display = 'block';
}

// Event listener for the Start Game button
startButton.addEventListener('click', function() {
    startButton.style.display = 'none';
    canvas.style.display = 'block';
    resizeCanvas();
    resetGame();
    gameStarted = true;
    recognition.start();

    // Play background music
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5; // Adjust volume as needed
    backgroundMusic.play();

    gameLoop();
});

// Event listener for the Restart Game button
restartButton.addEventListener('click', function() {
    if (recognition) {
        recognition.stop();
    }
    resetGame();
    gameStarted = true;

    // Restart background music
    backgroundMusic.currentTime = 0; // Reset playback position
    backgroundMusic.play();

    setTimeout(() => {
        recognition.start();
    }, 500);
    gameLoop();
    restartButton.style.display = 'none';
    backButton.style.display = 'none';
});

// Event listener for the Back button
backButton.addEventListener('click', function() {
    console.log("Back button clicked");
});

// Initialize Speech Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.continuous = true;
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let isSpeaking = false;
let speakTimeout;

recognition.onstart = function(event) {
    clearTimeout(speakTimeout);
    isSpeaking = true;

    const command = event.results[0][0].transcript;
    voiceCommandOutput.textContent = `Voice Command: ${command}`;

    // jump sound
    jumpSound.play();

    bird.velocity = bird.lift;

    speakTimeout = setTimeout(() => {
        isSpeaking = false;
    }, 0);
};

recognition.onaudiostart = function() {
    voiceCommandOutput.textContent = "Voice recognition started. Speak to move the bird up.";
    console.log("Voice recognition has started.");
};

recognition.onspeechstart = function() {
    voiceCommandOutput.textContent = "Speech detected!";
    console.log("Speech detected.");
};

recognition.onresult = function(event) {
    clearTimeout(speakTimeout);
    isSpeaking = true;

    const command = event.results[0][0].transcript;
    voiceCommandOutput.textContent = `Voice Command: ${command}`;

    bird.velocity = bird.lift;

    speakTimeout = setTimeout(() => {
        isSpeaking = false;
    }, 0);
};

recognition.onerror = function(event) {
    voiceCommandOutput.textContent = "Error: " + event.error;
};

recognition.onend = function() {
    voiceCommandOutput.textContent = "Voice recognition ended. Click restart to play again.";
    console.log("Voice recognition has ended.");
};

recognition.onspeechend = function() {
    voiceCommandOutput.textContent = "Speech has stopped.";
    console.log("Speech has stopped.");
};

voiceCommandOutput.textContent = "Speak loudly to move the bird up.";
