import React, { useState, useMemo } from 'react';
import {
  CADWall,
  CADOpening,
  CADRoom,
  CADDimension,
  CADBlock,
  CADSlab,
  CADColumn,
  Language,
} from '../types/cad';
import {
  exportToDXF,
  exportToIFC,
  exportToOBJ,
  exportToArchitecturalSheetSVG,
  downloadFile,
} from '../services/cadExporters';
import {
  Printer,
  Download,
  FileText,
  Layers,
  Box,
  Compass,
  CheckCircle2,
  Table,
  Eye,
} from 'lucide-react';

interface DocumentationEngineProps {
  projectName: string;
  walls: CADWall[];
  openings: CADOpening[];
  rooms: CADRoom[];
  dimensions: CADDimension[];
  blocks: CADBlock[];
  slabs?: CADSlab[];
  columns?: CADColumn[];
  language: Language;
}

export const DocumentationEngine: React.FC<DocumentationEngineProps> = ({
  projectName,
  walls,
  openings,
  rooms,
  dimensions,
  blocks,
  slabs = [],
  columns = [],
  language,
}) => {
  const [sheetFormat, setSheetFormat] = useState<'A1' | 'A2' | 'A3'>('A1');
  const [scale, setScale] = useState<'1:50' | '1:100' | '1:200'>('1:50');
  const [activeSheetTab, setActiveSheetTab] = useState<'plan' | 'section' | 'schedules'>('plan');

  // Compute bounding box for projection
  const bounds = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    walls.forEach((w) => {
      minX = Math.min(minX, w.x1, w.x2);
      maxX = Math.max(maxX, w.x1, w.x2);
      minY = Math.min(minY, w.y1, w.y2);
      maxY = Math.max(maxY, w.y1, w.y2);
    });
    if (!isFinite(minX)) {
      minX = 0; maxX = 12; minY = 0; maxY = 9;
    }
    return {
      minX, maxX, minY, maxY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    };
  }, [walls]);

  const totalUsableArea = useMemo(() => {
    return rooms.reduce((acc, r) => acc + (r.areaSqM || r.width * r.height || 0), 0).toFixed(1);
  }, [rooms]);

  // Section cut generation at Y = centerY
  const sectionCutData = useMemo(() => {
    const cutY = bounds.centerY;
    // Find all walls that cross the cut line
    const slicedWalls = walls.filter((w) => {
      const minWY = Math.min(w.y1, w.y2);
      const maxWY = Math.max(w.y1, w.y2);
      return cutY >= minWY - 0.1 && cutY <= maxWY + 0.1;
    });

    return {
      cutY,
      slicedWalls,
      ceilingHeight: 2.8,
      slabThickness: 0.3,
    };
  }, [walls, bounds]);

  // Export handlers
  const handlePrint = () => {
    window.print();
  };

  const handleExportSVG = () => {
    const svgStr = exportToArchitecturalSheetSVG(projectName, walls, openings, rooms, dimensions, language);
    downloadFile(svgStr, `${projectName.replace(/\s+/g, '_')}_Lamina_${sheetFormat}.svg`, 'image/svg+xml');
  };

  const handleExportDXF = () => {
    const dxf = exportToDXF(projectName, walls, openings, rooms, dimensions);
    downloadFile(dxf, `${projectName.replace(/\s+/g, '_')}.dxf`, 'application/dxf');
  };

  const handleExportIFC = () => {
    const ifc = exportToIFC(projectName, walls, rooms);
    downloadFile(ifc, `${projectName.replace(/\s+/g, '_')}.ifc`, 'application/x-step');
  };

  const handleExportOBJ = () => {
    const obj = exportToOBJ(projectName, walls, rooms);
    downloadFile(obj, `${projectName.replace(/\s+/g, '_')}.obj`, 'text/plain');
  };

  return (
    <div className="w-full h-full bg-[#05070c] text-neutral-200 overflow-y-auto flex flex-col font-sans select-none print:p-0 print:bg-white print:text-black">
      {/* Top Toolbar (Hidden on Print) */}
      <div className="p-4 border-b border-red-500/20 bg-[#090d16]/90 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold font-mono text-white tracking-wider uppercase">
              DOCUMENTATION ENGINE // ISO 5457 & NBR 6492
            </h2>
            <p className="text-[11px] text-neutral-400 font-mono">
              Generador automático de láminas técnicas, plantas acotadas, secciones y cuadros de carpintería.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Format Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 font-mono text-xs">
            {(['A1', 'A2', 'A3'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSheetFormat(fmt)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  sheetFormat === fmt
                    ? 'bg-red-600 text-white font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Scale Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 font-mono text-xs">
            {(['1:50', '1:100', '1:200'] as const).map((sc) => (
              <button
                key={sc}
                onClick={() => setScale(sc)}
                className={`px-2 py-1 rounded transition-colors ${
                  scale === sc ? 'bg-white/20 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {sc}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-white/10 mx-1" />

          {/* Print Sheet */}
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Lámina / PDF</span>
          </button>

          {/* Export SVG */}
          <button
            onClick={handleExportSVG}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>SVG ISO</span>
          </button>

          {/* Export DXF */}
          <button
            onClick={handleExportDXF}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>AutoCAD DXF</span>
          </button>

          {/* Export IFC */}
          <button
            onClick={handleExportIFC}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Box className="w-3.5 h-3.5 text-blue-400" />
            <span>OpenBIM IFC</span>
          </button>
        </div>
      </div>

      {/* Sheet Tab Switcher (Print: hidden) */}
      <div className="px-4 pt-3 flex items-center gap-2 border-b border-white/5 bg-[#090d16]/50 print:hidden">
        <button
          onClick={() => setActiveSheetTab('plan')}
          className={`px-3 py-2 text-xs font-mono flex items-center gap-2 border-b-2 transition-colors ${
            activeSheetTab === 'plan'
              ? 'border-red-500 text-white font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-red-400" />
          <span>LÁMINA 01: PLANTA GENERAL ({scale})</span>
        </button>

        <button
          onClick={() => setActiveSheetTab('section')}
          className={`px-3 py-2 text-xs font-mono flex items-center gap-2 border-b-2 transition-colors ${
            activeSheetTab === 'section'
              ? 'border-red-500 text-white font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>LÁMINA 02: SECCIÓN A-A' Y ALZADO</span>
        </button>

        <button
          onClick={() => setActiveSheetTab('schedules')}
          className={`px-3 py-2 text-xs font-mono flex items-center gap-2 border-b-2 transition-colors ${
            activeSheetTab === 'schedules'
              ? 'border-red-500 text-white font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Table className="w-3.5 h-3.5 text-emerald-400" />
          <span>LÁMINA 03: CUADROS Y ESPECIFICACIONES</span>
        </button>
      </div>

      {/* Central Printable Sheet Canvas */}
      <div className="flex-1 p-4 md:p-8 flex items-center justify-center overflow-auto print:p-0">
        <div
          id="architectural-sheet"
          className="w-full max-w-5xl aspect-[1.414/1] bg-white text-neutral-900 rounded-none shadow-2xl p-6 flex flex-col justify-between border-2 border-neutral-900 print:shadow-none print:border-none print:w-full print:max-w-none print:m-0"
          style={{ minHeight: '680px' }}
        >
          {/* Sheet Frame & Inner Border */}
          <div className="w-full h-full border border-neutral-800 p-4 flex flex-col justify-between relative">
            {/* Top Sheet Header */}
            <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-2">
              <div className="flex items-center gap-3">
                <div className="font-mono font-black text-sm tracking-widest text-neutral-900">
                  BELENT ARCHITECT // ESTUDIO TÉCNICO
                </div>
                <span className="text-[11px] font-mono bg-neutral-100 px-2 py-0.5 border border-neutral-300">
                  FORMATO {sheetFormat} ISO 5457
                </span>
              </div>
              <div className="font-mono text-xs text-neutral-700 font-semibold">
                ESCALA {scale} | COTAS EN METROS (m)
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 my-3 flex items-center justify-center relative overflow-hidden">
              {/* TAB 1: 2D Floor Plan Projection */}
              {activeSheetTab === 'plan' && (
                <svg
                  viewBox={`${bounds.minX - 2} ${bounds.minY - 2} ${bounds.width + 4} ${bounds.height + 4}`}
                  className="w-full h-full max-h-[440px]"
                >
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="sheet-grid" width="1" height="1" patternUnits="userSpaceOnUse">
                      <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#e5e7eb" strokeWidth="0.04" />
                    </pattern>
                  </defs>
                  <rect
                    x={bounds.minX - 2}
                    y={bounds.minY - 2}
                    width={bounds.width + 4}
                    height={bounds.height + 4}
                    fill="url(#sheet-grid)"
                  />

                  {/* Room fills and labels */}
                  {rooms.map((r) => (
                    <g key={r.id}>
                      <rect
                        x={r.x}
                        y={r.y}
                        width={r.width}
                        height={r.height}
                        fill="#f8fafc"
                        stroke="#cbd5e1"
                        strokeWidth="0.03"
                      />
                      <text
                        x={r.x + r.width / 2}
                        y={r.y + r.height / 2 - 0.2}
                        fontSize="0.32"
                        fontWeight="bold"
                        textAnchor="middle"
                        fill="#0f172a"
                        fontFamily="monospace"
                      >
                        {r.name.toUpperCase()}
                      </text>
                      <text
                        x={r.x + r.width / 2}
                        y={r.y + r.height / 2 + 0.3}
                        fontSize="0.26"
                        textAnchor="middle"
                        fill="#475569"
                        fontFamily="monospace"
                      >
                        S.U.: {(r.areaSqM || r.width * r.height).toFixed(1)} m²
                      </text>
                    </g>
                  ))}

                  {/* Section Line Cut A-A' indicator */}
                  <line
                    x1={bounds.minX - 1}
                    y1={bounds.centerY}
                    x2={bounds.maxX + 1}
                    y2={bounds.centerY}
                    stroke="#dc2626"
                    strokeWidth="0.08"
                    strokeDasharray="0.4,0.2"
                  />
                  <text
                    x={bounds.minX - 1.4}
                    y={bounds.centerY + 0.12}
                    fill="#dc2626"
                    fontSize="0.36"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    A
                  </text>
                  <text
                    x={bounds.maxX + 1.2}
                    y={bounds.centerY + 0.12}
                    fill="#dc2626"
                    fontSize="0.36"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    A'
                  </text>

                  {/* Walls (Solid Architectural Fill) */}
                  {walls.map((w) => (
                    <line
                      key={w.id}
                      x1={w.x1}
                      y1={w.y1}
                      x2={w.x2}
                      y2={w.y2}
                      stroke="#0f172a"
                      strokeWidth={w.thickness || 0.2}
                      strokeLinecap="square"
                    />
                  ))}

                  {/* Openings (Doors & Windows) */}
                  {openings.map((op) => {
                    if (op.type === 'door') {
                      return (
                        <g key={op.id}>
                          <circle cx={op.x} cy={op.y} r={op.width} fill="none" stroke="#dc2626" strokeWidth="0.03" strokeDasharray="0.1,0.1" />
                          <line x1={op.x} y1={op.y} x2={op.x + op.width} y2={op.y} stroke="#dc2626" strokeWidth="0.08" />
                        </g>
                      );
                    } else {
                      return (
                        <g key={op.id}>
                          <rect
                            x={op.x - op.width / 2}
                            y={op.y - 0.1}
                            width={op.width}
                            height={0.2}
                            fill="#bae6fd"
                            stroke="#0284c7"
                            strokeWidth="0.04"
                          />
                        </g>
                      );
                    }
                  })}

                  {/* Exterior Dimensions */}
                  {dimensions.map((d) => (
                    <g key={d.id}>
                      <line x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke="#64748b" strokeWidth="0.04" />
                      <text
                        x={(d.x1 + d.x2) / 2}
                        y={(d.y1 + d.y2) / 2 - 0.15}
                        fontSize="0.28"
                        textAnchor="middle"
                        fill="#0f172a"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {d.text}
                      </text>
                    </g>
                  ))}
                </svg>
              )}

              {/* TAB 2: Section Cut A-A' & Elevation */}
              {activeSheetTab === 'section' && (
                <div className="w-full h-full flex flex-col justify-around py-4">
                  {/* Section A-A' */}
                  <div className="flex flex-col gap-1">
                    <div className="text-[11px] font-mono font-bold text-neutral-800 border-b border-neutral-300 pb-1 flex items-center justify-between">
                      <span>SECCIÓN LONGITUDINAL A-A' (CORTE POR Y = {bounds.centerY.toFixed(2)}m)</span>
                      <span className="text-neutral-500">H = 2.80m | FORJADO = 0.30m</span>
                    </div>
                    <svg viewBox="0 0 800 160" className="w-full h-32 bg-neutral-50 border border-neutral-200">
                      {/* Ground Line */}
                      <line x1="20" y1="120" x2="780" y2="120" stroke="#000" strokeWidth="2" />
                      <text x="30" y="135" fontSize="9" fontFamily="monospace" fill="#666">Cota ±0.00</text>
                      
                      {/* Foundation Slab */}
                      <rect x="60" y="120" width="680" height="20" fill="#94a3b8" stroke="#000" strokeWidth="1.5" />
                      
                      {/* Ceilings & Upper Slab */}
                      <rect x="60" y="40" width="680" height="15" fill="#94a3b8" stroke="#000" strokeWidth="1.5" />
                      <text x="30" y="48" fontSize="9" fontFamily="monospace" fill="#666">Cota +2.80</text>
                      <text x="30" y="32" fontSize="9" fontFamily="monospace" fill="#666">Cota +3.10</text>

                      {/* Cut Walls */}
                      <rect x="60" y="55" width="16" height="65" fill="#334155" stroke="#000" strokeWidth="1.5" />
                      <rect x="280" y="55" width="12" height="65" fill="#334155" stroke="#000" strokeWidth="1.5" />
                      <rect x="520" y="55" width="12" height="65" fill="#334155" stroke="#000" strokeWidth="1.5" />
                      <rect x="724" y="55" width="16" height="65" fill="#334155" stroke="#000" strokeWidth="1.5" />

                      {/* Interior Opening Doors */}
                      <rect x="360" y="65" width="40" height="55" fill="none" stroke="#0284c7" strokeWidth="1.5" />
                      <text x="372" y="95" fontSize="9" fontFamily="monospace" fill="#0284c7">P-01</text>
                    </svg>
                  </div>

                  {/* Elevation / Fachada */}
                  <div className="flex flex-col gap-1 mt-3">
                    <div className="text-[11px] font-mono font-bold text-neutral-800 border-b border-neutral-300 pb-1 flex items-center justify-between">
                      <span>ALZADO PRINCIPAL / FACHADA SUR</span>
                      <span className="text-neutral-500">ACABADO: ESTUCO BLANCO & CARPINTERÍA ANODIZADA</span>
                    </div>
                    <svg viewBox="0 0 800 140" className="w-full h-28 bg-neutral-50 border border-neutral-200">
                      {/* Ground line */}
                      <line x1="20" y1="120" x2="780" y2="120" stroke="#000" strokeWidth="2" />

                      {/* Exterior Wall Volume */}
                      <rect x="80" y="40" width="640" height="80" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
                      
                      {/* Parapet Roof line */}
                      <line x1="75" y1="38" x2="725" y2="38" stroke="#0f172a" strokeWidth="3" />

                      {/* Main Door */}
                      <rect x="140" y="65" width="35" height="55" fill="#b91c1c" stroke="#000" strokeWidth="1.5" />
                      <circle cx="145" cy="95" r="2" fill="#fff" />

                      {/* Large Living Window */}
                      <rect x="240" y="65" width="90" height="45" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
                      <line x1="285" y1="65" x2="285" y2="110" stroke="#0284c7" strokeWidth="1" />

                      {/* Bedroom Window */}
                      <rect x="520" y="65" width="65" height="45" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
                      <line x1="552" y1="65" x2="552" y2="110" stroke="#0284c7" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              )}

              {/* TAB 3: Schedules / Cuadro de Superficies y Carpintería */}
              {activeSheetTab === 'schedules' && (
                <div className="w-full h-full flex flex-col gap-4 overflow-y-auto py-2">
                  {/* Cuadro de Superficies */}
                  <div>
                    <div className="text-xs font-mono font-bold text-neutral-900 border-b border-neutral-400 pb-1 mb-2">
                      CUADRO DE SUPERFICIES ÚTILES Y HABITABILIDAD
                    </div>
                    <table className="w-full text-left text-[11px] font-mono border border-neutral-300">
                      <thead className="bg-neutral-100 border-b border-neutral-300 font-bold">
                        <tr>
                          <th className="p-1.5">REF</th>
                          <th className="p-1.5">ESTANCIA</th>
                          <th className="p-1.5">S. ÚTIL (m²)</th>
                          <th className="p-1.5">PAVIMENTO</th>
                          <th className="p-1.5">ILUMINACIÓN / CTE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {rooms.map((r, i) => (
                          <tr key={r.id}>
                            <td className="p-1.5 font-bold">{`E-${String(i + 1).padStart(2, '0')}`}</td>
                            <td className="p-1.5">{r.name}</td>
                            <td className="p-1.5 font-bold">{(r.areaSqM || r.width * r.height).toFixed(1)}</td>
                            <td className="p-1.5">{r.floorMaterial}</td>
                            <td className="p-1.5 text-emerald-700 font-semibold">Natural Directa (≥ 10%)</td>
                          </tr>
                        ))}
                        <tr className="bg-neutral-100 font-bold">
                          <td colSpan={2} className="p-1.5">TOTAL SUPERFICIE ÚTIL COMPUTABLE</td>
                          <td className="p-1.5 text-red-700">{totalUsableArea} m²</td>
                          <td colSpan={2} className="p-1.5 text-neutral-600">S. CONSTRUIDA APROX: {(+totalUsableArea * 1.2).toFixed(1)} m²</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Cuadro de Carpinterías */}
                  <div>
                    <div className="text-xs font-mono font-bold text-neutral-900 border-b border-neutral-400 pb-1 mb-2">
                      CUADRO OFICIAL DE CARPINTERÍAS (PUERTAS Y VENTANAS)
                    </div>
                    <table className="w-full text-left text-[11px] font-mono border border-neutral-300">
                      <thead className="bg-neutral-100 border-b border-neutral-300 font-bold">
                        <tr>
                          <th className="p-1.5">CÓDIGO</th>
                          <th className="p-1.5">TIPO</th>
                          <th className="p-1.5">DIMENSIONES (L x H)</th>
                          <th className="p-1.5">ANTEPECHO</th>
                          <th className="p-1.5">VIDRIO / MATERIAL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {openings.map((op, i) => (
                          <tr key={op.id}>
                            <td className="p-1.5 font-bold">{op.label || `${op.type === 'door' ? 'P' : 'V'}-${i + 1}`}</td>
                            <td className="p-1.5">{op.type === 'door' ? 'Puerta Abatible' : 'Ventana Corredera / Oscilobatiente'}</td>
                            <td className="p-1.5">{`${op.width.toFixed(2)} x ${op.height.toFixed(2)} m`}</td>
                            <td className="p-1.5">{op.sillHeight > 0 ? `${op.sillHeight.toFixed(2)} m` : '±0.00 m'}</td>
                            <td className="p-1.5">{op.type === 'door' ? 'Madera Lacada / Acero' : 'Doble 4/16/4 Bajo Emisivo'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Official Title Block (Cartela ISO 5457 / NBR 6492) */}
            <div className="border-2 border-neutral-900 grid grid-cols-4 font-mono text-xs">
              <div className="p-2 border-r border-neutral-900 flex flex-col justify-between">
                <span className="text-[9px] text-neutral-500 uppercase">PROYECTO</span>
                <strong className="text-xs tracking-tight text-neutral-900 truncate">
                  {projectName || 'PROYECTO ARQUITECTÓNICO UNIFICADO'}
                </strong>
                <span className="text-[10px] text-neutral-600">BELENT ARCHITECT SYSTEM</span>
              </div>

              <div className="p-2 border-r border-neutral-900 flex flex-col justify-between">
                <span className="text-[9px] text-neutral-500 uppercase">AUTORÍA / COLEGIADO</span>
                <span className="text-[11px] font-bold text-neutral-900">BELENTANI ARQUITECTURA</span>
                <span className="text-[10px] text-neutral-600">COAM / CAU / BIM MANAGER</span>
              </div>

              <div className="p-2 border-r border-neutral-900 flex flex-col justify-between">
                <span className="text-[9px] text-neutral-500 uppercase">FASE / DOCUMENTO</span>
                <span className="text-[11px] font-bold text-neutral-900">PROYECTO BÁSICO Y DE EJECUCIÓN</span>
                <span className="text-[10px] text-neutral-600">REV. 02 // {new Date().toLocaleDateString()}</span>
              </div>

              <div className="p-2 bg-neutral-900 text-white flex flex-col justify-between items-center text-center">
                <span className="text-[9px] text-neutral-400">PLANO Nº</span>
                <strong className="text-base tracking-widest text-red-500">
                  {activeSheetTab === 'plan' ? 'ARQ-01' : activeSheetTab === 'section' ? 'ARQ-02' : 'ARQ-03'}
                </strong>
                <span className="text-[10px] text-neutral-400">ESCALA {scale}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
