import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  CADWall,
  CADOpening,
  CADRoom,
  CADBlock,
  CADSlab,
  CADColumn,
  Language,
  RenderStyleConfig,
} from '../types/cad';
import { create3DFurniture } from './CAD3DFurniture';
import {
  Camera,
  Sun,
  Layers,
  Box,
  Footprints,
  RotateCcw,
  Scissors,
  Eye,
  Sliders,
  Sparkles,
  Download,
} from 'lucide-react';

interface Viewer3DProps {
  walls: CADWall[];
  openings: CADOpening[];
  rooms: CADRoom[];
  blocks?: CADBlock[];
  slabs?: CADSlab[];
  columns?: CADColumn[];
  language: Language;
  renderStyle: RenderStyleConfig;
  onSnapshot?: (dataUrl: string) => void;
}

export const Viewer3D: React.FC<Viewer3DProps> = ({
  walls,
  openings,
  rooms,
  blocks = [],
  slabs = [],
  columns = [],
  language,
  renderStyle,
  onSnapshot,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const clipPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, -1, 0), 100));

  // Orbit controls state
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 24, theta: Math.PI / 4, phi: Math.PI / 3.2 });
  const targetRef = useRef(new THREE.Vector3(6, 0, 5));

  // Walkthrough First-Person state
  const [isWalkthrough, setIsWalkthrough] = useState(false);
  const walkPosRef = useRef(new THREE.Vector3(6, 1.65, 5));
  const walkYawRef = useRef(0);
  const walkPitchRef = useRef(0);
  const keyStateRef = useRef<{ [key: string]: boolean }>({});

  // Optics & Photometric State
  const [focalLength, setFocalLength] = useState<16 | 24 | 35 | 50 | 85>(35);
  const [exposureEV, setExposureEV] = useState<number>(0.0);
  const [sectionCut, setSectionCut] = useState<'none' | 'AA' | 'BB' | 'ceiling'>('none');
  const [isWireframe, setIsWireframe] = useState(false);
  const [showCeiling, setShowCeiling] = useState(false);
  const [sunHour, setSunHour] = useState<number>(15); // 15:00
  const [renderQuality, setRenderQuality] = useState<'DRAFT' | 'PREVIEW' | 'ARCHVIZ'>('PREVIEW');
  const [isRefining, setIsRefining] = useState(false);

  // Compute camera FOV from full-frame 35mm focal length
  // FOV = 2 * atan(36 / (2 * f)) * 180 / PI (approx for vertical FOV with 24mm sensor height: 24 / (2*f))
  const getFovForFocalLength = useCallback((fl: number) => {
    const sensorHeight = 24; // mm
    const rad = 2 * Math.atan(sensorHeight / (2 * fl));
    return (rad * 180) / Math.PI;
  }, []);

  // Update camera position from spherical coordinates (Orbit mode)
  const updateOrbitCamera = useCallback(() => {
    if (!cameraRef.current || isWalkthrough) return;
    const { radius, theta, phi } = sphericalRef.current;
    const x = targetRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = targetRef.current.y + radius * Math.cos(phi);
    const z = targetRef.current.z + radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(targetRef.current);
  }, [isWalkthrough]);

  // Apply Camera Preset
  const applyPreset = (preset: 'iso' | 'top' | 'eye' | 'front') => {
    setIsWalkthrough(false);
    if (preset === 'iso') {
      sphericalRef.current = { radius: 24, theta: Math.PI / 4, phi: Math.PI / 3.2 };
    } else if (preset === 'top') {
      sphericalRef.current = { radius: 26, theta: 0, phi: 0.05 };
    } else if (preset === 'eye') {
      sphericalRef.current = { radius: 10, theta: Math.PI / 3, phi: Math.PI / 2.05 };
    } else if (preset === 'front') {
      sphericalRef.current = { radius: 22, theta: 0, phi: Math.PI / 2.2 };
    }
    updateOrbitCamera();
  };

  // Rebuild 3D Scene Geometry
  const buildScene = useCallback(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clear existing models
    const toRemove: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (obj.name === 'arch-model') toRemove.push(obj);
    });
    toRemove.forEach((obj) => scene.remove(obj));

    const modelGroup = new THREE.Group();
    modelGroup.name = 'arch-model';

    // Materials with Architectural Shading
    const wallColor = new THREE.Color(renderStyle.wallColor);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: renderStyle.wallRoughness,
      metalness: 0.05,
      wireframe: isWireframe,
      side: THREE.DoubleSide,
      clippingPlanes: rendererRef.current?.clippingPlanes || [],
      clipShadows: true,
    });

    const exteriorWallMat = new THREE.MeshStandardMaterial({
      color: wallColor.clone().multiplyScalar(0.96),
      roughness: Math.min(1, renderStyle.wallRoughness + 0.1),
      metalness: 0.02,
      wireframe: isWireframe,
      clippingPlanes: rendererRef.current?.clippingPlanes || [],
    });

    const baseboardMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1e293b),
      roughness: 0.4,
      metalness: 0.2,
      clippingPlanes: rendererRef.current?.clippingPlanes || [],
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xa5f3fc),
      transparent: true,
      opacity: 0.38,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.92,
      ior: 1.52,
      wireframe: isWireframe,
      clippingPlanes: rendererRef.current?.clippingPlanes || [],
    });

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0f172a),
      roughness: 0.3,
      metalness: 0.8,
      wireframe: isWireframe,
      clippingPlanes: rendererRef.current?.clippingPlanes || [],
    });

    const doorLeafMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x78350f),
      roughness: 0.6,
      wireframe: isWireframe,
      clippingPlanes: rendererRef.current?.clippingPlanes || [],
    });

    const columnMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x475569),
      roughness: 0.8,
      metalness: 0.1,
      wireframe: isWireframe,
      clippingPlanes: rendererRef.current?.clippingPlanes || [],
    });

    // 1. Generate Architectural Walls with Baseboards
    walls.forEach((wall) => {
      const dx = wall.x2 - wall.x1;
      const dy = wall.y2 - wall.y1;
      const length = Math.hypot(dx, dy);
      if (length < 0.1) return;

      const angle = Math.atan2(dy, dx);
      const midX = (wall.x1 + wall.x2) / 2;
      const midZ = (wall.y1 + wall.y2) / 2;
      const height = wall.height || 2.8;
      const thickness = wall.thickness || 0.2;

      // Main Wall Mesh
      const wallGeom = new THREE.BoxGeometry(length, height, thickness);
      const mat = wall.isExterior ? exteriorWallMat : wallMaterial;
      const wallMesh = new THREE.Mesh(wallGeom, mat);
      wallMesh.position.set(midX, height / 2, midZ);
      wallMesh.rotation.y = -angle;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      modelGroup.add(wallMesh);

      // Architectural Baseboard (Rodapié) along base
      const bbGeom = new THREE.BoxGeometry(length, 0.08, thickness + 0.02);
      const bbMesh = new THREE.Mesh(bbGeom, baseboardMat);
      bbMesh.position.set(midX, 0.04, midZ);
      bbMesh.rotation.y = -angle;
      modelGroup.add(bbMesh);
    });

    // 2. Structural Columns
    columns.forEach((col) => {
      const colHeight = col.height || 2.8;
      let colGeom: THREE.BufferGeometry;
      if (col.shape === 'circle') {
        colGeom = new THREE.CylinderGeometry((col.width || 0.3) / 2, (col.width || 0.3) / 2, colHeight, 24);
      } else {
        colGeom = new THREE.BoxGeometry(col.width || 0.3, colHeight, col.depth || 0.3);
      }
      const colMesh = new THREE.Mesh(colGeom, columnMat);
      colMesh.position.set(col.x, colHeight / 2, col.y);
      colMesh.castShadow = true;
      colMesh.receiveShadow = true;
      modelGroup.add(colMesh);
    });

    // 3. Openings (Doors & Windows) with High Architectural Detailing
    openings.forEach((op) => {
      const posX = op.x;
      const posZ = op.y;
      const opWidth = op.width || 0.9;
      const opHeight = op.height || 2.1;
      const sillH = op.sillHeight || 0;

      if (op.type === 'window') {
        const winGroup = new THREE.Group();
        winGroup.position.set(posX, sillH + opHeight / 2, posZ);

        // Frame
        const frameGeom = new THREE.BoxGeometry(opWidth, opHeight, 0.24);
        const frameMesh = new THREE.Mesh(frameGeom, frameMaterial);
        winGroup.add(frameMesh);

        // Glass Pane with Reflection
        const glassGeom = new THREE.BoxGeometry(opWidth - 0.12, opHeight - 0.12, 0.03);
        const glassMesh = new THREE.Mesh(glassGeom, glassMaterial);
        winGroup.add(glassMesh);

        // Center Mullion
        if (opWidth > 1.2) {
          const mullionGeom = new THREE.BoxGeometry(0.06, opHeight, 0.25);
          const mullionMesh = new THREE.Mesh(mullionGeom, frameMaterial);
          winGroup.add(mullionMesh);
        }

        // Window Sill (Alféizar)
        const sillGeom = new THREE.BoxGeometry(opWidth + 0.1, 0.06, 0.32);
        const sillMesh = new THREE.Mesh(sillGeom, frameMaterial);
        sillMesh.position.set(0, -opHeight / 2, 0.02);
        winGroup.add(sillMesh);

        modelGroup.add(winGroup);
      } else {
        // Detailed Door with Frame, Leaf, and Metal Lever Handle
        const doorGroup = new THREE.Group();
        doorGroup.position.set(posX, opHeight / 2, posZ);

        // Outer Frame
        const frameGeom = new THREE.BoxGeometry(opWidth, opHeight, 0.22);
        const frameMesh = new THREE.Mesh(frameGeom, frameMaterial);
        doorGroup.add(frameMesh);

        // Door Leaf
        const leafGeom = new THREE.BoxGeometry(opWidth - 0.08, opHeight - 0.04, 0.05);
        const leafMesh = new THREE.Mesh(leafGeom, doorLeafMat);
        leafMesh.position.set(0.02, 0, 0);
        doorGroup.add(leafMesh);

        // Lever Handle (Manilla de acero inox)
        const handleGeom = new THREE.BoxGeometry(0.12, 0.03, 0.09);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
        const handleMesh = new THREE.Mesh(handleGeom, handleMat);
        handleMesh.position.set(-opWidth / 2 + 0.12, 0, 0.04);
        doorGroup.add(handleMesh);

        modelGroup.add(doorGroup);
      }
    });

    // 4. Floor Slabs & Rooms with Realistic Textures
    rooms.forEach((room) => {
      const slabGeom = new THREE.BoxGeometry(room.width, 0.2, room.height);
      const floorColor =
        room.floorMaterial === 'tile'
          ? 0xe2e8f0
          : room.floorMaterial === 'concrete-polished'
          ? 0x64748b
          : room.floorMaterial === 'marble'
          ? 0xf1f5f9
          : room.floorMaterial === 'deck-wood'
          ? 0x713f12
          : 0xa16207; // Parquet default

      const floorMat = new THREE.MeshStandardMaterial({
        color: floorColor,
        roughness: room.floorMaterial === 'marble' || room.floorMaterial === 'concrete-polished' ? 0.2 : 0.6,
        metalness: 0.05,
        wireframe: isWireframe,
        clippingPlanes: rendererRef.current?.clippingPlanes || [],
      });

      const floorMesh = new THREE.Mesh(slabGeom, floorMat);
      floorMesh.position.set(room.x + room.width / 2, -0.1, room.y + room.height / 2);
      floorMesh.receiveShadow = true;
      modelGroup.add(floorMesh);

      // Optional Ceilings
      if (showCeiling) {
        const ceilGeom = new THREE.BoxGeometry(room.width, 0.15, room.height);
        const ceilMat = new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          roughness: 0.9,
          wireframe: isWireframe,
          clippingPlanes: rendererRef.current?.clippingPlanes || [],
        });
        const ceilMesh = new THREE.Mesh(ceilGeom, ceilMat);
        ceilMesh.position.set(room.x + room.width / 2, 2.8 + 0.075, room.y + room.height / 2);
        modelGroup.add(ceilMesh);
      }
    });

    // 5. High-Fidelity 3D Furniture (Curved meshes with smooth normals)
    blocks.forEach((block) => {
      const furnMesh = create3DFurniture(block, isWireframe);
      furnMesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.clippingPlanes = rendererRef.current?.clippingPlanes || [];
        }
      });
      modelGroup.add(furnMesh);
    });

    scene.add(modelGroup);
  }, [walls, openings, rooms, blocks, columns, renderStyle, isWireframe, showCeiling]);

  // Section cut clipping plane update
  useEffect(() => {
    if (!rendererRef.current) return;
    const renderer = rendererRef.current;

    if (sectionCut === 'none') {
      renderer.clippingPlanes = [];
    } else if (sectionCut === 'AA') {
      // Longitudinal cut plane at center Z
      const midZ = 5.0;
      renderer.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 0, -1), midZ)];
    } else if (sectionCut === 'BB') {
      // Transversal cut plane at center X
      const midX = 6.0;
      renderer.clippingPlanes = [new THREE.Plane(new THREE.Vector3(-1, 0, 0), midX)];
    } else if (sectionCut === 'ceiling') {
      // Horizontal slice cut at H = 1.40m
      renderer.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.4)];
    }

    buildScene();
  }, [sectionCut, buildScene]);

  // Optical Camera Focal Length Update
  useEffect(() => {
    if (!cameraRef.current) return;
    cameraRef.current.fov = getFovForFocalLength(focalLength);
    cameraRef.current.updateProjectionMatrix();
  }, [focalLength, getFovForFocalLength]);

  // Exposure Control
  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.toneMappingExposure = Math.pow(2, exposureEV);
  }, [exposureEV]);

  // Sun Simulation update
  useEffect(() => {
    if (!dirLightRef.current) return;
    const hour = sunHour;
    const angle = ((hour - 6) / 12) * Math.PI; // 6:00 to 18:00
    const elev = Math.sin(Math.max(0, Math.min(Math.PI, angle)));
    const posX = 20 * Math.cos(angle);
    const posY = Math.max(1, 25 * elev);
    const posZ = 15;

    dirLightRef.current.position.set(posX, posY, posZ);
    dirLightRef.current.intensity = elev > 0 ? 2.5 * elev : 0.2;
  }, [sunHour]);

  // Initialize Three.js Viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070c); // Deep Obsidian Canvas
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(getFovForFocalLength(focalLength), width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateOrbitCamera();

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = Math.pow(2, exposureEV);
    renderer.localClippingEnabled = true;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Architectural Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    dirLight.position.set(15, 22, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Ground Plane with Fine Engineering Grid
    const gridHelper = new THREE.GridHelper(60, 60, 0xdc2626, 0x1e293b);
    gridHelper.position.y = -0.15;
    scene.add(gridHelper);

    buildScene();

    // Mouse Controls (Orbit / Pan)
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDraggingRef.current = true;
      if (e.button === 2 || e.shiftKey) isPanningRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

      if (isPanningRef.current) {
        const panSpeed = 0.02;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
        targetRef.current.addScaledVector(right, -deltaX * panSpeed);
        targetRef.current.addScaledVector(camera.up, deltaY * panSpeed);
        updateOrbitCamera();
      } else if (isDraggingRef.current) {
        const rotSpeed = 0.005;
        sphericalRef.current.theta -= deltaX * rotSpeed;
        sphericalRef.current.phi = Math.max(0.05, Math.min(Math.PI / 2.02, sphericalRef.current.phi - deltaY * rotSpeed));
        updateOrbitCamera();
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      isPanningRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.05;
      sphericalRef.current.radius = Math.max(3, Math.min(80, sphericalRef.current.radius * (1 + e.deltaY * 0.001 * zoomSpeed * 10)));
      updateOrbitCamera();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [buildScene, focalLength, getFovForFocalLength, updateOrbitCamera, exposureEV]);

  // Snapshot trigger
  const handleCaptureSnapshot = () => {
    if (!rendererRef.current) return;
    setIsRefining(true);
    setTimeout(() => {
      const dataUrl = rendererRef.current!.domElement.toDataURL('image/png');
      setIsRefining(false);
      if (onSnapshot) onSnapshot(dataUrl);
    }, 400);
  };

  return (
    <div className="relative w-full h-full bg-[#05070c] overflow-hidden select-none font-sans">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating Top Control Bar (Belentani Red Glass) */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Optical Camera Selector */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-xl bg-[#090d16]/90 backdrop-blur-xl border border-red-500/20 shadow-2xl">
          <div className="flex items-center gap-1 px-2 text-[10px] font-mono text-neutral-400">
            <Camera className="w-3.5 h-3.5 text-red-400" />
            <span>ÓPTICA</span>
          </div>
          {([16, 24, 35, 50, 85] as const).map((fl) => (
            <button
              key={fl}
              onClick={() => setFocalLength(fl)}
              className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                focalLength === fl ? 'bg-red-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title={`Distancia focal ${fl}mm`}
            >
              {fl}mm
            </button>
          ))}
        </div>

        {/* View Presets & Section Slicing */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-xl bg-[#090d16]/90 backdrop-blur-xl border border-red-500/20 shadow-2xl">
          <button
            onClick={() => applyPreset('iso')}
            className="px-2 py-1 rounded text-xs font-mono text-neutral-300 hover:text-white transition-colors"
          >
            ISO
          </button>
          <button
            onClick={() => applyPreset('top')}
            className="px-2 py-1 rounded text-xs font-mono text-neutral-300 hover:text-white transition-colors"
          >
            PLANTA
          </button>
          <button
            onClick={() => applyPreset('front')}
            className="px-2 py-1 rounded text-xs font-mono text-neutral-300 hover:text-white transition-colors"
          >
            ALZADO
          </button>
          <button
            onClick={() => applyPreset('eye')}
            className="px-2 py-1 rounded text-xs font-mono text-neutral-300 hover:text-white transition-colors"
          >
            OJO HUMANO
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Section Cut Slicing */}
          <div className="flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5 text-amber-400 ml-1" />
            <select
              value={sectionCut}
              onChange={(e) => setSectionCut(e.target.value as any)}
              className="bg-black/50 text-xs font-mono text-neutral-200 border border-white/10 rounded px-1.5 py-0.5 outline-none"
            >
              <option value="none">Sin Corte</option>
              <option value="AA">Sección A-A'</option>
              <option value="BB">Sección B-B'</option>
              <option value="ceiling">Plano Planta H=1.4m</option>
            </select>
          </div>
        </div>

        {/* Snapshot / Capture */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={handleCaptureSnapshot}
            disabled={isRefining}
            className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold border border-red-400/40 shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRefining ? 'PROCESANDO...' : 'RENDER FOTO'}</span>
          </button>
        </div>
      </div>

      {/* Floating Bottom Bar: Sunlight, EV Exposure, Wireframe */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Sun Hour Slider */}
        <div className="pointer-events-auto flex items-center gap-2 p-2 rounded-xl bg-[#090d16]/90 backdrop-blur-xl border border-red-500/20 shadow-2xl">
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono text-neutral-400">{sunHour}:00h</span>
          <input
            type="range"
            min="6"
            max="20"
            value={sunHour}
            onChange={(e) => setSunHour(parseInt(e.target.value))}
            className="w-24 accent-red-600 cursor-pointer"
          />
        </div>

        {/* Exposure Control */}
        <div className="pointer-events-auto flex items-center gap-2 p-2 rounded-xl bg-[#090d16]/90 backdrop-blur-xl border border-red-500/20 shadow-2xl">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono text-neutral-400">EV: {exposureEV > 0 ? `+${exposureEV}` : exposureEV}</span>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.5"
            value={exposureEV}
            onChange={(e) => setExposureEV(parseFloat(e.target.value))}
            className="w-20 accent-red-600 cursor-pointer"
          />
        </div>

        {/* Wireframe & Ceilings */}
        <div className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-xl bg-[#090d16]/90 backdrop-blur-xl border border-red-500/20 shadow-2xl text-xs font-mono">
          <button
            onClick={() => setIsWireframe(!isWireframe)}
            className={`px-2.5 py-1 rounded transition-colors ${
              isWireframe ? 'bg-red-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Alámbrico
          </button>
          <button
            onClick={() => setShowCeiling(!showCeiling)}
            className={`px-2.5 py-1 rounded transition-colors ${
              showCeiling ? 'bg-red-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Cubierta
          </button>
        </div>
      </div>
    </div>
  );
};
