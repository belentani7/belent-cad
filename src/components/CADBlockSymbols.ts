import { CADBlock } from '../types/cad';

export interface BlockDefinition {
  type: CADBlock['type'];
  name: Record<'es' | 'pt' | 'en', string>;
  category: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'exterior';
  width: number;  // in meters
  height: number; // in meters
}

export const BLOCK_CATALOG: BlockDefinition[] = [
  {
    type: 'sofa',
    name: { es: 'Sofá 3 Plazas', pt: 'Sofá 3 Lugares', en: '3-Seat Sofa' },
    category: 'living',
    width: 2.2,
    height: 0.9,
  },
  {
    type: 'dining-table',
    name: { es: 'Mesa Comedor 6p', pt: 'Mesa Jantar 6p', en: 'Dining Table 6p' },
    category: 'living',
    width: 1.8,
    height: 0.95,
  },
  {
    type: 'bed',
    name: { es: 'Cama Matrimonio', pt: 'Cama de Casal', en: 'Double Bed' },
    category: 'bedroom',
    width: 1.9,
    height: 2.0,
  },
  {
    type: 'desk',
    name: { es: 'Mesa de Trabajo CAD', pt: 'Mesa de Trabalho CAD', en: 'CAD Work Desk' },
    category: 'bedroom',
    width: 1.5,
    height: 0.75,
  },
  {
    type: 'kitchen-counter',
    name: { es: 'Encimera con Fregadero', pt: 'Bancada com Pia', en: 'Kitchen Counter' },
    category: 'kitchen',
    width: 2.4,
    height: 0.65,
  },
  {
    type: 'toilet',
    name: { es: 'Inodoro / WC', pt: 'Vaso Sanitário', en: 'Toilet WC' },
    category: 'bathroom',
    width: 0.45,
    height: 0.7,
  },
  {
    type: 'sink',
    name: { es: 'Lavabo con Espejo', pt: 'Lavatório com Cuba', en: 'Bathroom Sink' },
    category: 'bathroom',
    width: 0.8,
    height: 0.5,
  },
  {
    type: 'shower',
    name: { es: 'Plato Ducha Enrasado', pt: 'Box de Chuveiro', en: 'Walk-in Shower' },
    category: 'bathroom',
    width: 0.9,
    height: 0.9,
  },
  {
    type: 'bathtub',
    name: { es: 'Bañera Exenta Oval', pt: 'Banheira de Imersão', en: 'Freestanding Bathtub' },
    category: 'bathroom',
    width: 1.7,
    height: 0.75,
  },
  {
    type: 'armchair',
    name: { es: 'Sillón Lounge / Lectura', pt: 'Poltrona de Leitura', en: 'Lounge Armchair' },
    category: 'living',
    width: 0.9,
    height: 0.85,
  },
  {
    type: 'wardrobe',
    name: { es: 'Armario Empotrado 3p', pt: 'Armário Embutido', en: 'Fitted Wardrobe' },
    category: 'bedroom',
    width: 1.8,
    height: 0.6,
  },
  {
    type: 'stair',
    name: { es: 'Escalera Tramo Recto CTE', pt: 'Escada Reta CTE', en: 'Straight Flight Stair' },
    category: 'living',
    width: 1.0,
    height: 2.8,
  },
  {
    type: 'tree',
    name: { es: 'Árbol / Planta Patio', pt: 'Árvore / Paisagismo', en: 'Patio Tree / Plant' },
    category: 'exterior',
    width: 1.8,
    height: 1.8,
  },
  {
    type: 'car',
    name: { es: 'Vehículo / Plaza Garaje', pt: 'Veículo / Garagem', en: 'Car / Garage Spot' },
    category: 'exterior',
    width: 2.0,
    height: 4.4,
  },
];

/**
 * Renders an authentic 2D architectural CAD block symbol onto an HTML5 Canvas.
 */
export function drawCADBlock(
  ctx: CanvasRenderingContext2D,
  block: CADBlock,
  screenX: number,
  screenY: number,
  scale: number,
  isSelected: boolean
) {
  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(((block.rotation || 0) * Math.PI) / 180);

  const blockScale = block.scale || 1;
  const strokeColor = isSelected ? '#f59e0b' : '#38bdf8';
  const fillColor = isSelected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.08)';

  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;
  ctx.lineWidth = isSelected ? 2 : 1.2;

  switch (block.type) {
    case 'sofa': {
      const w = 2.2 * scale * blockScale;
      const h = 0.9 * scale * blockScale;
      // Main boundary
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // Backrest
      const backH = h * 0.3;
      ctx.strokeRect(-w / 2, -h / 2, w, backH);

      // Left and right armrests
      const armW = w * 0.12;
      ctx.strokeRect(-w / 2, -h / 2 + backH, armW, h - backH);
      ctx.strokeRect(w / 2 - armW, -h / 2 + backH, armW, h - backH);

      // Cushion seam lines (3 cushions)
      const seatW = w - armW * 2;
      const cW = seatW / 3;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + armW + cW, -h / 2 + backH);
      ctx.lineTo(-w / 2 + armW + cW, h / 2);
      ctx.moveTo(-w / 2 + armW + cW * 2, -h / 2 + backH);
      ctx.lineTo(-w / 2 + armW + cW * 2, h / 2);
      ctx.stroke();
      break;
    }

    case 'bed': {
      const w = 1.9 * scale * blockScale;
      const h = 2.0 * scale * blockScale;
      // Mattress boundary
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // Headboard
      const headH = h * 0.12;
      ctx.fillStyle = isSelected ? 'rgba(245, 158, 11, 0.3)' : 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(-w / 2, -h / 2, w, headH);
      ctx.strokeRect(-w / 2, -h / 2, w, headH);

      // Pillows (2 pillows)
      const pillW = w * 0.38;
      const pillH = h * 0.22;
      const pillY = -h / 2 + headH + 4;
      ctx.strokeRect(-w / 2 + (w * 0.08), pillY, pillW, pillH);
      ctx.strokeRect(w / 2 - (w * 0.08) - pillW, pillY, pillW, pillH);

      // Duvet fold line
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2 + h * 0.45);
      ctx.lineTo(w / 2, -h / 2 + h * 0.45);
      ctx.stroke();
      break;
    }

    case 'dining-table': {
      const w = 1.8 * scale * blockScale;
      const h = 0.95 * scale * blockScale;
      // Tabletop
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // Chairs tucked in
      const chairW = w * 0.25;
      const chairD = h * 0.2;
      // Top 2 chairs
      ctx.strokeRect(-w / 2 + w * 0.15, -h / 2 - chairD, chairW, chairD);
      ctx.strokeRect(w / 2 - w * 0.15 - chairW, -h / 2 - chairD, chairW, chairD);
      // Bottom 2 chairs
      ctx.strokeRect(-w / 2 + w * 0.15, h / 2, chairW, chairD);
      ctx.strokeRect(w / 2 - w * 0.15 - chairW, h / 2, chairW, chairD);
      // Left and right heads
      ctx.strokeRect(-w / 2 - chairD, -h / 4, chairD, h / 2);
      ctx.strokeRect(w / 2, -h / 4, chairD, h / 2);
      break;
    }

    case 'toilet': {
      const w = 0.45 * scale * blockScale;
      const h = 0.7 * scale * blockScale;
      // Water tank
      const tankH = h * 0.28;
      ctx.fillRect(-w / 2, -h / 2, w, tankH);
      ctx.strokeRect(-w / 2, -h / 2, w, tankH);

      // Bowl oval
      ctx.beginPath();
      ctx.ellipse(0, -h / 2 + tankH + (h - tankH) / 2, w * 0.45, (h - tankH) / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'sink': {
      const w = 0.8 * scale * blockScale;
      const h = 0.5 * scale * blockScale;
      // Counter
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // Basin
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.35, h * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Tap circle
      ctx.beginPath();
      ctx.arc(0, -h * 0.32, 3, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'kitchen-counter': {
      const w = 2.4 * scale * blockScale;
      const h = 0.65 * scale * blockScale;
      // Main counter top
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // Sink on left
      const sinkW = w * 0.35;
      ctx.strokeRect(-w / 2 + w * 0.08, -h / 2 + h * 0.15, sinkW, h * 0.7);

      // 4-burner cooktop on right
      const stoveX = w / 2 - w * 0.4;
      const stoveW = w * 0.32;
      ctx.strokeRect(stoveX, -h / 2 + h * 0.15, stoveW, h * 0.7);
      // Burner circles
      const r = h * 0.12;
      ctx.beginPath();
      ctx.arc(stoveX + stoveW * 0.3, -h / 2 + h * 0.35, r, 0, Math.PI * 2);
      ctx.arc(stoveX + stoveW * 0.7, -h / 2 + h * 0.35, r, 0, Math.PI * 2);
      ctx.arc(stoveX + stoveW * 0.3, -h / 2 + h * 0.65, r, 0, Math.PI * 2);
      ctx.arc(stoveX + stoveW * 0.7, -h / 2 + h * 0.65, r, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'desk': {
      const w = 1.5 * scale * blockScale;
      const h = 0.75 * scale * blockScale;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // Laptop/Screen
      const lapW = w * 0.35;
      const lapH = h * 0.3;
      ctx.strokeRect(-lapW / 2, -h / 2 + h * 0.15, lapW, lapH);

      // Office chair circle
      ctx.beginPath();
      ctx.arc(0, h / 2 + h * 0.25, h * 0.22, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'tree': {
      const r = 0.9 * scale * blockScale;
      // Trunk center
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Outer foliage cloud circle
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner branching
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * (r * 0.75), Math.sin(a) * (r * 0.75));
      }
      ctx.stroke();
      break;
    }

    case 'car': {
      const w = 2.0 * scale * blockScale;
      const h = 4.4 * scale * blockScale;
      // Car chassis rounded rect
      const cr = 6;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, [cr, cr, cr, cr]);
      ctx.fill();
      ctx.stroke();

      // Windshield & rear window
      const winW = w * 0.75;
      ctx.strokeRect(-winW / 2, -h * 0.25, winW, h * 0.18);
      ctx.strokeRect(-winW / 2, h * 0.15, winW, h * 0.15);

      // Side mirrors
      ctx.strokeRect(-w / 2 - 4, -h * 0.25, 4, 10);
      ctx.strokeRect(w / 2, -h * 0.25, 4, 10);
      break;
    }

    case 'shower': {
      const w = 0.9 * scale * blockScale;
      const h = 0.9 * scale * blockScale;
      // Shower tray outline
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // Water drainage fall diagonals
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(0, 0);
      ctx.moveTo(w / 2, -h / 2);
      ctx.lineTo(0, 0);
      ctx.moveTo(-w / 2, h / 2);
      ctx.lineTo(0, 0);
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(0, 0);
      ctx.stroke();

      // Drain drain circle
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.stroke();

      // Glass screen fixed edge
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-w / 2, h / 2);
      ctx.lineTo(w * 0.2, h / 2);
      ctx.stroke();
      ctx.lineWidth = isSelected ? 2 : 1.2;
      break;
    }

    case 'bathtub': {
      const w = 1.7 * scale * blockScale;
      const h = 0.75 * scale * blockScale;
      // Outer tub rim
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, [12, 12, 12, 12]);
      ctx.fill();
      ctx.stroke();

      // Inner tub basin
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, [16, 16, 16, 16]);
      ctx.stroke();

      // Drain hole
      ctx.beginPath();
      ctx.arc(w / 2 - 16, 0, 4, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'armchair': {
      const w = 0.9 * scale * blockScale;
      const h = 0.85 * scale * blockScale;
      // Main frame
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, [8, 8, 4, 4]);
      ctx.fill();
      ctx.stroke();

      // Curved backrest
      const backH = h * 0.28;
      ctx.strokeRect(-w / 2, -h / 2, w, backH);

      // Armrests
      const armW = w * 0.16;
      ctx.strokeRect(-w / 2, -h / 2 + backH, armW, h - backH);
      ctx.strokeRect(w / 2 - armW, -h / 2 + backH, armW, h - backH);

      // Central cushion
      ctx.beginPath();
      ctx.roundRect(-w / 2 + armW + 2, -h / 2 + backH + 2, w - armW * 2 - 4, h - backH - 4, [4, 4, 4, 4]);
      ctx.stroke();
      break;
    }

    case 'wardrobe': {
      const w = 1.8 * scale * blockScale;
      const h = 0.6 * scale * blockScale;
      // Outer cabinet
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // 3 Sliding doors with offset tracks
      const doorW = w / 3;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + doorW, -h / 2);
      ctx.lineTo(-w / 2 + doorW, h / 2);
      ctx.moveTo(-w / 2 + doorW * 2, -h / 2);
      ctx.lineTo(-w / 2 + doorW * 2, h / 2);
      ctx.stroke();

      // Clothes hanger dashed rod
      ctx.beginPath();
      ctx.setLineDash([4, 3]);
      ctx.moveTo(-w / 2 + 8, 0);
      ctx.lineTo(w / 2 - 8, 0);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }

    case 'stair': {
      const w = 1.0 * scale * blockScale;
      const h = 2.8 * scale * blockScale;
      // Outer stair stringer flight outline
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // 14 Treads (huellas de 28cm)
      const numTreads = 14;
      const stepH = h / numTreads;
      ctx.beginPath();
      for (let i = 1; i < numTreads; i++) {
        const y = -h / 2 + i * stepH;
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
      }
      ctx.stroke();

      // Walkline and direction arrow (subida)
      ctx.beginPath();
      ctx.moveTo(0, h / 2 - 10);
      ctx.lineTo(0, -h / 2 + 16);
      // Arrow head
      ctx.lineTo(-6, -h / 2 + 24);
      ctx.moveTo(0, -h / 2 + 16);
      ctx.lineTo(6, -h / 2 + 24);
      ctx.stroke();

      // Start circle dot
      ctx.beginPath();
      ctx.arc(0, h / 2 - 10, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Text "SUBE"
      ctx.fillStyle = isSelected ? '#f59e0b' : '#38bdf8';
      ctx.font = 'bold 8px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SUBE 2.80m', 0, 4);
      break;
    }

    default: {
      const size = 1.0 * scale * blockScale;
      ctx.strokeRect(-size / 2, -size / 2, size, size);
      ctx.beginPath();
      ctx.moveTo(-size / 2, -size / 2);
      ctx.lineTo(size / 2, size / 2);
      ctx.moveTo(size / 2, -size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.stroke();
      break;
    }
  }

  // Label
  ctx.fillStyle = isSelected ? '#f59e0b' : '#94a3b8';
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(block.name, 0, (block.type === 'car' ? 2.5 : 1.2) * scale * blockScale + 12);

  ctx.restore();
}
