// Home, after the footer, across the full page width: 55 (89 on wide screens) glass tokens (the same token as the 3D story) drop into a heap when it scrolls into view,
// and the pointer pushes them around. 2D physics (verlet circles with gravity, floor and side walls), drawn with three.js.
import * as THREE from 'three';
import { SVGLoader } from '/assets/vendor/three/addons/SVGLoader.js';
import { RoomEnvironment } from '/assets/vendor/three/addons/RoomEnvironment.js';
import { mergeGeometries } from '/assets/vendor/three/addons/BufferGeometryUtils.js';

const canvas = document.getElementById('pile');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

async function init() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0); // transparent: the page's skyline (scene.js) shows behind the tokens

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xfff0d2, 2.8); key.position.set(300, 400, 500); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffe6b8, 1.0); fill.position.set(-200, 50, 800); scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xfff8ec, 0x6b5434, 0.6));

  // the token, as in scene.js: the logo mark extruded, in frosted gold glass
  const svg = await fetch('/assets/img/logo.svg').then(r => r.text());
  const shapes = [];
  for (const p of new SVGLoader().parse(svg).paths) shapes.push(...SVGLoader.createShapes(p));
  const box = new THREE.Box2();
  shapes.forEach(sh => sh.getPoints().forEach(pt => box.expandByPoint(pt)));
  const cx = (box.min.x + box.max.x) / 2, cy = (box.min.y + box.max.y) / 2, s = 2 / (box.max.x - box.min.x); // 2 units wide = diameter 1 unit radius
  const depth = 0.18 / s;
  const geo = mergeGeometries(shapes.map(sh => new THREE.ExtrudeGeometry(sh, { depth, curveSegments: 8, bevelEnabled: true, bevelThickness: 0.02 / s, bevelSize: 0.008 / s, bevelSegments: 2 })), false);
  geo.deleteAttribute('uv'); geo.translate(-cx, -cy, -depth / 2); geo.scale(s, s, s); geo.rotateX(Math.PI); geo.computeVertexNormals();
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xfffaf0, metalness: 0, roughness: 0.24, transmission: 1, thickness: 0.9, ior: 1.5,
    attenuationColor: 0xc9a053, attenuationDistance: 1.6, specularIntensity: 0.8, envMapIntensity: 1.3 });

  const MAX = 89, G = 2400, STEP = 1 / 120;
  let N = 55; // 89 on wide screens, so the heap still covers the full width (both Fibonacci numbers, like the mark)
  const mesh = new THREE.InstancedMesh(geo, glass, MAX);
  mesh.frustumCulled = false;
  scene.add(mesh);
  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -2000, 2000);
  camera.position.z = 1000;

  let W = 0, H = 0, r = 24, floor = 0, dropped = false, running = false, last = 0, acc = 0;
  const coins = [];
  const pointer = { x: -1e4, y: -1e4, vx: 0, vy: 0, on: false };
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();

  function layout() {
    const oldW = W, oldH = H;
    W = canvas.clientWidth; H = canvas.clientHeight;
    renderer.setSize(W, H, false);
    camera.right = W; camera.bottom = -H; camera.updateProjectionMatrix();
    r = Math.max(16, Math.min(30, W / 34));
    floor = H - 6;
    if (oldW && coins.length) for (const c of coins) { c.x = (c.x / oldW) * W; c.px = c.x; c.y = H - ((oldH - c.y) / oldH) * H; c.py = c.y; }
  }
  function drop() {
    coins.length = 0;
    for (let i = 0; i < N; i++) {
      const x = r + Math.random() * (W - 2 * r), y = -r * 2 - i * r * 0.5;
      coins.push({ x, y, px: x + (Math.random() - 0.5) * 3, py: y - 4, a: Math.random() * Math.PI * 2,
        tx: (Math.random() - 0.5) * 0.9, ty: (Math.random() - 0.5) * 0.9 });
    }
  }
  function step() {
    for (const c of coins) {
      const vx = (c.x - c.px) * 0.99, vy = (c.y - c.py) * 0.99;
      c.px = c.x; c.py = c.y;
      c.x += vx; c.y += vy + G * STEP * STEP;
      c.a -= vx / r;
    }
    if (pointer.on) {
      const R0 = r * 3.4;
      for (const c of coins) {
        const dx = c.x - pointer.x, dy = c.y - pointer.y, d = Math.hypot(dx, dy);
        if (d < R0 && d > 0.01) {
          const f = 1 - d / R0;
          c.x += (dx / d) * f * r * 0.16 + pointer.vx * f * 0.12;
          c.y += (dy / d) * f * r * 0.16 + pointer.vy * f * 0.12;
        }
      }
      pointer.vx *= 0.6; pointer.vy *= 0.6;
    }
    const D = 2 * r * 0.96, D2 = D * D; // a little overlap, so tilted tokens nest into each other
    for (let k = 0; k < 6; k++) {
      for (let i = 0; i < N; i++) {
        const a = coins[i];
        for (let j = i + 1; j < N; j++) {
          const b = coins[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
          if (d2 < D2 && d2 > 1e-6) {
            const d = Math.sqrt(d2), o = (D - d) / 2, nx = dx / d, ny = dy / d;
            a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o;
          }
        }
      }
      for (const c of coins) {
        if (c.x < r) c.x = r;
        if (c.x > W - r) c.x = W - r;
        if (c.y > floor - r) { c.y = floor - r; c.px += (c.x - c.px) * 0.2; } // floor friction
      }
    }
  }
  function draw() {
    for (let i = 0; i < N; i++) {
      const c = coins[i], vx = c.x - c.px, vy = c.y - c.py;
      v.set(c.x, -c.y, i * 0.5);
      e.set(c.tx + vy * 0.03, c.ty + vx * 0.03, c.a); q.setFromEuler(e); sc.setScalar(r);
      m4.compose(v, q, sc); mesh.setMatrixAt(i, m4);
    }
    mesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }
  function frame(now) {
    if (!running) return;
    acc += Math.min(0.05, (now - last) / 1000); last = now;
    while (acc >= STEP) { step(); acc -= STEP; }
    draw();
    requestAnimationFrame(frame);
  }

  layout();
  N = W > 1000 ? 89 : 55;
  mesh.count = N;
  drop();
  if (reduce) { for (let i = 0; i < 900; i++) step(); dropped = true; } // already settled, no falling
  draw();
  new ResizeObserver(() => { layout(); draw(); }).observe(canvas);
  new IntersectionObserver(es => {
    if (es.some(x => x.isIntersecting)) {
      if (!dropped) { dropped = true; drop(); }
      if (!running) { running = true; last = performance.now(); acc = 0; requestAnimationFrame(frame); }
    } else running = false;
  }, { threshold: 0.3 }).observe(canvas);

  const at = ev => { const b = canvas.getBoundingClientRect(); return [ev.clientX - b.left, ev.clientY - b.top]; };
  canvas.addEventListener('pointermove', ev => {
    const [x, y] = at(ev);
    if (pointer.on) { pointer.vx = x - pointer.x; pointer.vy = y - pointer.y; }
    pointer.x = x; pointer.y = y; pointer.on = true;
  });
  canvas.addEventListener('pointerdown', ev => { const [x, y] = at(ev); pointer.x = x; pointer.y = y; pointer.vx = pointer.vy = 0; pointer.on = true; });
  for (const name of ['pointerleave', 'pointercancel', 'pointerup']) canvas.addEventListener(name, ev => { if (name !== 'pointerup' || ev.pointerType !== 'mouse') pointer.on = false; });
}

if (canvas) init().catch(e => console.error(e));
