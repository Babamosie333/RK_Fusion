// Update year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// === THREE.JS SETUP ===
const canvas = document.getElementById("webgl");
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  150
);
camera.position.set(0, 2.4, 13);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
mainLight.position.set(6, 10, 10);
scene.add(mainLight);

const sideLight = new THREE.PointLight(0x4fd1c5, 1.4, 60);
sideLight.position.set(-7, 2, -6);
scene.add(sideLight);

// === SPINE GROUP: vertebra segments in an S-curve ===
const spineGroup = new THREE.Group();
scene.add(spineGroup);

const vertebrae = [];
const vertebraCount = 18;

const baseY = -2.4;
const stepY = 0.52;

const baseColor = new THREE.Color(0x2f855a);
const topColor = new THREE.Color(0xf6e05e);

for (let i = 0; i < vertebraCount; i++) {
  const t = i / (vertebraCount - 1);

  const sCurve = Math.sin((t - 0.5) * Math.PI * 0.8) * 0.7;

  const radiusProfile =
    0.24 + (1 - Math.abs(t - 0.45) * 2) * 0.18;

  const height = 0.22 + (1 - Math.abs(t - 0.45) * 2) * 0.06;

  const geom = new THREE.CylinderGeometry(
    radiusProfile * 1.1,
    radiusProfile,
    height,
    24,
    1,
    false
  );

  const color = baseColor.clone().lerp(topColor, t);
  const mat = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.2,
    roughness: 0.18,
    transmission: 0.28,
    thickness: 1.2,
    emissive: color,
    emissiveIntensity: 0.5,
    clearcoat: 0.75,
    clearcoatRoughness: 0.2
  });

  const vertebra = new THREE.Mesh(geom, mat);

  vertebra.position.set(sCurve, baseY + i * stepY, -4.5);
  vertebra.rotation.z = (sCurve / 0.7) * 0.35;

  spineGroup.add(vertebra);
  vertebrae.push(vertebra);
}

// Spinal line
const linePoints = [];
for (let i = 0; i < vertebraCount; i++) {
  const t = i / (vertebraCount - 1);
  const sCurve = Math.sin((t - 0.5) * Math.PI * 0.8) * 0.7;
  const y = baseY + i * stepY;
  linePoints.push(new THREE.Vector3(sCurve, y, -4.5));
}
const lineGeom = new THREE.BufferGeometry().setFromPoints(linePoints);
const lineMat = new THREE.LineBasicMaterial({
  color: 0x9ae6b4,
  linewidth: 2
});
const spinalLine = new THREE.Line(lineGeom, lineMat);
spineGroup.add(spinalLine);

// === YOGA MAT at base ===
const matGeom = new THREE.BoxGeometry(6.5, 0.04, 2.4);
const matMat = new THREE.MeshStandardMaterial({
  color: 0x22543d,
  roughness: 0.85,
  metalness: 0.05
});
const matMesh = new THREE.Mesh(matGeom, matMat);
matMesh.position.set(0, baseY - 0.6, -3.6);
matMesh.rotation.x = -Math.PI / 14;
scene.add(matMesh);

// Mat stripes
const stripeGeom = new THREE.PlaneGeometry(6.1, 0.03);
const stripeMat = new THREE.MeshBasicMaterial({
  color: 0x9ae6b4,
  transparent: true,
  opacity: 0.4,
  side: THREE.DoubleSide
});
for (let i = 0; i < 4; i++) {
  const s = new THREE.Mesh(stripeGeom, stripeMat);
  s.rotation.x = -Math.PI / 14;
  s.position.set(0, baseY - 0.59 + i * 0.2, -3.5 - i * 0.03);
  scene.add(s);
}

// === BREATH WAVES (left & right) ===
function createBreathRibbon(color, side = "left") {
  const geom = new THREE.PlaneGeometry(8, 1.4, 160, 18);
  const mat = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: 0.24,
    metalness: 0.1,
    roughness: 0.6,
    side: THREE.DoubleSide
  });
  const ribbon = new THREE.Mesh(geom, mat);
  ribbon.rotation.x = -Math.PI / 2.3;
  ribbon.position.set(side === "left" ? -3.2 : 3.2, 0.2, -7.4);
  return ribbon;
}

const leftBreath = createBreathRibbon(0x4fd1c5, "left");
const rightBreath = createBreathRibbon(0xf6ad55, "right");
scene.add(leftBreath, rightBreath);

// === RISING ENERGY PARTICLES AROUND SPINE ===
const particleCount = 420;
const pPositions = new Float32Array(particleCount * 3);
const pColors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  const t = Math.random();
  const sCurve = Math.sin((t - 0.5) * Math.PI * 0.8) * 0.9;
  const y = baseY - 1.5 + Math.random() * 9;
  const z = -4.5 + (Math.random() - 0.5) * 1.8;

  pPositions[i * 3 + 0] = sCurve + (Math.random() - 0.5) * 0.6;
  pPositions[i * 3 + 1] = y;
  pPositions[i * 3 + 2] = z;

  const c = new THREE.Color().setHSL(0.47 + Math.random() * 0.08, 0.35, 0.7);
  pColors[i * 3 + 0] = c.r;
  pColors[i * 3 + 1] = c.g;
  pColors[i * 3 + 2] = c.b;
}

const pGeom = new THREE.BufferGeometry();
pGeom.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
pGeom.setAttribute("color", new THREE.BufferAttribute(pColors, 3));

const pMat = new THREE.PointsMaterial({
  size: 0.045,
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  depthWrite: false
});

const prana = new THREE.Points(pGeom, pMat);
scene.add(prana);

// === INTERACTION: mouse + scroll ===
const mouse = { x: 0, y: 0 };
let scrollProgress = 0;

window.addEventListener("pointermove", (e) => {
  mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

function updateScrollProgress() {
  const docHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const y = window.scrollY || window.pageYOffset || 0;
  scrollProgress = docHeight > 0 ? y / docHeight : 0;
}
window.addEventListener("scroll", updateScrollProgress);
updateScrollProgress();

// Resize
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Helper wave
function wave(x, t, freq, amp) {
  return Math.sin(x * freq + t) * amp;
}

// === ANIMATION LOOP ===
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();

  // Vertebrae: gentle rocking + micro “adjustments”
  vertebrae.forEach((v, i) => {
    const phase = i * 0.35;
    const breathe = 1 + Math.sin(t * 0.8 + phase) * 0.03;
    v.scale.set(1, breathe, 1);

    const microTilt = Math.sin(t * 0.6 + phase) * 0.05;
    v.rotation.y = microTilt;
  });

  // Spinal line slight glow pulse
  const lineOpacity = 0.4 + Math.sin(t * 0.9) * 0.12;
  lineMat.color.setHSL(0.4, 0.45, 0.6 + lineOpacity * 0.2);

  // Prana: rising around spine
  const pos = prana.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let y = pos.getY(i);
    y += 0.012 + scrollProgress * 0.01;
    if (y > baseY + 6) y = baseY - 2.8 - Math.random() * 0.8;
    pos.setY(i, y);
  }
  pos.needsUpdate = true;

  // Breath ribbons: inhale/exhale waves
  const leftPos = leftBreath.geometry.attributes.position;
  for (let i = 0; i < leftPos.count; i++) {
    const x = leftPos.getX(i);
    const y = leftPos.getY(i);
    const w = wave(x, t * 0.8, 0.6, 0.35) * (1 - Math.abs(y) / 0.8);
    leftPos.setZ(i, w);
  }
  leftPos.needsUpdate = true;

  const rightPos = rightBreath.geometry.attributes.position;
  for (let i = 0; i < rightPos.count; i++) {
    const x = rightPos.getX(i);
    const y = rightPos.getY(i);
    const w = wave(x, t * 0.8 + Math.PI, 0.6, 0.35) * (1 - Math.abs(y) / 0.8);
    rightPos.setZ(i, w);
  }
  rightPos.needsUpdate = true;

  // Camera parallax + scroll depth
  const targetX = mouse.x * 0.5;
  const targetY = mouse.y * 0.35;
  const targetZ = 13 - scrollProgress * 2.5;

  camera.position.x += (targetX - camera.position.x) * 0.04;
  camera.position.y += (2.4 + targetY - camera.position.y) * 0.04;
  camera.position.z += (targetZ - camera.position.z) * 0.05;

  // Spine rises slightly with scroll
  spineGroup.position.y = 0.4 + scrollProgress * 0.7;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// === WHATSAPP INTEGRATION ===
// Format: https://wa.me/whatsappphonenumber?text=urlencodedtext[web:177][web:179][web:189]
const WHATSAPP_NUMBER = "919415043595";
const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

function openWhatsAppWithMessage(message) {
  const url = `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

// Hero "Chat on WhatsApp" button
const heroWhatsAppBtn = document.getElementById("whatsapp-hero");
if (heroWhatsAppBtn) {
  heroWhatsAppBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const msg =
      "Namaste, I would like to book a chiropractic yoga session at RK Fusion Chiropractic Yog Centre.";
    openWhatsAppWithMessage(msg);
  });
}

// Contact section "Chat now" link
const contactWhatsAppLink = document.getElementById("whatsapp-contact-link");
if (contactWhatsAppLink) {
  contactWhatsAppLink.addEventListener("click", (e) => {
    e.preventDefault();
    const msg =
      "Namaste, I would like to know available slots and pricing at RK Fusion Chiropractic Yog Centre.";
    openWhatsAppWithMessage(msg);
  });
}

// Contact form -> WhatsApp message
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim() || "";
    const phone = document.getElementById("phone")?.value.trim() || "";
    const concern = document.getElementById("message")?.value.trim() || "";

    const msgLines = [
      "Namaste, I would like support from RK Fusion Chiropractic Yog Centre.",
      name ? `Name: ${name}` : "Name: (not provided)",
      phone ? `Phone: ${phone}` : "Phone: (not provided)",
      concern ? `Concern: ${concern}` : "Concern: (not provided)"
    ];

    openWhatsAppWithMessage(msgLines.join("\n"));
  });
}
