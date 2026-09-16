export type Language = 'es' | 'pt' | 'en';

export type ViewMode =
  | 'cad2d'
  | 'viewer3d'
  | 'split2d3d'
  | 'documentation'
  | 'analysis'
  | 'render'
  | 'converter'
  | 'opensource'
  | 'plugins'
  | 'tui';

export type SystemStatus = 'idle' | 'active' | 'processing' | 'success' | 'error';

export interface CADPoint {
  x: number;
  y: number;
}

export interface CADWall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number; // in meters (e.g. 0.25, 0.15)
  height: number;    // in meters (e.g. 2.80)
  layer: string;
  isExterior?: boolean;
  material?: 'concrete' | 'brick' | 'white-stucco' | 'wood' | 'glass' | 'stone';
  ifcType?: 'IfcWallStandardCase' | 'IfcCurtainWall';
  fireRating?: 'EI-30' | 'EI-60' | 'EI-90' | 'EI-120' | 'None';
  thermalU?: number; // W/m²K
  acousticDb?: number; // dB
  structural?: boolean;
}

export interface CADOpening {
  id: string;
  wallId?: string;
  type: 'door' | 'window';
  x: number;
  y: number;
  width: number;       // in meters (e.g. 0.90 for doors, 1.40 for windows)
  height: number;      // e.g. 2.10
  sillHeight: number;  // 0 for doors, 0.90 for windows
  style?: 'hinge-left' | 'hinge-right' | 'sliding' | 'pivot' | 'fixed-glass' | 'double-hinge';
  label?: string;
  ifcType?: 'IfcDoor' | 'IfcWindow';
  glazingType?: 'single' | 'double-lowE' | 'triple-acoustic';
  frameMaterial?: 'aluminum-dark' | 'timber-oak' | 'pvc-white' | 'steel-black';
  fireRating?: 'EI-30' | 'EI-60' | 'None';
}

export interface CADRoom {
  id: string;
  name: string;
  type: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'hall' | 'patio' | 'terrace' | 'garage' | 'studio' | 'corridor';
  x: number;
  y: number;
  width: number;
  height: number;
  areaSqM: number;
  floorMaterial: 'parquet' | 'concrete-polished' | 'marble' | 'terrazzo' | 'tile' | 'deck-wood';
  color: string;
  ceilingHeight?: number;
  occupancyLoad?: number; // persons
  ventilationTargetRatio?: number; // default 0.10 (10% of floor area)
}

export interface CADDimension {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  offset: number;
  value: number; // in meters
  text: string;
}

export interface CADBlock {
  id: string;
  type:
    | 'bed'
    | 'sofa'
    | 'dining-table'
    | 'toilet'
    | 'sink'
    | 'kitchen-counter'
    | 'desk'
    | 'tree'
    | 'car'
    | 'shower'
    | 'bathtub'
    | 'armchair'
    | 'wardrobe'
    | 'stair'
    | 'door-symbol';
  name: string;
  x: number;
  y: number;
  rotation: number; // degrees
  scale: number;
  layer: string;
  ifcType?: 'IfcFurnishingElement';
  material?: string;
}

export interface CADSlab {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  thickness: number; // e.g. 0.30
  level: number;     // e.g. 0.00
  material: 'concrete' | 'wood' | 'steel-deck';
  ifcType: 'IfcSlab';
  structural: boolean;
}

export interface CADColumn {
  id: string;
  x: number;
  y: number;
  shape: 'rect' | 'circle';
  width: number;  // or diameter
  depth: number;
  height: number;
  material: 'reinforced-concrete' | 'steel-he' | 'timber';
  ifcType: 'IfcColumn';
  structural: boolean;
}

export interface CADLayer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  locked: boolean;
  printable: boolean;
  lineWidth: number;
}

// Optical Camera & Photometric Lighting Setup
export interface CameraOpticalConfig {
  focalLength: 16 | 24 | 35 | 50 | 85; // mm
  sensorSize: 'full-frame-35mm';
  perspective: 'perspective' | 'orthographic' | 'two-point';
  fStop: number;      // e.g. 2.8, 4.0, 5.6, 8.0
  shutterSpeed: string; // e.g. '1/125s'
  iso: number;        // e.g. 100, 200, 400, 800
  exposureEV: number; // -2 to +2
  dofEnabled: boolean;
  nearPlane: number;
  farPlane: number;
  clippingPlaneEnabled: boolean;
  clippingPlaneAxis: 'X' | 'Y' | 'Z';
  clippingPlaneOffset: number;
}

export interface PhotometricLightingConfig {
  preset: 'golden-hour' | 'noon-sun' | 'overcast' | 'blue-hour' | 'interior-warm';
  sunAzimuth: number;    // degrees (0-360)
  sunElevation: number;  // degrees (0-90)
  sunIntensity: number;  // lux / multiplier
  skyKelvin: number;     // 2500K - 10000K
  skyColor: string;
  groundColor: string;
  ambientOcclusion: number;
  bloom: number;
  shadowSharpness: number;
}

export interface RenderStyleConfig {
  id: string;
  name: string;
  description: string;
  wallColor: string;
  wallRoughness: number;
  floorTexture: string;
  floorRoughness: number;
  lightingPreset: 'golden-hour' | 'noon-sun' | 'overcast' | 'blue-hour' | 'interior-warm';
  skyColor: string;
  groundColor: string;
  sunIntensity: number;
  sunAzimuth: number;
  sunElevation: number;
  ambientOcclusion: number;
  sampleImage: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  author: 'USER' | 'COMMAND_ENGINE' | 'AI_ARCHITECT' | 'SYSTEM';
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
}

export interface ProjectMetadata {
  id: string;
  name: string;
  projectCode: string;
  author: string;
  client: string;
  location: string;
  scale: string;
  units: 'm' | 'mm';
  revision: string;
  timestamp: number;
}

// Unified Project Graph / Source of Truth
export interface UnifiedProjectState {
  metadata: ProjectMetadata;
  walls: CADWall[];
  openings: CADOpening[];
  rooms: CADRoom[];
  dimensions: CADDimension[];
  blocks: CADBlock[];
  slabs: CADSlab[];
  columns: CADColumn[];
  layers: CADLayer[];
  camera: CameraOpticalConfig;
  lighting: PhotometricLightingConfig;
  renderStyle: RenderStyleConfig;
  originalSketch?: string;
  auditLog: AuditLogEntry[];
}

// Architectural Analysis & Review Types
export interface RoomVentilationCheck {
  roomId: string;
  roomName: string;
  roomArea: number;
  glazingArea: number;
  actualRatio: number;
  requiredRatio: number;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';
  ruleCode: string; // e.g. "CTE DB-HS 3 (10%)" or "NBR 15575 (1/8)"
  certifiedCheck: boolean; // true if algorithmic verification
}

export interface DoorAccessibilityCheck {
  openingId: string;
  label: string;
  clearWidth: number;
  minRequiredWidth: number;
  status: 'COMPLIANT' | 'WARNING' | 'VIOLATION';
  ruleCode: string; // e.g. "CTE DB-SUA 1.2 (≥0.80m)" or "NBR 9050"
  certifiedCheck: boolean;
  message: string;
}

export interface ClashDetectionIssue {
  id: string;
  type: 'CORNER_OVERLAP' | 'DOOR_ON_CORNER' | 'ZERO_LENGTH_WALL' | 'UNCLOSED_ROOM';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  elementIds: string[];
  suggestedFix: string;
}

export interface ArchitecturalAnalysisReport {
  timestamp: string;
  usableAreaSqM: number;
  grossBuiltAreaSqM: number;
  exteriorPerimeterM: number;
  compactnessRatio: number;
  totalRooms: number;
  totalOpenings: number;
  ventilationComplianceRatio: number; // e.g. 0.85 (85%)
  accessibilityComplianceRatio: number;
  ventilationChecks: RoomVentilationCheck[];
  doorChecks: DoorAccessibilityCheck[];
  clashes: ClashDetectionIssue[];
  bimHealthScore: number; // 0-100
  aiReviewerNotes: string[];
}

export interface PaperSketchProject {
  id: string;
  name: string;
  description?: string;
  timestamp: number;
  originalImage?: string;
  scale: string;
  totalAreaSqM: number;
  confidence: number;
  walls: CADWall[];
  openings: CADOpening[];
  rooms: CADRoom[];
  dimensions: CADDimension[];
  blocks: CADBlock[];
  slabs?: CADSlab[];
  columns?: CADColumn[];
  architecturalReport?: string;
}

export interface OpenSourceTool {
  id: string;
  name: string;
  category: '2d-to-3d' | 'cad-bim' | 'ai-generative' | 'formats-standards' | 'regulations';
  badge: string;
  description: Record<Language, string>;
  repoUrl: string;
  license: string;
  techStack: string[];
  keyFeatures: Record<Language, string[]>;
  commandExample?: string;
  stars?: string;
}

// Command Engine Result
export interface CommandResult {
  success: boolean;
  command: string;
  output: string;
  feedbackType: 'info' | 'success' | 'warning' | 'error';
  auditEntry?: AuditLogEntry;
}
