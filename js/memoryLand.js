import * as THREE from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';

import Gallery from '../js/gallery.js';

let scene, camera, renderer, gallery, controls, clock, raycaster, hoveredObject;
let acceptingInput = false;

clock = new THREE.Clock();

function init() {
    scene = new THREE.Scene();
    const ambientLight = new THREE.AmbientLight(0x404040, 10); 
    scene.add(ambientLight);
    scene.background = new THREE.Color(0xefd1b5);
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    light.castShadow = true;
    scene.add(light);
    
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    
    document.body.appendChild(renderer.domElement);

    gallery = new Gallery(scene);

    camera.position.z = 5;

    // Initialize FlyControls
    controls = new FlyControls(camera, renderer.domElement);
    controls.movementSpeed = 25;
    controls.domElement = renderer.domElement;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = true;
    controls.movementSpeed = 1.5;

    // Initialize Raycaster
    raycaster = new THREE.Raycaster();

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    animate();

    gallery.setSelectedType('text');
    updateSelectedShape('text-shape');

    // Load saved objects
    gallery.loadObjects();

    const savedObjects = JSON.parse(localStorage.getItem('galleryObjects'));
    if (!savedObjects || savedObjects.length === 0) {
    // Create splash screen if no saved objects
    createSplashScreen();
    } else {
        acceptingInput = true;
    }
}

function createSplashScreen() {
    const splashScreen = document.createElement('div');
    splashScreen.id = 'splash-screen';
    splashScreen.className = 'splash-screen';
    
    const splashContent = document.createElement('div');
    splashContent.className = 'splash-content';
    
    const splashTitle = document.createElement('h1');
    splashTitle.textContent = 'Welcome to MemoryLand';
    
    const splashText = document.createElement('p');
    splashText.textContent = 'This is an interactive gallery where you can create your space and find your peace.';
    // 3D poetry
    
    splashContent.appendChild(splashTitle);
    splashContent.appendChild(splashText);
    splashScreen.appendChild(splashContent);
    
    document.body.appendChild(splashScreen);
    
    // Add fade-out effect to splash content after 3 seconds
    setTimeout(() => {
        splashContent.classList.add('fade-out');
        setTimeout(() => {
            splashContent.style.display = 'none';
            showSplashImage(splashScreen);
        }, 2000); 
    }, 3000);
    
    function showSplashImage(splashScreen) {
        const splashImage = document.createElement('img');
        splashImage.src = '../assets/gallery/controls.png'; 
        splashImage.className = 'splash-image fade-in';
        splashScreen.appendChild(splashImage);
    
        // Add fade-out effect to the image after it has been displayed for 3 seconds
        setTimeout(() => {
            splashImage.classList.remove('fade-in');
            splashImage.classList.add('fade-out');
            setTimeout(() => {
                splashScreen.style.display = 'none';
                acceptingInput = true;
            }, 2000); 
        }, 3000);
    }
}

document.getElementById('text-shape').addEventListener('click', () => {
    gallery.setSelectedType('text');
    updateSelectedShape('text-shape');
    console.log('Selected shape: text');
});

document.getElementById('sphere-shape').addEventListener('click', () => {
    gallery.setSelectedType('sphere');
    updateSelectedShape('sphere-shape');
    console.log('Selected shape: sphere');
});

document.getElementById('box-shape').addEventListener('click', () => {
    gallery.setSelectedType('box');
    updateSelectedShape('box-shape');
    console.log('Selected shape: box');
});
function updateSelectedShape(selectedId) {
    const shapeOptions = document.querySelectorAll('.shape-option');
    shapeOptions.forEach(option => {
        if (option.id === selectedId) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    if (!acceptingInput) return;

    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const intersect = intersects[0].object;

        if (hoveredObject !== intersect) {
            if (hoveredObject) {
                // Reset the previous hovered object's material
                hoveredObject.material.emissive.setHex(hoveredObject.currentHex);
            }

            // Store the current hovered object
            hoveredObject = intersect;
            hoveredObject.currentHex = hoveredObject.material.emissive.getHex();
            hoveredObject.material.emissive.setHex(0x798cb2); // Highlight color
        }
    } else {
        if (hoveredObject) {
            // Reset the previous hovered object's material
            hoveredObject.material.emissive.setHex(hoveredObject.currentHex);
            hoveredObject = null;
        }
    }
}

function onKeyDown(event) {
    if (event.key === 'Shift') {
        controls.movementSpeed = 5; // Increase speed when leftShift is held
    } else if (event.key == 'Backspace') {
        event.preventDefault();
        if (!acceptingInput || !hoveredObject) return;
        
        gallery.removeObject(hoveredObject);
        hoveredObject = null;
    }
}

function onKeyUp(event) {
    if (event.key === 'Shift') {
        controls.movementSpeed = 1.5; // Reset speed when leftShift is released
    }
}

function onMouseClick(event) {
    if (!acceptingInput) return;

    // Check if the click event originated from the selector menu
    if (event.target.closest('.shape-option')) return;

    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate the position at a constant distance from the camera
    const distance = 4; 
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const position = new THREE.Vector3().copy(camera.position).add(direction.multiplyScalar(distance));

    gallery.addObject(position, camera.rotation);
}

function onRightClick(event) {
    event.preventDefault();
    if (!acceptingInput || !hoveredObject) return;

    gallery.removeObject(hoveredObject);
    hoveredObject = null;
}

document.getElementById('text-shape').addEventListener('click', () => {
    gallery.setSelectedType('text');
    console.log('Selected shape: text');
});

document.getElementById('sphere-shape').addEventListener('click', () => {
    gallery.setSelectedType('sphere');
    console.log('Selected shape: sphere');
});

document.getElementById('box-shape').addEventListener('click', () => {
    gallery.setSelectedType('box');
    console.log('Selected shape: box');
});

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    controls.update(delta);
    renderer.render(scene, camera);
}

init();