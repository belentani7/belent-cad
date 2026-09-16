import React from 'react';
import {
  CADWall,
  CADOpening,
  CADRoom,
  CADBlock,
  CADSlab,
  CADColumn,
  Language,
  RenderStyleConfig,
} from '../types/cad';
import { BIMInspector } from './BIMInspector';
import { PhotorealisticStudio } from './PhotorealisticStudio';
import { ArchitecturalAnalysis } from './ArchitecturalAnalysis';
import { ArchitecturalPluginsHub } from './ArchitecturalPluginsHub';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  Puzzle,
  X,
} from 'lucide-react';

export type InspectorTab = 'bim' | 'render' | 'analysis' | 'plugins';

interface UnifiedInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: InspectorTab;
  onChangeTab: (tab: InspectorTab) => void;
  walls: CADWall[];
  openings: CADOpening[];
  rooms: CADRoom[];
  blocks?: CADBlock[];
  slabs?: CADSlab[];
  columns?: CADColumn[];
  originalSketch?: string;
  language: Language;
  onUpdateWall?: (wall: CADWall) => void;
  onUpdateOpening?: (op: CADOpening) => void;
  onUpdateOpenings?: (ops: CADOpening[]) => void;
  onUpdateRoom?: (room: CADRoom) => void;
  onAddBlock?: (block: CADBlock) => void;
  onApplyRenderStyle: (style: RenderStyleConfig) => void;
  onFixNormativeIssue?: (issueId: string) => void;
}

export const UnifiedInspector: React.FC<UnifiedInspectorProps> = ({
  isOpen,
  onClose,
  activeTab,
  onChangeTab,
  walls,
  openings,
  rooms,
  blocks = [],
  slabs = [],
  columns = [],
  originalSketch,
  language,
  onUpdateWall,
  onUpdateOpening,
  onUpdateOpenings,
  onUpdateRoom,
  onAddBlock,
  onApplyRenderStyle,
  onFixNormativeIssue,
}) => {
  if (!isOpen) return null;

  const t = {
    es: {
      inspector: 'Inspector Técnico',
      bim: 'Árbol BIM',
      render: 'Render Foto',
      analysis: 'Normativa CTE',
      plugins: 'Plugins & Auditoría',
    },
    pt: {
      inspector: 'Inspetor Técnico',
      bim: 'Árvore BIM',
      render: 'Render Foto',
      analysis: 'Norma NBR',
      plugins: 'Plugins & Auditoria',
    },
    en: {
      inspector: 'Technical Inspector',
      bim: 'BIM Tree',
      render: 'Photo Render',
      analysis: 'Code Audit',
      plugins: 'Plugins & Tools',
    },
  }[language];

  return (
    <aside className="w-full sm:w-[500px] lg:w-[580px] xl:w-[640px] h-full bg-[#0c0e15]/95 border-l border-white/[0.08] backdrop-blur-2xl flex flex-col shrink-0 z-20 select-none animate-in slide-in-from-right duration-200">
      {/* Inspector Header with Apple Segmented Tab Control */}
      <div className="p-3 border-b border-white/[0.08] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center p-0.5 rounded-full bg-black/40 border border-white/[0.08] text-xs flex-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onChangeTab('bim')}
            className={`flex-1 py-1 px-2 rounded-full flex items-center justify-center gap-1.5 transition-all text-[11px] whitespace-nowrap ${
              activeTab === 'bim'
                ? 'bg-white/15 text-white font-semibold shadow-sm border border-white/10'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3 text-sky-400" />
            <span>{t.bim}</span>
          </button>

          <button
            onClick={() => onChangeTab('render')}
            className={`flex-1 py-1 px-2 rounded-full flex items-center justify-center gap-1.5 transition-all text-[11px] whitespace-nowrap ${
              activeTab === 'render'
                ? 'bg-white/15 text-white font-semibold shadow-sm border border-white/10'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>{t.render}</span>
          </button>

          <button
            onClick={() => onChangeTab('analysis')}
            className={`flex-1 py-1 px-2 rounded-full flex items-center justify-center gap-1.5 transition-all text-[11px] whitespace-nowrap ${
              activeTab === 'analysis'
                ? 'bg-white/15 text-white font-semibold shadow-sm border border-white/10'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>{t.analysis}</span>
          </button>

          <button
            onClick={() => onChangeTab('plugins')}
            className={`flex-1 py-1 px-2 rounded-full flex items-center justify-center gap-1.5 transition-all text-[11px] whitespace-nowrap ${
              activeTab === 'plugins'
                ? 'bg-white/15 text-white font-semibold shadow-sm border border-white/10'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Puzzle className="w-3 h-3 text-emerald-400" />
            <span>{t.plugins}</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors shrink-0"
          title="Ocultar inspector (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: BIM Semantic Tree & Properties */}
      {activeTab === 'bim' && (
        <div className="flex-1 overflow-hidden">
          <BIMInspector
            walls={walls}
            openings={openings}
            rooms={rooms}
            slabs={slabs}
            columns={columns}
            language={language}
            onUpdateWall={onUpdateWall}
            onUpdateOpening={onUpdateOpening}
            onUpdateRoom={onUpdateRoom}
          />
        </div>
      )}

      {/* Tab 2: Photorealistic Render Studio */}
      {activeTab === 'render' && (
        <div className="flex-1 overflow-y-auto">
          <PhotorealisticStudio
            walls={walls}
            rooms={rooms}
            originalSketch={originalSketch}
            language={language}
            onApplyStyle={onApplyRenderStyle}
          />
        </div>
      )}

      {/* Tab 3: Normative Analysis CTE / NBR */}
      {activeTab === 'analysis' && (
        <div className="flex-1 overflow-y-auto">
          <ArchitecturalAnalysis
            walls={walls}
            openings={openings}
            rooms={rooms}
            language={language}
            onFixNormativeIssue={onFixNormativeIssue}
          />
        </div>
      )}

      {/* Tab 4: Professional Architectural Plugins & Parity Audit */}
      {activeTab === 'plugins' && (
        <div className="flex-1 overflow-hidden">
          <ArchitecturalPluginsHub
            walls={walls}
            openings={openings}
            rooms={rooms}
            blocks={blocks}
            slabs={slabs}
            columns={columns}
            language={language}
            onAddBlock={onAddBlock}
            onUpdateOpening={onUpdateOpening}
            onUpdateOpenings={onUpdateOpenings}
          />
        </div>
      )}
    </aside>
  );
};
