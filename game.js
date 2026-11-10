// Setup Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x111111, 5, 30);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 8); // Pull camera back

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('game-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambientLight);
const spotLight = new THREE.SpotLight(0xffffff, 2);
spotLight.position.set(0, 10, 0);
spotLight.castShadow = true;
scene.add(spotLight);

// Floor
const floorGeo = new THREE.PlaneGeometry(50, 50);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Player (Red Box)
const player = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: 0xff2222 }));
player.position.set(0, 1, 0);
player.castShadow = true;
scene.add(player);

// Enemy (Blue Box)
const enemy = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: 0x2222ff }));
enemy.position.set(3, 1, -5);
enemy.castShadow = true;
scene.add(enemy);

// --- JOYSTICK LOGIC ---
let joystickActive = false;
let joystickStart = { x: 0, y: 0 };
let moveVector = { x: 0, y: 0 };
const joystickZone = document.getElementById('joystick');

joystickZone.addEventListener('touchstart', (e) => {
  joystickActive = true;
  const touch = e.touches[0];
  const rect = joystickZone.getBoundingClientRect();
  joystickStart.x = rect.left + rect.width / 2;
  joystickStart.y = rect.top + rect.height / 2;
});

joystickZone.addEventListener('touchmove', (e) => {
  if (!joystickActive) return;
  const touch = e.touches[0];
  const deltaX = touch.clientX - joystickStart.x;
  const deltaY = touch.clientY - joystickStart.y;
  
  // Normalize movement
  const distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
  const maxDist = 50; 
  
  if (distance > 0) {
    moveVector.x = (deltaX / distance) * Math.min(distance, maxDist) / maxDist;
    moveVector.y = (deltaY / distance) * Math.min(distance, maxDist) / maxDist;
  }
});

joystickZone.addEventListener('touchend', () => {
  joystickActive = false;
  moveVector = { x: 0, y: 0 };
});

// --- GAME LOOP ---
function animate() {
  requestAnimationFrame(animate);
  
  // Move Player based on joystick
  if (moveVector.x !== 0 || moveVector.y !== 0) {
    player.position.x += moveVector.x * 0.1;
    player.position.z += moveVector.y * 0.1;
    
    // Rotate player to face movement direction
    const angle = Math.atan2(moveVector.x, moveVector.y);
    player.rotation.y = angle;
  }

  // Camera follows player smoothly
  camera.position.x += (player.position.x - camera.position.x) * 0.1;
  camera.position.z += (player.position.z + 8 - camera.position.z) * 0.1;
  camera.lookAt(player.position.x, player.position.y + 1, player.position.z);

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
