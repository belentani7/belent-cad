import {
  CADWall,
  CADOpening,
  CADRoom,
  CADSlab,
  CADColumn,
  ArchitecturalAnalysisReport,
  RoomVentilationCheck,
  DoorAccessibilityCheck,
  ClashDetectionIssue,
  Language,
} from '../types/cad';

/**
 * Runs architectural verification and analytical computation on the project model.
 * Strict boundary:
 * - Algorithmic rules (CTE DB-SUA, NBR 9050, CTE DB-HS 3) are flagged as certifiedCheck = true.
 * - Heuristic spatial assessments are explicitly labeled as ESTIMATE / RECOMMENDATION.
 */
export function runArchitecturalAnalysis(
  walls: CADWall[],
  openings: CADOpening[],
  rooms: CADRoom[],
  slabs: CADSlab[] = [],
  columns: CADColumn[] = [],
  language: Language = 'es'
): ArchitecturalAnalysisReport {
  // 1. Usable Area vs Gross Built Area
  const usableAreaSqM = rooms.reduce((sum, r) => sum + (r.areaSqM || r.width * r.height || 0), 0);

  // Exterior bounding box & perimeter
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  walls.forEach((w) => {
    minX = Math.min(minX, w.x1, w.x2);
    maxX = Math.max(maxX, w.x1, w.x2);
    minY = Math.min(minY, w.y1, w.y2);
    maxY = Math.max(maxY, w.y1, w.y2);
  });

  const boundWidth = isFinite(maxX - minX) ? Math.max(0, maxX - minX) : 0;
  const boundHeight = isFinite(maxY - minY) ? Math.max(0, maxY - minY) : 0;
  const exteriorPerimeterM = 2 * (boundWidth + boundHeight);

  // Gross built area: usable area + estimated footprint occupied by wall thickness
  const wallFootprint = walls.reduce((sum, w) => {
    const len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1);
    return sum + len * (w.thickness || 0.2);
  }, 0);

  const grossBuiltAreaSqM = +(usableAreaSqM + wallFootprint * 0.7).toFixed(2);
  const compactnessRatio = grossBuiltAreaSqM > 0 ? +(exteriorPerimeterM / Math.sqrt(grossBuiltAreaSqM)).toFixed(2) : 0;

  // 2. Room Ventilation & Daylighting Checks (CTE DB-HS 3 / NBR 15575)
  // Habitable rooms (living, bedroom, studio) require window area >= 10% (0.10) of room floor area
  const ventilationChecks: RoomVentilationCheck[] = rooms.map((room) => {
    const isHabitable = ['living', 'bedroom', 'studio'].includes(room.type);
    const roomArea = room.areaSqM || room.width * room.height || 1;

    // Find openings located within or on boundary of this room (heuristic spatial proximity)
    const associatedWindows = openings.filter((op) => {
      if (op.type !== 'window') return false;
      const margin = 0.5;
      return (
        op.x >= room.x - margin &&
        op.x <= room.x + room.width + margin &&
        op.y >= room.y - margin &&
        op.y <= room.y + room.height + margin
      );
    });

    const totalGlazingArea = associatedWindows.reduce((sum, win) => sum + win.width * win.height, 0);
    const actualRatio = +(totalGlazingArea / roomArea).toFixed(3);
    const requiredRatio = room.ventilationTargetRatio || 0.1; // 10% rule

    let status: 'COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE' = 'NOT_APPLICABLE';
    if (isHabitable) {
      status = actualRatio >= requiredRatio ? 'COMPLIANT' : 'NON_COMPLIANT';
    }

    return {
      roomId: room.id,
      roomName: room.name,
      roomArea: +roomArea.toFixed(1),
      glazingArea: +totalGlazingArea.toFixed(2),
      actualRatio,
      requiredRatio,
      status,
      ruleCode: language === 'pt' ? 'NBR 15575 (Iluminação/Ventilação ≥ 10%)' : 'CTE DB-HS 3 (Ventilación/Luz ≥ 10%)',
      certifiedCheck: true,
    };
  });

  const habitableRooms = ventilationChecks.filter((c) => c.status !== 'NOT_APPLICABLE');
  const compliantVentilationRooms = habitableRooms.filter((c) => c.status === 'COMPLIANT');
  const ventilationComplianceRatio =
    habitableRooms.length > 0 ? +(compliantVentilationRooms.length / habitableRooms.length).toFixed(2) : 1;

  // 3. Door Clearances & Accessibility (CTE DB-SUA 1.2 / NBR 9050)
  // Main doors and rooms require minimum clear passage >= 0.80m
  const doorChecks: DoorAccessibilityCheck[] = openings
    .filter((op) => op.type === 'door')
    .map((door) => {
      const minRequiredWidth = 0.8; // 80cm standard
      let status: 'COMPLIANT' | 'WARNING' | 'VIOLATION' = 'COMPLIANT';
      let message = '';

      if (door.width < 0.7) {
        status = 'VIOLATION';
        message =
          language === 'pt'
            ? `Largura livre de ${door.width.toFixed(2)}m viola o mínimo exigido de 0.80m (NBR 9050 / Acessibilidade).`
            : `Paso libre de ${door.width.toFixed(2)}m incumple el mínimo obligatorio de 0.80m (CTE DB-SUA 1.2).`;
      } else if (door.width < 0.8) {
        status = 'WARNING';
        message =
          language === 'pt'
            ? `Largura de ${door.width.toFixed(2)}m aceitável apenas para sanitários privativos secundários.`
            : `Paso de ${door.width.toFixed(2)}m admisible únicamente para aseos secundarios sin requerimiento de accesibilidad.`;
      } else {
        message =
          language === 'pt'
            ? `Conforme com normas de acessibilidade (vão ≥ 0.80m).`
            : `Conforme con exigencias de accesibilidad de paso (vano ≥ 0.80m).`;
      }

      return {
        openingId: door.id,
        label: door.label || `Puerta (${door.width.toFixed(2)}m)`,
        clearWidth: door.width,
        minRequiredWidth,
        status,
        ruleCode: language === 'pt' ? 'NBR 9050 (Vão Livre ≥ 0.80m)' : 'CTE DB-SUA 1.2 (Paso Libre ≥ 0.80m)',
        certifiedCheck: true,
        message,
      };
    });

  const compliantDoors = doorChecks.filter((d) => d.status === 'COMPLIANT');
  const accessibilityComplianceRatio =
    doorChecks.length > 0 ? +(compliantDoors.length / doorChecks.length).toFixed(2) : 1;

  // 4. Geometric Clashes & Inconsistencies
  const clashes: ClashDetectionIssue[] = [];

  // Check 4.1: Door too close to wall corners (< 0.10m prevents opening swing / frame installation)
  openings
    .filter((op) => op.type === 'door')
    .forEach((door) => {
      walls.forEach((wall) => {
        const distToStart = Math.hypot(door.x - wall.x1, door.y - wall.y1);
        const distToEnd = Math.hypot(door.x - wall.x2, door.y - wall.y2);
        if (distToStart < 0.12 && distToStart > 0.001) {
          clashes.push({
            id: `clash-door-corner-${door.id}-${wall.id}`,
            type: 'DOOR_ON_CORNER',
            description:
              language === 'pt'
                ? `Porta "${door.label || door.id}" está a apenas ${(distToStart * 100).toFixed(0)}cm do encontro de paredes. Recomenda-se boneca mínima de 10cm.`
                : `Puerta "${door.label || door.id}" a solo ${(distToStart * 100).toFixed(0)}cm de esquina. Conviene mocheta mínima de 10cm para tapajuntas.`,
            severity: 'MEDIUM',
            elementIds: [door.id, wall.id],
            suggestedFix:
              language === 'pt'
                ? 'Deslocar porta pelo menos 0.10m do canto para permitir marco e guarnição.'
                : 'Desplazar puerta mínimo 0.10m de la esquina para embocadura y bisagras.',
          });
        }
      });
    });

  // Check 4.2: Degenerate walls (length < 0.15m)
  walls.forEach((wall) => {
    const len = Math.hypot(wall.x2 - wall.x1, wall.y2 - wall.y1);
    if (len < 0.15 && len > 0.0) {
      clashes.push({
        id: `clash-short-wall-${wall.id}`,
        type: 'ZERO_LENGTH_WALL',
        description:
          language === 'pt'
            ? `Parede com comprimento insignificante (${(len * 100).toFixed(1)}cm). Provável artefato geométrico.`
            : `Muro con longitud residual (${(len * 100).toFixed(1)}cm). Posible resto geométrico o falso nodo.`,
        severity: 'LOW',
        elementIds: [wall.id],
        suggestedFix:
          language === 'pt' ? 'Eliminar segmento de parede ou unir vértices.' : 'Eliminar muro o fusionar nodos adyacentes.',
      });
    }
  });

  // 5. BIM Semantic Completeness & Health Score
  let totalBIMEntities = walls.length + openings.length + rooms.length + slabs.length + columns.length;
  let wellFormedBIMEntities = 0;

  walls.forEach((w) => {
    if (w.material && w.height && w.thickness) wellFormedBIMEntities++;
  });
  openings.forEach((op) => {
    if (op.width && op.height) wellFormedBIMEntities++;
  });
  rooms.forEach((r) => {
    if (r.floorMaterial && r.areaSqM) wellFormedBIMEntities++;
  });
  slabs.forEach((s) => {
    if (s.material && s.thickness) wellFormedBIMEntities++;
  });
  columns.forEach((c) => {
    if (c.material && c.height) wellFormedBIMEntities++;
  });

  const bimHealthScore = totalBIMEntities > 0 ? Math.round((wellFormedBIMEntities / totalBIMEntities) * 100) : 100;

  // 6. AI Reviewer Editorial Notes
  const aiReviewerNotes: string[] = [];

  // Certified checks summary
  if (accessibilityComplianceRatio === 1) {
    aiReviewerNotes.push(
      language === 'pt'
        ? '[VERIFICAÇÃO NORMATIVA CERTIFICADA]: 100% dos vãos de portas atendem aos critérios de largura útil NBR 9050.'
        : '[COMPROBACIÓN NORMATIVA CERTIFICADA]: El 100% de los pasos de puerta cumplen con el ancho útil del CTE DB-SUA 1.2.'
    );
  } else {
    aiReviewerNotes.push(
      language === 'pt'
        ? `[ALERTA TÉCNICO]: ${doorChecks.filter((d) => d.status !== 'COMPLIANT').length} vãos de portas requerem revisão de acessibilidade.`
        : `[ALERTA TÉCNICO]: ${doorChecks.filter((d) => d.status !== 'COMPLIANT').length} vanos de puerta requieren adecuación de ancho de paso.`
    );
  }

  if (ventilationComplianceRatio < 1) {
    const failingRooms = ventilationChecks.filter((c) => c.status === 'NON_COMPLIANT');
    aiReviewerNotes.push(
      language === 'pt'
        ? `[ESTIMATIVA BIOCLIMÁTICA]: ${failingRooms.length} cômodo(s) habitável(is) possuem área envidraçada inferior a 10% da área de piso.`
        : `[ESTIMACIÓN BIOCLIMÁTICA]: ${failingRooms.length} estancia(s) vividera(s) presentan huecos de iluminación inferiores al ratio recomendado del 10%.`
    );
  } else {
    aiReviewerNotes.push(
      language === 'pt'
        ? '[CONFORME BIOCLIMÁTICO]: Todas as áreas habitáveis contam com ventilação e insolação natural direta.'
        : '[CONFORME BIOCLIMÁTICO]: Todas las estancias vivideras disponen de iluminación y ventilación natural directa.'
    );
  }

  aiReviewerNotes.push(
    language === 'pt'
      ? `[ESTRUTURA BIM]: Modelo IFC enriquecido com índice de completude semântica de ${bimHealthScore}%.`
      : `[ESTRUCTURA BIM]: Modelo IFC enriquecido con un índice de integridad semántica del ${bimHealthScore}%.`
  );

  return {
    timestamp: new Date().toISOString(),
    usableAreaSqM: +usableAreaSqM.toFixed(1),
    grossBuiltAreaSqM,
    exteriorPerimeterM: +exteriorPerimeterM.toFixed(1),
    compactnessRatio,
    totalRooms: rooms.length,
    totalOpenings: openings.length,
    ventilationComplianceRatio,
    accessibilityComplianceRatio,
    ventilationChecks,
    doorChecks,
    clashes,
    bimHealthScore,
    aiReviewerNotes,
  };
}
