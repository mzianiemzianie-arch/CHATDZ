let scene, camera, renderer;
let controlsEnabled = false;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

let pointerLocked = false;

// Basic setup
init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  scene.add(light);

  // Floor (Grass Block grid)
  const blockSize = 2;
  const floorSize = 20;
  const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
  const material = new THREE.MeshStandardMaterial({color: 0x27ae60});
  for(let x = -floorSize; x <= floorSize; x++) {
    for(let z = -floorSize; z <= floorSize; z++) {
      const block = new THREE.Mesh(geometry, material);
      block.position.set(x * blockSize, -blockSize, z * blockSize);
      scene.add(block);
    }
  }

  camera.position.set(0, 2, 5);

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Pointer lock & look handling
  const lookRight = document.getElementById('look-right');

  lookRight.addEventListener('pointerdown', () => {
    document.body.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === document.body;
  });

  document.addEventListener('mousemove', (event) => {
    if (!pointerLocked) return;
    camera.rotation.y -= event.movementX * 0.002;
    camera.rotation.x -= event.movementY * 0.002;
    camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
  });

  // Movement controls
  document.addEventListener('keydown', (e) => {
    switch(e.code) {
      case 'KeyW': moveForward = true; break;
      case 'KeyS': moveBackward = true; break;
      case 'KeyA': moveLeft = true; break;
      case 'KeyD': moveRight = true; break;
    }
  });
  document.addEventListener('keyup', (e) => {
    switch(e.code) {
      case 'KeyW': moveForward = false; break;
      case 'KeyS': moveBackward = false; break;
      case 'KeyA': moveLeft = false; break;
      case 'KeyD': moveRight = false; break;
    }
  });
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  velocity.x -= velocity.x * 0.1;
  velocity.z -= velocity.z * 0.1;

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  if(moveForward || moveBackward) velocity.z -= direction.z * 0.1;
  if(moveLeft || moveRight) velocity.x -= direction.x * 0.1;

  camera.translateX(velocity.x);
  camera.translateZ(velocity.z);

  renderer.render(scene, camera);
}