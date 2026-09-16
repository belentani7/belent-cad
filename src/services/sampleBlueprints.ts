import { CADWall, CADOpening, CADRoom, CADDimension, CADBlock, PaperSketchProject } from '../types/cad';

export const SAMPLE_PROJECTS: PaperSketchProject[] = [
  {
    id: 'casa-patio',
    name: 'Casa Patio Iberoamericana (120 m²)',
    timestamp: Date.now(),
    scale: '1:50',
    totalAreaSqM: 124.5,
    confidence: 0.96,
    architecturalReport: 'Proyecto residencial organizado en torno a un patio central ajardinado con galería perimetral. Óptima ventilación cruzada y captación solar pasiva según CTE y NBR 15575.',
    walls: [
      // Outer perimeter walls (thickness 0.25m)
      { id: 'w-ext-1', x1: 0, y1: 0, x2: 12, y2: 0, thickness: 0.25, height: 2.8, layer: 'A-WALL', isExterior: true },
      { id: 'w-ext-2', x1: 12, y1: 0, x2: 12, y2: 10, thickness: 0.25, height: 2.8, layer: 'A-WALL', isExterior: true },
      { id: 'w-ext-3', x1: 12, y1: 10, x2: 0, y2: 10, thickness: 0.25, height: 2.8, layer: 'A-WALL', isExterior: true },
      { id: 'w-ext-4', x1: 0, y1: 10, x2: 0, y2: 0, thickness: 0.25, height: 2.8, layer: 'A-WALL', isExterior: true },

      // Central patio courtyard perimeter
      { id: 'w-patio-1', x1: 4.5, y1: 3.5, x2: 7.5, y2: 3.5, thickness: 0.15, height: 2.8, layer: 'A-WALL' },
      { id: 'w-patio-2', x1: 7.5, y1: 3.5, x2: 7.5, y2: 6.5, thickness: 0.15, height: 2.8, layer: 'A-WALL' },
      { id: 'w-patio-3', x1: 7.5, y1: 6.5, x2: 4.5, y2: 6.5, thickness: 0.15, height: 2.8, layer: 'A-WALL' },
      { id: 'w-patio-4', x1: 4.5, y1: 6.5, x2: 4.5, y2: 3.5, thickness: 0.15, height: 2.8, layer: 'A-WALL' },

      // Interior partitions
      { id: 'w-int-1', x1: 0, y1: 6, x2: 4.5, y2: 6, thickness: 0.15, height: 2.8, layer: 'A-WALL' },
      { id: 'w-int-2', x1: 7.5, y1: 6, x2: 12, y2: 6, thickness: 0.15, height: 2.8, layer: 'A-WALL' },
      { id: 'w-int-3', x1: 8.5, y1: 0, x2: 8.5, y2: 3.5, thickness: 0.15, height: 2.8, layer: 'A-WALL' },
      { id: 'w-int-4', x1: 8.5, y1: 6, x2: 8.5, y2: 10, thickness: 0.15, height: 2.8, layer: 'A-WALL' },
    ],
    openings: [
      // Doors
      { id: 'op-d1', type: 'door', x: 2.0, y: 0.0, width: 0.9, height: 2.1, sillHeight: 0, label: 'Acceso Principal' },
      { id: 'op-d2', type: 'door', x: 2.5, y: 6.0, width: 0.8, height: 2.1, sillHeight: 0, label: 'Paso Dormitorio' },
      { id: 'op-d3', type: 'door', x: 6.0, y: 3.5, width: 1.2, height: 2.2, sillHeight: 0, style: 'sliding', label: 'Salida al Patio' },
      { id: 'op-d4', type: 'door', x: 10.0, y: 6.0, width: 0.8, height: 2.1, sillHeight: 0, label: 'Paso Baño Suite' },

      // Windows
      { id: 'op-w1', type: 'window', x: 5.0, y: 0.0, width: 1.8, height: 1.4, sillHeight: 0.9, label: 'Ventana Salón' },
      { id: 'op-w2', type: 'window', x: 12.0, y: 2.0, width: 1.4, height: 1.4, sillHeight: 0.9, label: 'Ventana Cocina' },
      { id: 'op-w3', type: 'window', x: 2.0, y: 10.0, width: 1.5, height: 1.4, sillHeight: 0.9, label: 'Ventana Dormitorio 1' },
      { id: 'op-w4', type: 'window', x: 9.5, y: 10.0, width: 1.5, height: 1.4, sillHeight: 0.9, label: 'Ventana Dormitorio 2' },
    ],
    rooms: [
      { id: 'r-1', name: 'Salón - Estar', type: 'living', x: 0, y: 0, width: 4.5, height: 6.0, areaSqM: 27.0, floorMaterial: 'parquet', color: '#ef4444' },
      { id: 'r-2', name: 'Patio Ajardinado', type: 'patio', x: 4.5, y: 3.5, width: 3.0, height: 3.0, areaSqM: 9.0, floorMaterial: 'deck-wood', color: '#10b981' },
      { id: 'r-3', name: 'Cocina & Comedor', type: 'kitchen', x: 8.5, y: 0, width: 3.5, height: 6.0, areaSqM: 21.0, floorMaterial: 'tile', color: '#f59e0b' },
      { id: 'r-4', name: 'Dormitorio Principal', type: 'bedroom', x: 0, y: 6.0, width: 4.5, height: 4.0, areaSqM: 18.0, floorMaterial: 'parquet', color: '#818cf8' },
      { id: 'r-5', name: 'Dormitorio 2 / Estudio', type: 'studio', x: 4.5, y: 6.5, width: 4.0, height: 3.5, areaSqM: 14.0, floorMaterial: 'parquet', color: '#a855f7' },
      { id: 'r-6', name: 'Baño Principal', type: 'bathroom', x: 8.5, y: 6.0, width: 3.5, height: 4.0, areaSqM: 14.0, floorMaterial: 'marble', color: '#ec4899' },
    ],
    dimensions: [
      { id: 'dim-1', x1: 0, y1: -0.6, x2: 12, y2: -0.6, offset: -0.6, value: 12.0, text: '12.00 m' },
      { id: 'dim-2', x1: -0.6, y1: 0, x2: -0.6, y2: 10, offset: -0.6, value: 10.0, text: '10.00 m' },
      { id: 'dim-3', x1: 4.5, y1: 3.0, x2: 7.5, y2: 3.0, offset: -0.4, value: 3.0, text: '3.00 m Patio' },
      { id: 'dim-4', x1: 12.6, y1: 0, x2: 12.6, y2: 6.0, offset: 0.6, value: 6.0, text: '6.00 m' },
    ],
    blocks: [
      { id: 'b-sofa', type: 'sofa', name: 'Sofá 3 Plazas', x: 1.5, y: 2.0, rotation: 0, scale: 1, layer: 'A-MOBI' },
      { id: 'b-bed1', type: 'bed', name: 'Cama Matrimonio', x: 2.0, y: 8.0, rotation: 90, scale: 1, layer: 'A-MOBI' },
      { id: 'b-dining', type: 'dining-table', name: 'Mesa Comedor 6p', x: 10.0, y: 3.0, rotation: 0, scale: 1, layer: 'A-MOBI' },
      { id: 'b-tree', type: 'tree', name: 'Olivo en Patio', x: 6.0, y: 5.0, rotation: 0, scale: 1.2, layer: 'A-MOBI' },
    ]
  },
  {
    id: 'loft-moderno',
    name: 'Loft de Arquitectura & Taller 3D (85 m²)',
    timestamp: Date.now() - 3600000,
    scale: '1:50',
    totalAreaSqM: 85.0,
    confidence: 0.98,
    architecturalReport: 'Espacio diáfano industrial reconvertido. Estructura de hormigón visto, grandes ventanales de doble acristalamiento y zona de maquetas.',
    walls: [
      { id: 'wl-1', x1: 0, y1: 0, x2: 10, y2: 0, thickness: 0.3, height: 3.4, layer: 'A-WALL', isExterior: true },
      { id: 'wl-2', x1: 10, y1: 0, x2: 10, y2: 8.5, thickness: 0.3, height: 3.4, layer: 'A-WALL', isExterior: true },
      { id: 'wl-3', x1: 10, y1: 8.5, x2: 0, y2: 8.5, thickness: 0.3, height: 3.4, layer: 'A-WALL', isExterior: true },
      { id: 'wl-4', x1: 0, y1: 8.5, x2: 0, y2: 0, thickness: 0.3, height: 3.4, layer: 'A-WALL', isExterior: true },

      // Service core box
      { id: 'wl-s1', x1: 7, y1: 5.5, x2: 10, y2: 5.5, thickness: 0.15, height: 2.6, layer: 'A-WALL' },
      { id: 'wl-s2', x1: 7, y1: 5.5, x2: 7, y2: 8.5, thickness: 0.15, height: 2.6, layer: 'A-WALL' },
    ],
    openings: [
      { id: 'op-l-d1', type: 'door', x: 1.0, y: 0.0, width: 1.0, height: 2.3, sillHeight: 0, label: 'Puerta Pivotante' },
      { id: 'op-l-w1', type: 'window', x: 3.5, y: 0.0, width: 5.5, height: 2.4, sillHeight: 0.4, label: 'Muro Cortina' },
      { id: 'op-l-w2', type: 'window', x: 2.0, y: 8.5, width: 4.0, height: 2.0, sillHeight: 0.8, label: 'Ventanal Norte' },
      { id: 'op-l-ds', type: 'door', x: 7.0, y: 6.5, width: 0.8, height: 2.1, sillHeight: 0, label: 'Baño / Aseo' },
    ],
    rooms: [
      { id: 'rl-1', name: 'Estudio / Taller CAD & Maquetas', type: 'studio', x: 0, y: 0, width: 7.0, height: 8.5, areaSqM: 59.5, floorMaterial: 'concrete-polished', color: '#0ea5e9' },
      { id: 'rl-2', name: 'Cocina Abierta', type: 'kitchen', x: 7.0, y: 0, width: 3.0, height: 5.5, areaSqM: 16.5, floorMaterial: 'concrete-polished', color: '#f59e0b' },
      { id: 'rl-3', name: 'Baño de Diseño', type: 'bathroom', x: 7.0, y: 5.5, width: 3.0, height: 3.0, areaSqM: 9.0, floorMaterial: 'tile', color: '#10b981' },
    ],
    dimensions: [
      { id: 'dim-l1', x1: 0, y1: -0.6, x2: 10, y2: -0.6, offset: -0.6, value: 10.0, text: '10.00 m' },
      { id: 'dim-l2', x1: -0.6, y1: 0, x2: -0.6, y2: 8.5, offset: -0.6, value: 8.5, text: '8.50 m' },
    ],
    blocks: [
      { id: 'bl-desk', type: 'desk', name: 'Mesa de Dibujo & PC CAD', x: 2.5, y: 4.5, rotation: 0, scale: 1.2, layer: 'A-MOBI' },
      { id: 'bl-sofa', type: 'sofa', name: 'Zona de Reunión Clientes', x: 3.0, y: 1.8, rotation: 0, scale: 1, layer: 'A-MOBI' },
    ]
  }
];

export const RENDER_STYLES = [
  {
    id: 'red-terracotta-carmine',
    name: 'Rojo Carmín & Terracota Cerámica',
    description: 'Ladrillo cerámico rojo cara vista, muros de estuco carmesí, celosías de arcilla cocida y luz cálida rasante.',
    wallColor: '#b91c1c',
    wallRoughness: 0.55,
    floorTexture: 'Baldosa de Barro Cocido Rojo',
    floorRoughness: 0.4,
    lightingPreset: 'golden-hour' as const,
    skyColor: '#fca5a5',
    groundColor: '#450a0a',
    sunIntensity: 2.0,
    sunAzimuth: 50,
    sunElevation: 30,
    ambientOcclusion: 0.9,
    sampleImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'modern-iberoamerican',
    name: 'Moderno Iberoamericano',
    description: 'Hormigón blanco, celosías de terracota, luz dorada vespertina y vegetación autóctona.',
    wallColor: '#e2e8f0',
    wallRoughness: 0.45,
    floorTexture: 'Madera Roble Claro',
    floorRoughness: 0.3,
    lightingPreset: 'golden-hour' as const,
    skyColor: '#fdba74',
    groundColor: '#78716c',
    sunIntensity: 1.8,
    sunAzimuth: 45,
    sunElevation: 28,
    ambientOcclusion: 0.85,
    sampleImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'mediterranean-minimal',
    name: 'Mediterráneo Blanco & Madera',
    description: 'Muros de estuco a la cal, carpinterías de iroko, sombras limpias y luz solar directa.',
    wallColor: '#f8fafc',
    wallRoughness: 0.6,
    floorTexture: 'Travertino Romano',
    floorRoughness: 0.5,
    lightingPreset: 'noon-sun' as const,
    skyColor: '#7dd3fc',
    groundColor: '#d6d3d1',
    sunIntensity: 2.2,
    sunAzimuth: 135,
    sunElevation: 65,
    ambientOcclusion: 0.7,
    sampleImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'brutalist-poetic',
    name: 'Brutalismo Poético & Agua',
    description: 'Hormigón entablillado, vigas vistas, lámina de agua reflectante y contrastes volumétricos.',
    wallColor: '#94a3b8',
    wallRoughness: 0.75,
    floorTexture: 'Hormigón Pulido Microcemento',
    floorRoughness: 0.2,
    lightingPreset: 'blue-hour' as const,
    skyColor: '#38bdf8',
    groundColor: '#475569',
    sunIntensity: 1.2,
    sunAzimuth: 220,
    sunElevation: 18,
    ambientOcclusion: 0.95,
    sampleImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'scandinavian-bio',
    name: 'Nórdico Biofílico',
    description: 'Estructura de madera laminada (CLT), ventanales de triple vidrio y luz natural difusa.',
    wallColor: '#f1f5f9',
    wallRoughness: 0.35,
    floorTexture: 'Tarima de Pino Báltico',
    floorRoughness: 0.4,
    lightingPreset: 'overcast' as const,
    skyColor: '#cbd5e1',
    groundColor: '#64748b',
    sunIntensity: 1.4,
    sunAzimuth: 180,
    sunElevation: 40,
    ambientOcclusion: 0.65,
    sampleImage: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
  }
];
