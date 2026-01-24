import * as THREE from 'three';

export function startAquarius(scene, camera, triggerObject) {
  const group = new THREE.Group();
  scene.add(group);

  let active = true;
  const letters = [];
  const clock = new THREE.Clock();

  // Shake parameters
  const shakeObj = { intensity: 0, duration: 0 };
  const originalPositions = new Map();
  const originalBookPos = triggerObject.position.clone(); // save original book position

  function stopAquarius() {
    active = false;

    letters.forEach(l => {
      l.material.map.dispose();
      l.material.dispose();
    });

    scene.remove(group);

    // Restore original positions
    originalPositions.forEach((pos, obj) => obj.position.copy(pos));

    // Restore book position
    triggerObject.position.copy(originalBookPos);
  }

  const result = { stop: stopAquarius };
  const text = '♒Aquarius Independence♒';
  const INSTANCES = 1;

  function createLetter(char, hue) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = `hsl(${hue}, 80%, 70%)`;
    ctx.font = '72px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.55, 0.55, 0.55);
    return sprite;
  }

  // Spawn letters
  for (let j = 0; j < INSTANCES; j++) {
    [...text].forEach((char, i) => {
      if (char === ' ') return;

      const sprite = createLetter(char, 200 + i * 4 + j * 20);

      sprite.userData = {
        baseX: (i - text.length / 2) * 0.18,
        baseY: (Math.random() - 0.5) * 0.2,
        depth: j * 0.35,
        floatSeed: Math.random() * Math.PI * 2,
        launched: false,
        exploding: false,
        explosionStarted: false,
        velocity: new THREE.Vector3(),
        rotationAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        spinSpeed: 0,
        scaleFactor: 0.5,
        jitterStrength: 0.02
      };

      sprite.scale.set(0.55 * sprite.userData.scaleFactor, 0.55 * sprite.userData.scaleFactor, 0.55 * sprite.userData.scaleFactor);

      group.add(sprite);
      letters.push(sprite);
    });
  }

  // Save original mesh positions for shake reset
  scene.traverse(obj => {
    if (obj.isMesh && obj !== triggerObject) originalPositions.set(obj, obj.position.clone());
  });

  // Animate
  function animate() {
    if (!active) return;
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    let anyExploding = false;

    letters.forEach((sprite, i) => {
      const d = sprite.userData;

      if (!d.launched) {
        sprite.position.copy(camera.position).add(forward.clone().multiplyScalar(2.2 + d.depth));
        sprite.position.x += d.baseX + Math.sin(t + d.floatSeed) * 0.04;
        sprite.position.y += d.baseY + Math.sin(t * 0.7 + i) * 0.06;
        sprite.material.opacity = Math.min(sprite.material.opacity + 0.03, 1);
        d.scaleFactor = Math.min(d.scaleFactor + 0.01, 1.5);
        sprite.scale.set(0.55 * d.scaleFactor, 0.55 * d.scaleFactor, 0.55 * d.scaleFactor);

        if (t > 1) d.launched = true; // auto-launch
      } else {
        if (!d.explosionStarted) {
          d.scaleFactor += 0.12;
          sprite.scale.set(0.55 * d.scaleFactor, 0.55 * d.scaleFactor, 0.55 * d.scaleFactor);

          if (d.scaleFactor > 4.5) {
            d.explosionStarted = true;
            d.exploding = true;
            d.velocity.set((Math.random() - 0.5) * 0.02, Math.random() * 0.02, (Math.random() - 0.5) * 0.02);
            d.spinSpeed = 1 + Math.random() * 2;

            shakeObj.intensity = 0.15;
            shakeObj.duration = 20;
          }
        } else {
          anyExploding = true;
          sprite.position.add(d.velocity);
          sprite.position.x += (Math.random() - 0.5) * d.jitterStrength;
          sprite.position.y += (Math.random() - 0.5) * d.jitterStrength;
          sprite.position.z += (Math.random() - 0.5) * d.jitterStrength;

          sprite.material.opacity *= 0.85;
          d.scaleFactor *= 0.95;
          sprite.scale.set(0.55 * d.scaleFactor, 0.55 * d.scaleFactor, 0.55 * d.scaleFactor);

          d.velocity.y -= 0.005;
          sprite.rotateOnAxis(d.rotationAxis, d.spinSpeed);
        }
      }

      sprite.lookAt(camera.position);
    });

    // Room shake
    if (shakeObj.duration > 0) {
      scene.traverse(obj => {
        if (!obj.isMesh || obj === triggerObject) return;
        const orig = originalPositions.get(obj);
        if (!orig) return;
        obj.position.x = orig.x + (Math.random() - 0.5) * shakeObj.intensity;
        obj.position.y = orig.y + (Math.random() - 0.5) * shakeObj.intensity;
        obj.position.z = orig.z + (Math.random() - 0.5) * shakeObj.intensity;
      });
      shakeObj.duration--;
    } else if (anyExploding) {
      scene.traverse(obj => {
        if (!obj.isMesh || obj === triggerObject) return;
        const orig = originalPositions.get(obj);
        if (!orig) return;
        obj.position.lerp(orig, 0.1);
      });
    }
  }

  animate();
  return result;
}
