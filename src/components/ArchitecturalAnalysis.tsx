import React, { useMemo } from 'react';
import {
  CADWall,
  CADOpening,
  CADRoom,
  CADSlab,
  CADColumn,
  Language,
} from '../types/cad';
import { runArchitecturalAnalysis } from '../services/architecturalAnalysis';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Ruler,
  Maximize2,
  Wind,
  Layers,
  ArrowRight,
  Info,
  Wrench,
  Download
} from 'lucide-react';

interface ArchitecturalAnalysisProps {
  walls: CADWall[];
  openings: CADOpening[];
  rooms: CADRoom[];
  slabs?: CADSlab[];
  columns?: CADColumn[];
  language: Language;
  onUpdateOpenings?: (openings: CADOpening[]) => void;
  onUpdateWalls?: (walls: CADWall[]) => void;
}

export const ArchitecturalAnalysis: React.FC<ArchitecturalAnalysisProps> = ({
  walls,
  openings,
  rooms,
  slabs = [],
  columns = [],
  language,
  onUpdateOpenings,
  onUpdateWalls,
}) => {
  const report = useMemo(() => {
    return runArchitecturalAnalysis(walls, openings, rooms, slabs, columns, language);
  }, [walls, openings, rooms, slabs, columns, language]);

  const handleFixDoorWidth = (openingId: string) => {
    if (!onUpdateOpenings) return;
    const updated = openings.map((op) => {
      if (op.id === openingId) {
        return { ...op, width: 0.85 }; // Fix to standard 0.85m compliant width
      }
      return op;
    });
    onUpdateOpenings(updated);
  };

  const handleRemoveShortWall = (wallId: string) => {
    if (!onUpdateWalls) return;
    const updated = walls.filter((w) => w.id !== wallId);
    onUpdateWalls(updated);
  };

  const handleExportReport = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BELENT_Architectural_Audit_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full bg-[#05070c] text-neutral-200 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 select-none font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shadow-lg shadow-red-600/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide font-mono uppercase">
              BELENT ARCHITECTURAL AUDITOR // CTE & NBR
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Validación de habitabilidad, accesibilidad normativa, dimensionamiento y detección de conflictos espaciales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportReport}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-neutral-200 border border-white/10 flex items-center gap-1.5 transition-colors"
            title="Descargar informe de auditoría en JSON"
          >
            <Download className="w-3.5 h-3.5 text-red-400" />
            <span>Descargar Dictamen</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Belentani Red Glass) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Usable vs Gross Area */}
        <div className="p-4 rounded-2xl bg-[#090d16]/90 border border-red-500/20 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>SUPERFICIE ÚTIL</span>
            <Ruler className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-white tracking-tight">
              {report.usableAreaSqM}
            </span>
            <span className="text-xs text-red-400 font-mono ml-1">m²</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-1">
            Construida est.: <strong className="text-neutral-300">{report.grossBuiltAreaSqM} m²</strong>
          </div>
        </div>

        {/* Accessibility Compliance */}
        <div className="p-4 rounded-2xl bg-[#090d16]/90 border border-red-500/20 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>PASO ACCESIBLE (SUA)</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-emerald-400 tracking-tight">
              {(report.accessibilityComplianceRatio * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">CTE DB-SUA 1.2</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-1">
            {report.doorChecks.filter((d) => d.status === 'COMPLIANT').length} de {report.doorChecks.length} vanos ≥ 0.80m
          </div>
        </div>

        {/* Bioclimatic Ventilation */}
        <div className="p-4 rounded-2xl bg-[#090d16]/90 border border-red-500/20 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>VENTILACIÓN NATURAL</span>
            <Wind className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-sky-400 tracking-tight">
              {(report.ventilationComplianceRatio * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">CTE DB-HS 3</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-1">
            Ratio mínimo luz/piso ≥ 10%
          </div>
        </div>

        {/* BIM Health Score */}
        <div className="p-4 rounded-2xl bg-[#090d16]/90 border border-red-500/20 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
            <span>ÍNDICE BIM IFC</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-amber-400 tracking-tight">
              {report.bimHealthScore}%
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">ISO 16739</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-1">
            {report.clashes.length} conflicto(s) geométrico(s)
          </div>
        </div>
      </div>

      {/* Conflict & Clashes Box (if any) */}
      {report.clashes.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold font-mono">
            <AlertTriangle className="w-4 h-4" />
            <span>DISCREPANCIAS Y CONFLICTOS DETECTADOS ({report.clashes.length})</span>
          </div>

          <div className="flex flex-col gap-2">
            {report.clashes.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-black/40 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono font-bold text-[10px]">
                      {c.type}
                    </span>
                    <span className="text-neutral-200">{c.description}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 italic">Solución: {c.suggestedFix}</span>
                </div>

                {c.type === 'ZERO_LENGTH_WALL' && (
                  <button
                    onClick={() => handleRemoveShortWall(c.elementIds[0])}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 font-mono text-[11px] border border-red-500/30 flex items-center gap-1 transition-colors"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Eliminar Muro Nulo</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Analysis Tables (Two Columns on large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Table 1: Door Accessibility Pass Checks */}
        <div className="p-4 rounded-2xl bg-[#090d16]/90 border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-xs font-mono text-white uppercase tracking-wider">
                Comprobación de Vanos y Puertas (CTE DB-SUA / NBR 9050)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
              Vano min. 0.80 m
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-neutral-400 border-b border-white/10 text-[10px]">
                  <th className="pb-2">VANO</th>
                  <th className="pb-2">ANCHO</th>
                  <th className="pb-2">ESTADO</th>
                  <th className="pb-2 text-right">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {report.doorChecks.map((door) => (
                  <tr key={door.openingId} className="hover:bg-white/[0.02]">
                    <td className="py-2 text-white font-medium">{door.label}</td>
                    <td className="py-2 text-neutral-300">{door.clearWidth.toFixed(2)} m</td>
                    <td className="py-2">
                      {door.status === 'COMPLIANT' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>CONFORME</span>
                        </span>
                      )}
                      {door.status === 'WARNING' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>ASEO SEC.</span>
                        </span>
                      )}
                      {door.status === 'VIOLATION' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">
                          <XCircle className="w-3 h-3" />
                          <span>&lt; 0.80m</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      {door.status !== 'COMPLIANT' && (
                        <button
                          onClick={() => handleFixDoorWidth(door.openingId)}
                          className="px-2 py-0.5 rounded bg-red-600/20 hover:bg-red-600/40 text-red-300 text-[10px] border border-red-500/30 transition-colors"
                          title="Ajustar a 0.85m conforme normativa"
                        >
                          Ajustar a 0.85m
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Ventilation & Lighting (CTE DB-HS 3) */}
        <div className="p-4 rounded-2xl bg-[#090d16]/90 border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-xs font-mono text-white uppercase tracking-wider">
                Ventilación e Iluminación (CTE DB-HS 3 / NBR 15575)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
              Ratio min. 10%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-neutral-400 border-b border-white/10 text-[10px]">
                  <th className="pb-2">ESTANCIA</th>
                  <th className="pb-2">ÁREA</th>
                  <th className="pb-2">VENTANAS</th>
                  <th className="pb-2">RATIO</th>
                  <th className="pb-2 text-right">DICTAMEN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {report.ventilationChecks.map((v) => (
                  <tr key={v.roomId} className="hover:bg-white/[0.02]">
                    <td className="py-2 text-white font-medium">{v.roomName}</td>
                    <td className="py-2 text-neutral-300">{v.roomArea} m²</td>
                    <td className="py-2 text-neutral-300">{v.glazingArea} m²</td>
                    <td className="py-2">
                      <span className={v.actualRatio >= v.requiredRatio ? 'text-emerald-400' : 'text-amber-400'}>
                        {(v.actualRatio * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      {v.status === 'COMPLIANT' && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          CONFORME
                        </span>
                      )}
                      {v.status === 'NON_COMPLIANT' && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                          REVISAR
                        </span>
                      )}
                      {v.status === 'NOT_APPLICABLE' && (
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-400 text-[10px]">
                          MECÁNICA
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Reviewer & Certified Audit Log */}
      <div className="p-4 rounded-2xl bg-[#090d16]/90 border border-red-500/20 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold">
          <Info className="w-4 h-4" />
          <span>DICTAMEN TÉCNICO OFICIAL DEL AUDITOR ARQUITECTÓNICO</span>
        </div>
        <div className="flex flex-col gap-1.5 mt-1 font-mono text-xs">
          {report.aiReviewerNotes.map((note, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-neutral-300 leading-relaxed"
            >
              {note}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
