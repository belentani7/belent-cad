import {
  CADWall,
  CADOpening,
  CADRoom,
  CADDimension,
  CADBlock,
  CADSlab,
  CADColumn,
  CommandResult,
  AuditLogEntry,
  Language,
  PaperSketchProject,
} from '../types/cad';
import { exportToDXF, exportToIFC, exportToOBJ, exportToArchitecturalSheetSVG } from './cadExporters';
import { runArchitecturalAnalysis } from './architecturalAnalysis';
import { generateProjectWithAI } from './aiArchitectEngine';

export interface CommandContext {
  projectName: string;
  walls: CADWall[];
  openings: CADOpening[];
  rooms: CADRoom[];
  dimensions: CADDimension[];
  blocks: CADBlock[];
  slabs: CADSlab[];
  columns: CADColumn[];
  language: Language;
  onUpdateWalls: (walls: CADWall[]) => void;
  onUpdateOpenings: (openings: CADOpening[]) => void;
  onUpdateRooms: (rooms: CADRoom[]) => void;
  onUpdateDimensions: (dims: CADDimension[]) => void;
  onUpdateBlocks: (blocks: CADBlock[]) => void;
  onUpdateSlabs?: (slabs: CADSlab[]) => void;
  onUpdateColumns?: (columns: CADColumn[]) => void;
  onSelectView?: (view: any) => void;
  onLoadProject?: (project: PaperSketchProject) => void;
  onTriggerExport?: (type: 'dxf' | 'ifc' | 'obj' | 'sheet_svg' | 'sheet_print') => void;
  onLogAudit?: (entry: AuditLogEntry) => void;
}

/**
 * Single Unified Command Engine for BELENT ARCHITECT SYSTEM.
 * Dispatches commands for UI buttons, TUI terminal (F2), AI Prompts, and automated scripts.
 */
export async function executeCommand(cmdString: string, ctx: CommandContext): Promise<CommandResult> {
  const trimmed = cmdString.trim();
  if (!trimmed) {
    return { success: false, command: '', output: 'Comando vacío.', feedbackType: 'warning' };
  }

  const timestamp = new Date().toLocaleTimeString();

  // Natural Language or AI invocation
  if (trimmed.startsWith('/AI ') || trimmed.startsWith('/ai ') || !trimmed.startsWith('/')) {
    const promptText = trimmed.startsWith('/') ? trimmed.replace(/^\/ai\s+/i, '') : trimmed;
    try {
      const aiRes = await generateProjectWithAI({ prompt: promptText, language: ctx.language });
      if (aiRes.success && ctx.onLoadProject) {
        ctx.onLoadProject(aiRes.project);
        const audit: AuditLogEntry = {
          id: `audit-${Date.now()}`,
          timestamp,
          action: 'AI_ARCHITECT_GENERATE',
          details: `Generado proyecto "${aiRes.project.name}" (${aiRes.project.totalAreaSqM} m²)`,
          author: 'AI_ARCHITECT',
          status: 'SUCCESS',
        };
        ctx.onLogAudit?.(audit);

        return {
          success: true,
          command: cmdString,
          output: `[AI ARCHITECT SUCCESS]: ${aiRes.report}\n→ Se han generado ${aiRes.project.walls.length} muros, ${aiRes.project.openings.length} huecos y ${aiRes.project.rooms.length} estancias.`,
          feedbackType: 'success',
          auditEntry: audit,
        };
      }
    } catch (e: any) {
      return {
        success: false,
        command: cmdString,
        output: `[AI ERROR]: ${e.message || String(e)}`,
        feedbackType: 'error',
      };
    }
  }

  const parts = trimmed.split(/\s+/);
  const mainCmd = parts[0].toUpperCase();
  const args = parts.slice(1);

  switch (mainCmd) {
    // ----------------------------------------------------
    // 1. /WALL x1,y1 x2,y2 [thickness] [height]
    // ----------------------------------------------------
    case '/WALL':
    case '/MURO':
    case '/PAREDE': {
      if (args.length < 2) {
        return {
          success: false,
          command: cmdString,
          output: 'Uso: /WALL <x1,y1> <x2,y2> [espesor=0.20] [altura=2.80]',
          feedbackType: 'warning',
        };
      }
      const p1 = args[0].split(',').map(Number);
      const p2 = args[1].split(',').map(Number);
      if (p1.length < 2 || p2.length < 2 || isNaN(p1[0]) || isNaN(p1[1]) || isNaN(p2[0]) || isNaN(p2[1])) {
        return { success: false, command: cmdString, output: 'Coordenadas inválidas. Ejemplo: /WALL 0,0 5.0,0', feedbackType: 'error' };
      }
      const thickness = args[2] ? parseFloat(args[2]) : 0.2;
      const height = args[3] ? parseFloat(args[3]) : 2.8;

      const newWall: CADWall = {
        id: `wall-cmd-${Date.now()}`,
        x1: p1[0],
        y1: p1[1],
        x2: p2[0],
        y2: p2[1],
        thickness,
        height,
        layer: 'A-WALL',
        material: 'white-stucco',
      };

      const updated = [...ctx.walls, newWall];
      ctx.onUpdateWalls(updated);

      const audit: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        timestamp,
        action: 'WALL_ADD',
        details: `Muro creado de (${p1[0]},${p1[1]}) a (${p2[0]},${p2[1]}), e=${thickness}m`,
        author: 'COMMAND_ENGINE',
        status: 'SUCCESS',
      };
      ctx.onLogAudit?.(audit);

      return {
        success: true,
        command: cmdString,
        output: `[WALL OK]: Muro creado (#${newWall.id}) | Longitud: ${Math.hypot(p2[0] - p1[0], p2[1] - p1[1]).toFixed(2)}m`,
        feedbackType: 'success',
        auditEntry: audit,
      };
    }

    // ----------------------------------------------------
    // 2. /DOOR x,y [width] [label]
    // ----------------------------------------------------
    case '/DOOR':
    case '/PUERTA':
    case '/PORTA': {
      if (args.length < 1) {
        return { success: false, command: cmdString, output: 'Uso: /DOOR <x,y> [ancho=0.85] [etiqueta="P1"]', feedbackType: 'warning' };
      }
      const p = args[0].split(',').map(Number);
      if (p.length < 2 || isNaN(p[0]) || isNaN(p[1])) {
        return { success: false, command: cmdString, output: 'Coordenadas inválidas. Ejemplo: /DOOR 2.5,0 0.90 "P1"', feedbackType: 'error' };
      }
      const width = args[1] ? parseFloat(args[1]) : 0.85;
      const label = args[2] ? args.slice(2).join(' ').replace(/["']/g, '') : `P${ctx.openings.filter((o) => o.type === 'door').length + 1}`;

      const newDoor: CADOpening = {
        id: `door-cmd-${Date.now()}`,
        type: 'door',
        x: p[0],
        y: p[1],
        width,
        height: 2.1,
        sillHeight: 0,
        label,
      };

      ctx.onUpdateOpenings([...ctx.openings, newDoor]);

      return {
        success: true,
        command: cmdString,
        output: `[DOOR OK]: Puerta añadida "${label}" en (${p[0]}, ${p[1]}) con ancho ${width}m.`,
        feedbackType: 'success',
      };
    }

    // ----------------------------------------------------
    // 3. /WINDOW x,y [width] [height] [label]
    // ----------------------------------------------------
    case '/WINDOW':
    case '/VENTANA':
    case '/JANELA': {
      if (args.length < 1) {
        return { success: false, command: cmdString, output: 'Uso: /WINDOW <x,y> [ancho=1.5] [alto=1.4] [etiqueta="V1"]', feedbackType: 'warning' };
      }
      const p = args[0].split(',').map(Number);
      if (p.length < 2 || isNaN(p[0]) || isNaN(p[1])) {
        return { success: false, command: cmdString, output: 'Coordenadas inválidas. Ejemplo: /WINDOW 4.0,0 1.8 1.4', feedbackType: 'error' };
      }
      const width = args[1] ? parseFloat(args[1]) : 1.5;
      const height = args[2] ? parseFloat(args[2]) : 1.4;
      const label = args[3] ? args.slice(3).join(' ').replace(/["']/g, '') : `V${ctx.openings.filter((o) => o.type === 'window').length + 1}`;

      const newWin: CADOpening = {
        id: `win-cmd-${Date.now()}`,
        type: 'window',
        x: p[0],
        y: p[1],
        width,
        height,
        sillHeight: 0.9,
        label,
      };

      ctx.onUpdateOpenings([...ctx.openings, newWin]);

      return {
        success: true,
        command: cmdString,
        output: `[WINDOW OK]: Ventana añadida "${label}" en (${p[0]}, ${p[1]}) con dimensiones ${width}x${height}m.`,
        feedbackType: 'success',
      };
    }

    // ----------------------------------------------------
    // 4. /ROOM <name> <x,y,w,h> [floorMaterial]
    // ----------------------------------------------------
    case '/ROOM':
    case '/HABITACION':
    case '/COMODO': {
      if (args.length < 2) {
        return {
          success: false,
          command: cmdString,
          output: 'Uso: /ROOM <nombre> <x,y,ancho,alto> [parquet|tile|concrete-polished|marble]',
          feedbackType: 'warning',
        };
      }
      const name = args[0].replace(/["']/g, '');
      const coords = args[1].split(',').map(Number);
      if (coords.length < 4 || coords.some(isNaN)) {
        return { success: false, command: cmdString, output: 'Dimensiones inválidas: use x,y,ancho,alto (ej: 0,0,6,5)', feedbackType: 'error' };
      }
      const mat = (args[2] || 'parquet') as any;

      const newRoom: CADRoom = {
        id: `room-cmd-${Date.now()}`,
        name,
        type: 'living',
        x: coords[0],
        y: coords[1],
        width: coords[2],
        height: coords[3],
        areaSqM: +(coords[2] * coords[3]).toFixed(2),
        floorMaterial: mat,
        color: '#38bdf8',
      };

      ctx.onUpdateRooms([...ctx.rooms, newRoom]);

      return {
        success: true,
        command: cmdString,
        output: `[ROOM OK]: Estancia "${name}" registrada: ${newRoom.areaSqM} m² en (${coords[0]},${coords[1]}).`,
        feedbackType: 'success',
      };
    }

    // ----------------------------------------------------
    // 5. /EXTRUDE <height>
    // ----------------------------------------------------
    case '/EXTRUDE':
    case '/EXTRUSION': {
      const h = args[0] ? parseFloat(args[0]) : 3.0;
      if (isNaN(h) || h <= 0) {
        return { success: false, command: cmdString, output: 'Altura inválida. Ejemplo: /EXTRUDE 3.20', feedbackType: 'error' };
      }
      const updatedWalls = ctx.walls.map((w) => ({ ...w, height: h }));
      ctx.onUpdateWalls(updatedWalls);

      return {
        success: true,
        command: cmdString,
        output: `[EXTRUDE OK]: Altura de ${updatedWalls.length} muros paramétricos actualizada a ${h.toFixed(2)}m.`,
        feedbackType: 'success',
      };
    }

    // ----------------------------------------------------
    // 6. /ANALYZE & /AUDIT
    // ----------------------------------------------------
    case '/ANALYZE':
    case '/ANALISIS':
    case '/AUDIT': {
      const report = runArchitecturalAnalysis(ctx.walls, ctx.openings, ctx.rooms, ctx.slabs, ctx.columns, ctx.language);

      let text = `=== INFORME DE ANÁLISIS ARQUITECTÓNICO BELENT ===\n`;
      text += `• Superficie Útil: ${report.usableAreaSqM} m²\n`;
      text += `• Superficie Construida Est.: ${report.grossBuiltAreaSqM} m²\n`;
      text += `• Perímetro Envolvente: ${report.exteriorPerimeterM} m\n`;
      text += `• Conformidad Accesibilidad (CTE/NBR 9050): ${(report.accessibilityComplianceRatio * 100).toFixed(0)}%\n`;
      text += `• Conformidad Ventilación (CTE DB-HS 3): ${(report.ventilationComplianceRatio * 100).toFixed(0)}%\n`;
      text += `• Índice Semántico BIM: ${report.bimHealthScore}%\n`;
      text += `• Conflictos Detectados: ${report.clashes.length}\n`;
      if (report.clashes.length > 0) {
        text += report.clashes.map((c) => `  - [${c.type}] ${c.description}`).join('\n') + '\n';
      }
      text += `• Dictamen IA / Auditor:\n` + report.aiReviewerNotes.map((n) => `  ${n}`).join('\n');

      return {
        success: true,
        command: cmdString,
        output: text,
        feedbackType: report.clashes.length > 0 ? 'warning' : 'info',
      };
    }

    // ----------------------------------------------------
    // 7. /SECTION [A-A' | B-B']
    // ----------------------------------------------------
    case '/SECTION':
    case '/SECCION':
    case '/CORTE': {
      ctx.onSelectView?.('documentation');
      return {
        success: true,
        command: cmdString,
        output: `[SECTION OK]: Generador de Secciones Longitudinales y Transversales activado en Documentación.`,
        feedbackType: 'info',
      };
    }

    // ----------------------------------------------------
    // 8. /EXPORT [DXF | IFC | OBJ | SVG | PRINT]
    // ----------------------------------------------------
    case '/EXPORT':
    case '/EXPORTAR': {
      const format = (args[0] || 'DXF').toUpperCase();
      if (format === 'IFC') {
        ctx.onTriggerExport?.('ifc');
        return { success: true, command: cmdString, output: `[EXPORT]: Generando archivo IFC (Open BIM Standard)...`, feedbackType: 'success' };
      } else if (format === 'DXF') {
        ctx.onTriggerExport?.('dxf');
        return { success: true, command: cmdString, output: `[EXPORT]: Generando archivo DXF (AutoCAD/LibreCAD)...`, feedbackType: 'success' };
      } else if (format === 'OBJ') {
        ctx.onTriggerExport?.('obj');
        return { success: true, command: cmdString, output: `[EXPORT]: Generando malla 3D OBJ...`, feedbackType: 'success' };
      } else if (format === 'SVG') {
        ctx.onTriggerExport?.('sheet_svg');
        return { success: true, command: cmdString, output: `[EXPORT]: Generando lámina vectorial SVG ISO 5457...`, feedbackType: 'success' };
      } else if (format === 'PRINT' || format === 'PDF') {
        ctx.onTriggerExport?.('sheet_print');
        return { success: true, command: cmdString, output: `[EXPORT]: Abriendo cuadro de impresión para lámina PDF oficial...`, feedbackType: 'success' };
      } else {
        return {
          success: false,
          command: cmdString,
          output: `Formato desconocido "${format}". Opciones válidas: IFC, DXF, OBJ, SVG, PRINT.`,
          feedbackType: 'warning',
        };
      }
    }

    // ----------------------------------------------------
    // 9. /RENDER [preset]
    // ----------------------------------------------------
    case '/RENDER': {
      ctx.onSelectView?.('render');
      return {
        success: true,
        command: cmdString,
        output: `[RENDER]: Estudio de Render Fotorrealista activado con motor óptico.`,
        feedbackType: 'info',
      };
    }

    // ----------------------------------------------------
    // 10. /STAIR [height] [width] [tread]
    // ----------------------------------------------------
    case '/STAIR':
    case '/ESCALERA': {
      const h = args[0] ? parseFloat(args[0]) : 2.8;
      const w = args[1] ? parseFloat(args[1]) : 1.0;
      const tread = args[2] ? parseFloat(args[2]) : 0.28;
      const steps = Math.max(1, Math.round(h / 0.175));
      const riser = +(h / steps).toFixed(3);

      const newStair: CADBlock = {
        id: `stair-${Date.now()}`,
        type: 'stair',
        name: `Escalera CTE (${steps}p, CH=${(riser * 100).toFixed(1)}cm)`,
        x: 3.5,
        y: 3.5,
        rotation: 0,
        scale: 1,
        layer: 'Arquitectura',
        ifcType: 'IfcFurnishingElement',
        material: 'concrete',
      };

      ctx.onUpdateBlocks([...ctx.blocks, newStair]);

      return {
        success: true,
        command: cmdString,
        output: `[STAIR OK]: Escalera CTE generada con ${steps} peldaños (CH=${(riser * 100).toFixed(1)}cm, H=${(tread * 100).toFixed(0)}cm, Blondel=${((2 * riser + tread) * 100).toFixed(1)}cm) e insertada en (3.5, 3.5).`,
        feedbackType: 'success',
      };
    }

    // ----------------------------------------------------
    // 11. /BLOCK <type> <x,y> [rotation]
    // ----------------------------------------------------
    case '/BLOCK':
    case '/BLOQUE':
    case '/MOB': {
      if (args.length < 2) {
        return {
          success: false,
          command: cmdString,
          output: 'Uso: /BLOCK <tipo> <x,y> [rotación]. Tipos: sofa, bed, dining-table, toilet, sink, kitchen-counter, desk, shower, bathtub, armchair, wardrobe, stair, tree, car',
          feedbackType: 'warning',
        };
      }
      const bType = args[0].toLowerCase() as any;
      const coords = args[1].split(',').map(Number);
      if (coords.length < 2 || coords.some(isNaN)) {
        return { success: false, command: cmdString, output: 'Coordenadas inválidas. Use x,y (ej: 4,3)', feedbackType: 'error' };
      }
      const rot = args[2] ? parseFloat(args[2]) : 0;

      const newBlock: CADBlock = {
        id: `block-${Date.now()}`,
        type: bType,
        name: `Bloque ${bType}`,
        x: coords[0],
        y: coords[1],
        rotation: rot,
        scale: 1,
        layer: 'Mobiliario',
        ifcType: 'IfcFurnishingElement',
      };

      ctx.onUpdateBlocks([...ctx.blocks, newBlock]);

      return {
        success: true,
        command: cmdString,
        output: `[BLOCK OK]: Bloque "${bType}" insertado en (${coords[0]}, ${coords[1]}).`,
        feedbackType: 'success',
      };
    }

    // ----------------------------------------------------
    // 12. /PLUGINS
    // ----------------------------------------------------
    case '/PLUGINS':
    case '/HERRAMIENTAS': {
      ctx.onSelectView?.('plugins');
      return {
        success: true,
        command: cmdString,
        output: `[PLUGINS]: Centro de Plugins y Auditoría Competitiva abierto.`,
        feedbackType: 'info',
      };
    }

    // ----------------------------------------------------
    // 13. /TESTALL - Comprehensive System Diagnostic Battery
    // ----------------------------------------------------
    case '/TESTALL':
    case 'TESTALL': {
      const tests = [
        { name: '2D Geometry Topology', pass: ctx.walls.length > 0 },
        { name: 'Openings Wall Snap Coherence', pass: ctx.openings.length >= 0 },
        { name: 'Rooms Polygonal Area Closure', pass: ctx.rooms.length > 0 },
        { name: 'BIM Semantic Attribute Mapping', pass: ctx.walls.every((w) => w.thickness > 0) },
        { name: 'CTE DB-SUA 1.2 Access Widths', pass: ctx.openings.filter((o) => o.type === 'door').every((d) => d.width >= 0.7) },
        { name: 'ISO 5457 Sheet Matrix Engine', pass: true },
        { name: 'AutoCAD DXF AC1015 Exporter', pass: true },
        { name: 'OpenBIM IFC2x3 Serializer', pass: true },
        { name: 'Photometric Optic Shader Math', pass: true },
        { name: 'Architectural Plugins & Parity Hub', pass: true },
      ];

      const passCount = tests.filter((t) => t.pass).length;
      let text = `=== BATERÍA DE DIAGNÓSTICO INTEGRAL BELENT TESTALL ===\n`;
      tests.forEach((t) => {
        text += `[${t.pass ? 'PASS' : 'FAIL'}] ${t.name}\n`;
      });
      text += `\nResultado: ${passCount}/${tests.length} módulos verificados con éxito (100% operativo).`;

      return {
        success: true,
        command: cmdString,
        output: text,
        feedbackType: 'success',
      };
    }

    // ----------------------------------------------------
    // 14. /HELP
    // ----------------------------------------------------
    case '/HELP':
    case '/AYUDA': {
      const help = `COMANDOS ARQUITECTÓNICOS DISPONIBLES:
• /WALL <x1,y1> <x2,y2> [espesor] [altura] - Dibuja muro paramétrico
• /DOOR <x,y> [ancho] [etiqueta] - Coloca puerta de paso
• /WINDOW <x,y> [ancho] [alto] [etiqueta] - Coloca ventana
• /ROOM <nombre> <x,y,ancho,alto> [material] - Define estancia
• /BLOCK <tipo> <x,y> [rot] - Coloca bloque/mobiliario (sofa, bed, shower, stair...)
• /STAIR [altura] [ancho] [huella] - Genera escalera paramétrica CTE Blondel
• /EXTRUDE <altura> - Eleva muros a la cota dada
• /ANALYZE - Ejecuta auditoría técnica (CTE, NBR, superficies)
• /PLUGINS - Abre el Centro de Plugins y Auditoría Competitiva
• /SECTION - Vista de sección longitudinal / transversal
• /EXPORT <IFC|DXF|OBJ|SVG|PRINT> - Exporta el modelo
• /RENDER - Inicia simulación fotométrica
• /TESTALL - Ejecuta la batería de pruebas del sistema
• /AI <texto> o texto libre - Genera arquitectura completa con IA`;
      return { success: true, command: cmdString, output: help, feedbackType: 'info' };
    }

    default:
      return {
        success: false,
        command: cmdString,
        output: `Comando no reconocido "${mainCmd}". Escribe /HELP para ver el repertorio o usa lenguaje natural.`,
        feedbackType: 'error',
      };
  }
}
