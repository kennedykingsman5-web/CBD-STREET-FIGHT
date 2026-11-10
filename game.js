// Setup Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x111111, 5, 30);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 8);

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

// --- LOAD 3D CHARACTER ---
let player;
let mixer;
let actions = {};

const loader = new THREE.GLTFLoader();
// We are loading a free animated fighter model
loader.load('https://threejs.org/examples/models/gltf/Soldier.glb', (gltf) => {
    player = gltf.scene;
    player.position.set(0, 0, 0);
    player.traverse(n => { if(n.isMesh) n.castShadow = true; });
    scene.add(player);

    // Setup Animations (Idle, Run, Punch, Kick)
    mixer = new THREE.AnimationMixer(player);
    
    // The Soldier model has specific animations built-in
    const animations = gltf.animations;
    actions.idle = mixer.clipAction(THREE.AnimationClip.findByName(animations, 'Idle'));
    actions.run = mixer.clipAction(THREE.AnimationClip.findByName(animations, 'Run'));
    actions.punch = mixer.clipAction(THREE.AnimationClip.findByName(animations, 'Punch'));
    actions.kick = mixer.clipAction(THREE.AnimationClip.findByName(animations, 'Kick'));

    actions.idle.play(); // Start with Idle
});

// Enemy (Blue Box for now)
const enemy = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: 0x2222ff }));
enemy.position.set(0, 1, -5);
enemy.castShadow = true;
scene.add(enemy);

// --- CONTROLS ---
let joystickActive = false;
let joystickStart = { x: 0, y: 0 };
let moveVector = { x: 0, y: 0 };
let isPunching = false;
let isKicking = false;
const joystickZone = document.getElementById('joystick');

joystickZone.addEventListener('touchstart', (e) => {
  joystickActive = true;
  const rect = joystickZone.getBoundingClientRect();
  joystickStart.x = rect.left + rect.width / 2;
  joystickStart.y = rect.top + rect.height / 2;
});

joystickZone.addEventListener('touchmove', (e) => {
  if (!joystickActive) return;
  const touch = e.touches[0];
  const deltaX = touch.clientX - joystickStart.x;
  const deltaY = touch.clientY - joystickStart.y;
  const distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
  if (distance > 0) {
    moveVector.x = (deltaX / distance) * Math.min(distance, 50) / 50;
    moveVector.y = (deltaY / distance) * Math.min(distance, 50) / 50;
  }
});

joystickZone.addEventListener('touchend', () => {
  joystickActive = false;
  moveVector = { x: 0, y: 0 };
  if(actions.run) actions.run.stop();
  if(actions.idle) actions.idle.play();
});

// Punch Button
document.getElementById('btn-punch').addEventListener('touchstart', () => {
  if(!player) return;
  actions.run.stop();
  actions.punch.reset().play();
  setTimeout(() => { actions.punch.stop(); actions.idle.play(); }, 500); // Punch for 0.5s
});

// Kick Button
document.getElementById('btn-kick').addEventListener('touchstart', () => {
  if(!player) return;
  actions.run.stop();
  actions.kick.reset().play();
  setTimeout(() => { actions.kick.stop(); actions.idle.play(); }, 800); // Kick for 0.8s
});

// --- GAME LOOP ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  
  if (mixer) mixer.update(delta);

  if (player) {
    // Move Player
    if (moveVector.x !== 0 || moveVector.y !== 0) {
      if(actions.idle) actions.idle.stop();
      if(actions.run && !actions.run.isRunning()) actions.run.play();
      
      player.position.x += moveVector.x * 0.1;
      player.position.z += moveVector.y * 0.1;
      
      const angle = Math.atan2(moveVector.x, moveVector.y);
      player.rotation.y = angle;
    }

    // Camera follow
    camera.position.x += (player.position.x - camera.position.x) * 0.1;
    camera.position.z += (player.position.z + 8 - camera.position.z) * 0.1;
    camera.lookAt(player.position.x, player.position.y + 2, player.position.z);
  }

  renderer.render(scene, camera);
}

animate();
