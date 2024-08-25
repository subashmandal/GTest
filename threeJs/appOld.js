import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

let map, scene, camera, renderer, controls;
let character, characterPosition;

function initMap() {
  // Initialize Leaflet Map
  map = L.map('map').setView([0, 0], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);

  // Initialize Three.js
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  camera.position.y = 1; // Adjust the camera height

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('three-container').appendChild(renderer.domElement);

  // OrbitControls for camera movement
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false; // Disable panning to prevent map drag interference
  controls.enableZoom = false; // Disable zoom to prevent map zoom interference

  // Example character (cube for simplicity)
  const geometry = new THREE.BoxGeometry(1, 2, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  character = new THREE.Mesh(geometry, material);
  scene.add(character);

  // Set initial position of the character
  characterPosition = L.latLng(0, 0); // Example: initial position at lat 0, lng 0
  updateCharacterPosition();

  // Event listeners for character movement
  document.addEventListener('keydown', onDocumentKeyDown, false);
  document.addEventListener('keyup', onDocumentKeyUp, false);

  // Start animation loop
  animate();

  // Handle window resize
  window.addEventListener('resize', onWindowResize);

  console.log("Map and Three.js initialized");
}

function updateCharacterPosition() {
  const scale = 100000; // Adjust scale for better visibility
  const point = map.latLngToContainerPoint(characterPosition);
  character.position.set((point.x - window.innerWidth / 2) / scale, 0, (window.innerHeight / 2 - point.y) / scale);
  console.log("Character position updated", character.position);
}

let keys = {};
let moveSpeed = 0.0001;
let jumpSpeed = 0.002;
let isJumping = false;
let jumpVelocity = 0;

function onDocumentKeyDown(event) {
  keys[event.key] = true;
}

function onDocumentKeyUp(event) {
  keys[event.key] = false;
}

function updatePositions() {
  const moveStep = moveSpeed * 100000; // Adjust step size for visibility

  if (keys['ArrowUp']) {
    characterPosition = L.latLng(characterPosition.lat + moveSpeed, characterPosition.lng);
    updateCharacterPosition();
  }
  if (keys['ArrowDown']) {
    characterPosition = L.latLng(characterPosition.lat - moveSpeed, characterPosition.lng);
    updateCharacterPosition();
  }
  if (keys['ArrowLeft']) {
    characterPosition = L.latLng(characterPosition.lat, characterPosition.lng - moveSpeed);
    updateCharacterPosition();
  }
  if (keys['ArrowRight']) {
    characterPosition = L.latLng(characterPosition.lat, characterPosition.lng + moveSpeed);
    updateCharacterPosition();
  }

  if (keys[' '] && !isJumping) {
    isJumping = true;
    jumpVelocity = jumpSpeed;
  }

  if (isJumping) {
    character.position.y += jumpVelocity;
    jumpVelocity -= 0.0001; // gravity effect

    if (character.position.y <= 0) { // ground check
      character.position.y = 0;
      isJumping = false;
      jumpVelocity = 0;
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  updatePositions();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize the map and Three.js scene
window.onload = initMap;
