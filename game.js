// Setup Scene, Camera, and Renderer
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x111111, 5, 30); // Dark city fog

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 6);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('game-container').appendChild(renderer.domElement);

// Lighting (Neon Street Style)
const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 2);
spotLight.position.set(0, 10, 0);
spotLight.castShadow = true;
scene.add(spotLight);

const blueLight = new THREE.PointLight(0x0000ff, 2, 20);
blueLight.position.set(-5, 2, -5);
scene.add(blueLight);

const redLight = new THREE.PointLight(0xff0000, 2, 20);
redLight.position.set(5, 2, -5);
scene.add(redLight);

// The Fighting Floor (Concrete)
const floorGeo = new THREE.PlaneGeometry(20, 20);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Arena Walls (Fences)
const wallMat = new THREE.MeshStandardMaterial({ color: 0x555555, wireframe: true });
const wallGeo = new THREE.BoxGeometry(20, 4, 20);
const walls = new THREE.Mesh(wallGeo, wallMat);
walls.position.y = 2;
scene.add(walls);

// Placeholder Box Fighters (We will replace these with 3D models later)
const playerMat = new THREE.MeshStandardMaterial({ color: 0xff2222 }); // Red player
const player = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), playerMat);
player.position.set(-2, 1, 0);
player.castShadow = true;
scene.add(player);

const enemyMat = new THREE.MeshStandardMaterial({ color: 0x2222ff }); // Blue enemy
const enemy = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), enemyMat);
enemy.position.set(2, 1, 0);
enemy.castShadow = true;
scene.add(enemy);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  
  // Simple idle movement (bobbing up and down)
  const time = Date.now() * 0.002;
  player.position.y = 1 + Math.sin(time) * 0.05;
  enemy.position.y = 1 + Math.sin(time + 2) * 0.05;
  
  renderer.render(scene, camera);
}

animate();

// Handle screen resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
