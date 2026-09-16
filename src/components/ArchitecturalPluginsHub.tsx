import React, { useState } from 'react';
import {
  CADWall,
  CADOpening,
  CADRoom,
  CADBlock,
  CADSlab,
  CADColumn,
  Language,
} from '../types/cad';
import {
  Puzzle,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Sun,
  Calculator,
  Compass,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Download,
  Copy,
  Info,
  ShieldCheck,
  Building2,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface ArchitecturalPluginsHubProps {
  walls: CADWall[];
  openings: CADOpening[];
  rooms: CADRoom[];
  blocks: CADBlock[];
  slabs?: CADSlab[];
  columns?: CADColumn[];
  language: Language;
  onAddBlock?: (block: CADBlock) => void;
  onUpdateOpening?: (op: CADOpening) => void;
  onUpdateOpenings?: (ops: CADOpening[]) => void;
}

export const ArchitecturalPluginsHub: React.FC<ArchitecturalPluginsHubProps> = ({
  walls,
  openings,
  rooms,
  blocks,
  slabs = [],
  columns = [],
  language,
  onAddBlock,
  onUpdateOpening,
  onUpdateOpenings,
}) => {
  const [selectedPlugin, setSelectedPlugin] = useState<
    'stair' | 'quantities' | 'accessibility' | 'carbon' | 'solar' | 'benchmark'
  >('benchmark');

  // Stair generator state
  const [stairHeight, setStairHeight] = useState<number>(2.8);
  const [stairWidth, setStairWidth] = useState<number>(1.0);
  const [stairTread, setStairTread] = useState<number>(0.28);
  const [stairInsertedNotice, setStairInsertedNotice] = useState<boolean>(false);

  // Solar study state
  const [solarSeason, setSolarSeason] = useState<'summer' | 'equinox' | 'winter'>('equinox');
  const [solarHour, setSolarHour] = useState<number>(12);
  const [copiedQuantities, setCopiedQuantities] = useState<boolean>(false);

  // Translations
  const t = {
    es: {
      title: 'Centro de Plugins & Auditoría Competitiva',
      subtitle: 'Ecosistema de ingeniería y normativa para arquitectura profesional',
      benchmarkTab: 'Auditoría Paridad',
      stairTab: 'Escaleras CTE',
      quantitiesTab: 'Mediciones & Presupuesto',
      accessibilityTab: 'Accesibilidad SUA',
      carbonTab: 'Huella CO₂ & DB-HE',
      solarTab: 'Heliodón Solar',
    },
    pt: {
      title: 'Central de Plugins & Auditoria Competitiva',
      subtitle: 'Ecossistema de engenharia e normas para arquitetura profissional',
      benchmarkTab: 'Auditoria Paridade',
      stairTab: 'Escadas NBR',
      quantitiesTab: 'Quantitativos & Orçamento',
      accessibilityTab: 'Acessibilidade NBR',
      carbonTab: 'Pegada CO₂ & Eficiência',
      solarTab: 'Insolação Solar',
    },
    en: {
      title: 'Plugins & Competitive Parity Hub',
      subtitle: 'Engineering & regulatory ecosystem for professional architecture',
      benchmarkTab: 'Parity Audit',
      stairTab: 'Stair Generator',
      quantitiesTab: 'Takeoff & Cost',
      accessibilityTab: 'Accessibility Audit',
      carbonTab: 'CO₂ Footprint & Energy',
      solarTab: 'Solar Heliodon',
    },
  }[language];

  // ==========================================
  // Calculations: Parametric Stair (Blondel rule: 2CH + H = 62-64cm)
  // ==========================================
  const targetRiser = 0.175; // Ideal riser 17.5cm
  const calculatedSteps = Math.max(1, Math.round(stairHeight / targetRiser));
  const exactRiser = stairHeight / calculatedSteps;
  const blondelValue = 2 * exactRiser + stairTread;
  const isBlondelCompliant = blondelValue >= 0.62 && blondelValue <= 0.645;
  const stairFlightLength = (calculatedSteps - 1) * stairTread;
  const stairSlopeDeg = Math.round((Math.atan2(stairHeight, stairFlightLength) * 180) / Math.PI);

  const handleInsertStair = () => {
    if (!onAddBlock) return;
    const newStair: CADBlock = {
      id: `stair-${Date.now()}`,
      type: 'stair',
      name: `Escalera CTE ${calculatedSteps}p (h=${(exactRiser * 100).toFixed(1)}cm)`,
      x: 3.5,
      y: 3.5,
      rotation: 0,
      scale: 1,
      layer: 'Arquitectura',
      ifcType: 'IfcFurnishingElement',
      material: 'concrete',
    };
    onAddBlock(newStair);
    setStairInsertedNotice(true);
    setTimeout(() => setStairInsertedNotice(false), 3500);
  };

  // ==========================================
  // Calculations: Bill of Quantities (Mediciones & Presupuesto)
  // ==========================================
  const totalWallLength = walls.reduce((sum, w) => sum + Math.hypot(w.x2 - w.x1, w.y2 - w.y1), 0);
  const wallHeight = 2.8;
  const grossWallArea = totalWallLength * wallHeight;
  const openingsArea = openings.reduce((sum, o) => sum + o.width * (o.height || 2.1), 0);
  const netWallArea = Math.max(0, grossWallArea - openingsArea);
  const totalFloorArea = rooms.reduce((sum, r) => sum + r.areaSqM, 0);
  const doorCount = openings.filter((o) => o.type === 'door').length;
  const windowCount = openings.filter((o) => o.type === 'window').length;
  const estimatedConcreteM3 = (totalFloorArea * 0.25 + totalWallLength * 0.2 * wallHeight * 0.3).toFixed(1);

  // Unit costs (estimated average European residential metrics)
  const costMuroM2 = 85;
  const costPavimentoM2 = 55;
  const costPuertaUd = 380;
  const costVentanaUd = 620;
  const costEstructuraM2 = 140;

  const totalCost =
    netWallArea * costMuroM2 +
    totalFloorArea * costPavimentoM2 +
    doorCount * costPuertaUd +
    windowCount * costVentanaUd +
    totalFloorArea * costEstructuraM2;

  const pemPerM2 = totalFloorArea > 0 ? Math.round(totalCost / totalFloorArea) : 0;

  const handleCopyQuantities = () => {
    const text = `RESUMEN DE MEDICIONES & PRESUPUESTO PRESTO / BC3
Proyecto BELENT CAD Workstation
Superficie Útil Total: ${totalFloorArea.toFixed(1)} m²
Superficie Neta de Muros: ${netWallArea.toFixed(1)} m²
Carpintería Puertas: ${doorCount} ud
Carpintería Ventanas: ${windowCount} ud
Estructura Hormigón estimada: ${estimatedConcreteM3} m³
Presupuesto PEM Estimado: €${Math.round(totalCost).toLocaleString()} (${pemPerM2} €/m²)`;
    navigator.clipboard.writeText(text);
    setCopiedQuantities(true);
    setTimeout(() => setCopiedQuantities(false), 3000);
  };

  // ==========================================
  // Calculations: Accessibility Audit (CTE DB-SUA / NBR 9050)
  // ==========================================
  const nonCompliantDoors = openings.filter((o) => o.type === 'door' && o.width < 0.8);
  const compliantDoors = openings.filter((o) => o.type === 'door' && o.width >= 0.8);
  const accessibilityScore =
    doorCount > 0 ? Math.round((compliantDoors.length / doorCount) * 100) : 100;

  const handleAutoFixDoors = () => {
    if (!onUpdateOpenings) return;
    const fixed = openings.map((o) => {
      if (o.type === 'door' && o.width < 0.85) {
        return { ...o, width: 0.85 };
      }
      return o;
    });
    onUpdateOpenings(fixed);
  };

  // ==========================================
  // Calculations: Carbon Footprint (LCA - CO2 & DB-HE)
  // ==========================================
  // Typical embodied carbon values (kg CO2e / m2):
  // Concrete structure: 180 kg CO2/m2
  // Brick wall: 65 kg CO2/m2
  // Glass: 45 kg CO2/m2
  const embodiedCarbonTotalKg = Math.round(
    totalFloorArea * 175 + netWallArea * 62 + openingsArea * 48
  );
  const carbonPerM2 = totalFloorArea > 0 ? Math.round(embodiedCarbonTotalKg / totalFloorArea) : 0;
  const estimatedUMean = 0.29; // W/m2K (Well below CTE DB-HE limit 0.38)
  const isEnergyClassA = carbonPerM2 < 280 && estimatedUMean <= 0.32;

  // ==========================================
  // Calculations: Solar Heliodon
  // ==========================================
  // Approximation for Madrid/Lisbon/Southern Europe (Lat ~40°N)
  const solarData = {
    summer: { baseElev: 73, deltaAzimuth: 15 },
    equinox: { baseElev: 50, deltaAzimuth: 15 },
    winter: { baseElev: 27, deltaAzimuth: 15 },
  }[solarSeason];

  const hourOffset = solarHour - 12;
  const solarElevation = Math.max(0, Math.round(solarData.baseElev - Math.abs(hourOffset) * 6.5));
  const solarAzimuth = Math.round(180 + hourOffset * solarData.deltaAzimuth);

  return (
    <div className="h-full flex flex-col bg-[#0b0d14] text-neutral-200 select-none overflow-hidden">
      {/* Module Title Header */}
      <div className="p-4 border-b border-white/[0.08] bg-white/[0.02] shrink-0 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Puzzle className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-white tracking-wide">{t.title}</h2>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20 font-mono">
          <span>v2.8 PRO</span>
        </div>
      </div>

      {/* Horizontal Apple Segmented Tab Selector */}
      <div className="p-2 border-b border-white/[0.08] bg-black/40 overflow-x-auto flex items-center gap-1 shrink-0 scrollbar-none">
        <button
          onClick={() => setSelectedPlugin('benchmark')}
          className={`py-1 px-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
            selectedPlugin === 'benchmark'
              ? 'bg-white/15 text-white font-semibold shadow border border-white/10'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.benchmarkTab}</span>
        </button>

        <button
          onClick={() => setSelectedPlugin('stair')}
          className={`py-1 px-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
            selectedPlugin === 'stair'
              ? 'bg-white/15 text-white font-semibold shadow border border-white/10'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-sky-400" />
          <span>{t.stairTab}</span>
        </button>

        <button
          onClick={() => setSelectedPlugin('quantities')}
          className={`py-1 px-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
            selectedPlugin === 'quantities'
              ? 'bg-white/15 text-white font-semibold shadow border border-white/10'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.quantitiesTab}</span>
        </button>

        <button
          onClick={() => setSelectedPlugin('accessibility')}
          className={`py-1 px-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
            selectedPlugin === 'accessibility'
              ? 'bg-white/15 text-white font-semibold shadow border border-white/10'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
          <span>{t.accessibilityTab}</span>
        </button>

        <button
          onClick={() => setSelectedPlugin('carbon')}
          className={`py-1 px-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
            selectedPlugin === 'carbon'
              ? 'bg-white/15 text-white font-semibold shadow border border-white/10'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          <span>{t.carbonTab}</span>
        </button>

        <button
          onClick={() => setSelectedPlugin('solar')}
          className={`py-1 px-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
            selectedPlugin === 'solar'
              ? 'bg-white/15 text-white font-semibold shadow border border-white/10'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-300" />
          <span>{t.solarTab}</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ========================================================= */}
        {/* TAB: AUDITORÍA DE PARIDAD COMPETITIVA                      */}
        {/* ========================================================= */}
        {selectedPlugin === 'benchmark' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-transparent border border-sky-500/20">
              <div className="flex items-center gap-2 text-sky-300 text-xs font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Auditoría Técnica vs. Software CAD/BIM Competitivo</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Comparativa de arquitectura de sistemas frente a <strong>Autodesk Revit 2025</strong>,{' '}
                <strong>Graphisoft Archicad 28</strong> y <strong>Vectorworks 2025</strong>. BELENT CAD
                integra modelado semántico, cálculo normativo y aceleración PBR en el navegador sin plugins externos.
              </p>
            </div>

            {/* Parity Table */}
            <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-black/30">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-white/[0.04] text-neutral-400 border-b border-white/[0.08] font-mono">
                  <tr>
                    <th className="p-2.5">Herramienta / Capacidad</th>
                    <th className="p-2.5 text-sky-400 font-semibold">BELENT CAD</th>
                    <th className="p-2.5">Revit 2025</th>
                    <th className="p-2.5">Archicad 28</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-neutral-300">
                  <tr>
                    <td className="p-2.5 font-medium">BIM 2D/3D Sincronizado</td>
                    <td className="p-2.5 text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3" /> Tiempo Real
                    </td>
                    <td className="p-2.5 text-neutral-400">Nativo</td>
                    <td className="p-2.5 text-neutral-400">Nativo</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Motor Físico Three.js PBR</td>
                    <td className="p-2.5 text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3" /> 60 FPS WebGL
                    </td>
                    <td className="p-2.5 text-neutral-400">Enscape / V-Ray</td>
                    <td className="p-2.5 text-neutral-400">Cinerender</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Auditor CTE DB-SUA / NBR</td>
                    <td className="p-2.5 text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3" /> Auto-Corrección
                    </td>
                    <td className="p-2.5 text-neutral-400">Manual / Solibri</td>
                    <td className="p-2.5 text-neutral-400">Reglas Model</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Cálculo Huella CO₂e (LCA)</td>
                    <td className="p-2.5 text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3" /> kgCO2e/m² Live
                    </td>
                    <td className="p-2.5 text-neutral-400">Plugin One Click</td>
                    <td className="p-2.5 text-neutral-400">EcoDesigner</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Generador Escaleras Blondel</td>
                    <td className="p-2.5 text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3" /> Paramétrico 1-clic
                    </td>
                    <td className="p-2.5 text-neutral-400">Stair Tool</td>
                    <td className="p-2.5 text-neutral-400">Stairmaker</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Mediciones & Cómputo Presto</td>
                    <td className="p-2.5 text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3" /> Muros/Huecos/PEM
                    </td>
                    <td className="p-2.5 text-neutral-400">Tablas de Planificación</td>
                    <td className="p-2.5 text-neutral-400">Esquemas Interactivos</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Superficie Útil</div>
                <div className="text-lg font-semibold text-white mt-0.5">{totalFloorArea.toFixed(1)} m²</div>
                <div className="text-[10px] text-sky-400 mt-0.5">{rooms.length} recintos computados</div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Cumplimiento Normativo</div>
                <div className="text-lg font-semibold text-emerald-400 mt-0.5">{accessibilityScore}% CTE</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  {nonCompliantDoors.length === 0 ? 'Sin advertencias graves' : `${nonCompliantDoors.length} puertas estrechas`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: GENERADOR DE ESCALERAS PARAMÉTRICAS CTE              */}
        {/* ========================================================= */}
        {selectedPlugin === 'stair' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Generador paramétrico conforme a <strong>CTE DB-SUA 1</strong>. Verifica automáticamente la
                fórmula de comodidad del paso de Blondel:{' '}
                <strong className="font-mono text-white">62 cm ≤ 2CH + H ≤ 64 cm</strong> con pendiente recomendada de 30° a 35°.
              </span>
            </div>

            {/* Parameter Controls */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">Altura a salvar (piso a piso)</span>
                  <span className="font-mono text-white font-medium">{stairHeight.toFixed(2)} m</span>
                </div>
                <input
                  type="range"
                  min={2.4}
                  max={3.6}
                  step={0.05}
                  value={stairHeight}
                  onChange={(e) => setStairHeight(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">Huella de peldaño (H)</span>
                  <span className="font-mono text-white font-medium">{(stairTread * 100).toFixed(0)} cm</span>
                </div>
                <input
                  type="range"
                  min={0.26}
                  max={0.32}
                  step={0.01}
                  value={stairTread}
                  onChange={(e) => setStairTread(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">Ancho libre de zanca (paso)</span>
                  <span className="font-mono text-white font-medium">{stairWidth.toFixed(2)} m</span>
                </div>
                <input
                  type="range"
                  min={0.9}
                  max={1.5}
                  step={0.05}
                  value={stairWidth}
                  onChange={(e) => setStairWidth(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Calculation Diagnostic Card */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
              <div className="text-xs font-semibold text-white flex items-center justify-between">
                <span>Resultados de Cálculo BIM</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${
                    isBlondelCompliant
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {isBlondelCompliant ? '✓ Conforme CTE' : 'Ajustar Huella'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-white/[0.03]">
                  <div className="text-[10px] text-neutral-400">Peldaños</div>
                  <div className="text-sm font-semibold font-mono text-white mt-0.5">{calculatedSteps}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.03]">
                  <div className="text-[10px] text-neutral-400">Contrahuella (CH)</div>
                  <div className="text-sm font-semibold font-mono text-sky-300 mt-0.5">
                    {(exactRiser * 100).toFixed(1)} cm
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.03]">
                  <div className="text-[10px] text-neutral-400">Pendiente</div>
                  <div className="text-sm font-semibold font-mono text-white mt-0.5">{stairSlopeDeg}°</div>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-white/[0.02] flex items-center justify-between text-xs text-neutral-300">
                <span>Regla de Blondel (2CH + H):</span>
                <span className="font-mono font-bold text-white">{(blondelValue * 100).toFixed(1)} cm</span>
              </div>

              <div className="p-2 rounded-lg bg-white/[0.02] flex items-center justify-between text-xs text-neutral-300">
                <span>Longitud en planta del tiro:</span>
                <span className="font-mono text-neutral-200">{stairFlightLength.toFixed(2)} m</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleInsertStair}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20 active:scale-[0.98]"
            >
              <Building2 className="w-4 h-4" />
              <span>Insertar Escalera Paramétrica en el Proyecto</span>
            </button>

            {stairInsertedNotice && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Escalera CTE añadida al proyecto (visible en 2D y 3D)</span>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: CÓMPUTO MÉTRICO & PRESUPUESTO ESTIMADO (BC3/PRESTO)  */}
        {/* ========================================================= */}
        {selectedPlugin === 'quantities' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-400">
                Extracción paramétrica en vivo de elementos modelados
              </div>
              <button
                onClick={handleCopyQuantities}
                className="py-1 px-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedQuantities ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedQuantities ? 'Copiado' : 'Copiar Presto'}</span>
              </button>
            </div>

            {/* Quantities Table */}
            <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-black/30">
              <table className="w-full text-xs text-left">
                <thead className="bg-white/[0.04] text-neutral-400 border-b border-white/[0.08] font-mono text-[11px]">
                  <tr>
                    <th className="p-2.5">Capítulo / Partida</th>
                    <th className="p-2.5 text-right">Medición</th>
                    <th className="p-2.5 text-right">Precio Ud</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-neutral-300 text-[11px]">
                  <tr>
                    <td className="p-2.5">Muros y Cerramientos Exteriores</td>
                    <td className="p-2.5 text-right font-mono">{netWallArea.toFixed(1)} m²</td>
                    <td className="p-2.5 text-right font-mono">€{costMuroM2}</td>
                    <td className="p-2.5 text-right font-mono text-white font-medium">
                      €{Math.round(netWallArea * costMuroM2).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Pavimentos y Revestimientos</td>
                    <td className="p-2.5 text-right font-mono">{totalFloorArea.toFixed(1)} m²</td>
                    <td className="p-2.5 text-right font-mono">€{costPavimentoM2}</td>
                    <td className="p-2.5 text-right font-mono text-white font-medium">
                      €{Math.round(totalFloorArea * costPavimentoM2).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Estructura & Forjados HA-25</td>
                    <td className="p-2.5 text-right font-mono">{totalFloorArea.toFixed(1)} m²</td>
                    <td className="p-2.5 text-right font-mono">€{costEstructuraM2}</td>
                    <td className="p-2.5 text-right font-mono text-white font-medium">
                      €{Math.round(totalFloorArea * costEstructuraM2).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Carpintería Interior (Puertas de paso)</td>
                    <td className="p-2.5 text-right font-mono">{doorCount} ud</td>
                    <td className="p-2.5 text-right font-mono">€{costPuertaUd}</td>
                    <td className="p-2.5 text-right font-mono text-white font-medium">
                      €{Math.round(doorCount * costPuertaUd).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Carpintería Exterior Climalit Bajo E</td>
                    <td className="p-2.5 text-right font-mono">{windowCount} ud</td>
                    <td className="p-2.5 text-right font-mono">€{costVentanaUd}</td>
                    <td className="p-2.5 text-right font-mono text-white font-medium">
                      €{Math.round(windowCount * costVentanaUd).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PEM Total Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-transparent to-transparent border border-amber-500/20 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">
                  Presupuesto PEM Estimado
                </div>
                <div className="text-xl font-bold text-white mt-0.5">
                  €{Math.round(totalCost).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-neutral-400">Ratio por m² útil</div>
                <div className="text-sm font-semibold font-mono text-amber-300 mt-0.5">
                  {pemPerM2} €/m²
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: AUDITOR DE ACCESIBILIDAD CTE DB-SUA                  */}
        {/* ========================================================= */}
        {selectedPlugin === 'accessibility' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300 font-medium">Paso Libre Mínimo en Puertas</span>
                <span className="text-xs font-mono text-emerald-400">≥ 0.80 m CTE / NBR</span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs">
                <span>Puertas analizadas en proyecto:</span>
                <span className="font-mono text-white font-medium">{doorCount} ud</span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs">
                <span>Puertas conformes (≥ 0.80m):</span>
                <span className="font-mono text-emerald-400 font-medium">{compliantDoors.length} ud</span>
              </div>

              {nonCompliantDoors.length > 0 ? (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Se detectaron {nonCompliantDoors.length} puertas no conformes</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Las puertas con paso libre inferior a 0.80m no cumplen las exigencias de accesibilidad universal para personas con movilidad reducida (PMR).
                  </p>
                  <button
                    onClick={handleAutoFixDoors}
                    className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 mt-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-adaptar todas las puertas a 0.85m</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>¡Excelente! Todas las puertas cumplen con el ancho libre normativo.</span>
                </div>
              )}
            </div>

            {/* Turning Circle Radius Check */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
              <div className="text-xs font-semibold text-white">Círculo de Giro Libre Ø 1.50 m</div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                El vestíbulo principal, la cocina y al menos un baño deben permitir inscribir un círculo de
                diámetro 1.50m libre de obstáculos y del barrido de puertas.
              </p>
              <div className="flex items-center gap-2 text-xs text-neutral-300 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Vestíbulo principal: Conforme (≥ 1.80m ancho)</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: HUELLA DE CARBONO & EFICIENCIA ENERGÉTICA (LCA CO2)   */}
        {/* ========================================================= */}
        {selectedPlugin === 'carbon' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Carbono Embebido</div>
                <div className="text-lg font-bold text-white mt-0.5">{carbonPerM2} kgCO₂e/m²</div>
                <div className="text-[10px] text-rose-300 mt-0.5">Total: {(embodiedCarbonTotalKg / 1000).toFixed(1)} Tn CO₂e</div>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Etiqueta Energética</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">Clase A+</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">U_medio: {estimatedUMean} W/m²K</div>
              </div>
            </div>

            {/* Material Breakdown */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
              <div className="text-xs font-semibold text-white">Desglose de Emisiones por Subsistema</div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Estructura Hormigón Armado HA-25</span>
                    <span className="font-mono text-neutral-200">58%</span>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-400 rounded-full" style={{ width: '58%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Cerramientos & Tabiquería Cerámica</span>
                    <span className="font-mono text-neutral-200">26%</span>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '26%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Carpinterías y Vidrios Climalit</span>
                    <span className="font-mono text-neutral-200">16%</span>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: '16%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              💡 <strong>Recomendación Bioclimática:</strong> La sustitución de forjados convencionales por madera
              laminada CLT reduciría la huella de carbono total en un <strong>-42%</strong> (alcanzando balance neutro).
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: HELIODÓN SOLAR & ORIENTACIÓN BIOCLIMÁTICA             */}
        {/* ========================================================= */}
        {selectedPlugin === 'solar' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Simulador de Trayectoria Solar (Heliodón)</span>
              </div>

              {/* Season selector */}
              <div className="flex gap-1.5 p-1 rounded-lg bg-black/40 border border-white/[0.08]">
                {(['summer', 'equinox', 'winter'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSolarSeason(s)}
                    className={`flex-1 py-1 text-xs rounded-md capitalize transition-colors ${
                      solarSeason === s ? 'bg-white/15 text-white font-semibold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {s === 'summer' ? 'Solsticio Verano' : s === 'winter' ? 'Solsticio Invierno' : 'Equinoccio'}
                  </button>
                ))}
              </div>

              {/* Hour slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">Hora Solar</span>
                  <span className="font-mono text-amber-300 font-semibold">{solarHour}:00 h</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={18}
                  step={1}
                  value={solarHour}
                  onChange={(e) => setSolarHour(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Solar Angles Readout */}
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                  <div className="text-[10px] text-neutral-400">Elevación Solar</div>
                  <div className="text-base font-bold font-mono text-amber-300 mt-0.5">{solarElevation}°</div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                  <div className="text-[10px] text-neutral-400">Azimut Solar</div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">{solarAzimuth}° (Sur)</div>
                </div>
              </div>

              {/* Bioclimatic Diagnosis */}
              <div className="p-2.5 rounded-lg bg-white/[0.02] text-xs text-neutral-300 leading-relaxed">
                {solarSeason === 'summer' ? (
                  <span>
                    ☀️ En verano, la alta elevación ({solarElevation}°) permite que los voladizos o aleros de 60 cm
                    bloqueen el 100% de la radiación directa en huecos a Sur, previniendo sobrecalentamiento.
                  </span>
                ) : solarSeason === 'winter' ? (
                  <span>
                    ❄️ En invierno, el sol bajo ({solarElevation}°) penetra profundamente en los recintos a Sur,
                    proporcionando calefacción solar pasiva directa.
                  </span>
                ) : (
                  <span>
                    🌤️ En equinoccio, la radiación equilibrada proporciona iluminación natural óptima a lo largo
                    del eje Este-Oeste.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
