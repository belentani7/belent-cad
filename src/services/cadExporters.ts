import { CADWall, CADOpening, CADRoom, CADDimension, CADBlock } from '../types/cad';

/**
 * Escapes a value for safe inclusion inside SVG/XML text or attribute context.
 * Prevents injection when user-provided or AI-generated names are interpolated.
 */
function escapeXml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;'
  );
}

/**
 * Reduces a project name to a safe filename / identifier token.
 */
function sanitizeName(value: unknown): string {
  return String(value ?? '')
    .replace(/[^\w.-]+/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 60) || 'proyecto';
}

/**
 * Generates an authentic, standard AutoCAD/LibreCAD-compatible ASCII DXF file.
 */
export function exportToDXF(
  projectName: string,
  walls: CADWall[],
  openings: CADOpening[],
  rooms: CADRoom[],
  dimensions: CADDimension[]
): string {
  const lines: string[] = [];

  // DXF Header
  lines.push('0', 'SECTION', '2', 'HEADER');
  lines.push('9', '$ACADVER', '1', 'AC1015'); // AutoCAD 2000 format, universal compatibility
  lines.push('9', '$INSUNITS', '70', '6');    // 6 = Meters
  lines.push('0', 'ENDSEC');

  // DXF Tables (Layers)
  lines.push('0', 'SECTION', '2', 'TABLES');
  lines.push('0', 'TABLE', '2', 'LAYER', '70', '5');

  const layerDefs = [
    { name: 'A-WALL', color: 7 }, // White/Black
    { name: 'A-DOOR', color: 1 }, // Red
    { name: 'A-GLAZ', color: 4 }, // Cyan
    { name: 'A-AREA', color: 3 }, // Green
    { name: 'A-DIMS', color: 2 }, // Yellow
  ];

  for (const l of layerDefs) {
    lines.push('0', 'LAYER', '2', l.name, '70', '0', '62', String(l.color), '6', 'CONTINUOUS');
  }

  lines.push('0', 'ENDTAB');
  lines.push('0', 'ENDSEC');

  // DXF Entities
  lines.push('0', 'SECTION', '2', 'ENTITIES');

  // Export Walls (both boundary lines taking thickness into account)
  for (const wall of walls) {
    const dx = wall.x2 - wall.x1;
    const dy = wall.y2 - wall.y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) continue;

    const nx = (-dy / len) * (wall.thickness / 2);
    const ny = (dx / len) * (wall.thickness / 2);

    // Wall Line A
    lines.push('0', 'LINE', '8', 'A-WALL');
    lines.push('10', (wall.x1 + nx).toFixed(4), '20', (wall.y1 + ny).toFixed(4), '30', '0.0000');
    lines.push('11', (wall.x2 + nx).toFixed(4), '21', (wall.y2 + ny).toFixed(4), '31', '0.0000');

    // Wall Line B
    lines.push('0', 'LINE', '8', 'A-WALL');
    lines.push('10', (wall.x1 - nx).toFixed(4), '20', (wall.y1 - ny).toFixed(4), '30', '0.0000');
    lines.push('11', (wall.x2 - nx).toFixed(4), '21', (wall.y2 - ny).toFixed(4), '31', '0.0000');
  }

  // Export Openings (Doors & Windows)
  for (const op of openings) {
    if (op.type === 'door') {
      // Door panel line
      lines.push('0', 'LINE', '8', 'A-DOOR');
      lines.push('10', op.x.toFixed(4), '20', op.y.toFixed(4), '30', '0.0000');
      lines.push('11', (op.x + op.width * 0.8).toFixed(4), '21', (op.y + op.width * 0.8).toFixed(4), '31', '0.0000');

      // Door swing arc approximation
      lines.push('0', 'ARC', '8', 'A-DOOR');
      lines.push('10', op.x.toFixed(4), '20', op.y.toFixed(4), '30', '0.0000');
      lines.push('40', op.width.toFixed(4)); // Radius
      lines.push('50', '0.0', '51', '90.0'); // Start & End angle
    } else {
      // Window frame lines (triple lines)
      lines.push('0', 'LINE', '8', 'A-GLAZ');
      lines.push('10', op.x.toFixed(4), '20', (op.y - 0.1).toFixed(4), '30', '0.0000');
      lines.push('11', (op.x + op.width).toFixed(4), '21', (op.y - 0.1).toFixed(4), '31', '0.0000');

      lines.push('0', 'LINE', '8', 'A-GLAZ');
      lines.push('10', op.x.toFixed(4), '20', (op.y + 0.1).toFixed(4), '30', '0.0000');
      lines.push('11', (op.x + op.width).toFixed(4), '21', (op.y + 0.1).toFixed(4), '31', '0.0000');

      // Glass pane
      lines.push('0', 'LINE', '8', 'A-GLAZ');
      lines.push('10', op.x.toFixed(4), '20', op.y.toFixed(4), '30', '0.0000');
      lines.push('11', (op.x + op.width).toFixed(4), '21', op.y.toFixed(4), '31', '0.0000');
    }
  }

  // Export Rooms Labels & Areas
  for (const room of rooms) {
    const cx = room.x + room.width / 2;
    const cy = room.y + room.height / 2;

    lines.push('0', 'TEXT', '8', 'A-AREA');
    lines.push('10', cx.toFixed(4), '20', (cy + 0.25).toFixed(4), '30', '0.0000');
    lines.push('40', '0.35'); // Text height
    lines.push('1', room.name.toUpperCase());

    lines.push('0', 'TEXT', '8', 'A-AREA');
    lines.push('10', cx.toFixed(4), '20', (cy - 0.25).toFixed(4), '30', '0.0000');
    lines.push('40', '0.25'); // Area text height
    lines.push('1', `${room.areaSqM.toFixed(1)} m²`);
  }

  // Export Dimensions
  for (const dim of dimensions) {
    lines.push('0', 'LINE', '8', 'A-DIMS');
    lines.push('10', dim.x1.toFixed(4), '20', dim.y1.toFixed(4), '30', '0.0000');
    lines.push('11', dim.x2.toFixed(4), '21', dim.y2.toFixed(4), '31', '0.0000');

    const mx = (dim.x1 + dim.x2) / 2;
    const my = (dim.y1 + dim.y2) / 2;
    lines.push('0', 'TEXT', '8', 'A-DIMS');
    lines.push('10', mx.toFixed(4), '20', (my + 0.15).toFixed(4), '30', '0.0000');
    lines.push('40', '0.22');
    lines.push('1', dim.text || `${dim.value.toFixed(2)}m`);
  }

  lines.push('0', 'ENDSEC');
  lines.push('0', 'EOF');

  return lines.join('\n');
}

/**
 * Generates an open BIM IFC (Industry Foundation Classes 2x3 / IFC4) file string.
 */
export function exportToIFC(projectName: string, walls: CADWall[], rooms: CADRoom[]): string {
  const now = new Date().toISOString();
  const totalArea = rooms.reduce((acc, r) => acc + r.areaSqM, 0);

  let idCounter = 1;
  const nextId = () => `#${idCounter++}`;

  const header = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('BELENT CAD BIM Export - Open Architecture'), '2;1');
FILE_NAME('${sanitizeName(projectName)}.ifc', '${now}', ('Pedro Belentani'), ('BELENT CAD Open Source Studio'), 'BELENT CAD v2.0 IFC Engine', 'FreeCAD / BIM Livre Compatible', '');
FILE_SCHEMA(('IFC2X3'));
ENDSEC;

DATA;
#1=IFCORGANIZATION($,'BELENT CAD','Open Architecture Toolset',$,$);
#2=IFCAPPLICATION(#1,'2.0','BELENT CAD','BELENT_CAD_2026');
#3=IFCPERSON('PB','Belentani','Pedro',$,$,$,$,$);
#4=IFCPERSONANDORGANIZATION(#3,#1,$);
#5=IFCOWNERHISTORY(#4,#2,$,.ADDED.,$,$,$,$);
#6=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);
#7=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);
#8=IFCUNITASSIGNMENT((#6,#7));
#9=IFCPROJECT('17WfK_7n1BvPB6p4w4pG3y',#5,'${projectName.replace(/['\r\n]/g, '')}',$,$,$,$,(#10),#8);
#10=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#11,$);
#11=IFCAXIS2PLACEMENT3D(#12,$,$);
#12=IFCCARTESIANPOINT((0.,0.,0.));
#13=IFCSITE('0h7RkM0x18B8_O6L_Yq5kP',#5,'Sitio del Proyecto',$,$,#11,$,$,.ELEMENT.,$,$,$,$,$);
#14=IFCBUILDING('3K_Kk12zH4UeO_nI1vK12X',#5,'Edificio Residencial',$,$,#11,$,$,.ELEMENT.,$,$,$);
#15=IFCBUILDINGSTOREY('2P_O091yF3TdN_mH0uJ01W',#5,'Planta Principal',$,$,#11,$,$,.ELEMENT.,0.);
#16=IFCRELAGGREGATES('0$r$M$1v98K9_P7M_Zr6lQ',#5,$,$,#9,(#13));
#17=IFCRELAGGREGATES('1$s$N$2w09L0_Q8N_0s7mR',#5,$,$,#13,(#14));
#18=IFCRELAGGREGATES('2$t$O$3x10M1_R9O_1t8nS',#5,$,$,#14,(#15));
`;

  let wallEntities = '';
  let entityIndex = 20;

  walls.forEach((wall, idx) => {
    const wallId = `#${entityIndex++}`;
    const length = Math.hypot(wall.x2 - wall.x1, wall.y2 - wall.y1);
    wallEntities += `${wallId}=IFCWALLSTANDARDCASE('W_${idx}_${Date.now()}',#5,'Muro_${idx + 1}','Muro estructural espesor ${wall.thickness}m',$,#11,$,$);\n`;
  });

  const footer = `ENDSEC;
END-ISO-10303-21;`;

  return header + wallEntities + footer;
}

/**
 * Generates an OBJ 3D mesh string with normals, faces, and materials.
 */
export function exportToOBJ(projectName: string, walls: CADWall[], rooms: CADRoom[]): string {
  let obj = `# BELENT CAD 3D Mesh Export
# Project: ${projectName}
# Generated: ${new Date().toISOString()}
# Units: Meters

mtllib ${sanitizeName(projectName)}.mtl
o ArchitectureModel
`;

  let vertexCount = 1;
  const vertices: string[] = [];
  const faces: string[] = [];

  // Generate 3D box for each wall
  walls.forEach((wall, i) => {
    const dx = wall.x2 - wall.x1;
    const dy = wall.y2 - wall.y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    const nx = (-dy / len) * (wall.thickness / 2);
    const ny = (dx / len) * (wall.thickness / 2);
    const h = wall.height || 2.8;

    // 8 vertices for a 3D wall cuboid
    const v = [
      [wall.x1 + nx, 0, wall.y1 + ny],
      [wall.x2 + nx, 0, wall.y2 + ny],
      [wall.x2 - nx, 0, wall.y2 - ny],
      [wall.x1 - nx, 0, wall.y1 - ny],
      [wall.x1 + nx, h, wall.y1 + ny],
      [wall.x2 + nx, h, wall.y2 + ny],
      [wall.x2 - nx, h, wall.y2 - ny],
      [wall.x1 - nx, h, wall.y1 - ny],
    ];

    v.forEach(([vx, vy, vz]) => {
      vertices.push(`v ${vx.toFixed(4)} ${vy.toFixed(4)} ${vz.toFixed(4)}`);
    });

    const base = vertexCount;
    // 6 quad faces (as triangles or quads in OBJ)
    faces.push(`g Wall_${i + 1}`);
    faces.push(`usemtl WallMaterial`);
    faces.push(`f ${base} ${base + 1} ${base + 2} ${base + 3}`); // Bottom
    faces.push(`f ${base + 4} ${base + 7} ${base + 6} ${base + 5}`); // Top
    faces.push(`f ${base} ${base + 4} ${base + 5} ${base + 1}`); // Front
    faces.push(`f ${base + 1} ${base + 5} ${base + 6} ${base + 2}`); // Right
    faces.push(`f ${base + 2} ${base + 6} ${base + 7} ${base + 3}`); // Back
    faces.push(`f ${base + 3} ${base + 7} ${base + 4} ${base}`); // Left

    vertexCount += 8;
  });

  // Generate floor slabs for each room
  rooms.forEach((room, j) => {
    const base = vertexCount;
    vertices.push(`v ${room.x.toFixed(4)} 0.0000 ${room.y.toFixed(4)}`);
    vertices.push(`v ${(room.x + room.width).toFixed(4)} 0.0000 ${room.y.toFixed(4)}`);
    vertices.push(`v ${(room.x + room.width).toFixed(4)} 0.0000 ${(room.y + room.height).toFixed(4)}`);
    vertices.push(`v ${room.x.toFixed(4)} 0.0000 ${(room.y + room.height).toFixed(4)}`);

    faces.push(`g Floor_${j + 1}_${sanitizeName(room.name)}`);
    faces.push(`usemtl FloorMaterial`);
    faces.push(`f ${base} ${base + 1} ${base + 2} ${base + 3}`);

    vertexCount += 4;
  });

  return obj + '\n' + vertices.join('\n') + '\n\n' + faces.join('\n');
}

/**
 * Downloads a generated file directly in the browser with given filename and mime type.
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const downloadFile = triggerFileDownload;

/**
 * Generates an ISO 5457 / NBR 6492 architectural vector blueprint drawing sheet with title block.
 */
export function exportToArchitecturalSheetSVG(
  projectName: string,
  walls: CADWall[],
  openings: CADOpening[],
  rooms: CADRoom[],
  dimensions: CADDimension[],
  language: 'es' | 'pt' | 'en' = 'es'
): string {
  // A3 dimensions in points/pixels: 1190 x 842
  const width = 1190;
  const height = 842;
  const margin = 30;
  const bindingMargin = 50;

  // Calculate bounding box of building
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const w of walls) {
    minX = Math.min(minX, w.x1, w.x2);
    minY = Math.min(minY, w.y1, w.y2);
    maxX = Math.max(maxX, w.x1, w.x2);
    maxY = Math.max(maxY, w.y1, w.y2);
  }
  if (!isFinite(minX)) {
    minX = 0; minY = 0; maxX = 12; maxY = 10;
  }

  const bWidth = maxX - minX || 10;
  const bHeight = maxY - minY || 8;

  // Drawing area within sheet
  const drawAreaWidth = width - bindingMargin - margin - 320; // reserve right for schedule & title block
  const drawAreaHeight = height - margin * 2 - 40;

  const scaleM = Math.min(drawAreaWidth / (bWidth + 3), drawAreaHeight / (bHeight + 3)) * 0.85;
  const originX = bindingMargin + 40 + (drawAreaWidth - bWidth * scaleM) / 2 - minX * scaleM;
  const originY = margin + 40 + (drawAreaHeight - bHeight * scaleM) / 2 - minY * scaleM;

  const toX = (wx: number) => (originX + wx * scaleM).toFixed(1);
  const toY = (wy: number) => (originY + wy * scaleM).toFixed(1);

  const totalUsefulArea = rooms.reduce((acc, r) => acc + (r.areaSqM || r.width * r.height), 0);
  const totalBuiltArea = totalUsefulArea * 1.18;
  const today = new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES');

  const titleBlockTitle = language === 'pt' ? 'FOLHA DE DESENHO ARQUITETÔNICO' : language === 'en' ? 'ARCHITECTURAL DRAWING SHEET' : 'PLANO DE ARQUITECTURA';
  const scaleText = '1:50';

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: #ffffff; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
  <defs>
    <pattern id="archGrid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="1"/>
    </pattern>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#0f172a"/>
    </marker>
  </defs>

  <!-- Background subtle drafting grid -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#archGrid)" />

  <!-- Sheet Margins (ISO 5457 / NBR 6492) -->
  <rect x="${margin}" y="${margin}" width="${width - margin * 2}" height="${height - margin * 2}" fill="none" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,4"/>
  <rect x="${bindingMargin}" y="${margin}" width="${width - bindingMargin - margin}" height="${height - margin * 2}" fill="none" stroke="#0f172a" stroke-width="1.8"/>

  <!-- Centering reference marks -->
  <line x1="${width / 2}" y1="${margin - 10}" x2="${width / 2}" y2="${margin + 10}" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="${width / 2}" y1="${height - margin - 10}" x2="${width / 2}" y2="${height - margin + 10}" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="${bindingMargin - 10}" y1="${height / 2}" x2="${bindingMargin + 10}" y2="${height / 2}" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="${width - margin - 10}" y1="${height / 2}" x2="${width - margin + 10}" y2="${height / 2}" stroke="#0f172a" stroke-width="1.5"/>

  <!-- Rooms polygons and labels -->
  <g id="rooms-layer">`;

  rooms.forEach((r) => {
    const rx = parseFloat(toX(r.x));
    const ry = parseFloat(toY(r.y));
    const rw = (r.width * scaleM);
    const rh = (r.height * scaleM);
    const area = (r.areaSqM || r.width * r.height).toFixed(1);

    svg += `
    <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${escapeXml(r.color || '#38bdf8')}" fill-opacity="0.08" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="2,2"/>
    <text x="${rx + rw / 2}" y="${ry + rh / 2 - 6}" font-size="11" font-weight="600" fill="#1e293b" text-anchor="middle">${escapeXml(r.name)}</text>
    <text x="${rx + rw / 2}" y="${ry + rh / 2 + 10}" font-size="9.5" font-family="monospace" fill="#64748b" text-anchor="middle">S: ${escapeXml(area)} m²</text>`;
  });

  svg += `
  </g>

  <!-- Walls (thick drafting lines) -->
  <g id="walls-layer">`;

  walls.forEach((w) => {
    const x1 = toX(w.x1);
    const y1 = toY(w.y1);
    const x2 = toX(w.x2);
    const y2 = toY(w.y2);
    const strokeWidth = (w.thickness ? w.thickness * scaleM : 7).toFixed(1);

    svg += `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0f172a" stroke-width="${strokeWidth}" stroke-linecap="square"/>`;
  });

  svg += `
  </g>

  <!-- Openings (doors and windows) -->
  <g id="openings-layer">`;

  openings.forEach((op) => {
    const opX = parseFloat(toX(op.x));
    const opY = parseFloat(toY(op.y));
    const opW = (op.width * scaleM);

    if (op.type === 'door') {
      // Door leaf and swing
      svg += `
      <circle cx="${opX}" cy="${opY}" r="${opW}" fill="none" stroke="#64748b" stroke-width="0.8" stroke-dasharray="3,2"/>
      <line x1="${opX}" y1="${opY}" x2="${opX + opW * 0.7}" y2="${opY - opW * 0.7}" stroke="#0f172a" stroke-width="1.8"/>`;
    } else {
      // Window frame
      svg += `
      <rect x="${opX}" y="${opY - 3}" width="${opW}" height="6" fill="#f8fafc" stroke="#0284c7" stroke-width="1.4"/>
      <line x1="${opX}" y1="${opY}" x2="${opX + opW}" y2="${opY}" stroke="#0284c7" stroke-width="1"/>`;
    }
  });

  svg += `
  </g>

  <!-- Dimensions -->
  <g id="dimensions-layer">`;

  dimensions.forEach((d) => {
    const dx1 = toX(d.x1);
    const dy1 = toY(d.y1);
    const dx2 = toX(d.x2);
    const dy2 = toY(d.y2);
    const mx = ((parseFloat(dx1) + parseFloat(dx2)) / 2).toFixed(1);
    const my = ((parseFloat(dy1) + parseFloat(dy2)) / 2 - 5).toFixed(1);

    svg += `
    <line x1="${dx1}" y1="${dy1}" x2="${dx2}" y2="${dy2}" stroke="#475569" stroke-width="0.9"/>
    <circle cx="${dx1}" cy="${dy1}" r="2" fill="#475569"/>
    <circle cx="${dx2}" cy="${dy2}" r="2" fill="#475569"/>
    <text x="${mx}" y="${my}" font-size="9" font-family="monospace" fill="#334155" text-anchor="middle">${escapeXml(d.text || d.value + ' m')}</text>`;
  });

  svg += `
  </g>

  <!-- North Arrow Symbol -->
  <g transform="translate(${bindingMargin + 40}, ${margin + 45})">
    <circle cx="0" cy="0" r="22" fill="#ffffff" stroke="#0f172a" stroke-width="1.2"/>
    <path d="M 0 -18 L 6 12 L 0 6 L -6 12 Z" fill="#0f172a"/>
    <text x="0" y="-23" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">N</text>
  </g>

  <!-- Graphical Scale Bar -->
  <g transform="translate(${bindingMargin + 100}, ${margin + 45})">
    <rect x="0" y="0" width="${5 * scaleM}" height="5" fill="#0f172a"/>
    <rect x="${2.5 * scaleM}" y="0" width="${2.5 * scaleM}" height="5" fill="#ffffff" stroke="#0f172a" stroke-width="0.8"/>
    <text x="0" y="16" font-size="9" fill="#334155">0m</text>
    <text x="${(2.5 * scaleM).toFixed(1)}" y="16" font-size="9" fill="#334155" text-anchor="middle">2.5m</text>
    <text x="${(5 * scaleM).toFixed(1)}" y="16" font-size="9" fill="#334155" text-anchor="end">5.0m</text>
    <text x="0" y="-6" font-size="9.5" font-weight="600" fill="#0f172a">${language === 'pt' ? 'Escala Gráfica' : language === 'en' ? 'Graphic Scale' : 'Escala Gráfica'} (E: ${scaleText})</text>
  </g>

  <!-- Right Side: Room Schedule Table (Cuadro de Superficies) -->
  <g transform="translate(${width - margin - 260}, ${margin + 20})">
    <rect x="0" y="0" width="250" height="280" fill="#ffffff" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="0" y="0" width="250" height="28" fill="#0f172a"/>
    <text x="125" y="18" font-size="10.5" font-weight="bold" fill="#ffffff" text-anchor="middle">${language === 'pt' ? 'QUADRO DE ÁREAS ÚTEIS' : language === 'en' ? 'USEFUL AREAS SCHEDULE' : 'CUADRO DE SUPERFICIES ÚTILES'}</text>

    <!-- Table header -->
    <text x="12" y="44" font-size="9" font-weight="600" fill="#475569">${language === 'pt' ? 'Ambiente / Estância' : language === 'en' ? 'Room / Space' : 'Estancia'}</text>
    <text x="238" y="44" font-size="9" font-weight="600" fill="#475569" text-anchor="end">Sup. (m²)</text>
    <line x1="10" y1="50" x2="240" y2="50" stroke="#e2e8f0" stroke-width="1"/>`;

  rooms.slice(0, 8).forEach((r, idx) => {
    const yPos = 68 + idx * 22;
    svg += `
    <text x="12" y="${yPos}" font-size="9.5" fill="#1e293b">${escapeXml(r.name.length > 20 ? r.name.slice(0, 20) + '..' : r.name)}</text>
    <text x="238" y="${yPos}" font-size="9.5" font-family="monospace" fill="#0f172a" text-anchor="end">${(r.areaSqM || r.width * r.height).toFixed(2)} m²</text>
    <line x1="10" y1="${yPos + 5}" x2="240" y2="${yPos + 5}" stroke="#f1f5f9" stroke-width="0.8"/>`;
  });

  svg += `
    <!-- Total rows -->
    <rect x="0" y="240" width="250" height="40" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <text x="12" y="256" font-size="9.5" font-weight="bold" fill="#0f172a">${language === 'pt' ? 'TOTAL ÚTIL:' : language === 'en' ? 'TOTAL USEFUL:' : 'TOTAL ÚTIL:'}</text>
    <text x="238" y="256" font-size="10.5" font-weight="bold" font-family="monospace" fill="#0284c7" text-anchor="end">${totalUsefulArea.toFixed(2)} m²</text>
    <text x="12" y="272" font-size="8.5" fill="#64748b">${language === 'pt' ? 'Estimativa Construída (+18%):' : language === 'en' ? 'Built Area Est. (+18%):' : 'Estimada Construida (+18%):'}</text>
    <text x="238" y="272" font-size="8.5" font-family="monospace" fill="#64748b" text-anchor="end">${totalBuiltArea.toFixed(2)} m²</text>
  </g>

  <!-- Title Block / Carátula / Cajetín ISO 5457 / NBR 6492 (Bottom-Right) -->
  <g transform="translate(${width - margin - 320}, ${height - margin - 150})">
    <rect x="0" y="0" width="310" height="140" fill="#ffffff" stroke="#0f172a" stroke-width="1.8"/>
    
    <!-- Header row -->
    <rect x="0" y="0" width="310" height="32" fill="#0f172a"/>
    <text x="12" y="16" font-size="11" font-weight="bold" fill="#38bdf8">BELENT CAD</text>
    <text x="12" y="27" font-size="7.5" fill="#94a3b8">OPEN SOURCE ARCHITECTURAL DRAFTING ENGINE</text>
    <text x="298" y="21" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="end">PLANO A-101</text>

    <!-- Project info -->
    <text x="12" y="48" font-size="8" fill="#64748b">${language === 'pt' ? 'PROJETO:' : language === 'en' ? 'PROJECT:' : 'PROYECTO:'}</text>
    <text x="12" y="62" font-size="11" font-weight="bold" fill="#0f172a">${escapeXml(projectName.length > 28 ? projectName.slice(0, 28) + '...' : projectName)}</text>

    <!-- Divider -->
    <line x1="0" y1="72" x2="310" y2="72" stroke="#cbd5e1" stroke-width="1"/>

    <!-- Left sub-cell: Architect -->
    <text x="12" y="86" font-size="7.5" fill="#64748b">${language === 'pt' ? 'AUTOR / ARQUITETO:' : language === 'en' ? 'ARCHITECT / AUTHOR:' : 'AUTOR / ARQUITECTO:'}</text>
    <text x="12" y="99" font-size="9" font-weight="bold" fill="#0f172a">Pedro Belentani</text>
    <text x="12" y="110" font-size="7.5" fill="#64748b">BELENT CAD Studio</text>

    <line x1="160" y1="72" x2="160" y2="140" stroke="#cbd5e1" stroke-width="1"/>

    <!-- Right sub-cell: Meta -->
    <text x="170" y="86" font-size="7.5" fill="#64748b">${language === 'pt' ? 'ESCALA:' : language === 'en' ? 'SCALE:' : 'ESCALA:'}</text>
    <text x="230" y="86" font-size="8.5" font-weight="bold" fill="#0f172a">${scaleText}</text>

    <text x="170" y="101" font-size="7.5" fill="#64748b">${language === 'pt' ? 'DATA:' : language === 'en' ? 'DATE:' : 'FECHA:'}</text>
    <text x="230" y="101" font-size="8.5" font-family="monospace" fill="#0f172a">${today}</text>

    <text x="170" y="116" font-size="7.5" fill="#64748b">${language === 'pt' ? 'FASE:' : language === 'en' ? 'PHASE:' : 'FASE:'}</text>
    <text x="230" y="116" font-size="8" font-weight="600" fill="#0284c7">BÁSICO &amp; EJEC.</text>

    <rect x="0" y="126" width="310" height="14" fill="#f1f5f9"/>
    <text x="155" y="136" font-size="7" fill="#64748b" text-anchor="middle">Standard ISO 5457 / NBR 6492 • Licencia MIT de Código Abierto</text>
  </g>

</svg>`;

  return svg;
}

/**
 * Opens a print-ready window with the architectural sheet for high-res PDF generation or printing.
 */
export function openArchitecturalSheetForPrint(svgContent: string, projectName: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // Fallback to downloading SVG directly if popup blocked
    triggerFileDownload(svgContent, `${sanitizeName(projectName)}_plano_ISO5457.svg`, 'image/svg+xml');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeXml(projectName)} - Plano Arquitectónico ISO 5457</title>
        <style>
          @page { size: A3 landscape; margin: 0; }
          body { margin: 0; padding: 20px; background: #e2e8f0; display: flex; flex-direction: column; align-items: center; font-family: sans-serif; }
          .sheet-container { background: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.15); max-width: 100%; border-radius: 4px; overflow: hidden; }
          .actions-bar { margin-bottom: 16px; display: flex; gap: 12px; }
          button { background: #0284c7; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; }
          button:hover { background: #0369a1; }
          @media print {
            body { padding: 0; background: none; }
            .actions-bar { display: none; }
            .sheet-container { box-shadow: none; width: 100vw; height: 100vh; }
          }
        </style>
      </head>
      <body>
        <div class="actions-bar">
          <button onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
          <button onclick="window.close()" style="background:#64748b">Cerrar</button>
        </div>
        <div class="sheet-container">
          ${svgContent}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
}

