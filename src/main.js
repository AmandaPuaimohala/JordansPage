import './style.scss';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { spamSheep } from './sheep.js';
import { daisyEvent } from './daisy.js';
import { showGlobePlace } from './globe.js';
import { showEightBall } from './eightBall.js';
import { createFlappyBook } from './flappyBook.js';
import { startAquarius } from './aquarius.js';
import { startGhostEvent } from './ghostEvent.js';
import { startWolfSpirits } from './wolf.js';

/* -------------------- Canvas & Core -------------------- */
const canvas = document.querySelector('#experience-canvas');
const sizes = { width: window.innerWidth, height: window.innerHeight };
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffcaa8);

/* -------------------- Camera -------------------- */
const camera = new THREE.PerspectiveCamera(70, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 7, 13); 
camera.lookAt(5, 5, 0);      
scene.add(camera);

/* -------------------- Renderer -------------------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;

/* -------------------- Controls -------------------- */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);
controls.minPolarAngle = Math.PI / 6;    
controls.maxPolarAngle = Math.PI / 2.1;  
controls.minDistance = 4;
controls.maxDistance = 20;


/* -------------------- Enter Screen -------------------- */
const enterScreen = document.createElement('div');
enterScreen.id = 'enterScreen';
enterScreen.innerHTML = `
  <h1>Welcome to Jordan's Reading Room</h1>
  <p>Preparing the room...</p>
  <button id="enterButton">Enter</button>
`;
document.body.appendChild(enterScreen);

const enterButton = document.getElementById('enterButton');
``
/* -------------------- Interaction -------------------- */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const interactables = new Map();
let hovered = null;

const INTERACTIVE_NAMES = [
  'book1','book2','book3','book4','book5','book6','book53',
  'globe','daisy','Chihuahua',
];

const popupInfo = {
  book1: "This is book 1, full of adventures!",
  book2: "Book 2: mystery awaits.",
  book3: "Go to couch.",
  book4: "Book 4: fun stories inside.",
  book5: "Book 5: secrets revealed.",
  book6: "Flappy",
  book53: "Book 53: the hidden gem.",
  globe: "A tiny globe of the world!",
  mug: "A cute mug for your coffee.",
  daisy: "❤️",
  Chihuahua: "psychic"
};

/* -------------------- Popup HTML -------------------- */
const popup = document.createElement('div');
popup.id = 'popup';
popup.style.cssText = `
  display: none; position: absolute; top:50%; left:50%;
  transform: translate(-50%,-50%);
  background: #1e2a38; color: #fff; padding:25px 30px;
  border-radius:15px; box-shadow:0 8px 20px rgba(0,0,0,0.6);
  font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width:90%; width:600px; text-align:center; transition: all 0.3s ease;
`;
popup.innerHTML = `
  <span id="popup-text" style="display:block; margin-bottom:20px; font-size:1rem;"></span>
  <button id="close-popup" style="
    background: #3b5a7d; color:#fff; border:none; padding:10px 20px;
    border-radius:8px; cursor:pointer; font-size:0.95rem; transition: all 0.2s ease;
  ">Close</button>
`;
document.body.appendChild(popup);

const popupText = document.getElementById('popup-text');
const closeBtn = document.getElementById('close-popup');
closeBtn.addEventListener('mouseenter', () => closeBtn.style.background = '#577aa1');
closeBtn.addEventListener('mouseleave', () => closeBtn.style.background = '#3b5a7d');

/* -------------------- Night Mode -------------------- */
let nightTint = null;
function setNightMode(on) {
  if (on) {
    nightTint = new THREE.Color(0x1a2b4c);
    scene.traverse(obj => {
      if (obj.material && obj.material.color) {
        obj.userData.originalColor = obj.material.color.clone();
        obj.material.color.lerp(nightTint, 0.95);
      }
    });
    scene.fog = new THREE.Fog(0x0b1e3f, 3, 30);
  } else {
    scene.traverse(obj => {
      if (obj.material && obj.userData.originalColor) {
        obj.material.color.copy(obj.userData.originalColor);
        delete obj.userData.originalColor;
      }
    });
    scene.fog = null;
  }
}

function setNightVision(on) {
  if (on) {
    const nightTint = new THREE.Color(0x777777); 
    scene.traverse(obj => {
      if (obj.material && obj.material.color) {
        obj.userData.originalColor = obj.material.color.clone();
        const c = obj.userData.originalColor;
        const gray = (c.r + c.g + c.b) / 3;
        obj.material.color.setRGB(gray * nightTint.r, gray * nightTint.g, gray * nightTint.b);
      }
    });
    scene.fog = new THREE.Fog(0x444444, 2, 40);
 
  } else {
    scene.traverse(obj => {
      if (obj.material && obj.userData.originalColor) {
        obj.material.color.copy(obj.userData.originalColor);
        delete obj.userData.originalColor;
      }
    });
    scene.fog = null;
  }
}
// -------------------- Wolf Heart Release Button --------------------
let wolfReleaseBtn = null;

export function createWolfReleaseButton(onRelease, delay = 3000) {
  if (wolfReleaseBtn) return;

  wolfReleaseBtn = document.createElement('button');
  wolfReleaseBtn.textContent = '🖤 Release the Heart 🖤';

  wolfReleaseBtn.style.cssText = `
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    padding: 14px 32px;
    font-size: 1.05rem;
    letter-spacing: 0.12em;
    border-radius: 999px;
    border: 1px solid rgba(214,195,163,0.4);
    background: radial-gradient(circle at top, rgba(40,55,70,0.9), rgba(10,15,20,0.95));
    color: #d6c3a3;
    cursor: pointer;
    box-shadow: 0 0 18px rgba(140,180,255,0.25), 0 0 35px rgba(30,40,60,0.6) inset;
    backdrop-filter: blur(6px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 1.2s ease, transform 1.2s ease, box-shadow 0.3s ease;
    z-index: 1000;
  `;

  wolfReleaseBtn.onmouseenter = () => {
    wolfReleaseBtn.style.transform = 'translateX(-50%) translateY(6px) scale(1.05)';
    wolfReleaseBtn.style.boxShadow = '0 0 30px rgba(180,210,255,0.6), 0 0 45px rgba(40,60,90,0.8) inset';
  };

  wolfReleaseBtn.onmouseleave = () => {
    wolfReleaseBtn.style.transform = 'translateX(-50%) translateY(6px) scale(1)';
    wolfReleaseBtn.style.boxShadow = '0 0 18px rgba(140,180,255,0.25), 0 0 35px rgba(30,40,60,0.6) inset';
  };

  wolfReleaseBtn.onclick = () => {
    wolfReleaseBtn.style.opacity = '0';
    wolfReleaseBtn.style.pointerEvents = 'none';
    setTimeout(() => {
      wolfReleaseBtn.remove();
      wolfReleaseBtn = null;
    }, 800);
    onRelease();
  };

  document.body.appendChild(wolfReleaseBtn);
  setTimeout(() => {
    wolfReleaseBtn.style.opacity = '1';
    wolfReleaseBtn.style.pointerEvents = 'auto';
    wolfReleaseBtn.style.transform = 'translateX(-50%) translateY(0px)';
  }, delay);
}


// -------------------- Ghost Cleanse Button --------------------
let ghostCleanseBtn = null;

function createGhostCleanseButton(onCleanse) {
  
  if (ghostCleanseBtn) return;

  ghostCleanseBtn = document.createElement('button');
  ghostCleanseBtn.textContent = '✨ Cleanse the Area ✨';
  ghostCleanseBtn.style.cssText = `
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 30px;
    font-size: 1.1rem;
    border-radius: 12px;
    border: none;
    background: linear-gradient(90deg, #ff4444, #ffbb00);
    color: white;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(255,200,100,0.6);
    transition: all 0.3s ease;
    z-index: 1000;
  `;

  ghostCleanseBtn.addEventListener('mouseenter', () => {
    ghostCleanseBtn.style.boxShadow = '0 0 40px rgba(255,200,100,0.8)';
    ghostCleanseBtn.style.transform = 'translateX(-50%) scale(1.1)';
  });
  ghostCleanseBtn.addEventListener('mouseleave', () => {
    ghostCleanseBtn.style.boxShadow = '0 0 20px rgba(255,200,100,0.6)';
    ghostCleanseBtn.style.transform = 'translateX(-50%) scale(1)';
  });

  ghostCleanseBtn.addEventListener('click', () => {
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: absolute; top:0; left:0; width:100%; height:100%;
      background: radial-gradient(circle, rgba(255,200,100,0.8) 0%, transparent 60%);
      pointer-events: none;
      z-index: 999;
      opacity: 0;
      transition: opacity 0.5s ease-out;
    `;
    document.body.appendChild(flash);
    requestAnimationFrame(() => flash.style.opacity = '1');
    setTimeout(() => flash.style.opacity = '0', 50);
    setTimeout(() => document.body.removeChild(flash), 600);

    onCleanse();
    document.body.removeChild(ghostCleanseBtn);
    ghostCleanseBtn = null;
  });

  document.body.appendChild(ghostCleanseBtn);
}
let flappyCloseBtn = null;

export function createFlappyCloseButton(stopFlappyCallback) {
  if (flappyCloseBtn) {
    flappyCloseBtn.remove();
    flappyCloseBtn = null;
  }

  flappyCloseBtn = document.createElement('button');
  flappyCloseBtn.textContent = '🕹 Close Flappy 🕹';
  flappyCloseBtn.style.cssText = `
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 30px;
    font-size: 1.1rem;
    border-radius: 12px;
    border: none;
    background: linear-gradient(90deg, #44aaff, #00bbff);
    color: white;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(100,200,255,0.6);
    transition: all 0.3s ease;
    z-index: 1000;
  `;

  flappyCloseBtn.addEventListener('mouseenter', () => {
    flappyCloseBtn.style.boxShadow = '0 0 40px rgba(100,200,255,0.8)';
    flappyCloseBtn.style.transform = 'translateX(-50%) scale(1.1)';
  });
  flappyCloseBtn.addEventListener('mouseleave', () => {
    flappyCloseBtn.style.boxShadow = '0 0 20px rgba(100,200,255,0.6)';
    flappyCloseBtn.style.transform = 'translateX(-50%) scale(1)';
  });

  flappyCloseBtn.addEventListener('click', () => {
    if (stopFlappyCallback) stopFlappyCallback();
    flappyCloseBtn.remove();
    flappyCloseBtn = null;
  });

  document.body.appendChild(flappyCloseBtn);
}


/* -------------------- Loaders & Preloading -------------------- */
const textureLoader = new THREE.TextureLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const bakedTextureMap = { 
  woodFloor:'images/floor.jpg', 
  room:'images/walls4k.jpg', 
  Shelf:'images/shelf.jpg',
  rug:'images/rug4k.jpg', 
  bookStack:'images/staticBooks.jpg', 
  chair:'images/chair.jpg', 
  smallFurniture:'images/sideTable.jpg', 
  topRoom:'images/topRoom.jpg', 
  smallLanterninside:'images/lights.jpg', 
  plants:'images/plants.jpg', 
  globe:'images/diffuse.jpg', 
  Chihuahua:'images/chis.jpg', 
  milk:'images/milk.jpg', 
  cat:'images/tekstura_kota.jpg', 
  mug:'images/mug.jpg', 
  katana:'images/katana.jpg', 
  ground:'images/Ground.jpg', 
  daisy:'images/daisy.jpg', 
  windowOne:'images/window1.jpg', 
  windowTwo:'images/window2.jpg', 
  book1:'images/book1.jpg', 
  book2:'images/book2.jpg', 
  book3:'images/book8.jpg', 
  book4:'images/book4.jpg', 
  book5:'images/book5.jpg', 
  book6:'images/book6.jpg', 
  book53:'images/book7.jpg', 
  mountainDew:'images/dew.jpg', 
  pot:'images/daisyPot.jpg', 
  dinky:'images/dinks.jpg', 
  pillow:'images/pillow.jpg',
  frame: 'images/frame.jpg'
};

const bakedTextures = {};
Object.entries(bakedTextureMap).forEach(([name,path])=>{
  const tex = textureLoader.load(path);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  bakedTextures[name] = tex;
});

let preloadedScene = null;
let roomReady = false;
gltfLoader.load('models/JordanReadingRoom.glb', (gltf)=>{
  gltf.scene.traverse(child=>{
    if(!child.isMesh) return;
    if(bakedTextures[child.name]){
      child.material = new THREE.MeshBasicMaterial({map:bakedTextures[child.name]});
    }
    if(INTERACTIVE_NAMES.includes(child.name)){
      interactables.set(child, {basePos: child.position.clone(), baseRot: child.rotation.clone()});
    }
  });
  preloadedScene = gltf.scene; 
  roomReady = true;
});

/* -------------------- Event Handlers -------------------- */
let stopSheep=null, stopDaisy=null, stopGlobe=null, stopEightBall=null, stopFlappy=null, stopAquarius = null, stopGhost = null, stopWolf = null;
; 
let isEventActive = false;


const normalBg = new THREE.Color(0xffcaa8);
const sheepBg = new THREE.Color(0x0b1e3f);
const flappy = createFlappyBook(scene, camera);


scene.background = normalBg;
function stopAllEvents(){
  if (stopSheep)    { stopSheep(); stopSheep = null; scene.background = normalBg; setNightMode(false); }
  if (stopDaisy)    { stopDaisy(); stopDaisy = null; }
  if (stopGlobe)    { stopGlobe(); stopGlobe = null; }
  if (stopEightBall){ stopEightBall(); stopEightBall = null; }
  if (stopFlappy)   { stopFlappy(); stopFlappy = null; }
  if (stopAquarius) { stopAquarius(); stopAquarius = null; }
  if (stopGhost)    { stopGhost(); stopGhost = null; }
  if (stopWolf)     { stopWolf(); stopWolf = null; }

  popup.style.display = 'none';
  isEventActive = false;
}


window.addEventListener('mousemove', e=>{
  mouse.x = (e.clientX / sizes.width)*2-1;
  mouse.y = -(e.clientY / sizes.height)*2+1;
});

/* -------------------- Enter Button -------------------- */
enterButton.addEventListener('click', () => {
  if (!roomReady) {
    enterButton.textContent = 'Loading...';
    return;
  }

  enterScreen.classList.add('exit');
  enterScreen.addEventListener('animationend', function handler() {
    enterScreen.style.display = 'none';
    scene.add(preloadedScene);
    startTick();
    enterScreen.removeEventListener('animationend', handler);
  });
});



/* -------------------- Animation Loop -------------------- */
function startTick() {
  window.addEventListener('click', () => {
    if (isEventActive) return;
    if (!hovered) return; 
    stopAllEvents();
    isEventActive = true;
    switch (hovered.name) {

      case 'book3':
        popupText.textContent = popupInfo[hovered.name];
        popup.style.display = 'block';
        scene.background = sheepBg;
        setNightMode(true);
        isEventActive = true;
        stopSheep = spamSheep();
        break;

      case 'daisy':
        popupText.textContent = popupInfo[hovered.name];
        popup.style.display = 'block';
        stopDaisy = daisyEvent();
        break;

      case 'Chihuahua':
        popupText.textContent = popupInfo[hovered.name];
        popup.style.display = 'block';
        stopEightBall = showEightBall(popup);
        break;

      case 'book1':
        popup.style.display = 'none';
        const aquariusInstance = startAquarius(scene, camera, hovered);
        stopAllEvents();
        break;

      case 'book2':
        popup.style.display = 'none';
        stopWolf = startWolfSpirits(scene);
        createWolfReleaseButton(() => {
          stopAllEvents();
        });
        break;

      case 'book6':
          popup.style.display = 'none';
          if (!stopFlappy) {
              flappy.book.onClick();
              stopFlappy = () => {
                  flappy.stopFlappy(); 
                  stopFlappy = null;
              };
          }
          if (!flappyCloseBtn) {
              createFlappyCloseButton(() => {
                  stopFlappy?.(); 
                  stopAllEvents(); 
              });
          }
          break;


      case 'book53':
        popup.style.display = 'none';
        setNightVision(true);

        const floatObjs = [];
        preloadedScene.traverse(obj => {
          const floatNames = ['milk', 'mug', 'Chihuahua', 'globe', 'cat', 'mountainDew', 'book4', 'book6'];
          if (floatNames.includes(obj.name)) floatObjs.push(obj);
        });
        const ghost = startGhostEvent(scene, floatObjs);
        stopGhost = () => {
          ghost.stop();
          setNightVision(false);
        };
        createGhostCleanseButton(() => {
          stopAllEvents();
        });
        break;

      case 'globe':
        stopGlobe = showGlobePlace(popup);
        break;

      default:
        popupText.textContent = popupInfo[hovered.name] || `You clicked: ${hovered.name}`;
        popup.style.display = 'block';
    }
  });



  closeBtn.addEventListener('click', stopAllEvents);

  window.addEventListener('resize', ()=>{
    sizes.width=window.innerWidth;
    sizes.height=window.innerHeight;
    camera.aspect=sizes.width/sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width,sizes.height);
  });

  const tick = ()=>{
    controls.update();
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects([...interactables.keys()], true);
    hovered = hits.length ? hits[0].object : null;

    interactables.forEach((data, mesh)=>{
      const isHover = mesh === hovered;
      mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, data.basePos.y + (isHover ? 0.3 : 0), 0.1);
      mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, data.baseRot.y + (isHover ? 0 : 0), 0.1);
    });

    // -------------------- Camera Clamp --------------------
    const MIN_Y = 1;   
    const MAX_Y = 10; 
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, MIN_Y, MAX_Y);

    document.body.style.cursor = hovered ? 'pointer':'default';
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };

  tick();
}