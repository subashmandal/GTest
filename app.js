// Create a new scene
const scene = new THREE.Scene();

// Create a camera, which determines what we'll see when we render the scene
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.position.y = 1; // Adjust the camera height

// Create a renderer and add it to the DOM
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a basic cube character (simple geometry for demo purposes)
const geometry = new THREE.BoxGeometry(1, 2, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const character = new THREE.Mesh(geometry, material);
scene.add(character);

// Add an axes helper to the scene
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Add a ground plane
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
plane.position.y = -1;
scene.add(plane);

// Add a skybox
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  'textures/px.jpg',
  'textures/nx.jpg',
  'textures/py.jpg',
  'textures/ny.jpg',
  'textures/pz.jpg',
  'textures/nz.jpg',
]);
scene.background = texture;

// Add a light to the scene
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

 // Background music setup
 const backgroundMusic = new Audio('sounds/rest.wav');
 backgroundMusic.loop = true;
 backgroundMusic.volume = 0.5;
 backgroundMusic.play();

 // Volume control
 const volumeControl = document.getElementById('volume-control');
 volumeControl.addEventListener('input', (event) => {
   backgroundMusic.volume = event.target.value;
 });

// Movement variables
let moveSpeed = 0.1;
let jumpSpeed = 0.2;
let isJumping = false;
let jumpVelocity = 0;

// Load sounds
const walkSound = new Audio('sounds/walk.wav');
const jumpSound = new Audio('sounds/jump.wav');
const restSound = new Audio('sounds/rest.wav');

// Event listeners for keyboard input
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);

let keys = {};
let isWalking = false;
let isResting = true;

function onDocumentKeyDown(event) {
  keys[event.key] = true;
}

function onDocumentKeyUp(event) {
  keys[event.key] = false;
  if (!keys['ArrowUp'] && !keys['ArrowDown'] && !keys['ArrowLeft'] && !keys['ArrowRight']) {
    isWalking = false;
    walkSound.pause();
  }
}

// Function to update camera position based on keyboard input
function updateCameraPosition() {
  if (keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight']) {
    if (!isWalking) {
      walkSound.currentTime = 0;
      walkSound.play();
      isWalking = true;
      isResting = false;
    }
  } else {
    if (!isResting) {
      restSound.play();
      isResting = true;
    }
  }

  if (keys['ArrowUp']) camera.position.z -= moveSpeed;
  if (keys['ArrowDown']) camera.position.z += moveSpeed;
  if (keys['ArrowLeft']) camera.position.x -= moveSpeed;
  if (keys['ArrowRight']) camera.position.x += moveSpeed;

  // Jump logic
  if (keys[' '] && !isJumping) {
    isJumping = true;
    jumpVelocity = jumpSpeed;
    jumpSound.play();
    walkSound.pause();
  }

  if (isJumping) {
    camera.position.y += jumpVelocity;
    jumpVelocity -= 0.01; // gravity effect

    if (camera.position.y <= 1) { // ground check, adjust for camera height
      camera.position.y = 1;
      isJumping = false;
      jumpVelocity = 0;
      if (keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight']) {
        walkSound.play();
      }
    }
  }
}

// Function to animate the character
function animate() {
  requestAnimationFrame(animate);

  // Update camera position
  updateCameraPosition();

  // Render the scene from the perspective of the camera
  renderer.render(scene, camera);
}

// Run the animation loop
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
