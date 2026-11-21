// /join reveal: the same glass token as the home 3D story (scene.js: logo mark extruded, frosted gold glass, same lights),
// floating in its own transparent canvas. spin() turns it faster and faster until it is edge-on, where the card takes over.
// Without WebGL the button keeps its still image (join-token-glass.webp, a render of this same token).
import * as THREE from 'three';
import { SVGLoader } from '/assets/vendor/three/addons/SVGLoader.js';
import { RoomEnvironment } from '/assets/vendor/three/addons/RoomEnvironment.js';
import { mergeGeometries } from '/assets/vendor/three/addons/BufferGeometryUtils.js';

export async function mountToken(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xfff0d2, 2.8); key.position.set(3, 4, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffe6b8, 1.0); fill.position.set(-2, 0.5, 8); scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xfff8ec, 0x6b5434, 0.6));
  const rim = new THREE.DirectionalLight(0xffffff, 0.8); rim.position.set(-5, 3, -4); scene.add(rim);

  const svg = await fetch('/assets/img/logo.svg').then(r => r.text());
  const shapes = [];
  for (const p of new SVGLoader().parse(svg).paths) shapes.push(...SVGLoader.createShapes(p));
  const box = new THREE.Box2();
  shapes.forEach(sh => sh.getPoints().forEach(pt => box.expandByPoint(pt)));
  const cx = (box.min.x + box.max.x) / 2, cy = (box.min.y + box.max.y) / 2, s = (2 * 0.9) / (box.max.x - box.min.x);
  const depth = 0.16 / s;
  const geo = mergeGeometries(shapes.map(sh => new THREE.ExtrudeGeometry(sh, { depth, curveSegments: 16, bevelEnabled: true, bevelThickness: 0.02 / s, bevelSize: 0.008 / s, bevelSegments: 4 })), false);
  geo.deleteAttribute('uv'); geo.translate(-cx, -cy, -depth / 2); geo.scale(s, s, s); geo.rotateX(Math.PI); geo.computeVertexNormals();
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xfffaf0, metalness: 0, roughness: 0.24, transmission: 1, thickness: 0.9, ior: 1.5,
    attenuationColor: 0xc9a053, attenuationDistance: 1.6, specularIntensity: 0.8, envMapIntensity: 1.3 });
  const coin = new THREE.Mesh(geo, glass);
  scene.add(coin);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 4.6);
  const size = () => { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  size(); new ResizeObserver(size).observe(canvas);

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let spinStart = 0, spinFrom = 0, done = null, t0 = performance.now();
  const SPIN = 1100, TURNS = 3.25 * Math.PI * 2; // ends a quarter turn past whole turns: edge-on
  function frame(now) {
    const t = (now - t0) / 1000;
    if (spinStart) {
      const k = Math.min(1, (now - spinStart) / SPIN), e = k * k * (3 - 2 * k) * 0.35 + k * k * 0.65; // slow start, fast finish
      coin.rotation.y = spinFrom + (TURNS - spinFrom) * e;
      coin.rotation.x = 0; coin.position.y = 0; coin.scale.setScalar(1 + 0.35 * e);
      renderer.render(scene, camera);
      if (k >= 1) { done(); return; }
    } else {
      coin.rotation.y = still ? 0.35 : Math.sin(t * 0.8) * 0.55;
      coin.rotation.x = still ? -0.08 : Math.sin(t * 0.6) * 0.12;
      coin.position.y = still ? 0 : Math.sin(t * 1.9) * 0.08;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }
  frame(performance.now()); // first frame drawn before the canvas is shown, so the still image hands over without a blank
  return {
    spin: () => new Promise(r => { if (still) return r(); spinFrom = coin.rotation.y; spinStart = performance.now(); done = r; })
  };
}
