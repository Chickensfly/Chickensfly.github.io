import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const loader = new FontLoader();

export default class Gallery {
    constructor(scene) {
        this.scene = scene;
        this.selectedType = 'text'; // Default type
        this.objects = [];
    }

    setSelectedType(type) {
        this.selectedType = type;
    }

    addObject(position, rotation, text = null, color = null, isLoading = false) {
        let mesh;
        console.log(`Adding object: type=${this.selectedType}, position=${position.toArray()}, rotation=${rotation.toArray()}, text=${text}, color=${color}`);
        if (this.selectedType === 'text') {
            if (!isLoading && !text) {
                text = prompt("Enter Text");
                // Prompts for text input, to be replaced with a more user-friendly input method
            }
            if (text != null && text != "") {
                loader.load(
                    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r146/examples/fonts/helvetiker_regular.typeface.json',
                    (font) => {
                        const textGeometry = new TextGeometry(text, {
                            font: font,
                            size: 1,
                            height: 0.5,
                            curveSegments: 12,
                            bevelEnabled: true,
                            bevelThickness: 0.03,
                            bevelSize: 0.02,
                            bevelSegments: 5,
                        });

                        textGeometry.center();

                        const material = new THREE.MeshStandardMaterial({
                            color: color !== null ? color : Math.floor(Math.random() * 16777215),
                            roughness: 0.5,
                            metalness: 0.1,
                        });

                        mesh = new THREE.Mesh(textGeometry, material);
                        mesh.position.copy(position);
                        mesh.rotation.copy(rotation);
                        console.log(`Text object added with rotation: ${mesh.rotation.toArray()}`);
                        this.scene.add(mesh);
                        this.objects.push({ type: 'text', text, position, rotation, mesh });
                        if (!isLoading) this.saveObjects();
                    }
                );
            }
        } else if (this.selectedType === 'sphere') {
            const geometry = new THREE.SphereGeometry(0.6);
            const material = new THREE.MeshStandardMaterial({
                color: color !== null ? color : Math.floor(Math.random() * 16777215),
                roughness: 0.5,
                metalness: 0.1,
            });
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(position);
            mesh.rotation.copy(rotation);
            console.log(`Sphere object added with rotation: ${mesh.rotation.toArray()}`);
            this.scene.add(mesh);
            this.objects.push({ type: 'sphere', position, rotation, mesh });
            if (!isLoading) this.saveObjects();
        } else if (this.selectedType === 'box') {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({
                color: color !== null ? color : Math.floor(Math.random() * 16777215),
                roughness: 0.5,
                metalness: 0.1,
            });
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(position);
            mesh.rotation.copy(rotation);
            console.log(`Box object added with rotation: ${mesh.rotation.toArray()}`);
            this.scene.add(mesh);
            this.objects.push({ type: 'box', position, rotation, mesh });
            if (!isLoading) this.saveObjects();
        }
    }

    removeObject(object) {
        this.scene.remove(object);
        object.geometry.dispose();
        object.material.dispose();
        this.objects = this.objects.filter(obj => obj.mesh !== object);
        this.saveObjects();
    }

    saveObjects() {
        const serializedObjects = this.objects.map(obj => ({
            type: obj.type,
            text: obj.text,
            position: obj.mesh.position.toArray(),
            rotation: obj.mesh.rotation.toArray(),
            color: obj.mesh.material.color.getHex() // Save the color as a hex value
        }));
        console.log('Saving objects:', serializedObjects); // Add logging
        localStorage.setItem('galleryObjects', JSON.stringify(serializedObjects));
    }

    loadObjects() {
        const serializedObjects = JSON.parse(localStorage.getItem('galleryObjects'));
        console.log('Loading objects:', serializedObjects); // Add logging
        if (serializedObjects) {
            serializedObjects.forEach(obj => {
                const position = new THREE.Vector3().fromArray(obj.position);
                const rotation = new THREE.Euler().fromArray(obj.rotation);
                const color = obj.color;
                console.log(`Loading object: type=${obj.type}, position=${position.toArray()}, rotation=${rotation.toArray()}, text=${obj.text}, color=${color}`);
                this.setSelectedType(obj.type);
                this.addObject(position, rotation, obj.text, color, true);
            });
        }
        // Reset selectedType to 'text' after loading objects
        this.setSelectedType('text');
    }
}