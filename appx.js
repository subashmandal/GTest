import * as THREE from 'node_modules/three/build/three.module.js';
import { GLTFLoader } from 'node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'node_modules/three/examples/jsm/controls/OrbitControls.js';


        // Create a new scene
        const scene = new THREE.Scene();

        // Create a camera, which determines what we'll see when we render the scene
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 1.5, 5);

        // Create a renderer and add it to the DOM
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Load the character model
        const loader = new GLTFLoader();
        let character;
        loader.load('model/avatar.glb', (gltf) => {
            character = gltf.scene;
            character.position.set(0, 0, 0);
            scene.add(character);
        });

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
        const skyboxLoader = new THREE.CubeTextureLoader();
        const texture = skyboxLoader.load([
            'textures/px.jpg',
            'textures/nx.jpg',
            'textures/py.jpg',
            'textures/ny.jpg',
            'textures/pz.jpg',
            'textures/nz.jpg',
        ]);
        scene.background = texture;

        // Add lights
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5).normalize();
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

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
            if (character) {
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

                // Camera follows the character from behind
                camera.position.set(character.position.x, character.position.y + 1.5, character.position.z + 5);
                camera.lookAt(character.position);
            }
        }

        // Add controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 1.5, 0);
        controls.update();

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