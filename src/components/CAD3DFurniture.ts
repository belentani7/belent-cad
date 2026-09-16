import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CADBlock } from '../types/cad';

/**
 * Creates a rounded box geometry using Shape + Extrude with bevels.
 * Eliminates harsh 90° razor edges ("Minecraft/Lego look") and gives realistic specular highlights.
 */
function createRoundedBoxGeometry(
  width: number,
  height: number,
  depth: number,
  radius: number = 0.03,
  smoothness: number = 3
): THREE.BufferGeometry {
  const eps = 0.0001;
  const maxR = Math.min(width / 2 - eps, depth / 2 - eps, height / 2 - eps);
  const r = Math.max(0.002, Math.min(radius, maxR));
  const w = width / 2 - r;
  const d = depth / 2 - r;

  const shape = new THREE.Shape();
  shape.absarc(-w, -d, r, Math.PI, Math.PI * 1.5);
  shape.absarc(w, -d, r, Math.PI * 1.5, Math.PI * 2);
  shape.absarc(w, d, r, 0, Math.PI * 0.5);
  shape.absarc(-w, d, r, Math.PI * 0.5, Math.PI);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: Math.max(0.002, height - r * 2),
    bevelEnabled: true,
    bevelSegments: smoothness,
    steps: 1,
    bevelSize: r,
    bevelThickness: r,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // Orient shape from X-Y extrusion to X-Z horizontal floor orientation
  geo.rotateX(-Math.PI / 2);
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates an organic curved cushion with a crowning dome for soft upholstery.
 */
function createCushionGeometry(
  width: number,
  height: number,
  depth: number,
  radius: number = 0.05
): THREE.BufferGeometry {
  const geo = createRoundedBoxGeometry(width, height, depth, radius, 4);
  const pos = geo.attributes.position;
  const halfW = width / 2;
  const halfD = depth / 2;

  // Gentle dome crowning on top face
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    if (y > 0) {
      const distFromCenter = Math.sqrt((x / halfW) ** 2 + (z / halfD) ** 2);
      const crown = Math.max(0, 1 - Math.min(1, distFromCenter));
      pos.setY(i, y + crown * height * 0.22);
    }
  }

  geo.computeVertexNormals();
  return geo;
}

interface PartSpec {
  geometry: THREE.BufferGeometry;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

/**
 * Merges multiple sub-geometries into a single seamless BufferGeometry or Object3D.
 * Converts all sub-geometries to non-indexed to ensure 100% attribute compatibility
 * in Three.js BufferGeometryUtils.mergeGeometries and falls back cleanly if merge returns null.
 */
function mergePartsIntoMesh(parts: PartSpec[], material: THREE.Material): THREE.Object3D {
  if (parts.length === 0) {
    return new THREE.Group();
  }

  try {
    const geos: THREE.BufferGeometry[] = [];

    parts.forEach((p) => {
      let clone = p.geometry.clone();
      const mat4 = new THREE.Matrix4();
      const pos = p.position ? new THREE.Vector3(...p.position) : new THREE.Vector3();
      const rot = p.rotation ? new THREE.Euler(...p.rotation) : new THREE.Euler();
      const sca = p.scale ? new THREE.Vector3(...p.scale) : new THREE.Vector3(1, 1, 1);
      mat4.compose(pos, new THREE.Quaternion().setFromEuler(rot), sca);
      clone.applyMatrix4(mat4);

      // THREE.JS FIX: Convert indexed geometries to non-indexed so all geometries
      // share the exact same index status (index === null), avoiding merge failure.
      if (clone.index) {
        clone = clone.toNonIndexed();
      }

      // Compute consistent vertex normals
      clone.computeVertexNormals();

      // Keep only position and normal attributes to prevent mismatch across different primitives
      const uniformAttributes: { [name: string]: THREE.BufferAttribute | THREE.InterleavedBufferAttribute } = {
        position: clone.attributes.position,
        normal: clone.attributes.normal,
      };
      clone.attributes = uniformAttributes;

      geos.push(clone);
    });

    const merged = mergeGeometries(geos, false);
    if (merged) {
      merged.computeVertexNormals();
      const mesh = new THREE.Mesh(merged, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }
  } catch (err) {
    console.warn('mergeGeometries warning, applying safe group fallback:', err);
  }

  // Resilient fallback: assemble parts as an explicit THREE.Group
  const fallbackGroup = new THREE.Group();
  parts.forEach((p) => {
    const m = new THREE.Mesh(p.geometry, material);
    if (p.position) m.position.set(...p.position);
    if (p.rotation) m.rotation.set(...p.rotation);
    if (p.scale) m.scale.set(...p.scale);
    m.castShadow = true;
    m.receiveShadow = true;
    fallbackGroup.add(m);
  });
  return fallbackGroup;
}

/**
 * Generates rich, architectural 3D Three.js models with curved, beveled geometries
 * and merged meshes for authentic architectural rendering.
 */
export function create3DFurniture(block: CADBlock, isWireframe: boolean = false): THREE.Group {
  const group = new THREE.Group();
  group.name = `furniture-${block.id}`;
  group.position.set(block.x, 0, block.y);
  group.rotation.y = -((block.rotation || 0) * Math.PI) / 180;

  const s = block.scale || 1;

  // Architectural standard materials with PBR properties
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x6e472a,
    roughness: 0.55,
    metalness: 0.05,
    wireframe: isWireframe,
  });

  const fabricDarkMaterial = new THREE.MeshStandardMaterial({
    color: 0x273549,
    roughness: 0.82,
    metalness: 0.02,
    wireframe: isWireframe,
  });

  const fabricLightMaterial = new THREE.MeshStandardMaterial({
    color: 0xedebe8,
    roughness: 0.88,
    metalness: 0.0,
    wireframe: isWireframe,
  });

  const ceramicWhiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xfafafa,
    roughness: 0.15,
    metalness: 0.08,
    wireframe: isWireframe,
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8dde6,
    roughness: 0.12,
    metalness: 0.95,
    wireframe: isWireframe,
  });

  const foliageMaterial = new THREE.MeshStandardMaterial({
    color: 0x235d37,
    roughness: 0.75,
    metalness: 0.02,
    wireframe: isWireframe,
  });

  const metalDarkMaterial = new THREE.MeshStandardMaterial({
    color: 0x18202c,
    roughness: 0.35,
    metalness: 0.8,
    wireframe: isWireframe,
  });

  switch (block.type) {
    case 'sofa': {
      // 3-seater modern Italian-style sofa with curved cushions and beveled armrests
      const w = 2.2 * s;
      const d = 0.92 * s;
      const h = 0.76 * s;
      const armW = 0.18 * s;
      const armH = 0.52 * s;

      // 1. Base plinth & legs (merged dark metal)
      const baseGeo = createRoundedBoxGeometry(w - 0.04 * s, 0.08 * s, d - 0.04 * s, 0.02 * s, 2);
      const legGeo = new THREE.CylinderGeometry(0.025 * s, 0.015 * s, 0.12 * s, 12);
      const metalParts: PartSpec[] = [
        { geometry: baseGeo, position: [0, 0.1 * s, 0] },
        { geometry: legGeo, position: [-w / 2 + 0.12 * s, 0.06 * s, -d / 2 + 0.12 * s] },
        { geometry: legGeo, position: [w / 2 - 0.12 * s, 0.06 * s, -d / 2 + 0.12 * s] },
        { geometry: legGeo, position: [-w / 2 + 0.12 * s, 0.06 * s, d / 2 - 0.12 * s] },
        { geometry: legGeo, position: [w / 2 - 0.12 * s, 0.06 * s, d / 2 - 0.12 * s] },
      ];
      group.add(mergePartsIntoMesh(metalParts, metalDarkMaterial));

      // 2. All fabric upholstery (backrest, armrests and 3 crowned cushions merged into one seamless mesh)
      const backGeo = createRoundedBoxGeometry(w - armW * 2, 0.44 * s, 0.2 * s, 0.05 * s, 4);
      const leftArmGeo = createRoundedBoxGeometry(armW, armH, d, 0.05 * s, 4);
      const rightArmGeo = createRoundedBoxGeometry(armW, armH, d, 0.05 * s, 4);

      const cushionW = (w - armW * 2 - 0.04 * s) / 3;
      const cushionGeo = createCushionGeometry(cushionW, 0.22 * s, d - 0.22 * s, 0.04 * s);

      const fabricParts: PartSpec[] = [
        { geometry: backGeo, position: [0, 0.46 * s, -d / 2 + 0.12 * s] },
        { geometry: leftArmGeo, position: [-w / 2 + armW / 2, armH / 2 + 0.06 * s, 0] },
        { geometry: rightArmGeo, position: [w / 2 - armW / 2, armH / 2 + 0.06 * s, 0] },
        { geometry: cushionGeo, position: [-cushionW * 1.02, 0.25 * s, 0.06 * s] },
        { geometry: cushionGeo, position: [0, 0.25 * s, 0.06 * s] },
        { geometry: cushionGeo, position: [cushionW * 1.02, 0.25 * s, 0.06 * s] },
      ];
      group.add(mergePartsIntoMesh(fabricParts, fabricDarkMaterial));
      break;
    }

    case 'bed': {
      // King-size double bed with beveled headboard, crowned mattress & soft pillows
      const w = 1.95 * s;
      const d = 2.1 * s;

      // 1. Wooden platform & headboard (filleted edges)
      const platformGeo = createRoundedBoxGeometry(w, 0.22 * s, d, 0.03 * s, 3);
      const headboardGeo = createRoundedBoxGeometry(w + 0.08 * s, 1.05 * s, 0.12 * s, 0.04 * s, 4);
      const woodParts: PartSpec[] = [
        { geometry: platformGeo, position: [0, 0.11 * s, 0.02 * s] },
        { geometry: headboardGeo, position: [0, 0.55 * s, -d / 2 + 0.06 * s] },
      ];
      group.add(mergePartsIntoMesh(woodParts, woodMaterial));

      // 2. Crowned Mattress & 2 puffy pillows
      const mattressGeo = createCushionGeometry(w - 0.12 * s, 0.28 * s, d - 0.18 * s, 0.06 * s);
      const pillowGeo = createCushionGeometry(0.68 * s, 0.14 * s, 0.42 * s, 0.06 * s);
      const bedParts: PartSpec[] = [
        { geometry: mattressGeo, position: [0, 0.36 * s, 0.06 * s] },
        { geometry: pillowGeo, position: [-w * 0.23, 0.54 * s, -d / 2 + 0.38 * s], rotation: [0.18, 0, 0] },
        { geometry: pillowGeo, position: [w * 0.23, 0.54 * s, -d / 2 + 0.38 * s], rotation: [0.18, 0, 0] },
      ];
      group.add(mergePartsIntoMesh(bedParts, fabricLightMaterial));

      // 3. Curved Duvet blanket fold
      const duvetGeo = createRoundedBoxGeometry(w - 0.08 * s, 0.14 * s, d * 0.6, 0.05 * s, 3);
      const duvetMesh = new THREE.Mesh(
        duvetGeo,
        new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.85, wireframe: isWireframe })
      );
      duvetMesh.position.set(0, 0.46 * s, d * 0.18);
      duvetMesh.castShadow = true;
      group.add(duvetMesh);
      break;
    }

    case 'dining-table': {
      // Modern dining table with beveled edge top & sculpted chairs
      const w = 1.85 * s;
      const d = 0.95 * s;
      const h = 0.76 * s;

      // Tabletop with soft edge chamfer
      const topGeo = createRoundedBoxGeometry(w, 0.045 * s, d, 0.018 * s, 3);
      const topMesh = new THREE.Mesh(topGeo, woodMaterial);
      topMesh.position.y = h;
      topMesh.castShadow = true;
      group.add(topMesh);

      // 4 Metal turned legs
      const legGeo = new THREE.CylinderGeometry(0.024 * s, 0.016 * s, h, 16);
      const legParts: PartSpec[] = [
        { geometry: legGeo, position: [-w / 2 + 0.09 * s, h / 2, -d / 2 + 0.09 * s] },
        { geometry: legGeo, position: [w / 2 - 0.09 * s, h / 2, -d / 2 + 0.09 * s] },
        { geometry: legGeo, position: [-w / 2 + 0.09 * s, h / 2, d / 2 - 0.09 * s] },
        { geometry: legGeo, position: [w / 2 - 0.09 * s, h / 2, d / 2 - 0.09 * s] },
      ];
      group.add(mergePartsIntoMesh(legParts, metalDarkMaterial));

      // 4 Sculpted curved chairs
      const seatGeo = createRoundedBoxGeometry(0.44 * s, 0.05 * s, 0.42 * s, 0.025 * s, 3);
      const backGeo = createRoundedBoxGeometry(0.42 * s, 0.38 * s, 0.035 * s, 0.02 * s, 3);
      const chairLegGeo = new THREE.CylinderGeometry(0.012 * s, 0.008 * s, 0.44 * s, 10);

      [-0.45 * s, 0.45 * s].forEach((cx) => {
        // Chair 1 (Top)
        const c1Parts: PartSpec[] = [
          { geometry: seatGeo, position: [cx, 0.44 * s, -d / 2 - 0.22 * s] },
          { geometry: backGeo, position: [cx, 0.65 * s, -d / 2 - 0.41 * s], rotation: [-0.1, 0, 0] },
          { geometry: chairLegGeo, position: [cx - 0.18 * s, 0.22 * s, -d / 2 - 0.38 * s] },
          { geometry: chairLegGeo, position: [cx + 0.18 * s, 0.22 * s, -d / 2 - 0.38 * s] },
          { geometry: chairLegGeo, position: [cx - 0.18 * s, 0.22 * s, -d / 2 - 0.06 * s] },
          { geometry: chairLegGeo, position: [cx + 0.18 * s, 0.22 * s, -d / 2 - 0.06 * s] },
        ];
        group.add(mergePartsIntoMesh(c1Parts, fabricDarkMaterial));

        // Chair 2 (Bottom)
        const c2Parts: PartSpec[] = [
          { geometry: seatGeo, position: [cx, 0.44 * s, d / 2 + 0.22 * s] },
          { geometry: backGeo, position: [cx, 0.65 * s, d / 2 + 0.41 * s], rotation: [0.1, 0, 0] },
          { geometry: chairLegGeo, position: [cx - 0.18 * s, 0.22 * s, d / 2 + 0.38 * s] },
          { geometry: chairLegGeo, position: [cx + 0.18 * s, 0.22 * s, d / 2 + 0.38 * s] },
          { geometry: chairLegGeo, position: [cx - 0.18 * s, 0.22 * s, d / 2 + 0.06 * s] },
          { geometry: chairLegGeo, position: [cx + 0.18 * s, 0.22 * s, d / 2 + 0.06 * s] },
        ];
        group.add(mergePartsIntoMesh(c2Parts, fabricDarkMaterial));
      });
      break;
    }

    case 'toilet': {
      // Ceramic toilet with smooth rounded bowl & tank
      const w = 0.42 * s;
      const d = 0.68 * s;

      // Soft rounded tank & bowl
      const tankGeo = createRoundedBoxGeometry(w, 0.42 * s, 0.24 * s, 0.04 * s, 3);
      const bowlBase = new THREE.CylinderGeometry(w / 2.2, w / 2.8, 0.42 * s, 24);
      const seatRim = createRoundedBoxGeometry(w * 0.95, 0.04 * s, d * 0.65, 0.04 * s, 3);

      const toiletParts: PartSpec[] = [
        { geometry: tankGeo, position: [0, 0.58 * s, -d / 2 + 0.14 * s] },
        { geometry: bowlBase, position: [0, 0.21 * s, 0.1 * s] },
        { geometry: seatRim, position: [0, 0.43 * s, 0.12 * s] },
      ];
      group.add(mergePartsIntoMesh(toiletParts, ceramicWhiteMaterial));

      // Chrome flush button
      const flushBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.025 * s, 0.025 * s, 0.015 * s, 16), chromeMaterial);
      flushBtn.position.set(0, 0.8 * s, -d / 2 + 0.14 * s);
      group.add(flushBtn);
      break;
    }

    case 'sink': {
      // Modern floating vanity with sculpted basin and chrome gooseneck tap
      const w = 0.85 * s;
      const d = 0.52 * s;
      const h = 0.82 * s;

      // Vanity body
      const bodyGeo = createRoundedBoxGeometry(w, h * 0.85, d, 0.03 * s, 3);
      const vanityMesh = new THREE.Mesh(bodyGeo, woodMaterial);
      vanityMesh.position.y = h / 2 + 0.08 * s;
      vanityMesh.castShadow = true;
      group.add(vanityMesh);

      // Ceramic countertop & basin
      const basinGeo = createRoundedBoxGeometry(w * 0.7, 0.12 * s, d * 0.7, 0.04 * s, 4);
      const basinMesh = new THREE.Mesh(basinGeo, ceramicWhiteMaterial);
      basinMesh.position.set(0, h + 0.07 * s, 0);
      basinMesh.castShadow = true;
      group.add(basinMesh);

      // Chrome tap fixture
      const tapPipe = new THREE.CylinderGeometry(0.014 * s, 0.014 * s, 0.2 * s, 12);
      const tapMesh = new THREE.Mesh(tapPipe, chromeMaterial);
      tapMesh.position.set(0, h + 0.18 * s, -d * 0.22);
      group.add(tapMesh);
      break;
    }

    case 'kitchen-counter': {
      // Premium architectural kitchen island with beveled waterfall countertop
      const w = 2.4 * s;
      const d = 0.7 * s;
      const h = 0.9 * s;

      // Base cabinetry (with recessed toe kick)
      const cabinetGeo = createRoundedBoxGeometry(w - 0.06 * s, h - 0.1 * s, d - 0.06 * s, 0.02 * s, 2);
      const cabinetMesh = new THREE.Mesh(cabinetGeo, metalDarkMaterial);
      cabinetMesh.position.y = (h - 0.1 * s) / 2 + 0.1 * s;
      cabinetMesh.castShadow = true;
      group.add(cabinetMesh);

      // Solid surface marble/quartz countertop with smooth 2cm bevel
      const counterTopGeo = createRoundedBoxGeometry(w + 0.04 * s, 0.06 * s, d + 0.04 * s, 0.02 * s, 3);
      const counterTopMesh = new THREE.Mesh(counterTopGeo, ceramicWhiteMaterial);
      counterTopMesh.position.y = h + 0.03 * s;
      counterTopMesh.castShadow = true;
      group.add(counterTopMesh);

      // Inset under-mount stainless sink
      const sinkGeo = createRoundedBoxGeometry(0.55 * s, 0.02 * s, 0.42 * s, 0.03 * s, 3);
      const sinkMesh = new THREE.Mesh(sinkGeo, chromeMaterial);
      sinkMesh.position.set(-w * 0.28, h + 0.062 * s, 0);
      group.add(sinkMesh);

      // Flush-mount induction glass cooktop
      const cooktopGeo = createRoundedBoxGeometry(0.62 * s, 0.01 * s, 0.48 * s, 0.015 * s, 2);
      const cooktopMesh = new THREE.Mesh(
        cooktopGeo,
        new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.1, metalness: 0.9, wireframe: isWireframe })
      );
      cooktopMesh.position.set(w * 0.28, h + 0.062 * s, 0);
      group.add(cooktopMesh);
      break;
    }

    case 'desk': {
      // Architectural study desk with beveled oak top & slim tubular steel frame
      const w = 1.5 * s;
      const d = 0.75 * s;
      const h = 0.74 * s;

      // Beveled oak top
      const topGeo = createRoundedBoxGeometry(w, 0.038 * s, d, 0.015 * s, 3);
      const topMesh = new THREE.Mesh(topGeo, woodMaterial);
      topMesh.position.y = h;
      topMesh.castShadow = true;
      group.add(topMesh);

      // Tubular steel leg frame (merged)
      const legRadius = 0.018 * s;
      const legGeo = new THREE.CylinderGeometry(legRadius, legRadius, h, 14);
      const deskParts: PartSpec[] = [
        { geometry: legGeo, position: [-w / 2 + 0.08 * s, h / 2, -d / 2 + 0.08 * s] },
        { geometry: legGeo, position: [w / 2 - 0.08 * s, h / 2, -d / 2 + 0.08 * s] },
        { geometry: legGeo, position: [-w / 2 + 0.08 * s, h / 2, d / 2 - 0.08 * s] },
        { geometry: legGeo, position: [w / 2 - 0.08 * s, h / 2, d / 2 - 0.08 * s] },
      ];
      group.add(mergePartsIntoMesh(deskParts, metalDarkMaterial));

      // Modern slim laptop
      const lapGeo = createRoundedBoxGeometry(0.32 * s, 0.012 * s, 0.22 * s, 0.01 * s, 2);
      const lapMesh = new THREE.Mesh(lapGeo, chromeMaterial);
      lapMesh.position.set(0, h + 0.02 * s, 0.04 * s);
      group.add(lapMesh);
      break;
    }

    case 'tree': {
      // Courtyard ornamental architectural olive / ficus tree with smooth sculpted foliage
      const r = 0.85 * s;

      // Tapered ceramic planter pot
      const potGeo = new THREE.CylinderGeometry(0.42 * s, 0.3 * s, 0.48 * s, 24);
      const pot = new THREE.Mesh(potGeo, ceramicWhiteMaterial);
      pot.position.y = 0.24 * s;
      pot.castShadow = true;
      group.add(pot);

      // Trunk with natural curvature
      const trunkGeo = new THREE.CylinderGeometry(0.06 * s, 0.1 * s, 1.5 * s, 12);
      const trunk = new THREE.Mesh(trunkGeo, woodMaterial);
      trunk.position.y = 1.0 * s;
      trunk.castShadow = true;
      group.add(trunk);

      // Sculpted organic foliage spheres with soft normals
      const foliageGeo1 = new THREE.IcosahedronGeometry(r * 0.75, 2);
      const foliageGeo2 = new THREE.IcosahedronGeometry(r * 0.55, 2);
      const foliageParts: PartSpec[] = [
        { geometry: foliageGeo1, position: [0, 1.95 * s, 0] },
        { geometry: foliageGeo2, position: [0.18 * s, 2.3 * s, -0.1 * s] },
      ];
      group.add(mergePartsIntoMesh(foliageParts, foliageMaterial));
      break;
    }

    case 'car': {
      // Streamlined modern electric sedan with curved aerodynamic profile
      const carGroup = new THREE.Group();
      const carMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.25,
        metalness: 0.85,
        wireframe: isWireframe,
      });

      // Beveled sculpted body & aerodynamic cabin
      const bodyGeo = createRoundedBoxGeometry(1.88 * s, 0.42 * s, 4.25 * s, 0.08 * s, 3);
      const bodyMesh = new THREE.Mesh(bodyGeo, carMat);
      bodyMesh.position.y = 0.38 * s;
      bodyMesh.castShadow = true;
      carGroup.add(bodyMesh);

      const cabinGeo = createRoundedBoxGeometry(1.58 * s, 0.44 * s, 2.2 * s, 0.06 * s, 3);
      const cabinMesh = new THREE.Mesh(
        cabinGeo,
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.95, wireframe: isWireframe })
      );
      cabinMesh.position.set(0, 0.8 * s, -0.2 * s);
      cabinMesh.castShadow = true;
      carGroup.add(cabinMesh);

      // 4 Detailed turned wheels
      const wheelGeom = new THREE.CylinderGeometry(0.3 * s, 0.3 * s, 0.22 * s, 20);
      wheelGeom.rotateZ(Math.PI / 2);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85, metalness: 0.1 });

      [
        [-0.95 * s, -1.3 * s],
        [0.95 * s, -1.3 * s],
        [-0.95 * s, 1.3 * s],
        [0.95 * s, 1.3 * s],
      ].forEach(([wx, wz]) => {
        const wheel = new THREE.Mesh(wheelGeom, wheelMat);
        wheel.position.set(wx, 0.3 * s, wz);
        wheel.castShadow = true;
        carGroup.add(wheel);
      });

      group.add(carGroup);
      break;
    }

    case 'shower': {
      // Walk-in flush architectural shower with tempered glass partition & chrome column
      const w = 0.9 * s;
      const d = 0.9 * s;

      // Anti-slip ceramic/slate shower tray
      const trayGeo = createRoundedBoxGeometry(w, 0.035 * s, d, 0.015 * s, 2);
      const trayMesh = new THREE.Mesh(trayGeo, ceramicWhiteMaterial);
      trayMesh.position.y = 0.018 * s;
      trayMesh.receiveShadow = true;
      group.add(trayMesh);

      // Glass screen with realistic physical transmission
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.35,
        roughness: 0.05,
        metalness: 0.05,
        transmission: 0.92,
        ior: 1.5,
        wireframe: isWireframe,
      });
      const glassGeo = new THREE.BoxGeometry(0.012 * s, 2.0 * s, d * 0.75);
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.set(-w / 2 + 0.01 * s, 1.0 * s, d * 0.1);
      group.add(glassMesh);

      // Chrome shower column & rain head
      const pipeGeo = new THREE.CylinderGeometry(0.014 * s, 0.014 * s, 1.8 * s, 12);
      const pipeMesh = new THREE.Mesh(pipeGeo, chromeMaterial);
      pipeMesh.position.set(0, 1.2 * s, -d / 2 + 0.03 * s);
      group.add(pipeMesh);

      const headGeo = new THREE.CylinderGeometry(0.12 * s, 0.12 * s, 0.015 * s, 20);
      const headMesh = new THREE.Mesh(headGeo, chromeMaterial);
      headMesh.position.set(0, 2.1 * s, -d / 2 + 0.22 * s);
      group.add(headMesh);
      break;
    }

    case 'bathtub': {
      // Sculpted freestanding oval bathtub with soft curved geometry
      const w = 1.7 * s;
      const d = 0.78 * s;
      const h = 0.58 * s;

      // Outer tub body with smooth filleted base
      const tubGeo = createRoundedBoxGeometry(w, h, d, 0.12 * s, 4);
      const tubMesh = new THREE.Mesh(tubGeo, ceramicWhiteMaterial);
      tubMesh.position.y = h / 2;
      tubMesh.castShadow = true;
      group.add(tubMesh);

      // Chrome freestanding floor tap
      const tapCol = new THREE.CylinderGeometry(0.02 * s, 0.02 * s, 0.85 * s, 12);
      const tapMesh = new THREE.Mesh(tapCol, chromeMaterial);
      tapMesh.position.set(w / 2 + 0.1 * s, 0.42 * s, 0);
      group.add(tapMesh);
      break;
    }

    case 'armchair': {
      // Modern Scandinavian lounge armchair with curved back & wooden tapered legs
      const w = 0.88 * s;
      const d = 0.82 * s;
      const h = 0.78 * s;

      // Cushion & shell
      const seatGeo = createCushionGeometry(w * 0.78, 0.18 * s, d * 0.72, 0.05 * s);
      const backGeo = createRoundedBoxGeometry(w * 0.82, 0.48 * s, 0.16 * s, 0.06 * s, 3);
      const armL = createRoundedBoxGeometry(0.12 * s, 0.38 * s, d * 0.68, 0.04 * s, 3);
      const armR = createRoundedBoxGeometry(0.12 * s, 0.38 * s, d * 0.68, 0.04 * s, 3);

      const chairParts: PartSpec[] = [
        { geometry: seatGeo, position: [0, 0.34 * s, 0.02 * s] },
        { geometry: backGeo, position: [0, 0.58 * s, -d * 0.26], rotation: [-0.15, 0, 0] },
        { geometry: armL, position: [-w / 2 + 0.08 * s, 0.42 * s, 0] },
        { geometry: armR, position: [w / 2 - 0.08 * s, 0.42 * s, 0] },
      ];
      group.add(mergePartsIntoMesh(chairParts, fabricDarkMaterial));

      // 4 Tapered wood legs
      const legGeo = new THREE.CylinderGeometry(0.022 * s, 0.014 * s, 0.32 * s, 10);
      legGeo.rotateZ(0.08);
      const leg1 = new THREE.Mesh(legGeo, woodMaterial);
      leg1.position.set(-w * 0.32, 0.16 * s, -d * 0.28);
      leg1.castShadow = true;
      group.add(leg1);

      const leg2 = new THREE.Mesh(legGeo, woodMaterial);
      leg2.position.set(w * 0.32, 0.16 * s, -d * 0.28);
      leg2.castShadow = true;
      group.add(leg2);

      const leg3 = new THREE.Mesh(legGeo, woodMaterial);
      leg3.position.set(-w * 0.32, 0.16 * s, d * 0.28);
      leg3.castShadow = true;
      group.add(leg3);

      const leg4 = new THREE.Mesh(legGeo, woodMaterial);
      leg4.position.set(w * 0.32, 0.16 * s, d * 0.28);
      leg4.castShadow = true;
      group.add(leg4);
      break;
    }

    case 'wardrobe': {
      // Architectural full-height wardrobe with subtle vertical door reveals
      const w = 1.8 * s;
      const d = 0.6 * s;
      const h = 2.4 * s;

      const bodyGeo = createRoundedBoxGeometry(w, h, d, 0.02 * s, 3);
      const wardrobeMesh = new THREE.Mesh(bodyGeo, woodMaterial);
      wardrobeMesh.position.y = h / 2;
      wardrobeMesh.castShadow = true;
      group.add(wardrobeMesh);

      // Recessed plinth
      const plinthGeo = new THREE.BoxGeometry(w - 0.04 * s, 0.08 * s, d - 0.04 * s);
      const plinthMesh = new THREE.Mesh(plinthGeo, metalDarkMaterial);
      plinthMesh.position.y = 0.04 * s;
      group.add(plinthMesh);
      break;
    }

    case 'stair': {
      // Parametric flight of stairs complying with CTE DB-SUA 1 & Blondel formula
      const flightW = 1.0 * s;
      const totalH = 2.8 * s;
      const numSteps = 16;
      const stepH = totalH / numSteps; // 17.5cm riser
      const stepD = 0.28 * s;          // 28cm tread

      const stairGroup = new THREE.Group();
      const stepMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.65,
        metalness: 0.05,
        wireframe: isWireframe,
      });

      for (let i = 0; i < numSteps; i++) {
        const stepGeo = createRoundedBoxGeometry(flightW, stepH, stepD, 0.008 * s, 2);
        const stepMesh = new THREE.Mesh(stepGeo, stepMat);
        stepMesh.position.set(0, (i + 0.5) * stepH, (i - numSteps / 2 + 0.5) * stepD);
        stepMesh.castShadow = true;
        stepMesh.receiveShadow = true;
        stairGroup.add(stepMesh);
      }

      // Continuous safety handrail at H = 0.90m
      const railGeo = new THREE.CylinderGeometry(0.02 * s, 0.02 * s, Math.hypot(totalH, numSteps * stepD), 12);
      const railMesh = new THREE.Mesh(railGeo, metalDarkMaterial);
      railMesh.rotation.x = Math.atan2(numSteps * stepD, totalH) - Math.PI / 2;
      railMesh.position.set(flightW / 2 - 0.04 * s, totalH / 2 + 0.9 * s, 0);
      stairGroup.add(railMesh);

      group.add(stairGroup);
      break;
    }

    default: {
      const boxGeo = createRoundedBoxGeometry(1 * s, 0.8 * s, 1 * s, 0.04 * s, 3);
      const box = new THREE.Mesh(boxGeo, woodMaterial);
      box.position.y = 0.4 * s;
      box.castShadow = true;
      group.add(box);
      break;
    }
  }

  return group;
}
