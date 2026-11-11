let scene, camera, renderer, player, mixer;
let moveVector = { x: 0, y: 0 };
let joystickActive = false;
let joystickStart = { x: 0, y: 0 };
let gameStarted = false;
let actions = {};

// Game Logic Variables
let pedestrians = [];
let police = null;
let wantedLevel = 0;
let isGameOver = false;

document.getElementById('enter-btn').addEventListener('click', () => {
  document.getElementById('welcome-screen').style.display = 'none';
  document.getElementById('ui-layer').style.display = 'flex';
  
  if (!gameStarted) {
    init3DGame();
    gameStarted = true;
  }
});

function init3DGame() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x111111, 10, 80);
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 4, 8);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.getElementById('game-container').appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 20, 10);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Road & Sidewalk
  const road = new THREE.Mesh(new THREE.PlaneGeometry(20, 200), new THREE.MeshStandardMaterial({ color: 0x333333 }));
  road.rotation.x = -Math.PI / 2;
  road.receiveShadow = true;
  scene.add(road);

  // Buildings (Simple boxes)
  for(let i = 0; i < 10; i++) {
    const h = Math.random() * 20 + 10;
    const building = new THREE.Mesh(new THREE.BoxGeometry(15, h, 15), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    building.position.set(i % 2 === 0 ? -18 : 18, h/2, -i * 20);
    building.castShadow = true;
    scene.add(building);
  }

  // Player Character
  const loader = new THREE.GLTFLoader();
  loader.load('https://threejs.org/examples/models/gltf/Soldier.glb', (gltf) => {
    player = gltf.scene;
    player.position.set(0, 0, 0);
    player.traverse(n => { if(n.isMesh) n.castShadow = true; });
    scene.add(player);

    mixer = new THREE.AnimationMixer(player);
    actions.idle = mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, 'Idle'));
    actions.run = mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, 'Run'));
    actions.punch = mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, 'Punch'));
    actions.idle.play();
  });

  // Spawn Pedestrians (Walking NPCs)
  for(let i = 0; i < 5; i++) {
    spawnPedestrian();
  }

  animate();
}

// NPC Generator
function spawnPedestrian() {
  const npc = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }));
  npc.position.set((Math.random() - 0.5) * 15, 1, -Math.random() * 50);
  npc.isPedestrian = true;
  npc.speed = 0.02 + Math.random() * 0.03;
  scene.add(npc);
  pedestrians.push(npc);
}

// Controls
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
  if(actions.idle && actions.run) {
      actions.run.stop();
      actions.idle.play();
  }
});

// Punch Button (Starts Police Chase if you hit a pedestrian)
document.getElementById('btn-punch').addEventListener('touchstart', () => {
  if(!player || !actions.punch || isGameOver) return;
  
  actions.run.stop();
  actions.idle.stop();
  actions.punch.reset().play();
  setTimeout(() => { actions.punch.stop(); actions.idle.play(); }, 600);

  // Check if you are close to a pedestrian
  pedestrians.forEach((npc, index) => {
    const dist = player.position.distanceTo(npc.position);
    if(dist < 3) {
      // You hit them! Remove them and trigger wanted level
      scene.remove(npc);
      pedestrians.splice(index, 1);
      triggerPoliceChase();
    }
  });
});

function triggerPoliceChase() {
  if(wantedLevel === 1) return;
  wantedLevel = 1;
  alert("WANTED LEVEL 1! Police are chasing you!");

  // Spawn Police
  police = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x0000ff })); // Blue police
  police.position.set(0, 1, -20);
  scene.add(police);
}

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  if (player && !isGameOver) {
    // Player Movement
    if (moveVector.x !== 0 || moveVector.y !== 0) {
      if(actions.idle) actions.idle.stop();
      if(actions.run && !actions.run.isRunning()) actions.run.play();
      
      player.position.x += moveVector.x * 0.15;
      player.position.z += moveVector.y * 0.15;
      
      const angle = Math.atan2(moveVector.x, moveVector.y);
      player.rotation.y = angle;
    }

    // Camera Follow
    camera.position.x += (player.position.x - camera.position.x) * 0.1;
    camera.position.z += (player.position.z + 8 - camera.position.z) * 0.1;
    camera.lookAt(player.position.x, player.position.y + 2, player.position.z);

    // Animate Pedestrians
    pedestrians.forEach(npc => {
      npc.position.z -= npc.speed;
      npc.rotation.y = 0; // Facing forward
      if(npc.position.z < -60) npc.position.z = 10; // Loop them
    });

    // Animate Police Chase
    if(police) {
      police.position.x += (player.position.x - police.position.x) * 0.02; // Police runs towards you
      police.position.z += (player.position.z - police.position.z) * 0.02;

      // If police catches you
      const distToPolice = player.position.distanceTo(police.position);
      if(distToPolice < 2) {
        isGameOver = true;
        alert("BUSTED! The police caught you.");
        location.reload(); // Restart game
      }
    }
  }

  renderer.render(scene, camera);
}
