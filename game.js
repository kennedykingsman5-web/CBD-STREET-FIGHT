let scene, camera, renderer, player, enemy;
let moveVector = { x: 0, y: 0 };
let joystickActive = false;
let joystickStart = { x: 0, y: 0 };
let gameStarted = false;

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
  scene.fog = new THREE.Fog(0x111111, 5, 30);
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 3, 8);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.getElementById('game-container').appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
  scene.add(ambientLight);
  const spotLight = new THREE.SpotLight(0xffffff, 2);
  spotLight.position.set(0, 10, 0);
  spotLight.castShadow = true;
  scene.add(spotLight);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  player = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: 0xff2222 }));
  player.position.set(0, 1, 0);
  player.castShadow = true;
  scene.add(player);

  enemy = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: 0x2222ff }));
  enemy.position.set(0, 1, -5);
  enemy.castShadow = true;
  scene.add(enemy);

  animate();
}

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
});

function animate() {
  requestAnimationFrame(animate);
  
  if (player) {
    if (moveVector.x !== 0 || moveVector.y !== 0) {
      player.position.x += moveVector.x * 0.1;
      player.position.z += moveVector.y * 0.1;
      const angle = Math.atan2(moveVector.x, moveVector.y);
      player.rotation.y = angle;
    }

    camera.position.x += (player.position.x - camera.position.x) * 0.1;
    camera.position.z += (player.position.z + 8 - camera.position.z) * 0.1;
    camera.lookAt(player.position.x, player.position.y + 1, player.position.z);
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
                              }
