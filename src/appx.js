import * as THREE from 'three';
// import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
// import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/controls/OrbitControls.js';

// Function to check for WebGL support
function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}
console.log("hello");

if (!isWebGLAvailable()) {
    console.log('WebGL is not available in your browser');
} else {
    console.log('WebGL is available in your browser');
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

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Load a GLTF model
    const loader = new GLTFLoader();
    loader.load(
        '../model/avatar.glb', 
        function (gltf) {
            scene.add(gltf.scene);
        },
        undefined, 
        function (error) {
            console.error(error);
        }
    );

    // Add an axes helper to the scene
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Add a ground plane
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -1;
    scene.add(plane);

    // Add a skybox
    const cubeLoader = new THREE.CubeTextureLoader();
    const texture = cubeLoader.load([
        '../textures/px.jeg',
        '../textures/py.avif',
    ]);
    scene.background = texture;

    // Add a light to the scene
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    // Background music setup
    const backgroundMusic = new Audio('../sounds/rest.wav');
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
    const walkSound = new Audio('../sounds/walk.wav');
    const jumpSound = new Audio('../sounds/jump.wav');
    const restSound = new Audio('../sounds/rest.wav');

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

    // Function to update character position based on keyboard input
    function updateCharacterPosition() {
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

        if (keys['ArrowUp']) character.position.z -= moveSpeed;
        if (keys['ArrowDown']) character.position.z += moveSpeed;
        if (keys['ArrowLeft']) character.position.x -= moveSpeed;
        if (keys['ArrowRight']) character.position.x += moveSpeed;

        // Jump logic
        if (keys[' '] && !isJumping) {
            isJumping = true;
            jumpVelocity = jumpSpeed;
            jumpSound.play();
            walkSound.pause();
        }

        if (isJumping) {
            character.position.y += jumpVelocity;
            jumpVelocity -= 0.01; // gravity effect

            if (character.position.y <= 0) { // ground check, adjust for character height
                character.position.y = 0;
                isJumping = false;
                jumpVelocity = 0;
                if (keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight']) {
                    walkSound.play();
                }
            }
        }

        // Camera follows the character from above
        camera.position.set(character.position.x, character.position.y + 5, character.position.z + 5);
        camera.lookAt(character.position);
    }

    // Function to animate the character
    function animate() {
        requestAnimationFrame(animate);

        // Update character position
        updateCharacterPosition();

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
}
