import * as THREE from 'three';

let spreads = [];
let currentSpread = 0;
let controlsUI = null;
let keyListener = null;

// ---------------- Load story ----------------
async function loadStory(url = 'story.txt') {
  const res = await fetch(url);
  const text = await res.text();
  return splitIntoPages(text, 100);
}

function splitIntoPages(text, size) {
  const words = text.split(/\s+/);
  const pages = [];
  for (let i = 0; i < words.length; i += size) {
    pages.push(words.slice(i, i + size).join(' '));
  }
  return pages;
}

// ---------------- Create book ----------------
export async function createBook5(
  scene,
  position = new THREE.Vector3(0, 2, 0)
) {
  const pages = await loadStory();

  const scale = 1.4;
  const coverW = 4.6 * scale;
  const coverH = 3.2 * scale;

  const pageW = coverW * 0.45;
  const pageH = coverH * 0.88;
  const gap = 0.1;

  const base = position.clone();
  base.y += 6;

  // ---- Cover
  const cover = new THREE.Mesh(
    new THREE.BoxGeometry(coverW, coverH, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
  );
  cover.position.copy(base);
  scene.add(cover);

  // ---- Pages
  spreads = [];
  for (let i = 0; i < pages.length; i += 2) {
    const left = makePage(pages[i] ?? '', pageW, pageH, base);
    const right = makePage(pages[i + 1] ?? '', pageW, pageH, base);

    left.position.x -= pageW / 2 + gap;
    right.position.x += pageW / 2 + gap;

    left.visible = i === 0;
    right.visible = i === 0;

    scene.add(left, right);
    spreads.push({ left, right });
  }

  // ---- HTML Controls
  controlsUI = createHTMLControls();

  // ---- Keyboard
  keyListener = (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  };
  window.addEventListener('keydown', keyListener);

  // ---- Animation flag for stopping fade
  let stopping = false;
  let fadeAlpha = 1;

  // ---- Return stop function
  return function stopBook5() {
    stopping = true;

    // Animate fade out
    const fadeInterval = setInterval(() => {
      fadeAlpha -= 0.05;
      if (fadeAlpha <= 0) {
        clearInterval(fadeInterval);

        // Remove spreads
        spreads.forEach(s => {
          scene.remove(s.left, s.right);
          s.left.geometry.dispose();
          s.left.material.map.dispose();
          s.left.material.dispose();
          s.right.geometry.dispose();
          s.right.material.map.dispose();
          s.right.material.dispose();
        });
        spreads = [];

        // Remove cover
        scene.remove(cover);
        cover.geometry.dispose();
        cover.material.dispose();

        // Remove HTML controls
        if (controlsUI) {
          document.body.removeChild(controlsUI);
          controlsUI = null;
        }

        // Remove keyboard listener
        if (keyListener) {
          window.removeEventListener('keydown', keyListener);
          keyListener = null;
        }

        currentSpread = 0;
      } else {
        // Fade pages and cover
        spreads.forEach(s => {
          s.left.material.opacity = fadeAlpha;
          s.right.material.opacity = fadeAlpha;
          s.left.material.transparent = true;
          s.right.material.transparent = true;
        });
        cover.material.opacity = fadeAlpha;
        cover.material.transparent = true;
      }
    }, 50);
  };
}

// ---------------- Page ----------------
function makePage(text, w, h, base) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = Math.round((h / w) * 512);

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#111';
  ctx.font = '26px serif';
  wrapText(ctx, text, 32, 56, canvas.width - 64, 36);

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(canvas),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1
    })
  );

  mesh.position.copy(base);
  mesh.position.z += 0.18;
  return mesh;
}

// ---------------- HTML Controls ----------------
function createHTMLControls() {
  const ui = document.createElement('div');
  ui.style.position = 'absolute';
  ui.style.left = '50%';
  ui.style.bottom = '200px'; 
  ui.style.transform = 'translateX(-50%)';
  ui.style.display = 'flex';
  ui.style.gap = '50px';
  ui.style.zIndex = '10';

  const btnStyle = `
    padding: 14px 26px;
    font-size: 34px;
    border-radius: 12px;
    border: 2px solid #333;
    background: #f3f3f3;
    cursor: pointer;
  `;

  const left = document.createElement('button');
  left.innerText = '◀';
  left.style.cssText = btnStyle;
  left.onclick = prev;

  const right = document.createElement('button');
  right.innerText = '▶';
  right.style.cssText = btnStyle;
  right.onclick = next;

  ui.append(left, right);
  document.body.appendChild(ui);

  return ui;
}

// ---------------- Navigation ----------------
function next() {
  if (currentSpread >= spreads.length - 1) return;
  setVisible(false);
  currentSpread++;
  setVisible(true);
}

function prev() {
  if (currentSpread <= 0) return;
  setVisible(false);
  currentSpread--;
  setVisible(true);
}

function setVisible(v) {
  spreads[currentSpread].left.visible = v;
  spreads[currentSpread].right.visible = v;
}

// ---------------- Text wrap ----------------
function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' ');
  let line = '';

  for (const w of words) {
    const test = line + w + ' ';
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(line, x, y);
      line = w + ' ';
      y += lineH;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}
