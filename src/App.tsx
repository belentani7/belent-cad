import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { UnifiedSidebar, SidebarTab } from './components/UnifiedSidebar';
import { UnifiedInspector, InspectorTab } from './components/UnifiedInspector';
import { AppleSpotlightCommand } from './components/AppleSpotlightCommand';
import { UnifiedTuiShelf } from './components/UnifiedTuiShelf';
import { CAD2DEditor } from './components/CAD2DEditor';
import { Viewer3D } from './components/Viewer3D';
import { ArchitecturalAnalysis } from './components/ArchitecturalAnalysis';
import { DocumentationEngine } from './components/DocumentationEngine';
import {
  CADWall,
  CADOpening,
  CADRoom,
  CADDimension,
  CADBlock,
  CADSlab,
  CADColumn,
  PaperSketchProject,
  Language,
  RenderStyleConfig,
  ViewMode,
  SystemStatus,
  AuditLogEntry,
} from './types/cad';
import { SAMPLE_PROJECTS, RENDER_STYLES } from './services/sampleBlueprints';
import { CommandContext } from './services/commandEngine';
import {
  Layers,
  Wand2,
  Sparkles,
  BookOpen,
  Terminal,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';

export default function App() {
  // Main canvas viewport mode
  const [viewportMode, setViewportMode] = useState<ViewMode>('cad2d');

  // Apple Unified Workspace Panels State
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(false);
  const [leftSidebarTab, setLeftSidebarTab] = useState<SidebarTab>('projects');

  const [isRightInspectorOpen, setIsRightInspectorOpen] = useState<boolean>(false);
  const [rightInspectorTab, setRightInspectorTab] = useState<InspectorTab>('bim');

  const [isSpotlightOpen, setIsSpotlightOpen] = useState<boolean>(false);
  const [isTuiOpen, setIsTuiOpen] = useState<boolean>(false);

  const [language, setLanguage] = useState<Language>('pt');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('idle');

  // Active Project Data
  const defaultProject = SAMPLE_PROJECTS[0];
  const [projectName, setProjectName] = useState<string>(defaultProject.name);
  const [walls, setWalls] = useState<CADWall[]>(defaultProject.walls);
  const [openings, setOpenings] = useState<CADOpening[]>(defaultProject.openings);
  const [rooms, setRooms] = useState<CADRoom[]>(defaultProject.rooms);
  const [dimensions, setDimensions] = useState<CADDimension[]>(defaultProject.dimensions);
  const [blocks, setBlocks] = useState<CADBlock[]>(defaultProject.blocks || []);
  const [slabs, setSlabs] = useState<CADSlab[]>(defaultProject.slabs || []);
  const [columns, setColumns] = useState<CADColumn[]>(defaultProject.columns || []);
  const [originalSketch, setOriginalSketch] = useState<string | undefined>(undefined);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  // Active Render Style
  const [renderStyle, setRenderStyle] = useState<RenderStyleConfig>(RENDER_STYLES[0]);

  // Global keyboard shortcuts (Apple Ergonomics: Cmd+K for Spotlight, Cmd+1 for Sidebar, Cmd+2 for Inspector, F2 for TUI, Esc to close)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      } else if (isCmdOrCtrl && e.key === '1') {
        e.preventDefault();
        setIsLeftSidebarOpen((prev) => !prev);
      } else if (isCmdOrCtrl && e.key === '2') {
        e.preventDefault();
        setIsRightInspectorOpen((prev) => !prev);
      } else if (e.key === 'F2') {
        e.preventDefault();
        setIsTuiOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isSpotlightOpen) {
          setIsSpotlightOpen(false);
        } else if (isTuiOpen) {
          setIsTuiOpen(false);
        } else if (isLeftSidebarOpen || isRightInspectorOpen) {
          setIsLeftSidebarOpen(false);
          setIsRightInspectorOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isSpotlightOpen, isTuiOpen, isLeftSidebarOpen, isRightInspectorOpen]);

  // Handle Loading a new Project (from templates or AI synthesis)
  const handleLoadProject = useCallback((project: PaperSketchProject) => {
    setProjectName(project.name);
    setWalls(project.walls);
    setOpenings(project.openings);
    setRooms(project.rooms);
    setDimensions(project.dimensions);
    setBlocks(project.blocks || []);
    if (project.slabs) setSlabs(project.slabs);
    if (project.columns) setColumns(project.columns);
    if (project.originalImage) {
      setOriginalSketch(project.originalImage);
    }
  }, []);

  // Handle Viewport changes from Header / Command Engine.
  // Panel-only targets (render, plugins, converter, opensource, tui) must open
  // their sidebar/inspector instead of an unhandled center viewport (blank screen).
  const handleSelectView = (view: ViewMode) => {
    switch (view) {
      case 'render':
        setIsRightInspectorOpen(true);
        setRightInspectorTab('render');
        return;
      case 'plugins':
      case 'analysis':
        setIsRightInspectorOpen(true);
        setRightInspectorTab(view === 'plugins' ? 'plugins' : 'analysis');
        return;
      case 'converter':
      case 'opensource':
        setIsLeftSidebarOpen(true);
        setLeftSidebarTab(view);
        return;
      case 'tui':
        setIsTuiOpen(true);
        return;
      case 'cad2d':
      case 'viewer3d':
      case 'split2d3d':
      case 'documentation':
        setViewportMode(view);
        return;
      default:
        setViewportMode('cad2d');
    }
  };

  // Log an audit entry
  const handleLogAudit = useCallback((entry: AuditLogEntry) => {
    setAuditLog((prev) => [entry, ...prev.slice(0, 49)]);
  }, []);

  // Command Context for Command Engine and AI Architect
  const commandContext: CommandContext = useMemo(
    () => ({
      projectName,
      walls,
      openings,
      rooms,
      dimensions,
      blocks,
      slabs,
      columns,
      language,
      onUpdateWalls: setWalls,
      onUpdateOpenings: setOpenings,
      onUpdateRooms: setRooms,
      onUpdateDimensions: setDimensions,
      onUpdateBlocks: setBlocks,
      onUpdateSlabs: setSlabs,
      onUpdateColumns: setColumns,
      onSelectView: handleSelectView,
      onLoadProject: handleLoadProject,
      onLogAudit: handleLogAudit,
    }),
    [projectName, walls, openings, rooms, dimensions, blocks, slabs, columns, language, handleLoadProject, handleLogAudit]
  );

  // Compute live project metrics
  const totalUsableArea = rooms.reduce((acc, r) => acc + (r.areaSqM || r.width * r.height || 0), 0);

  return (
    <div className="flex flex-col w-screen h-screen bg-[#08090d] text-neutral-100 overflow-hidden font-sans select-none">
      {/* Top Application Bar (Apple macOS Unified Toolbar) */}
      <Header
        currentView={viewportMode}
        language={language}
        projectName={projectName}
        walls={walls}
        openings={openings}
        rooms={rooms}
        dimensions={dimensions}
        isLeftSidebarOpen={isLeftSidebarOpen}
        onToggleLeftSidebar={() => setIsLeftSidebarOpen((prev) => !prev)}
        isRightInspectorOpen={isRightInspectorOpen}
        onToggleRightInspector={() => setIsRightInspectorOpen((prev) => !prev)}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        isTuiOpen={isTuiOpen}
        onToggleTui={() => setIsTuiOpen((prev) => !prev)}
        onSelectView={handleSelectView}
        onSelectLanguage={setLanguage}
        onLoadProject={handleLoadProject}
      />

      {/* Main Unified 3-Column Studio Workspace */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex">
        {/* 1. Left Sidebar: Projects, Paper-to-3D, Open Source Ecosystem */}
        <UnifiedSidebar
          isOpen={isLeftSidebarOpen}
          onClose={() => setIsLeftSidebarOpen(false)}
          activeTab={leftSidebarTab}
          onChangeTab={setLeftSidebarTab}
          projectName={projectName}
          language={language}
          onLoadProject={handleLoadProject}
          onGoTo3D={() => {
            setViewportMode('viewer3d');
            setIsLeftSidebarOpen(false);
          }}
          onGoToRender={() => {
            setIsLeftSidebarOpen(false);
            setIsRightInspectorOpen(true);
            setRightInspectorTab('render');
          }}
        />

        {/* 2. Center Hero Canvas: Edge-to-edge CAD / 3D viewport */}
        <main className="flex-1 h-full relative overflow-hidden flex flex-col bg-[#07080d]">
          {/* Central Viewport Area */}
          <div className="w-full h-full relative flex-1 overflow-hidden">
            {/* Viewport: 2D Technical CAD Drafting */}
            {viewportMode === 'cad2d' && (
              <CAD2DEditor
                projectName={projectName}
                walls={walls}
                openings={openings}
                rooms={rooms}
                dimensions={dimensions}
                blocks={blocks}
                language={language}
                initialTuiMode="docked"
                onSelectView={handleSelectView}
                onUpdateWalls={setWalls}
                onUpdateOpenings={setOpenings}
                onUpdateRooms={setRooms}
                onUpdateDimensions={setDimensions}
                onUpdateBlocks={setBlocks}
              />
            )}

            {/* Viewport: 3D Immersive Architectural Model with Slicing & Optics */}
            {viewportMode === 'viewer3d' && (
              <Viewer3D
                walls={walls}
                openings={openings}
                rooms={rooms}
                blocks={blocks}
                slabs={slabs}
                columns={columns}
                language={language}
                renderStyle={renderStyle}
              />
            )}

            {/* Viewport: Split Screen 2D + 3D Simultaneous */}
            {viewportMode === 'split2d3d' && (
              <div className="w-full h-full flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
                <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden">
                  <CAD2DEditor
                    projectName={projectName}
                    walls={walls}
                    openings={openings}
                    rooms={rooms}
                    dimensions={dimensions}
                    blocks={blocks}
                    language={language}
                    initialTuiMode="docked"
                    onSelectView={handleSelectView}
                    onUpdateWalls={setWalls}
                    onUpdateOpenings={setOpenings}
                    onUpdateRooms={setRooms}
                    onUpdateDimensions={setDimensions}
                    onUpdateBlocks={setBlocks}
                  />
                </div>
                <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden bg-[#05070c]">
                  <Viewer3D
                    walls={walls}
                    openings={openings}
                    rooms={rooms}
                    blocks={blocks}
                    slabs={slabs}
                    columns={columns}
                    language={language}
                    renderStyle={renderStyle}
                  />
                </div>
              </div>
            )}

            {/* Viewport: Documentation Engine (Láminas ISO 5457 A1/A2/A3) */}
            {viewportMode === 'documentation' && (
              <DocumentationEngine
                projectName={projectName}
                walls={walls}
                openings={openings}
                rooms={rooms}
                dimensions={dimensions}
                blocks={blocks}
                slabs={slabs}
                columns={columns}
                language={language}
              />
            )}

            {/* Viewport: Architectural Analysis & CTE/NBR Auditor */}
            {viewportMode === 'analysis' && (
              <ArchitecturalAnalysis
                walls={walls}
                openings={openings}
                rooms={rooms}
                language={language}
                onFixNormativeIssue={(issueId) => {
                  if (issueId.includes('door') || issueId.includes('access')) {
                    const updatedOps = openings.map((op) => (op.type === 'door' && op.width < 0.9 ? { ...op, width: 0.9 } : op));
                    setOpenings(updatedOps);
                  }
                }}
              />
            )}
          </div>

          {/* Unified TUI Console Shelf (Bottom Collapsible, F2) */}
          <UnifiedTuiShelf
            isOpen={isTuiOpen}
            onClose={() => setIsTuiOpen(false)}
            commandContext={commandContext}
            language={language}
          />
        </main>

        {/* 3. Right Inspector: BIM Tree, Photorealistic Render Studio, CTE Normative Audit, Plugins Hub */}
        <UnifiedInspector
          isOpen={isRightInspectorOpen}
          onClose={() => setIsRightInspectorOpen(false)}
          activeTab={rightInspectorTab}
          onChangeTab={setRightInspectorTab}
          walls={walls}
          openings={openings}
          rooms={rooms}
          blocks={blocks}
          slabs={slabs}
          columns={columns}
          originalSketch={originalSketch}
          language={language}
          onUpdateWall={(w) => setWalls((prev) => prev.map((item) => (item.id === w.id ? w : item)))}
          onUpdateOpening={(o) => setOpenings((prev) => prev.map((item) => (item.id === o.id ? o : item)))}
          onUpdateOpenings={setOpenings}
          onUpdateRoom={(r) => setRooms((prev) => prev.map((item) => (item.id === r.id ? r : item)))}
          onAddBlock={(b) => setBlocks((prev) => [...prev, b])}
          onApplyRenderStyle={setRenderStyle}
          onFixNormativeIssue={(issueId) => {
            if (issueId.includes('door') || issueId.includes('access')) {
              setOpenings((prev) => prev.map((op) => (op.type === 'door' && op.width < 0.9 ? { ...op, width: 0.9 } : op)));
            }
          }}
        />
      </div>

      {/* Apple Spotlight Command Palette (⌘K) */}
      <AppleSpotlightCommand
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        commandContext={commandContext}
        onExecutionComplete={(msg, success) => {
          setSystemStatus(success ? 'success' : 'error');
          setTimeout(() => setSystemStatus('idle'), 4000);
        }}
      />

      {/* Apple Minimal Status Bar at Bottom */}
      <footer className="h-6 bg-[#090b10]/98 border-t border-white/[0.08] px-3 sm:px-4 flex items-center justify-between text-[10px] font-mono text-neutral-400 z-20 shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="font-semibold text-white">BELENT STUDIO</span>
          </div>
          <span className="text-neutral-600">·</span>
          <span>Escala 1:50</span>
          <span className="text-neutral-600 hidden sm:inline">·</span>
          <span className="text-neutral-300 hidden sm:inline">{walls.length} muros</span>
          <span className="text-neutral-600 hidden sm:inline">·</span>
          <span className="text-neutral-300 hidden sm:inline">{openings.length} huecos</span>
          <span className="text-neutral-600">·</span>
          <span className="text-emerald-400 font-medium">{totalUsableArea.toFixed(1)} m² útiles</span>
        </div>

        <div className="flex items-center gap-2">
          {/* System Status indicator dot */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] uppercase">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                systemStatus === 'idle'
                  ? 'bg-emerald-400'
                  : systemStatus === 'processing'
                  ? 'bg-amber-400 animate-ping'
                  : systemStatus === 'success'
                  ? 'bg-sky-400'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-neutral-400">{systemStatus}</span>
          </div>

          {/* Quick Module Shortcuts */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => {
                setIsLeftSidebarOpen(true);
                setLeftSidebarTab('projects');
              }}
              className="px-1.5 py-0.5 rounded hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1"
            >
              <FolderOpen className="w-2.5 h-2.5 text-red-400" />
              <span>Proyectos</span>
            </button>

            <button
              onClick={() => {
                setIsLeftSidebarOpen(true);
                setLeftSidebarTab('converter');
              }}
              className="px-1.5 py-0.5 rounded hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1"
            >
              <Wand2 className="w-2.5 h-2.5 text-amber-300" />
              <span>Boceto</span>
            </button>

            <button
              onClick={() => {
                setIsRightInspectorOpen(true);
                setRightInspectorTab('bim');
              }}
              className="px-1.5 py-0.5 rounded hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1"
            >
              <Layers className="w-2.5 h-2.5 text-sky-400" />
              <span>BIM</span>
            </button>

            <button
              onClick={() => {
                setIsRightInspectorOpen(true);
                setRightInspectorTab('render');
              }}
              className="px-1.5 py-0.5 rounded hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-2.5 h-2.5 text-rose-400" />
              <span>Render</span>
            </button>

            <button
              onClick={() => setIsTuiOpen((prev) => !prev)}
              className={`px-1.5 py-0.5 rounded transition-colors flex items-center gap-1 ${
                isTuiOpen ? 'bg-emerald-600/20 text-emerald-300' : 'hover:text-emerald-400 hover:bg-white/[0.06]'
              }`}
            >
              <Terminal className="w-2.5 h-2.5" />
              <span>F2</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
