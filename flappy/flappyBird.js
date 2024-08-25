// Get DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const voiceCommandOutput = document.getElementById('voiceCommandOutput');
const backButton = document.getElementById('backButton');
const scoreDisplay = document.getElementById('scoreDisplay');

// Function to resize the canvas based on the window size
function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Set the canvas width and height based on the screen size
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

    // Adjust bird size and position based on canvas size
    bird.width = canvas.width * 0.06;  // 6% of canvas width
    bird.height = bird.width;           // Make bird square
    bird.x = canvas.width * 0.1;        // 10% of canvas width
    bird.y = canvas.height - bird.height; // Start at the bottom of the canvas
}

// Listen for window resize events
window.addEventListener('resize', resizeCanvas);

// Define the bird object
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

// Function to draw the bird on the canvas
function drawBird() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

// Function to update the game state
function updateGame() {
    // Update bird position based on velocity
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Prevent the bird from going below the canvas
    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height;
        bird.velocity = 0;
    }

    // Update and draw obstacles
    updateObstacles();

    // Check for collisions
    if (checkCollision()) {
        handleCollision();
        return; // Stop updating the game after collision
    }
}

// Function to update obstacles
function updateObstacles() {
    frameCount++;

    // Generate new obstacles every 90 frames
    if (frameCount % 220 === 0) {
        const width = 3 + Math.random() * 2;
        const height = canvas.height * 0.05 + Math.random() * (canvas.height * 0.01); // Reduce obstacle height

        // Add obstacle
        obstacles.push({
            x: canvas.width,
            y: canvas.height - height, // Position obstacle on the ground
            width: width,
            height: height,
            passed: false // Track if the bird has passed the obstacle
        });

        // Increase the speed of obstacles after each set is added
        obstacleSpeed += 0.1; // Increase speed slightly after each obstacle
    }

    // Move and draw obstacles
    ctx.fillStyle = 'green';
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0); // Remove off-screen obstacles

    for (const obstacle of obstacles) {
        obstacle.x -= obstacleSpeed; // Move leftwards at the current speed

        // Check if bird has successfully passed the obstacle
        if (!obstacle.passed && bird.x > obstacle.x + obstacle.width) {
            obstacle.passed = true;
            score += 1; // Increase score
            scoreDisplay.textContent = `Score: ${score}`; // Update score display
        }

        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height); // Draw obstacle
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
            return true; // Collision detected
        }
    }
    return false; // No collision
}

// Function to handle collisions (end the game)
function handleCollision() {
    gameStarted = false; // Stop the game loop
    voiceCommandOutput.textContent = "Game Over! Click Restart to play again.";
    restartButton.style.display = 'block'; // Show Restart button
    backButton.style.display = 'block';    // Show Back button below Restart button
}

// Function to handle the game loop
function gameLoop() {
    if (gameStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        updateGame(); // Update game state
        drawBird();   // Draw the bird
        requestAnimationFrame(gameLoop); // Continue the loop
    }
}

// Function to reset the game state
function resetGame() {
    obstacles = [];
    frameCount = 0;
    bird.velocity = 0;
    bird.y = canvas.height - bird.height; // Reset bird to the bottom of the canvas
    obstacleSpeed = initialObstacleSpeed; // Reset the obstacle speed to the initial value
    score = 0; // Reset the score
    scoreDisplay.textContent = `Score: ${score}`; // Update score display
    voiceCommandOutput.textContent = "Speak loudly to move the bird up.";
    restartButton.style.display = 'none'; // Hide Restart button
    backButton.style.display = 'none';    // Show Back button

    // Clear and redraw the canvas to ensure it starts fresh
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawBird(); // Redraw the bird at the initial position
}

// Function to handle the end of the game (e.g., after a collision)
function endGame() {
    gameStarted = false;
    recognition.stop(); // Stop voice recognition

    // Show the Restart and Back buttons
    restartButton.style.display = 'block';
    backButton.style.display = 'block';
}

// Event listener for the Start Game button
startButton.addEventListener('click', function() {
    startButton.style.display = 'none'; // Hide Start button
    canvas.style.display = 'block';      // Show canvas
    resizeCanvas();                      // Resize the canvas
    resetGame();                         // Reset game state
    gameStarted = true;                  // Set game state to started
    recognition.start();                 // Start voice recognition
    gameLoop();                          // Start the game loop
});

// Event listener for the Restart Game button
restartButton.addEventListener('click', function() {
    if (recognition) {
        recognition.stop(); // Stop the current recognition session
    }
    resetGame();                         // Reset game state
    gameStarted = true;                  // Set game state to started
    setTimeout(() => {
        recognition.start();             // Start voice recognition
    }, 500);               // Start voice recognition
    gameLoop();                          // Continue the game loop
    restartButton.style.display = 'none'; // Hide Restart button
    backButton.style.display = 'none';    // Hide Back button
});

// Event listener for the Back button
backButton.addEventListener('click', function() {
    // Implement logic to go back to the main menu or another screen
    console.log("Back button clicked");
});

// Initialize Speech Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.continuous = true;
recognition.interimResults = false;
recognition.maxAlternatives = 1; // Limit to one alternative for faster processing

let isSpeaking = false;
let speakTimeout;

recognition.onstart = function(event) {
    clearTimeout(speakTimeout);
    isSpeaking = true;

    // Display the recognized voice command
    const command = event.results[0][0].transcript;
    voiceCommandOutput.textContent = `Voice Command: ${command}`;

    // Apply lift when speaking is detected
    bird.velocity = bird.lift;

    // Stop the lift effect shortly after speaking ends
    speakTimeout = setTimeout(() => {
        isSpeaking = false;
    }, 0); // 300ms delay to detect silence
};

// Detect when the voice recognition starts
recognition.onaudiostart = function() {
    voiceCommandOutput.textContent = "Voice recognition started. Speak to move the bird up.";
    console.log("Voice recognition has started.");
};

recognition.onspeechstart = function() {
    voiceCommandOutput.textContent = "Speech detected!";
    console.log("Speech detected.");
};

// Handle recognized voice commands
recognition.onresult = function(event) {
    clearTimeout(speakTimeout);
    isSpeaking = true;

    // Display the recognized voice command
    const command = event.results[0][0].transcript;
    voiceCommandOutput.textContent = `Voice Command: ${command}`;

    // Apply lift when speaking is detected
    bird.velocity = bird.lift;

    // Stop the lift effect shortly after speaking ends
    speakTimeout = setTimeout(() => {
        isSpeaking = false;
    }, 0); // 300ms delay to detect silence
};

// Handle speech recognition errors
recognition.onerror = function(event) {
    voiceCommandOutput.textContent = "Error: " + event.error;
};

// Detect when the voice recognition service ends
recognition.onend = function() {
    voiceCommandOutput.textContent = "Voice recognition ended. Click restart to play again.";
    console.log("Voice recognition has ended.");
};

// Detect when the user stops speaking
recognition.onspeechend = function() {
    voiceCommandOutput.textContent = "Speech has stopped.";
    console.log("Speech has stopped.");
};
// Initial message
voiceCommandOutput.textContent = "Speak loudly to move the bird up.";
