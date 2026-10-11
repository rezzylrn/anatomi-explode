import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { GLTFLoader } from 'three/addons/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/DRACOLoader.js';

/* ==========================================================================
   ANATOMI v2 — Human Atlas 3D (Core Application)
   ========================================================================== */

// 1. Konfigurasi 13 Sistem Organ & Konvensi Warna Medis
const SYSTEMS_CONFIG = [
  {
    id: 'skeleton',
    nameId: 'Sistem Rangka',
    nameEn: 'Skeleton',
    color: '#e4dccb', // Ivory / Bone White
    defaultOn: true,
    desc: 'Kerangka tubuh penopang postur, pelindung organ vital, dan tuas mekanis pergerakan.'
  },
  {
    id: 'muscles',
    nameId: 'Sistem Otot',
    nameEn: 'Muscles',
    color: '#9e3a30', // Deep Maroon / Red Muscle
    defaultOn: true,
    desc: 'Jaringan kontraktil yang menghasilkan gaya gerak, stabilitas sendi, dan produksi panas.'
  },
  {
    id: 'skin',
    nameId: 'Kulit & Integumen',
    nameEn: 'Integumentary',
    color: '#f5d0b5', // Translucent Peach Flesh
    defaultOn: true,
    isSkin: true,
    desc: 'Barier pelindung eksternal tubuh dari patogen, regulasi suhu, dan reseptor sensorik.'
  },
  {
    id: 'heart',
    nameId: 'Jantung',
    nameEn: 'Heart',
    color: '#be123c', // Crimson Heart Muscle
    defaultOn: false,
    desc: 'Organ pompa muskular utama sirkulasi kardiovaskular dalam rongga mediastinum.'
  },
  {
    id: 'arteries',
    nameId: 'Sistem Arteri',
    nameEn: 'Arteries',
    color: '#dc2626', // Oxygenated Bright Red
    defaultOn: false,
    desc: 'Pembuluh elastis bertekanan tinggi penyalur darah kaya oksigen dari jantung ke jaringan perifer.'
  },
  {
    id: 'veins',
    nameId: 'Sistem Vena',
    nameEn: 'Veins',
    color: '#2563eb', // Deoxygenated Deep Blue
    defaultOn: false,
    desc: 'Pembuluh kapasitans pengalir darah balik terdeoksigenasi dari jaringan tubuh ke atrium jantung.'
  },
  {
    id: 'nervous_system',
    nameId: 'Sistem Saraf',
    nameEn: 'Nervous System',
    color: '#eab308', // Neural Yellow
    defaultOn: false,
    desc: 'Jaringan koordinasi sinyal bioelektrik pusat dan perifer pengatur homeostasis dan persepsi sensorik.'
  },
  {
    id: 'respiratory',
    nameId: 'Sistem Pernapasan',
    nameEn: 'Respiratory',
    color: '#06b6d4', // Aerated Cyan / Sky Blue
    defaultOn: false,
    desc: 'Aparatus ventilasi saluran napas dan pertukaran gas hematosis oksigen-karbondioksida.'
  },
  {
    id: 'digestive',
    nameId: 'Sistem Pencernaan',
    nameEn: 'Digestive',
    color: '#d97706', // Enteric Ochre / Amber
    defaultOn: false,
    desc: 'Saluran gastrointestinal pemroses nutrien makanan, penyerapan sari pati, dan eliminasi sisa.'
  },
  {
    id: 'urinary',
    nameId: 'Sistem Perkemihan',
    nameEn: 'Urinary',
    color: '#ca8a04', // Renal Gold / Amber
    defaultOn: false,
    desc: 'Organ filtrasi plasma darah, pemelihara kesetimbangan cairan-elektrolit, dan ekskresi urin.'
  },
  {
    id: 'sensory_organs',
    nameId: 'Organ Sensorik',
    nameEn: 'Sensory Organs',
    color: '#8b5cf6', // Sensory Violet
    defaultOn: false,
    desc: 'Reseptor spesifik pengindera penglihatan, pendengaran, dan keseimbangan posisi spasial tubuh.'
  },
  {
    id: 'reproductive',
    nameId: 'Sistem Reproduksi',
    nameEn: 'Reproductive',
    color: '#db2777', // Reproductive Magenta
    defaultOn: false,
    desc: 'Organ gonad dan saluran penghasil gamet serta regulator hormon reproduksi.'
  },
  {
    id: 'lainnya',
    nameId: 'Endokrin & Limfatik',
    nameEn: 'Other Organs',
    color: '#10b981', // Glandular Green
    defaultOn: false,
    desc: 'Kelenjar endokrin pensekresi hormon dan jaringan limfatik pertahanan imunologis tubuh.'
  }
];

// 2. Pemetaan Manual Struktur Utama (Inggris -> ID Kamus anatomy.json)
const MANUAL_MAPPING = {
  // Kardiovaskular / Jantung & Vaskular
  'Wall_of_left_atrium': 'jantung-atrium-kiri',
  'Cavity_of_left_atrium': 'jantung-atrium-kiri',
  'Wall_of_right_atrium': 'jantung-atrium-kanan',
  'Cavity_of_right_atrium': 'jantung-atrium-kanan',
  'Cavity_of_left_ventricle': 'jantung-ventrikel-kiri',
  'Wall_of_ventricle': 'jantung-ventrikel-kiri',
  'Cavity_of_right_ventricle': 'jantung-ventrikel-kanan',
  'Abdominal_aorta': 'aorta',
  'Arch_of_aorta': 'aorta',
  'Ascending_aorta': 'aorta',
  'Superior_vena_cava': 'vena-kava-superior',
  'Inferior_vena_cava': 'vena-kava-inferior',
  'Right_internal_jugular_vein': 'vena-jugularis-kanan',
  'Left_internal_jugular_vein': 'vena-jugularis-kiri',
  'Right_common_carotid_artery': 'arteri-karotis-kanan',
  'Left_common_carotid_artery': 'arteri-karotis-kiri',
  'Right_brachial_artery': 'arteri-brakialis-kanan',
  'Left_brachial_artery': 'arteri-brakialis-kiri',
  'Right_femoral_artery': 'arteri-femoralis-kanan',
  'Left_femoral_artery': 'arteri-femoralis-kiri',

  // Pencernaan
  'Stomach': 'lambung',
  'Caudate_lobe_of_liver': 'hati',
  'Hepatovenous_segment_II': 'hati',
  'Hepatovenous_segment_III': 'hati',
  'Hepatovenous_segment_IV': 'hati',
  'Gallbladder': 'kantong-empedu',
  'Pancreas': 'pankreas',
  'Parenchyma_of_pancreas': 'pankreas',
  'Appendix': 'apendiks',
  'Rectum': 'rektum',
  'Duodenum': 'usus-halus',
  'Distal_part_of_ileum': 'usus-halus',
  'Middle_part_of_ileum': 'usus-halus',
  'Proximal_part_of_ileum': 'usus-halus',
  'Distal_part_of_jejunum': 'usus-halus',
  'Middle_part_of_jejunum': 'usus-halus',
  'Proximal_part_of_jejunum': 'usus-halus',
  'Ascending_colon': 'usus-besar',
  'Descending_colon': 'usus-besar',
  'Transverse_colon': 'usus-besar',
  'Esophagus': 'esofagus',
  'Tongue': 'mulut',

  // Perkemihan
  'Right_kidney': 'ginjal-kanan',
  'Left_kidney': 'ginjal-kiri',
  'Right_ureter': 'ureter-kanan',
  'Left_ureter': 'ureter-kiri',
  'Urinary_bladder': 'kandung-kemih',
  'Urethra': 'uretra',

  // Pernapasan
  'Trachea': 'trakea',
  'Diaphragm': 'diafragma',
  'Left_main_bronchus': 'bronkus-kiri',
  'Right_main_bronchus_proper': 'bronkus-kanan',
  'Thyroid_cartilage': 'laring',
  'Cricoid_cartilage': 'laring',
  'Epiglottis': 'faring',

  // Rangka
  'Right_femur': 'femur-kanan',
  'Left_femur': 'femur-kiri',
  'Right_tibia': 'tibia-kanan',
  'Left_tibia': 'tibia-kiri',
  'Right_fibula': 'fibula-kanan',
  'Left_fibula': 'fibula-kiri',
  'Right_patella': 'patela-kanan',
  'Left_patella': 'patela-kiri',
  'Right_humerus': 'humerus-kanan',
  'Left_humerus': 'humerus-kiri',
  'Right_radius': 'radius-kanan',
  'Left_radius': 'radius-kiri',
  'Right_ulna': 'ulna-kanan',
  'Left_ulna': 'ulna-kiri',
  'Right_clavicle': 'klavikula-kanan',
  'Left_clavicle': 'klavikula-kiri',
  'Right_scapula': 'skapula-kanan',
  'Left_scapula': 'skapula-kiri',
  'Body_of_sternum': 'sternum',
  'Manubrium': 'sternum',
  'Mandible': 'mandibula',
  'Atlas': 'vertebra-servikal',
  'Axis': 'vertebra-servikal',
  'Sacrum': 'pelvis',

  // Otot
  'Abdominal_part_of_right_pectoralis_major': 'pectoralis-major-kanan',
  'Abdominal_part_of_left_pectoralis_major': 'pectoralis-major-kiri',
  'Right_biceps_brachii': 'biceps-brachii-kanan',
  'Left_biceps_brachii': 'biceps-brachii-kiri',
  'Trapezius': 'trapezius-kanan',
  'Deltoid': 'deltoid-kanan',

  // Saraf
  'Cerebellum': 'serebelum',
  'Cerebellum_2': 'serebelum',
  'Central_canal_of_spinal_cord': 'medula-spinalis',
  'Right_optic_nerve': 'saraf-optik-kanan',
  'Left_optic_nerve': 'saraf-optik-kiri',

  // Reproduksi & Lainnya
  'Right_testis': 'testis-kanan',
  'Left_testis': 'testis-kiri',
  'Prostate': 'prostat',
  'Glans_penis': 'penis',
  'Spleen': 'limpa',
  'Right_adrenal_gland': 'adrenal-kanan',
  'Left_adrenal_gland': 'adrenal-kiri',
  'Right_lobe_of_thymus': 'timus',
  'Left_lobe_of_thymus': 'timus',

  // Kulit
  'Skin': 'epidermis'
};

// 3. Pool Soal Kuis Terverifikasi (10 Soal Acak per Ronde)
const QUIZ_QUESTION_POOL = [
  { targetName: 'Jantung (Serambi Kiri)', systemId: 'heart', meshNames: ['Wall_of_left_atrium', 'Cavity_of_left_atrium'] },
  { targetName: 'Jantung (Bilik Kiri)', systemId: 'heart', meshNames: ['Wall_of_ventricle', 'Cavity_of_left_ventricle'] },
  { targetName: 'Jantung (Serambi Kanan)', systemId: 'heart', meshNames: ['Wall_of_right_atrium', 'Cavity_of_right_atrium'] },
  { targetName: 'Hati', systemId: 'digestive', meshNames: ['Caudate_lobe_of_liver', 'Hepatovenous_segment_II', 'Hepatovenous_segment_III'] },
  { targetName: 'Lambung', systemId: 'digestive', meshNames: ['Stomach'] },
  { targetName: 'Kantong Empedu', systemId: 'digestive', meshNames: ['Gallbladder'] },
  { targetName: 'Pankreas', systemId: 'digestive', meshNames: ['Pancreas', 'Parenchyma_of_pancreas'] },
  { targetName: 'Umbai Cacing (Apendiks)', systemId: 'digestive', meshNames: ['Appendix'] },
  { targetName: 'Ginjal Kanan', systemId: 'urinary', meshNames: ['Right_kidney'] },
  { targetName: 'Ginjal Kiri', systemId: 'urinary', meshNames: ['Left_kidney'] },
  { targetName: 'Kandung Kemih', systemId: 'urinary', meshNames: ['Urinary_bladder'] },
  { targetName: 'Trakea', systemId: 'respiratory', meshNames: ['Trachea'] },
  { targetName: 'Diafragma', systemId: 'respiratory', meshNames: ['Diaphragm'] },
  { targetName: 'Tulang Paha Kanan (Femur)', systemId: 'skeleton', meshNames: ['Right_femur'] },
  { targetName: 'Tulang Paha Kiri (Femur)', systemId: 'skeleton', meshNames: ['Left_femur'] },
  { targetName: 'Tulang Kering Kanan (Tibia)', systemId: 'skeleton', meshNames: ['Right_tibia'] },
  { targetName: 'Tulang Lengan Atas Kanan (Humerus)', systemId: 'skeleton', meshNames: ['Right_humerus'] },
  { targetName: 'Tulang Pengumpil Kanan (Radius)', systemId: 'skeleton', meshNames: ['Right_radius'] },
  { targetName: 'Tulang Selangka Kanan (Klavikula)', systemId: 'skeleton', meshNames: ['Right_clavicle'] },
  { targetName: 'Tulang Belikat Kanan (Skapula)', systemId: 'skeleton', meshNames: ['Right_scapula'] },
  { targetName: 'Tulang Dada (Sternum)', systemId: 'skeleton', meshNames: ['Body_of_sternum', 'Manubrium'] },
  { targetName: 'Rahang Bawah (Mandibula)', systemId: 'skeleton', meshNames: ['Mandible'] },
  { targetName: 'Tempurung Lutut Kanan (Patela)', systemId: 'skeleton', meshNames: ['Right_patella'] },
  { targetName: 'Otak Kecil (Serebelum)', systemId: 'nervous_system', meshNames: ['Cerebellum', 'Cerebellum_2'] },
  { targetName: 'Saraf Optik Kanan', systemId: 'nervous_system', meshNames: ['Right_optic_nerve', 'Right_optic_nerve_2'] },
  { targetName: 'Sumsum Tulang Belakang', systemId: 'nervous_system', meshNames: ['Central_canal_of_spinal_cord'] },
  { targetName: 'Kelenjar Prostat', systemId: 'reproductive', meshNames: ['Prostate'] },
  { targetName: 'Testis Kanan', systemId: 'reproductive', meshNames: ['Right_testis'] },
  { targetName: 'Limpa', systemId: 'lainnya', meshNames: ['Spleen'] },
  { targetName: 'Kelenjar Adrenal Kanan', systemId: 'lainnya', meshNames: ['Right_adrenal_gland'] }
];

/* ==========================================================================
   State & Variabel Global
   ========================================================================== */

let scene, camera, renderer, controls;
let gltfLoader, dracoLoader;
let manifestData = {};
let anatomyDictionary = [];
let anatomyMapById = new Map();

// Map sistem terload: systemId -> { group, meshes, loaded, visible, meshCount }
const loadedSystems = new Map();

// Explode (grid layout) animation state
let currentExplodeT = 0;
let targetExplodeT = 0;
let gridResizeTimer = null; // debounce resize -> computeGridLayout
let gridFit = null;

// Raycaster & Interaksi
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDownPos = { x: 0, y: 0 };
let selectedMesh = null;
let originalMaterialMap = new WeakMap();

// Search state
let searchIndex = [];

// Quiz state
let quizState = {
  active: false,
  questions: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  maxStreak: 0,
  isAnswering: false
};

// Kamera Animasi State
let cameraLerpTarget = null;
let controlsLerpTarget = null;
let lerpProgress = 1;

// Default Kamera State (Tampak Depan Figur Full Body)
const DEFAULT_CAM_POS = new THREE.Vector3(0, 0.82, -2.70);
const DEFAULT_CAM_TARGET = new THREE.Vector3(0, 0.82, 0.10);

/* ==========================================================================
   Inisialisasi Aplikasi Utama
   ========================================================================== */

async function init() {
  const canvas = document.getElementById('webgl-canvas');
  const container = document.getElementById('viewport-container');

  // 1. Inisialisasi Three.js Scene & Renderer
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf1f5f9);

  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.05, 50);
  camera.position.copy(DEFAULT_CAM_POS);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  // 2. OrbitControls (Rotate Kiri, Pan Kanan, Zoom Scroll)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(DEFAULT_CAM_TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.screenSpacePanning = true;
  controls.minDistance = 0.2;
  controls.maxDistance = 6.0;
  controls.maxPolarAngle = Math.PI - 0.05;
  controls.minPolarAngle = 0.05;
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
  };

  // 3. Pencahayaan Medis Bersih & Terang
  setupLighting();

  // 4. Inisialisasi Loader dengan Kompresi Draco
  dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./vendor/draco/');
  dracoLoader.preload();

  gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  // 5. Muat Data Manifest & Kamus Anatomi
  await loadMetadata();

  // 6. Siapkan UI Panel Kiri & Interaksi
  renderSystemsPanel();
  setupUIEventListeners();
  buildSearchIndex();

  // 7. Mulai Render Loop
  requestAnimationFrame(renderLoop);

  // 8. Muat Sistem Default (skeleton, muscles, skin) Berurutan saat Startup
  await loadDefaultSystemsSequential();
}

/* ==========================================================================
   Pencahayaan (Medical Studio Lighting)
   ========================================================================== */

function setupLighting() {
  // Ambient & Hemisphere Light untuk kecerahan merata tanpa bayangan mati
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcfd8dc, 0.90);
  scene.add(hemiLight);

  // Directional Light Utama (depan-kanan-atas)
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.15);
  dirLight1.position.set(4, 9, 6);
  scene.add(dirLight1);

  // Rim Light (belakang-kiri-atas) untuk kontur organ yang tegas
  const dirLight2 = new THREE.DirectionalLight(0xe2e8f0, 0.65);
  dirLight2.position.set(-5, 5, -5);
  scene.add(dirLight2);

  // Fill Light Lembut dari bawah-depan
  const dirLight3 = new THREE.DirectionalLight(0xf8fafc, 0.40);
  dirLight3.position.set(0, -4, 4);
  scene.add(dirLight3);
}

/* ==========================================================================
   Memuat Metadata (manifest.json & anatomy.json)
   ========================================================================== */

async function loadMetadata() {
  try {
    const [manifestRes, anatRes] = await Promise.all([
      fetch('./models/manifest.json'),
      fetch('./data/anatomy.json')
    ]);

    manifestData = await manifestRes.json();
    anatomyDictionary = await anatRes.json();

    // Map by ID
    for (const item of anatomyDictionary) {
      if (item.id) {
        anatomyMapById.set(item.id, item);
      }
    }
  } catch (err) {
    console.error('Gagal memuat manifest atau data kamus:', err);
  }
}

/* ==========================================================================
   Lazy-Load GLB Sistem Anatomi
   ========================================================================== */

async function loadSystem(systemId) {
  if (loadedSystems.has(systemId)) {
    const sysData = loadedSystems.get(systemId);
    if (!sysData.visible) {
      sysData.visible = true;
      sysData.group.visible = true;
      updateSystemUIStatus(systemId, 'active');
      updateStatsDisplay();
      computeGridLayout();
      if (currentExplodeT > 0) applyExplodeToMeshes(getAllLoadedVisibleMeshes(), currentExplodeT);
    }
    return sysData;
  }

  const sysConfig = SYSTEMS_CONFIG.find(s => s.id === systemId);
  const manifestEntry = manifestData[systemId];
  if (!sysConfig || !manifestEntry) {
    console.warn(`Sistem tidak ditemukan: ${systemId}`);
    return null;
  }

  // Update status UI sedang memuat
  updateSystemUIStatus(systemId, 'loading');

  const glbUrl = `./models/${manifestEntry.file}`;

  try {
    const gltf = await new Promise((resolve, reject) => {
      gltfLoader.load(glbUrl, resolve, undefined, reject);
    });

    const group = gltf.scene;
    group.name = `system_${systemId}`;
    const meshes = [];

    // Siapkan material PBR medis untuk sistem ini
    const isSkin = !!sysConfig.isSkin;
    const materialColor = new THREE.Color(sysConfig.color);

    // Iterasi seluruh mesh di dalam glTF
    group.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = false;
        node.receiveShadow = false;

        // Bikin material PBR baru dengan warna sistem
        const mat = new THREE.MeshStandardMaterial({
          color: materialColor,
          roughness: isSkin ? 0.85 : 0.55,
          metalness: isSkin ? 0.0 : 0.05,
          transparent: isSkin,
          opacity: isSkin ? 0.32 : 1.0,
          depthWrite: !isSkin
        });

        node.material = mat;
        originalMaterialMap.set(node, mat);

        // Hitung centroid geometri (world space)
        if (!node.geometry.boundingBox) {
          node.geometry.computeBoundingBox();
        }
        const center = new THREE.Vector3();
        node.geometry.boundingBox.getCenter(center);
        node.localToWorld(center);

        // Setengah diagonal boundingBox (meter) — dipakai ukur sel grid
        if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
        const size = new THREE.Vector3();
        node.geometry.boundingBox.getSize(size);
        size.multiply(node.scale);
        const gridRadius = 0.5 * size.length();

        // Simpan data penataan grid dan identitas di userData
        node.userData.systemId = systemId;
        node.userData.meshName = node.name;
        node.userData.basePos = node.position.clone();
        node.userData.centroid = center.clone();
        node.userData.gridRadius = gridRadius;

        meshes.push(node);
      }
    });

    scene.add(group);

    const sysRecord = {
      id: systemId,
      config: sysConfig,
      group: group,
      meshes: meshes,
      loaded: true,
      visible: true,
      meshCount: meshes.length
    };

    loadedSystems.set(systemId, sysRecord);
    updateSystemUIStatus(systemId, 'active');
    updateStatsDisplay();

    // Sistem baru selesai di-load: hitung ulang layout grid,
    // lalu terapkan posisi jika slider explode sedang tidak di 0
    computeGridLayout();
    if (currentExplodeT > 0) {
      applyExplodeToMeshes(getAllLoadedVisibleMeshes(), currentExplodeT);
    }

    return sysRecord;
  } catch (error) {
    console.error(`Gagal memuat GLB ${systemId}:`, error);
    updateSystemUIStatus(systemId, 'unloaded');
    return null;
  }
}

function setSystemVisibility(systemId, visible) {
  const sysRecord = loadedSystems.get(systemId);
  if (!sysRecord) {
    if (visible) {
      loadSystem(systemId);
    }
    return;
  }

  sysRecord.visible = visible;
  sysRecord.group.visible = visible;
  updateSystemUIStatus(systemId, visible ? 'active' : 'hidden');
  updateStatsDisplay();

  // Jika mesh yang dipilih disembunyikan, deselect
  if (!visible && selectedMesh && selectedMesh.userData.systemId === systemId) {
    deselectMesh();
  }

  // Susun ulang grid karena himpunan mesh terlihat berubah
  computeGridLayout();
  if (currentExplodeT > 0) {
    applyExplodeToMeshes(getAllLoadedVisibleMeshes(), currentExplodeT);
  }
}

// Kumpulkan semua mesh dari sistem yang loaded DAN visible
function getAllLoadedVisibleMeshes() {
  const out = [];
  for (const [, sys] of loadedSystems) {
    if (sys.loaded && sys.visible) {
      for (let i = 0; i < sys.meshes.length; i++) out.push(sys.meshes[i]);
    }
  }
  return out;
}

// Urut mesh per sistem, lalu antar sistem sesuai urutan panel (SYSTEMS_CONFIG);
// dalam tiap sistem urut by centroid.y DESC (kepala ke kaki)
function getAllLoadedVisibleMeshesInPanelOrder() {
  const out = [];
  for (const sysConfig of SYSTEMS_CONFIG) {
    const sys = loadedSystems.get(sysConfig.id);
    if (sys && sys.loaded && sys.visible) {
      const ms = sys.meshes.slice().sort((a, b) => b.userData.centroid.y - a.userData.centroid.y);
      for (const m of ms) out.push(m);
    }
  }
  return out;
}

/* ==========================================================================
   Grid Layout (pengganti explode radial)
   ========================================================================== */

function computeGridLayout() {
  // 1. Sistem yang loaded & visible, urut sesuai SYSTEMS_CONFIG (urutan panel)
  const systems = [];
  for (const sysConfig of SYSTEMS_CONFIG) {
    const sysRecord = loadedSystems.get(sysConfig.id);
    if (sysRecord && sysRecord.loaded && sysRecord.visible) {
      systems.push(sysRecord);
    }
  }

  // 2. Dalam tiap sistem, urut mesh by centroid.y DESC (kepala ke kaki)
  const orderedMeshes = getAllLoadedVisibleMeshesInPanelOrder();
  if (orderedMeshes.length === 0) {
    gridFit = null;
    return;
  }

  // 3. Cell size dari persentil-95 diameter (2*gridRadius), clamp [0.03, 0.15]
  const diameters = orderedMeshes.map(m => 2 * (m.userData.gridRadius || 0.05));
  diameters.sort((a, b) => a - b);
  const idx = Math.min(diameters.length - 1, Math.max(0, Math.floor(0.95 * (diameters.length - 1))));
  let cellSize = diameters[idx];
  cellSize = Math.max(0.03, Math.min(0.15, cellSize));

  // 4. Grid columns berdasarkan aspect, center di origin pada bidang Z=0
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  const n = orderedMeshes.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(n * aspect)));
  const rows = Math.ceil(n / cols);

  const gapY = 0.7 * cellSize; // baris kosong visual antar sistem
  const gridW = cols * cellSize;
  const gridH = rows * cellSize + (systems.length - 1) * gapY;
  gridFit = { w: gridW, h: gridH };

  // Posisi pusat sel untuk tiap mesh, lalu gridPos = basePos + (cellCenter - centroid)
  let cursor = 0;
  for (let si = 0; si < systems.length; si++) {
    const ms = systems[si].meshes.slice().sort((a, b) => b.userData.centroid.y - a.userData.centroid.y);
    for (const m of ms) {
      const col = cursor % cols;
      const row = Math.floor(cursor / cols);

      const cellCenterX = (col + 0.5) * cellSize - gridW / 2;
      const cellCenterY = gridH / 2 - (row + 0.5) * cellSize - gapY * si;
      const offsetZ = si * 0.002;

      m.userData.basePos = m.userData.basePos || m.position.clone();
      m.userData.gridCell = { cx: cellCenterX, cy: cellCenterY };
      m.userData.gridPos = new THREE.Vector3(
        m.userData.basePos.x + (cellCenterX - m.userData.centroid.x),
        m.userData.basePos.y + (cellCenterY - m.userData.centroid.y),
        m.userData.basePos.z + (offsetZ - m.userData.centroid.z)
      );
      cursor++;
    }
  }
}

/* ==========================================================================
   Startup Sequence: Muat skeleton, muscles, skin Berurutan
   ========================================================================== */

async function loadDefaultSystemsSequential() {
  const loaderOverlay = document.getElementById('startup-loader');
  const loaderStatus = document.getElementById('loader-status');
  const loaderProgress = document.getElementById('loader-progress-bar');
  const loaderCounter = document.getElementById('loader-counter');

  const defaultSystems = ['skeleton', 'muscles', 'skin'];
  const total = defaultSystems.length;

  for (let i = 0; i < total; i++) {
    const sysId = defaultSystems[i];
    const sysConfig = SYSTEMS_CONFIG.find(s => s.id === sysId);
    const stepNum = i + 1;

    loaderStatus.textContent = `Memuat ${sysConfig ? sysConfig.nameId : sysId} (${stepNum}/${total})...`;
    const pct = Math.round((i / total) * 100);
    loaderProgress.style.width = `${pct}%`;
    loaderCounter.textContent = `${pct}%`;

    await loadSystem(sysId);
  }

  // 100% Selesai
  loaderProgress.style.width = '100%';
  loaderCounter.textContent = '100%';
  loaderStatus.textContent = 'Menyiapkan penampil 3D...';

  setTimeout(() => {
    loaderOverlay.style.opacity = '0';
    loaderOverlay.style.pointerEvents = 'none';
    setTimeout(() => {
      loaderOverlay.style.display = 'none';
    }, 320);
  }, 200);
}

/* ==========================================================================
   Explode Slider & Grid Math
   ========================================================================== */

function setExplodeTarget(valuePercent) {
  targetExplodeT = Math.max(0, Math.min(100, Number(valuePercent)));
  const badge = document.getElementById('explode-value');
  const slider = document.getElementById('explode-slider');
  badge.textContent = `${Math.round(targetExplodeT)}%`;
  slider.value = Math.round(targetExplodeT);

  // Update status preset button
  const btnAssembled = document.getElementById('btn-preset-assembled');
  const btnExploded = document.getElementById('btn-preset-exploded');
  btnAssembled.classList.toggle('active', targetExplodeT === 0);
  btnExploded.classList.toggle('active', targetExplodeT === 100);
}

function applyExplodeToMeshes(meshList, tValue) {
  const t = tValue / 100;
  for (let i = 0; i < meshList.length; i++) {
    const m = meshList[i];
    if (!m.userData.basePos || !m.userData.gridPos) continue; // gridPos belum ada = skip (akan dihitung di computeGridLayout)
    m.position.lerpVectors(m.userData.basePos, m.userData.gridPos, t);
  }
}

function desiredCameraDistance() {
  const t = currentExplodeT / 100;
  const dist0 = DEFAULT_CAM_POS.distanceTo(DEFAULT_CAM_TARGET);
  if (!gridFit || t <= 0) return dist0;

  const fovRad = THREE.MathUtils.degToRad(camera.fov / 2);
  const tanFovHalf = Math.tan(fovRad);
  const vFit = (gridFit.h / 2) / tanFovHalf;
  const hFit = (gridFit.w / 2) / (tanFovHalf * camera.aspect);
  const distGrid = Math.max(vFit, hFit) * 1.12;
  return dist0 + (distGrid - dist0) * t;
}

/* ==========================================================================
   Pencocokan Nama Medis & Kamus anatomy.json
   ========================================================================== */

function resolveStructureInfo(meshName, systemId) {
  // 1. Cek pemetaan manual kamus
  if (MANUAL_MAPPING[meshName]) {
    const anatId = MANUAL_MAPPING[meshName];
    const item = anatomyMapById.get(anatId);
    if (item) {
      return {
        nameId: item.nama_id,
        nameLatin: item.nama_latin || '-',
        nameEn: meshName,
        systemId: systemId,
        desc: item.deskripsi,
        fact: item.fakta || null,
        dictId: item.id
      };
    }
  }

  // 2. Normalisasi string
  const clean = meshName.replace(/_\d+$/, '').replace(/_/g, ' ').toLowerCase();

  // Coba cari langsung ke kamus
  for (const item of anatomyDictionary) {
    const nid = (item.nama_id || '').toLowerCase();
    const nlat = (item.nama_latin || '').toLowerCase();
    const idKey = (item.id || '').replace(/-/g, ' ').toLowerCase();

    if (nid === clean || nlat === clean || idKey === clean) {
      return {
        nameId: item.nama_id,
        nameLatin: item.nama_latin || '-',
        nameEn: meshName,
        systemId: systemId,
        desc: item.deskripsi,
        fact: item.fakta || null,
        dictId: item.id
      };
    }
  }

  // 3. Terjemahan Frasa Dasar Bahasa Indonesia yang Rapi
  let translated = meshName.replace(/_\d+$/, '').replace(/_/g, ' ');

  // Prefix & Suffix Translasi Anatomi
  translated = translated
    .replace(/\bRight\b/g, 'Kanan')
    .replace(/\bLeft\b/g, 'Kiri')
    .replace(/\bSuperior\b/g, 'Atas (Superior)')
    .replace(/\bInferior\b/g, 'Bawah (Inferior)')
    .replace(/\bAnterior\b/g, 'Depan (Anterior)')
    .replace(/\bPosterior\b/g, 'Belakang (Posterior)')
    .replace(/\bLateral\b/g, 'Samping (Lateral)')
    .replace(/\bMedial\b/g, 'Tengah (Medial)')
    .replace(/\bArtery\b/g, 'Arteri')
    .replace(/\bVein\b/g, 'Vena')
    .replace(/\bNerve\b/g, 'Saraf')
    .replace(/\bMuscle\b/g, 'Otot')
    .replace(/\bBone\b/g, 'Tulang');

  const sysConfig = SYSTEMS_CONFIG.find(s => s.id === systemId);
  const genericDesc = sysConfig ? sysConfig.desc : 'Bagian struktural dari anatomi tubuh manusia.';

  return {
    nameId: translated,
    nameLatin: meshName.replace(/_/g, ' '),
    nameEn: meshName,
    systemId: systemId,
    desc: genericDesc,
    fact: null,
    dictId: '-'
  };
}

/* ==========================================================================
   Raycaster & Seleksi Mesh
   ========================================================================== */

function getVisibleMeshes() {
  const visible = [];
  for (const [, sys] of loadedSystems) {
    if (sys.visible) {
      for (let i = 0; i < sys.meshes.length; i++) {
        visible.push(sys.meshes[i]);
      }
    }
  }
  return visible;
}

function handlePointerClick(event) {
  const container = document.getElementById('viewport-container');
  const rect = container.getBoundingClientRect();

  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const visibleMeshes = getVisibleMeshes();
  const intersects = raycaster.intersectObjects(visibleMeshes, false);

  if (intersects.length === 0) {
    if (!quizState.active) {
      deselectMesh();
    }
    return;
  }

  // Filter pintar: jika mengenai skin transparan, cari apakah ada organ dalam di belakangnya
  let hitObject = intersects[0].object;
  if (hitObject.userData.systemId === 'skin' && intersects.length > 1) {
    const nonSkinHit = intersects.find(hit => hit.object.userData.systemId !== 'skin');
    if (nonSkinHit) {
      hitObject = nonSkinHit.object;
    }
  }

  if (quizState.active) {
    evaluateQuizAnswer(hitObject);
  } else {
    selectMesh(hitObject);
  }
}

function selectMesh(mesh) {
  if (selectedMesh === mesh) return;

  // Kembalikan mesh sebelumnya
  deselectMesh();

  selectedMesh = mesh;

  // Highlight emissive teal pada mesh yang aktif
  if (mesh.material && mesh.material.emissive) {
    mesh.material.emissive.setHex(0x0d9488);
    mesh.material.emissiveIntensity = 0.55;
  }

  // Tampilkan panel informasi kanan
  displayStructureDetails(mesh);
}

function deselectMesh() {
  if (selectedMesh) {
    if (selectedMesh.material && selectedMesh.material.emissive) {
      selectedMesh.material.emissive.setHex(0x000000);
      selectedMesh.material.emissiveIntensity = 0.0;
    }
    selectedMesh = null;
  }
  hideStructureDetails();
}

/* ==========================================================================
   Panel Kanan: Tampilkan Detail Struktur Anatomi
   ========================================================================== */

function displayStructureDetails(mesh) {
  const infoEmpty = document.getElementById('info-empty');
  const infoContent = document.getElementById('info-content');
  const infoBadge = document.getElementById('info-system-badge');
  const infoNameId = document.getElementById('info-name-id');
  const infoNameLatin = document.getElementById('info-name-latin');
  const infoNameEn = document.getElementById('info-name-en');
  const infoDesc = document.getElementById('info-desc');
  const infoFactCard = document.getElementById('info-fact-container');
  const infoFact = document.getElementById('info-fact');
  const infoMetaId = document.getElementById('info-meta-id');
  const infoMetaPos = document.getElementById('info-meta-pos');

  const sysId = mesh.userData.systemId;
  const meshName = mesh.userData.meshName;
  const sysConfig = SYSTEMS_CONFIG.find(s => s.id === sysId);

  const info = resolveStructureInfo(meshName, sysId);

  infoBadge.textContent = sysConfig ? sysConfig.nameId : sysId;
  infoBadge.style.color = sysConfig ? sysConfig.color : '#0d9488';
  infoNameId.textContent = info.nameId;
  infoNameLatin.textContent = info.nameLatin !== '-' ? info.nameLatin : '';
  infoNameEn.textContent = info.nameEn;
  infoDesc.textContent = info.desc;

  if (info.fact) {
    infoFact.textContent = info.fact;
    infoFactCard.style.display = 'block';
  } else {
    infoFactCard.style.display = 'none';
  }

  infoMetaId.textContent = info.dictId !== '-' ? info.dictId : 'BP3D 4.0';

  if (mesh.userData.centroid) {
    const c = mesh.userData.centroid;
    infoMetaPos.textContent = `(${c.x.toFixed(2)}, ${c.y.toFixed(2)}, ${c.z.toFixed(2)})`;
  } else {
    infoMetaPos.textContent = '-';
  }

  infoEmpty.style.display = 'none';
  infoContent.style.display = 'flex';
}

function hideStructureDetails() {
  const infoEmpty = document.getElementById('info-empty');
  const infoContent = document.getElementById('info-content');
  infoEmpty.style.display = 'flex';
  infoContent.style.display = 'none';
}

/* ==========================================================================
   Kamera Fokus (Smooth Lerp ke Centroid Mesh)
   ========================================================================== */

function focusOnMesh(mesh) {
  if (!mesh) return;

  if (!mesh.geometry.boundingSphere) {
    mesh.geometry.computeBoundingSphere();
  }

  const worldCentroid = new THREE.Vector3();
  mesh.getWorldPosition(worldCentroid);
  if (mesh.userData.centroid) {
    worldCentroid.copy(mesh.userData.centroid);
  }

  const radius = Math.max(mesh.geometry.boundingSphere.radius, 0.08);
  const targetDistance = Math.min(Math.max(radius * 2.8, 0.35), 1.2);

  // Dekati dari arah pandang kamera saat ini (bukan arah +z tetap),
  // supaya struktur depan/belakang difokuskan dari sisi yang benar.
  const viewDir = camera.position.clone().sub(controls.target);
  if (viewDir.lengthSq() < 1e-8) viewDir.set(0, 0, -1); else viewDir.normalize();
  const newCamPos = worldCentroid.clone().addScaledVector(viewDir, targetDistance);
  newCamPos.y += 0.04;

  startCameraLerp(newCamPos, worldCentroid);
}

function resetCameraView() {
  startCameraLerp(DEFAULT_CAM_POS, DEFAULT_CAM_TARGET);
  deselectMesh();
}

function startCameraLerp(newCamPos, newTarget) {
  cameraLerpTarget = newCamPos.clone();
  controlsLerpTarget = newTarget.clone();
  lerpProgress = 0;
}

/* ==========================================================================
   Pencarian (Search Index & Dropdown)
   ========================================================================== */

function buildSearchIndex() {
  searchIndex = [];

  for (const sysId in manifestData) {
    const mEntry = manifestData[sysId];
    const sysConfig = SYSTEMS_CONFIG.find(s => s.id === sysId);
    const sysName = sysConfig ? sysConfig.nameId : sysId;

    for (let i = 0; i < mEntry.mesh_names.length; i++) {
      const meshName = mEntry.mesh_names[i];
      const resolved = resolveStructureInfo(meshName, sysId);

      searchIndex.push({
        meshName: meshName,
        systemId: sysId,
        systemName: sysName,
        nameId: resolved.nameId,
        nameLatin: resolved.nameLatin,
        searchText: `${resolved.nameId} ${resolved.nameLatin} ${meshName}`.toLowerCase()
      });
    }
  }
}

function handleSearchInput(query) {
  const dropdown = document.getElementById('search-dropdown');
  const clearBtn = document.getElementById('btn-clear-search');
  const cleanQ = query.trim().toLowerCase();

  if (cleanQ.length === 0) {
    dropdown.style.display = 'none';
    clearBtn.style.display = 'none';
    return;
  }

  clearBtn.style.display = 'block';

  // Filter pencarian maksimal 10 hasil
  const matches = [];
  for (let i = 0; i < searchIndex.length; i++) {
    const item = searchIndex[i];
    if (item.searchText.includes(cleanQ)) {
      matches.push(item);
      if (matches.length >= 10) break;
    }
  }

  if (matches.length === 0) {
    dropdown.innerHTML = '<div class="search-empty">Tidak ada struktur yang cocok</div>';
    dropdown.style.display = 'block';
    return;
  }

  let html = '';
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    html += `
      <div class="search-item" data-mesh="${m.meshName}" data-system="${m.systemId}">
        <div class="search-item-info">
          <span class="search-item-title">${m.nameId}</span>
          <span class="search-item-meta">${m.nameLatin !== '-' ? m.nameLatin + ' • ' : ''}${m.meshName}</span>
        </div>
        <span class="search-item-badge">${m.systemName}</span>
      </div>
    `;
  }

  dropdown.innerHTML = html;
  dropdown.style.display = 'block';

  // Pasang event listener klik pada hasil
  dropdown.querySelectorAll('.search-item').forEach(el => {
    el.addEventListener('click', async () => {
      const meshName = el.getAttribute('data-mesh');
      const systemId = el.getAttribute('data-system');
      await selectStructureByName(systemId, meshName);
      dropdown.style.display = 'none';
    });
  });
}

async function selectStructureByName(systemId, meshName) {
  // Pastikan sistem di-load dan visible
  let sysRecord = loadedSystems.get(systemId);
  if (!sysRecord) {
    sysRecord = await loadSystem(systemId);
  } else if (!sysRecord.visible) {
    setSystemVisibility(systemId, true);
    const cb = document.querySelector(`.system-checkbox[data-sys="${systemId}"]`);
    if (cb) cb.checked = true;
  }

  if (!sysRecord) return;

  const targetMesh = sysRecord.meshes.find(m => m.userData.meshName === meshName);
  if (targetMesh) {
    selectMesh(targetMesh);
    focusOnMesh(targetMesh);
  }
}

/* ==========================================================================
   Mode Kuis
   ========================================================================== */

function startQuiz() {
  if (quizState.active) return;

  // Acak 10 soal dari QUIZ_QUESTION_POOL
  const poolCopy = [...QUIZ_QUESTION_POOL];
  poolCopy.sort(() => Math.random() - 0.5);
  const selectedQuestions = poolCopy.slice(0, 10);

  quizState = {
    active: true,
    questions: selectedQuestions,
    currentIndex: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    isAnswering: false
  };

  deselectMesh();

  // Tampilkan UI Kuis
  document.getElementById('quiz-banner').style.display = 'flex';
  document.getElementById('btn-quiz').classList.add('active');

  presentQuizQuestion();
}

function exitQuiz() {
  quizState.active = false;
  document.getElementById('quiz-banner').style.display = 'none';
  document.getElementById('btn-quiz').classList.remove('active');
  document.getElementById('quiz-result-modal').style.display = 'none';

  // Hapus semua highlight warna
  resetAllEmissives();
}

async function presentQuizQuestion() {
  if (quizState.currentIndex >= quizState.questions.length) {
    finishQuiz();
    return;
  }

  quizState.isAnswering = false;
  const q = quizState.questions[quizState.currentIndex];

  // Pastikan sistem organ terkait di-load & terlihat
  if (!loadedSystems.has(q.systemId) || !loadedSystems.get(q.systemId).visible) {
    await loadSystem(q.systemId);
    const cb = document.querySelector(`.system-checkbox[data-sys="${q.systemId}"]`);
    if (cb) cb.checked = true;
  }

  // Jika skin aktif, buat lebih transparan agar organ di dalam terlihat jelas saat kuis
  if (loadedSystems.has('skin') && q.systemId !== 'skin') {
    const skinSys = loadedSystems.get('skin');
    for (const m of skinSys.meshes) {
      if (m.material) m.material.opacity = 0.12;
    }
  }

  // Reset highlight warna sebelumnya
  resetAllEmissives();

  // Update banner kuis
  document.getElementById('quiz-progress-text').textContent = `Soal ${quizState.currentIndex + 1} / ${quizState.questions.length}`;
  document.getElementById('quiz-score-text').textContent = `Skor: ${quizState.score}`;
  document.getElementById('quiz-streak-text').textContent = `Beruntun: ${quizState.streak}`;
  document.getElementById('quiz-target-name').textContent = q.targetName;

  const feedback = document.getElementById('quiz-feedback');
  feedback.className = 'quiz-feedback';
  feedback.textContent = 'Klik bagian yang dimaksud pada model';
}

function evaluateQuizAnswer(clickedMesh) {
  if (quizState.isAnswering) return;
  quizState.isAnswering = true;

  const currentQ = quizState.questions[quizState.currentIndex];
  const isCorrect = currentQ.meshNames.includes(clickedMesh.userData.meshName);
  const feedback = document.getElementById('quiz-feedback');

  if (isCorrect) {
    quizState.score++;
    quizState.streak++;
    if (quizState.streak > quizState.maxStreak) {
      quizState.maxStreak = quizState.streak;
    }

    // Highlight Hijau pada jawaban benar
    if (clickedMesh.material && clickedMesh.material.emissive) {
      clickedMesh.material.emissive.setHex(0x22c55e);
      clickedMesh.material.emissiveIntensity = 0.8;
    }

    feedback.className = 'quiz-feedback correct';
    feedback.textContent = `Benar! Itu ${currentQ.targetName}.`;

    setTimeout(() => {
      quizState.currentIndex++;
      presentQuizQuestion();
    }, 1300);
  } else {
    quizState.streak = 0;

    // Highlight Merah pada mesh yang salah diklik
    if (clickedMesh.material && clickedMesh.material.emissive) {
      clickedMesh.material.emissive.setHex(0xef4444);
      clickedMesh.material.emissiveIntensity = 0.8;
    }

    // Sorot jawaban benar dengan Hijau
    const sysRecord = loadedSystems.get(currentQ.systemId);
    if (sysRecord) {
      for (const m of sysRecord.meshes) {
        if (currentQ.meshNames.includes(m.userData.meshName) && m.material && m.material.emissive) {
          m.material.emissive.setHex(0x22c55e);
          m.material.emissiveIntensity = 0.9;
        }
      }
    }

    const clickedInfo = resolveStructureInfo(clickedMesh.userData.meshName, clickedMesh.userData.systemId);
    feedback.className = 'quiz-feedback wrong';
    feedback.textContent = `Kurang tepat (itu ${clickedInfo.nameId}). Jawaban benar ditandai hijau.`;

    setTimeout(() => {
      quizState.currentIndex++;
      presentQuizQuestion();
    }, 2200);
  }

  document.getElementById('quiz-score-text').textContent = `Skor: ${quizState.score}`;
  document.getElementById('quiz-streak-text').textContent = `Beruntun: ${quizState.streak}`;
}

function finishQuiz() {
  const modal = document.getElementById('quiz-result-modal');
  const scoreLarge = document.getElementById('modal-final-score');
  const summary = document.getElementById('modal-result-summary');
  const acc = document.getElementById('modal-metric-acc');
  const streakEl = document.getElementById('modal-metric-streak');

  const total = quizState.questions.length;
  const pct = Math.round((quizState.score / total) * 100);

  scoreLarge.textContent = quizState.score;
  acc.textContent = `${pct}%`;
  streakEl.textContent = quizState.maxStreak;

  if (pct >= 90) {
    summary.textContent = 'Hampir semua benar.';
  } else if (pct >= 70) {
    summary.textContent = 'Sebagian besar benar.';
  } else if (pct >= 50) {
    summary.textContent = 'Setengahnya benar. Main lagi buat naikkin skor.';
  } else {
    summary.textContent = 'Masih banyak yang meleset. Latihan pakai pencarian dulu.';
  }

  modal.style.display = 'flex';

  // Kembalikan opacity skin normal
  if (loadedSystems.has('skin')) {
    const skinSys = loadedSystems.get('skin');
    for (const m of skinSys.meshes) {
      if (m.material) m.material.opacity = 0.32;
    }
  }
}

function resetAllEmissives() {
  for (const [, sys] of loadedSystems) {
    for (let i = 0; i < sys.meshes.length; i++) {
      const m = sys.meshes[i];
      if (m.material && m.material.emissive) {
        m.material.emissive.setHex(0x000000);
        m.material.emissiveIntensity = 0.0;
      }
    }
  }
}

/* ==========================================================================
   UI Controls & Event Handlers
   ========================================================================== */

function renderSystemsPanel() {
  const listEl = document.getElementById('systems-list');
  listEl.innerHTML = '';

  for (let i = 0; i < SYSTEMS_CONFIG.length; i++) {
    const sys = SYSTEMS_CONFIG[i];
    const mEntry = manifestData[sys.id] || { mesh_count: 0 };

    const row = document.createElement('div');
    row.className = `system-row ${sys.defaultOn ? 'active' : ''}`;
    row.setAttribute('data-sys-row', sys.id);

    row.innerHTML = `
      <input type="checkbox" class="system-checkbox" data-sys="${sys.id}" ${sys.defaultOn ? 'checked' : ''}>
      <span class="system-color-dot" style="background-color: ${sys.color};"></span>
      <div class="system-info-col">
        <div class="system-name-row">
          <span class="system-name-id">${sys.nameId}</span>
          <span class="system-mesh-count">${mEntry.mesh_count}</span>
        </div>
        <div class="system-status-row">
          <span class="system-name-en">${sys.nameEn}</span>
          <span class="system-status-badge ${sys.defaultOn ? 'status-loading' : 'status-unloaded'}" id="badge-${sys.id}">
            ${sys.defaultOn ? 'Memuat…' : 'Belum'}
          </span>
        </div>
      </div>
    `;

    // Event listener checkbox toggle
    const checkbox = row.querySelector('.system-checkbox');
    checkbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      setSystemVisibility(sys.id, isChecked);
      row.classList.toggle('active', isChecked);
    });

    // Klik seluruh baris (selain langsung di checkbox)
    row.addEventListener('click', (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        setSystemVisibility(sys.id, checkbox.checked);
        row.classList.toggle('active', checkbox.checked);
      }
    });

    listEl.appendChild(row);
  }
}

function updateSystemUIStatus(systemId, status) {
  const badge = document.getElementById(`badge-${systemId}`);
  if (!badge) return;

  badge.className = 'system-status-badge';

  if (status === 'active') {
    badge.classList.add('status-active');
    badge.textContent = 'Aktif';
  } else if (status === 'hidden') {
    badge.classList.add('status-hidden');
    badge.textContent = 'Sembunyi';
  } else if (status === 'loading') {
    badge.classList.add('status-loading');
    badge.textContent = 'Memuat…';
  } else {
    badge.classList.add('status-unloaded');
    badge.textContent = 'Belum';
  }
}

function updateStatsDisplay() {
  let activeSysCount = 0;
  let activeMeshCount = 0;

  for (const [, sys] of loadedSystems) {
    if (sys.visible) {
      activeSysCount++;
      activeMeshCount += sys.meshCount;
    }
  }

  document.getElementById('systems-active-count').textContent = `${activeSysCount}/${SYSTEMS_CONFIG.length}`;
  document.getElementById('footer-stats').textContent = `Sistem aktif: ${activeSysCount} / ${SYSTEMS_CONFIG.length} | ${activeMeshCount} mesh`;
}

function setupUIEventListeners() {
  // 1. Explode Slider & Presets
  const slider = document.getElementById('explode-slider');
  slider.addEventListener('input', (e) => {
    setExplodeTarget(e.target.value);
  });

  document.getElementById('btn-preset-assembled').addEventListener('click', () => {
    setExplodeTarget(0);
  });

  document.getElementById('btn-preset-exploded').addEventListener('click', () => {
    setExplodeTarget(100);
  });

  // 2. Tombol Reset Kamera
  document.getElementById('btn-reset-view').addEventListener('click', resetCameraView);

  // 3. Tombol Quick Actions Sistem
  document.getElementById('btn-all-systems').addEventListener('click', async () => {
    for (const sys of SYSTEMS_CONFIG) {
      const cb = document.querySelector(`.system-checkbox[data-sys="${sys.id}"]`);
      if (cb) cb.checked = true;
      const row = document.querySelector(`[data-sys-row="${sys.id}"]`);
      if (row) row.classList.add('active');
      await loadSystem(sys.id);
      setSystemVisibility(sys.id, true);
    }
  });

  document.getElementById('btn-reset-systems').addEventListener('click', () => {
    for (const sys of SYSTEMS_CONFIG) {
      const cb = document.querySelector(`.system-checkbox[data-sys="${sys.id}"]`);
      if (cb) cb.checked = sys.defaultOn;
      const row = document.querySelector(`[data-sys-row="${sys.id}"]`);
      if (row) row.classList.toggle('active', sys.defaultOn);
      setSystemVisibility(sys.id, sys.defaultOn);
    }
  });

  // 4. Panel Info Tombol
  document.getElementById('btn-close-info').addEventListener('click', deselectMesh);
  document.getElementById('btn-focus-mesh').addEventListener('click', () => {
    if (selectedMesh) focusOnMesh(selectedMesh);
  });

  // 5. Pencarian Input & Clear
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    handleSearchInput(e.target.value);
  });

  document.getElementById('btn-clear-search').addEventListener('click', () => {
    searchInput.value = '';
    handleSearchInput('');
  });

  // Tutup dropdown jika klik di luar search box
  document.addEventListener('click', (e) => {
    const sContainer = document.getElementById('search-container');
    if (!sContainer.contains(e.target)) {
      document.getElementById('search-dropdown').style.display = 'none';
    }
  });

  // 6. Mode Kuis Tombol
  document.getElementById('btn-quiz').addEventListener('click', () => {
    if (quizState.active) {
      exitQuiz();
    } else {
      startQuiz();
    }
  });

  document.getElementById('btn-exit-quiz').addEventListener('click', exitQuiz);
  document.getElementById('btn-modal-retry').addEventListener('click', () => {
    document.getElementById('quiz-result-modal').style.display = 'none';
    startQuiz();
  });
  document.getElementById('btn-modal-close').addEventListener('click', exitQuiz);

  // 7. Raycaster Mouse Click Handler pada Canvas
  const canvas = document.getElementById('webgl-canvas');

  canvas.addEventListener('pointerdown', (e) => {
    pointerDownPos = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('pointerup', (e) => {
    const dx = Math.abs(e.clientX - pointerDownPos.x);
    const dy = Math.abs(e.clientY - pointerDownPos.y);
    // Hanya anggap sebagai klik jika perpindahan kursor < 6px (bukan orbit drag)
    if (dx < 6 && dy < 6) {
      handlePointerClick(e);
    }
  });

  // 8. Resize Window (+ debounce hitung ulang grid)
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('resize', () => {
    clearTimeout(gridResizeTimer);
    gridResizeTimer = setTimeout(() => {
      computeGridLayout();
      if (currentExplodeT > 0) applyExplodeToMeshes(getAllLoadedVisibleMeshes(), currentExplodeT);
    }, 300);
  });
}

function onWindowResize() {
  const container = document.getElementById('viewport-container');
  if (!container || !camera || !renderer) return;

  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

/* ==========================================================================
   Render Loop & Animasi Lerp
   ========================================================================== */

function renderLoop() {
  requestAnimationFrame(renderLoop);

  // 1. Animasi Lerp Explode Slider
  if (Math.abs(targetExplodeT - currentExplodeT) > 0.05) {
    currentExplodeT += (targetExplodeT - currentExplodeT) * 0.12;

    // Mesh baru yang belum punya gridPos: hitung dulu layout grid-nya
    for (const [, sys] of loadedSystems) {
      if (sys.visible && sys.meshes.some(m => !m.userData.gridPos)) {
        computeGridLayout();
        break;
      }
    }

    for (const [, sys] of loadedSystems) {
      if (sys.visible) {
        applyExplodeToMeshes(sys.meshes, currentExplodeT);
      }
    }

    // Auto-fit kamera saat explode
    if (lerpProgress >= 1.0) {
      const d = desiredCameraDistance();
      const dir = camera.position.clone().sub(controls.target).normalize();
      const currentDist = camera.position.distanceTo(controls.target);
      const newD = currentDist + (d - currentDist) * 0.08;
      camera.position.copy(controls.target).addScaledVector(dir, newD);
    }
  }

  // 2. Animasi Lerp Kamera & Orbit Target
  if (lerpProgress < 1.0 && cameraLerpTarget && controlsLerpTarget) {
    lerpProgress += 0.05;
    const t = Math.min(1.0, lerpProgress);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - t, 3);

    camera.position.lerp(cameraLerpTarget, 0.15);
    controls.target.lerp(controlsLerpTarget, 0.15);

    if (t >= 1.0) {
      camera.position.copy(cameraLerpTarget);
      controls.target.copy(controlsLerpTarget);
      cameraLerpTarget = null;
      controlsLerpTarget = null;
    }
  }

  // 3. OrbitControls Update & Render
  controls.update();
  renderer.render(scene, camera);
}

// Mulai aplikasi saat DOM siap
window.addEventListener('DOMContentLoaded', init);

// TEMP DEBUG HOOK (QA only — DIHAPUS setelah QA)
window.__anatomiDebug = {
  setExplode: (v) => setExplodeTarget(v),
  explodeT: () => currentExplodeT,
  raycastTest: (ndcX, ndcY) => {
    pointer.set(ndcX, ndcY);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(getVisibleMeshes(), false);
    return hits.length ? { name: hits[0].object.userData.meshName, sys: hits[0].object.userData.systemId } : null;
  },
  count: () => { let n = 0; for (const [, s] of loadedSystems) if (s.visible) n += s.meshes.length; return n; },
  sysCount: () => loadedSystems.size,
  positions: () => {
    const out = [];
    for (const [sysId, sys] of loadedSystems) {
      if (!sys.visible) continue;
      for (const m of sys.meshes) {
        const p = new THREE.Vector3();
        m.getWorldPosition(p);
        const g = m.userData.gridPos;
        out.push({ sys: sysId, name: m.userData.meshName,
          x: +p.x.toFixed(4), y: +p.y.toFixed(4), z: +p.z.toFixed(4),
          gx: g ? +g.x.toFixed(4) : null, gy: g ? +g.y.toFixed(4) : null,
          cx: m.userData.gridCell ? +m.userData.gridCell.cx.toFixed(4) : null,
          cy: m.userData.gridCell ? +m.userData.gridCell.cy.toFixed(4) : null });
      }
    }
    return out;
  }
};

// TEMP QA: dukung ?explode=N untuk screenshot headless
const _qaExplode = new URLSearchParams(window.location.search).get('explode');
if (_qaExplode !== null) {
  window.addEventListener('load', () => {
    setTimeout(() => setExplodeTarget(Number(_qaExplode)), 3000);
  });
}
