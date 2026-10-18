// Myntas 3D stage: a frosted-glass token made from the logo, a palazzo of 55 blocks, and 55 small tokens.
// Each page sets <body data-page="..."> and the stage follows that page's story as the visitor scrolls:
//   home        token -> building -> 55 tokens -> one token (scroll story across the [data-chapter] sections),
//               then the token settles between the benefit cards and flips with the investor/owner switch
//   proprietari owners: the building is compressed into a single token
import * as THREE from 'three';
import { SVGLoader } from '/assets/vendor/three/addons/SVGLoader.js';
import { RoomEnvironment } from '/assets/vendor/three/addons/RoomEnvironment.js';
import { mergeGeometries } from '/assets/vendor/three/addons/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from '/assets/vendor/three/addons/RoundedBoxGeometry.js';

const PAGE = document.body.dataset.page;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

async function loadImage(src) {
  const img = new Image();
  img.src = src;
  try { await img.decode(); } catch (e) { /* render without the skyline */ }
  return img;
}

async function init() {
  const canvas = document.getElementById('scene');
  if (!canvas) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { noScene(); return; }

  const [skyImg, svgText] = await Promise.all([
    loadImage('/assets/img/skyline.jpg'),
    fetch('/assets/img/logo.svg').then(r => r.text())
  ]);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0xf7f1e5, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf7f1e5);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  // skyline backdrop: opaque, so the glass has something to show through
  const skyTex = new THREE.Texture(skyImg);
  skyTex.colorSpace = THREE.SRGBColorSpace; skyTex.anisotropy = 4; skyTex.needsUpdate = true;
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: skyTex, toneMapped: false }));
  const SKY_Z = -3, SKY_A = 16 / 9;
  sky.position.z = SKY_Z;
  scene.add(sky);
  let skyBaseY = 0, skyVisH = 1;
  function fitSky() {
    skyVisH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - SKY_Z);
    const visW = skyVisH * camera.aspect;
    let w = visW * 1.04, h = w / SKY_A;
    if (h < skyVisH * 1.12) { h = skyVisH * 1.12; w = h * SKY_A; }
    sky.scale.set(w, h, 1);
    skyBaseY = -skyVisH / 2 + h / 2;
  }

  const key = new THREE.DirectionalLight(0xfff0d2, 2.8); key.position.set(3, 4, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffe6b8, 1.0); fill.position.set(-2, 0.5, 8); scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xfff8ec, 0x6b5434, 0.6));
  const rim = new THREE.DirectionalLight(0xffffff, 0.8); rim.position.set(-5, 3, -4); scene.add(rim);

  // logo geometry from /assets/img/logo.svg
  const shapes = [];
  for (const p of new SVGLoader().parse(svgText).paths) shapes.push(...SVGLoader.createShapes(p));
  const box = new THREE.Box2();
  shapes.forEach(sh => sh.getPoints().forEach(pt => box.expandByPoint(pt)));
  const cx = (box.min.x + box.max.x) / 2, cy = (box.min.y + box.max.y) / 2;
  const s = (2 * 0.9) / (box.max.x - box.min.x);
  function tokenGeo(hi) {
    const depth = 0.16 / s;
    const opts = hi
      ? { depth, curveSegments: 16, bevelEnabled: true, bevelThickness: 0.02 / s, bevelSize: 0.008 / s, bevelSegments: 4 }
      : { depth, curveSegments: 4, bevelEnabled: true, bevelThickness: 0.02 / s, bevelSize: 0.008 / s, bevelSegments: 1 };
    const g = mergeGeometries(shapes.map(sh => new THREE.ExtrudeGeometry(sh, opts)), false);
    g.deleteAttribute('uv');
    g.translate(-cx, -cy, -depth / 2);
    g.scale(s, s, s);
    g.rotateX(Math.PI); // SVG y-down to y-up (a rotation, so the mark is not mirrored)
    g.computeVertexNormals();
    return g;
  }
  // frosted glass in the brand gold
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xfffaf0, metalness: 0, roughness: 0.24,
    transmission: 1, thickness: 0.9, ior: 1.5,
    attenuationColor: 0xc9a053, attenuationDistance: 1.6,
    specularIntensity: 0.8, envMapIntensity: 1.3
  });

  const coin = new THREE.Group();
  coin.add(new THREE.Mesh(tokenGeo(true), glass));
  scene.add(coin);

  // the palazzo: 55 units (5 floors x 5 bays x 2 deep, plus a 5-block gold cornice). 55 is a Fibonacci number, like the mark.
  const N = 55, CELL = 0.36;
  const slots = [], rows = [], kinds = [];
  for (let r = 0; r < 5; r++) for (let z = 0; z < 2; z++) for (let c = 0; c < 5; c++) {
    slots.push(new THREE.Vector3((c - 2) * CELL, (r - 2.6) * CELL, (z - 0.5) * CELL));
    rows.push(r);
    const opening = (z === 1 && r >= 1 && (c === 1 || c === 3)) || (z === 1 && r === 0 && c === 2);
    kinds.push(opening ? 'opening' : 'stone');
  }
  for (let c = 0; c < 5; c++) { slots.push(new THREE.Vector3((c - 2) * CELL, 2.4 * CELL, 0)); rows.push(5); kinds.push('cornice'); }
  const blocks = new THREE.InstancedMesh(
    new RoundedBoxGeometry(CELL * 0.96, CELL * 0.96, CELL * 0.96, 2, 0.025),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.05, roughness: 0.75 }), N);
  const cStone = [new THREE.Color(0xd6c3a0), new THREE.Color(0xcdb68f), new THREE.Color(0xdccbaa)];
  const cOpening = new THREE.Color(0x4a3820), cCornice = new THREE.Color(0xb79144);
  for (let i = 0; i < N; i++) blocks.setColorAt(i, kinds[i] === 'opening' ? cOpening : kinds[i] === 'cornice' ? cCornice : cStone[i % 3]);
  const tokens = new THREE.InstancedMesh(tokenGeo(false), glass, N);
  const GOLD_ANGLE = Math.PI * (3 - Math.sqrt(5));
  const spreadPos = [];
  for (let i = 0; i < N; i++) {
    const r = 0.25 * Math.sqrt(i + 0.6), a = i * GOLD_ANGLE;
    spreadPos.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, Math.sin(i * 1.7) * 0.25));
  }
  const stage = new THREE.Group();
  stage.add(blocks, tokens);
  scene.add(stage);
  blocks.frustumCulled = false; tokens.frustumCulled = false;

  // ---- per-page targets
  const clamp01 = v => Math.min(1, Math.max(0, v));
  const ease = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const ramp = (t, a, b) => ease((t - a) / (b - a));
  const lerp = (a, b, u) => a + (b - a) * u;
  const K = [
    { t: 0.5, x: 1.6, y: 0, s: 1 }, { t: 1.5, x: -1.6, y: 0, s: 1 }, { t: 2.5, x: 1.55, y: 0, s: 1 },
    { t: 3.5, x: -1.55, y: 0, s: 1.05 }, { t: 4.5, x: 1.75, y: 0.05, s: 0.78 }
  ];
  function sample(t) {
    if (t <= K[0].t) return K[0];
    for (let i = 0; i < K.length - 1; i++) {
      const a = K[i], b = K[i + 1];
      if (t <= b.t) { const u = ease((t - a.t) / (b.t - a.t)); return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), s: lerp(a.s, b.s, u) }; }
    }
    return K[K.length - 1];
  }
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const perks = document.querySelector('.perks'), slot = perks && perks.querySelector('.flip-slot');
  // the story's spin when the token reaches the benefits chapter, wound back to a front-facing angle so it lands face on
  const FRONT = -0.3, S5 = 4.5 * Math.PI - 0.38, SPIN_FRONT = S5 - ((((S5 - FRONT) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));
  function storyT() {
    const c = window.scrollY + window.innerHeight / 2;
    for (let i = 0; i < chapters.length; i++) {
      const top = chapters[i].getBoundingClientRect().top + window.scrollY, h = chapters[i].offsetHeight;
      if (c < top) return i === 0 ? 0.5 : i;
      if (c < top + h) return i + (c - top) / h;
    }
    return chapters.length;
  }

  let W = 0, H = 0, mobile = false;
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    fitSky(); mobile = W < 760;
  }
  resize();
  window.addEventListener('resize', resize);
  let px = 0, py = 0, tpx = 0, tpy = 0;
  window.addEventListener('pointermove', e => { tpx = (e.clientX / W) * 2 - 1; tpy = (e.clientY / H) * 2 - 1; }, { passive: true });

  function targets() {
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z, halfW = halfH * camera.aspect;
    let T, t = 0;
    if (PAGE === 'home') {
      t = storyT(); const k = sample(t);
      T = { x: k.x, y: k.y, s: k.s, build: ramp(t, 0.75, 1.45), split: ramp(t, 1.75, 2.4), gather: ramp(t, 2.7, 3.35),
        coin: clamp01(1 - ramp(t, 0.7, 1.15) + ramp(t, 3.0, 3.4)), spin: (t - 0.5) * Math.PI - 0.38, turn: -0.55 + (t - 1.5) * 0.5, sky: clamp01(t / 4.5) };
    } else {
      // after the hero the object shrinks into the top corner so it never covers listings or forms
      const p = Math.max(0, window.scrollY / H), away = ramp(p, 0.9, 1.5);
      T = { x: lerp(1.7, halfW * 0.8, away), y: lerp(0, halfH * 0.66, away), s: lerp(1, 0.3, away), spin: p * Math.PI - 0.38, turn: -0.55 + p * 0.6, sky: clamp01(p / 2) };
      Object.assign(T, { build: 1 - ramp(p, 0.12, 0.65), split: 0, gather: 0, coin: ramp(p, 0.4, 0.7) });
    }
    if (mobile) { T.x = 0; T.y = halfH * 0.5; T.s *= 0.55; }
    T.flip = 0;
    if (slot) {
      // benefits chapter: follow .flip-slot on screen, face front, one full turn per switch.
      // The move starts when the section enters the viewport (a solid section sits between it and "processo").
      const f = ramp(H - perks.getBoundingClientRect().top, 0, H * 0.65);
      if (f > 0) {
        const r = slot.getBoundingClientRect();
        T.x = lerp(T.x, ((r.left + r.width / 2) / W * 2 - 1) * halfW, f);
        T.y = lerp(T.y, (1 - (r.top + r.height / 2) / H * 2) * halfH, f);
        T.s = lerp(T.s, (r.width / W) * halfW, f); // the token is 1.8 units wide at s = 1; fill ~90% of the slot
        T.spin = lerp(T.spin, SPIN_FRONT, f);
      }
      if (perks.dataset.side === 'owner') T.flip = 2 * Math.PI;
    }
    return T;
  }

  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), v4 = new THREE.Vector3(), sc4 = new THREE.Vector3(), tmp = new THREE.Vector3();
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  const clock = new THREE.Clock();
  const P = targets();
  let first = true, last = performance.now();
  function frame(now) {
    now = now || performance.now();
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const time = clock.getElapsedTime();
    const T = targets(), k = 1 - Math.exp(-dt * 4.5);
    for (const key in T) P[key] += (T[key] - P[key]) * k;
    const pe = 1 - Math.exp(-dt * 3);
    px += (tpx - px) * pe; py += (tpy - py) * pe;

    sky.position.y = skyBaseY - P.sky * 0.1 * skyVisH; // skyline sinks gently as you scroll
    const build = clamp01(P.build), split = clamp01(P.split), gather = clamp01(P.gather);

    const cs = P.s * clamp01(P.coin);
    coin.visible = cs > 0.002;
    coin.position.set(P.x, P.y + Math.sin(time * 0.8) * 0.04, 0);
    coin.scale.setScalar(Math.max(cs, 0.0001));
    coin.rotation.set(0.14 + Math.sin(time * 0.45) * 0.05 + py * 0.12, P.spin + P.flip + Math.sin(time * 0.6) * 0.1 + px * 0.25, 0);

    stage.position.set(P.x, P.y, 0);
    stage.scale.setScalar(Math.max(P.s, 0.0001));
    stage.rotation.set((0.12 + py * 0.08) * (1 - split), (P.turn + px * 0.2) * (1 - split), 0);

    const active = build > 0.001 && gather < 0.999 && P.s > 0.01;
    blocks.visible = active && split < 0.999;
    tokens.visible = active && split > 0.001;
    if (blocks.visible || tokens.visible) {
      for (let i = 0; i < N; i++) {
        const slot = slots[i];
        const bi = ease(build * 1.9 - rows[i] * 0.15);       // blocks rise from the ground floor up
        const si = ease(split * 1.7 - (5 - rows[i]) * 0.12); // the top comes apart first
        const gi = ease(gather * 1.6 - (i / N) * 0.6);       // outer tokens travel last
        if (blocks.visible) {
          const bs = bi * (1 - si);
          if (bs < 0.002) blocks.setMatrixAt(i, ZERO);
          else {
            tmp.copy(slot).multiplyScalar(bi); q4.identity(); sc4.setScalar(bs);
            if (kinds[i] === 'opening') { tmp.z -= 0.06 * bi; sc4.set(bs * 0.66, bs * 0.72, bs * 0.62); } // recessed windows and door
            m4.compose(tmp, q4, sc4); blocks.setMatrixAt(i, m4);
          }
        }
        if (tokens.visible) {
          const ts = 0.125 * si * (1 - gi * 0.85);
          if (ts < 0.002) tokens.setMatrixAt(i, ZERO);
          else {
            v4.copy(slot).lerp(spreadPos[i], si).multiplyScalar(1 - gi);
            e4.set(0.2, P.spin + i * 0.61 + time * 0.4, 0); q4.setFromEuler(e4); sc4.setScalar(ts);
            m4.compose(v4, q4, sc4); tokens.setMatrixAt(i, m4);
          }
        }
      }
      blocks.instanceMatrix.needsUpdate = true;
      tokens.instanceMatrix.needsUpdate = true;
    }
    renderer.render(scene, camera);
    if (first) { first = false; document.documentElement.classList.add('webgl'); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// no WebGL or a failed start: show the flat logo straight away instead of waiting for the CSS timeout
function noScene() { document.documentElement.classList.add('no3d'); }
if (!reduce && ['home', 'proprietari'].includes(PAGE)) init().catch(e => { noScene(); console.error(e); });
