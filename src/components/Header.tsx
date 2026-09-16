import React, { useState } from 'react';
import { Language, ViewMode, CADWall, CADOpening, CADRoom, CADDimension, PaperSketchProject } from '../types/cad';
import {
  exportToDXF,
  exportToIFC,
  exportToOBJ,
  exportToArchitecturalSheetSVG,
  openArchitecturalSheetForPrint,
  triggerFileDownload,
} from '../services/cadExporters';
import { SAMPLE_PROJECTS } from '../services/sampleBlueprints';
import {
  Square,
  Box,
  Sparkles,
  Download,
  FolderOpen,
  Info,
  Layers,
  ChevronDown,
  Columns2,
  Printer,
  FileSpreadsheet,
  Terminal,
  ShieldCheck,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Check,
  FileCode,
} from 'lucide-react';

export type ActiveDrawerType =
  | 'converter'
  | 'render'
  | 'opensource'
  | 'tui'
  | 'bim_inspector'
  | 'ai_architect'
  | null;

export interface HeaderProps {
  currentView: ViewMode;
  language: Language;
  projectName: string;
  walls: CADWall[];
  openings: CADOpening[];
  rooms: CADRoom[];
  dimensions: CADDimension[];
  // Apple Unified Window controls
  isLeftSidebarOpen?: boolean;
  onToggleLeftSidebar?: () => void;
  isRightInspectorOpen?: boolean;
  onToggleRightInspector?: () => void;
  onOpenSpotlight?: () => void;
  isTuiOpen?: boolean;
  onToggleTui?: () => void;
  // Navigation & Handlers
  onSelectView: (view: ViewMode) => void;
  onSelectLanguage: (lang: Language) => void;
  onLoadProject: (project: PaperSketchProject) => void;
  // Fallbacks for drawer triggers
  activeDrawer?: ActiveDrawerType;
  onToggleDrawer?: (drawer: NonNullable<ActiveDrawerType>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  language,
  projectName,
  walls,
  openings,
  rooms,
  dimensions,
  isLeftSidebarOpen = false,
  onToggleLeftSidebar,
  isRightInspectorOpen = false,
  onToggleRightInspector,
  onOpenSpotlight,
  isTuiOpen = false,
  onToggleTui,
  onSelectView,
  onSelectLanguage,
  onLoadProject,
  activeDrawer,
  onToggleDrawer,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showProjectsMenu, setShowProjectsMenu] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const t = {
    es: {
      cad2d: '2D Plano',
      split2d3d: 'Dividido',
      viewer3d: '3D Maqueta',
      documentation: 'Láminas ISO',
      analysis: 'Auditoría CTE',
      sidebar: 'Biblioteca',
      inspector: 'Inspector',
      spotlight: 'Asistente IA',
      tui: 'Terminal',
      export: 'Exportar',
      printSheet: 'Imprimir Lámina ISO 5457 (PDF)',
      svgSheet: 'Descargar Lámina Vectorial (.SVG)',
      dxf: 'Exportar DXF (AutoCAD)',
      ifc: 'Exportar IFC (OpenBIM 2x3)',
      obj: 'Exportar Malla 3D (.OBJ)',
      authorSubtitle: 'Estación Arquitectónica Unificada',
      about: 'Acerca de BELENT CAD',
    },
    pt: {
      cad2d: '2D Planta',
      split2d3d: 'Dividido',
      viewer3d: '3D Maquete',
      documentation: 'Pranchas NBR',
      analysis: 'Auditoria NBR',
      sidebar: 'Biblioteca',
      inspector: 'Inspetor',
      spotlight: 'Assistente IA',
      tui: 'Terminal',
      export: 'Exportar',
      printSheet: 'Imprimir Prancha NBR 6492 (PDF)',
      svgSheet: 'Baixar Prancha Vetorial (.SVG)',
      dxf: 'Exportar DXF (AutoCAD)',
      ifc: 'Exportar IFC (OpenBIM)',
      obj: 'Exportar Malha 3D (.OBJ)',
      authorSubtitle: 'Estação Arquitetônica Unificada',
      about: 'Sobre BELENT CAD',
    },
    en: {
      cad2d: '2D Plan',
      split2d3d: 'Split View',
      viewer3d: '3D Model',
      documentation: 'ISO Sheets',
      analysis: 'BIM Audit',
      sidebar: 'Library',
      inspector: 'Inspector',
      spotlight: 'AI Assistant',
      tui: 'Terminal',
      export: 'Export',
      printSheet: 'Print ISO 5457 Sheet (PDF)',
      svgSheet: 'Download Vector Sheet (.SVG)',
      dxf: 'Export DXF (AutoCAD)',
      ifc: 'Export IFC (OpenBIM)',
      obj: 'Export 3D Mesh (.OBJ)',
      authorSubtitle: 'Unified Architecture Workstation',
      about: 'About BELENT CAD',
    },
  }[language];

  const handlePrintSheet = () => {
    const svgString = exportToArchitecturalSheetSVG(projectName, walls, openings, rooms, dimensions, language);
    openArchitecturalSheetForPrint(svgString, projectName);
    setShowExportMenu(false);
  };

  const handleDownloadSheetSVG = () => {
    const svgString = exportToArchitecturalSheetSVG(projectName, walls, openings, rooms, dimensions, language);
    triggerFileDownload(svgString, `${projectName.replace(/\s+/g, '_')}_Lamina_ISO5457.svg`, 'image/svg+xml');
    setShowExportMenu(false);
  };

  const handleExportDXF = () => {
    const dxfString = exportToDXF(projectName, walls, openings, rooms, dimensions);
    triggerFileDownload(dxfString, `${projectName.replace(/\s+/g, '_')}.dxf`, 'application/dxf');
    setShowExportMenu(false);
  };

  const handleExportIFC = () => {
    const ifcString = exportToIFC(projectName, walls, rooms);
    triggerFileDownload(ifcString, `${projectName.replace(/\s+/g, '_')}.ifc`, 'application/x-step');
    setShowExportMenu(false);
  };

  const handleExportOBJ = () => {
    const objString = exportToOBJ(projectName, walls, rooms);
    triggerFileDownload(objString, `${projectName.replace(/\s+/g, '_')}.obj`, 'text/plain');
    setShowExportMenu(false);
  };

  return (
    <header className="w-full h-12 bg-[#090b10]/95 border-b border-white/[0.08] px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 select-none backdrop-blur-2xl">
      {/* Left Section: macOS Chrome & Brand & Sidebar Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Apple Style Window Indicator Dots */}
        <div className="flex items-center gap-1.5 pr-1 hidden sm:flex">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-[#e0443e]/50 opacity-80 hover:opacity-100 transition-opacity" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e] border border-[#d89e24]/50 opacity-80 hover:opacity-100 transition-opacity" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840] border border-[#1aab29]/50 opacity-80 hover:opacity-100 transition-opacity" />
        </div>

        {/* Brand & Studio Tag */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-sm shadow-red-600/30">
            <Box className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs tracking-tight text-white font-sans">BELENT CAD</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.06] text-neutral-300 border border-white/[0.08] font-medium hidden sm:inline">
              STUDIO
            </span>
          </div>
        </div>

        {/* Left Sidebar Toggle Button */}
        {onToggleLeftSidebar && (
          <button
            onClick={onToggleLeftSidebar}
            className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-xs ${
              isLeftSidebarOpen
                ? 'bg-red-600/20 text-red-300 border-red-500/40 shadow-sm'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white border-white/[0.06] hover:bg-white/[0.08]'
            }`}
            title="Panel Lateral: Proyectos, Bocetos y Normas (⌘1)"
          >
            {isLeftSidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            <span className="hidden md:inline text-[11px]">{t.sidebar}</span>
          </button>
        )}

        {/* Project Selector Pill */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setShowProjectsMenu(!showProjectsMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs text-neutral-300 hover:text-white border border-white/[0.08] transition-colors"
          >
            <FolderOpen className="w-3 h-3 text-red-400" />
            <span className="max-w-[130px] truncate text-[11px] font-medium">{projectName}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {showProjectsMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#11131a]/98 rounded-2xl shadow-2xl border border-white/15 p-1.5 flex flex-col gap-1 z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100">
              <span className="text-[10px] font-medium text-neutral-400 px-2.5 py-1">Proyectos Predefinidos:</span>
              {SAMPLE_PROJECTS.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => {
                    onLoadProject(proj);
                    setShowProjectsMenu(false);
                  }}
                  className={`text-left px-2.5 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                    projectName === proj.name
                      ? 'bg-red-600/20 text-red-300 border border-red-500/30 font-medium'
                      : 'text-neutral-200 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{proj.name}</span>
                    <span className="text-[10px] text-neutral-400">{proj.totalAreaSqM} m² · {proj.walls.length} muros</span>
                  </div>
                  {projectName === proj.name && <Check className="w-3.5 h-3.5 text-red-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Section: Apple Segmented View Controller */}
      <nav className="flex items-center p-0.5 rounded-full bg-black/40 border border-white/[0.08] text-xs">
        <button
          onClick={() => onSelectView('cad2d')}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all text-[11px] ${
            currentView === 'cad2d'
              ? 'bg-white/15 text-white font-semibold shadow-sm border border-white/10'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Lienzo 2D Técnico CAD"
        >
          <Square className="w-3 h-3 text-red-400" />
          <span>{t.cad2d}</span>
        </button>

        <button
          onClick={() => onSelectView('split2d3d')}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all text-[11px] ${
            currentView === 'split2d3d'
              ? 'bg-white/15 text-white font-semibold shadow-sm border border-white/10'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Vista dividida simultánea 2D y 3D"
        >
          <Columns2 className="w-3 h-3 text-rose-400" />
          <span className="hidden sm:inline">{t.split2d3d}</span>
        </button>

        <button
          onClick={() => onSelectView('viewer3d')}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all text-[11px] ${
            currentView === 'viewer3d'
              ? 'bg-white/15 text-white font-semibold shadow-sm border border-white/10'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Maqueta 3D Interactiva & Óptica"
        >
          <Box className="w-3 h-3 text-sky-400" />
          <span>{t.viewer3d}</span>
        </button>

        <button
          onClick={() => onSelectView('documentation')}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all text-[11px] ${
            currentView === 'documentation'
              ? 'bg-white/15 text-white font-semibold shadow-sm border border-white/10'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Láminas oficiales ISO 5457 / NBR 6492"
        >
          <FileText className="w-3 h-3 text-emerald-400" />
          <span className="hidden md:inline">{t.documentation}</span>
        </button>

        <button
          onClick={() => onSelectView('analysis')}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all text-[11px] ${
            currentView === 'analysis'
              ? 'bg-white/15 text-white font-semibold shadow-sm border border-white/10'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Auditoría Normativa CTE DB-SUA / DB-HS y Detección de Colisiones"
        >
          <ShieldCheck className="w-3 h-3 text-amber-400" />
          <span className="hidden lg:inline">{t.analysis}</span>
        </button>
      </nav>

      {/* Right Section: Apple Action Hub (Spotlight, Inspector, TUI, Export, Language, About) */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Apple Spotlight / AI Assistant Pill Button */}
        {onOpenSpotlight && (
          <button
            onClick={onOpenSpotlight}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600/20 via-rose-600/20 to-purple-600/20 text-neutral-200 hover:text-white border border-red-500/30 hover:border-red-500/60 shadow-sm transition-all text-xs group"
            title="Asistente de Síntesis Arquitectónica IA (⌘K)"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="hidden xl:inline text-[11px] font-medium">{t.spotlight}</span>
            <kbd className="hidden sm:inline px-1.5 py-0.2 rounded bg-black/40 text-[10px] text-neutral-400 font-mono border border-white/10">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Right Inspector Toggle Button */}
        {onToggleRightInspector && (
          <button
            onClick={onToggleRightInspector}
            className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-xs ${
              isRightInspectorOpen
                ? 'bg-red-600/20 text-red-300 border-red-500/40 shadow-sm'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white border-white/[0.06] hover:bg-white/[0.08]'
            }`}
            title="Inspector: Propiedades BIM, Render y CTE (⌘2)"
          >
            {isRightInspectorOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            <span className="hidden md:inline text-[11px]">{t.inspector}</span>
          </button>
        )}

        {/* TUI Terminal Toggle Button */}
        {onToggleTui && (
          <button
            onClick={onToggleTui}
            className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-xs ${
              isTuiOpen
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-white/[0.04] text-neutral-400 hover:text-emerald-400 border-white/[0.06] hover:bg-white/[0.08]'
            }`}
            title="Consola de Comandos TUI y Batería de Pruebas (F2)"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px] font-mono">F2</span>
          </button>
        )}

        {/* Export Action Menu */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 hover:text-white border border-white/[0.08] transition-all text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline text-[11px]">{t.export}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-1.5 w-64 bg-[#11131a]/98 rounded-2xl shadow-2xl border border-white/15 p-1.5 flex flex-col gap-1 z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100">
              <span className="text-[10px] font-medium text-neutral-400 px-2.5 py-1">Documentación Oficial:</span>
              <button
                onClick={handlePrintSheet}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-white/[0.08] text-neutral-200 transition-colors flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5 text-red-400" />
                <span className="font-medium">{t.printSheet}</span>
              </button>
              <button
                onClick={handleDownloadSheetSVG}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-white/[0.08] text-neutral-200 transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.svgSheet}</span>
              </button>

              <div className="h-[1px] bg-white/[0.08] my-1" />
              <span className="text-[10px] font-medium text-neutral-400 px-2.5 py-0.5">Intercambio Técnico:</span>

              <button
                onClick={handleExportDXF}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-white/[0.08] text-neutral-200 transition-colors flex items-center gap-2"
              >
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.dxf}</span>
              </button>
              <button
                onClick={handleExportIFC}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-white/[0.08] text-neutral-200 transition-colors flex items-center gap-2"
              >
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.ifc}</span>
              </button>
              <button
                onClick={handleExportOBJ}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-white/[0.08] text-neutral-200 transition-colors flex items-center gap-2"
              >
                <Box className="w-3.5 h-3.5 text-purple-400" />
                <span>{t.obj}</span>
              </button>
            </div>
          )}
        </div>

        {/* Language Selector Pill */}
        <div className="flex items-center bg-black/40 rounded-full p-0.5 border border-white/[0.08] text-[10px] font-mono">
          {(['pt', 'es', 'en'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onSelectLanguage(lang)}
              className={`px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                language === lang ? 'bg-white/20 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* About Button */}
        <button
          onClick={() => setShowAboutModal(true)}
          className="p-1.5 rounded-full bg-white/[0.04] text-neutral-400 hover:text-white border border-white/[0.06] transition-colors"
          title={t.about}
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e1017] rounded-3xl p-6 border border-white/15 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white font-sans">BELENT CAD // STUDIO</h3>
                  <p className="text-[11px] text-neutral-400">{t.authorSubtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAboutModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white text-xs transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Sistema unificado de diseño y documentación arquitectónica inspirado en los principios de simplicidad, ergonomía y claridad de <strong>Apple Human Interface Guidelines</strong> y la metodología técnica de <strong>Pedro Belentani</strong>.
            </p>

            <div className="bg-black/40 rounded-2xl p-3.5 border border-white/[0.06] flex flex-col gap-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2 text-red-400 font-medium text-[11px]">
                <Layers className="w-3.5 h-3.5" />
                <span>ARQUITECTURA DE TRIPLE PANEL UNIFICADO:</span>
              </div>
              <ul className="space-y-1 text-[11px] text-neutral-400">
                <li>• <strong>Panel Lateral Izquierdo (⌘1)</strong>: Biblioteca de Proyectos, Digitalizador de Bocetos y Ecosistema Open Source.</li>
                <li>• <strong>Lienzo Central</strong>: Plano 2D Técnico, Visor 3D con Óptica, Split 2D+3D y Láminas ISO 5457 / NBR 6492.</li>
                <li>• <strong>Inspector Derecho (⌘2)</strong>: Árbol Semántico BIM (IFC 2x3), Estudio de Render Fotorrealista y Auditoría CTE.</li>
                <li>• <strong>Asistente Spotlight (⌘K)</strong>: Síntesis paramétrica y ejecución instantánea de comandos directos.</li>
                <li>• <strong>Consola TUI (F2)</strong>: Diagnóstico técnico en tiempo real y batería de pruebas automáticas.</li>
              </ul>
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-all shadow-md shadow-red-600/30 font-sans"
            >
              Comenzar a Diseñar
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
