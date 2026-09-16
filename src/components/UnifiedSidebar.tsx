import React from 'react';
import { Language, PaperSketchProject } from '../types/cad';
import { SAMPLE_PROJECTS } from '../services/sampleBlueprints';
import { PaperTo3DConverter } from './PaperTo3DConverter';
import { OpenSourceBank } from './OpenSourceBank';
import {
  FolderOpen,
  Wand2,
  Globe,
  X,
  Check,
  ArrowRight,
  Plus,
  Compass,
  Layers,
  Sparkles,
} from 'lucide-react';

export type SidebarTab = 'projects' | 'converter' | 'opensource';

interface UnifiedSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: SidebarTab;
  onChangeTab: (tab: SidebarTab) => void;
  projectName: string;
  language: Language;
  onLoadProject: (project: PaperSketchProject) => void;
  onGoTo3D?: () => void;
  onGoToRender?: () => void;
}

export const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onChangeTab,
  projectName,
  language,
  onLoadProject,
  onGoTo3D,
  onGoToRender,
}) => {
  if (!isOpen) return null;

  const t = {
    es: {
      title: 'Biblioteca & Ecosistema',
      projects: 'Proyectos',
      converter: 'Boceto IA',
      opensource: 'Ecosistema',
      openProject: 'Cargar',
      activeProject: 'Activo',
      templatesTitle: 'Plantillas y Casos de Estudio',
      sketchHint: 'Digitaliza bocetos en papel o dibujos a mano alzada',
    },
    pt: {
      title: 'Biblioteca & Ecossistema',
      projects: 'Projetos',
      converter: 'Croqui IA',
      opensource: 'Ecossistema',
      openProject: 'Carregar',
      activeProject: 'Ativo',
      templatesTitle: 'Modelos e Estudos de Caso',
      sketchHint: 'Digitalize croquis no papel ou desenhos manuais',
    },
    en: {
      title: 'Library & Ecosystem',
      projects: 'Projects',
      converter: 'Paper to 3D',
      opensource: 'Ecosystem',
      openProject: 'Load',
      activeProject: 'Active',
      templatesTitle: 'Templates & Case Studies',
      sketchHint: 'Convert hand-drawn sketches to parametric 3D models',
    },
  }[language];

  return (
    <aside className="w-full sm:w-96 lg:w-[420px] h-full bg-[#0c0e15]/95 border-r border-white/[0.08] backdrop-blur-2xl flex flex-col shrink-0 z-20 select-none animate-in slide-in-from-left duration-200">
      {/* Sidebar Header with Apple Segmented Tab Control */}
      <div className="p-3 border-b border-white/[0.08] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center p-0.5 rounded-full bg-black/40 border border-white/[0.08] text-xs flex-1">
          <button
            onClick={() => onChangeTab('projects')}
            className={`flex-1 py-1 px-2 rounded-full flex items-center justify-center gap-1.5 transition-all text-[11px] ${
              activeTab === 'projects'
                ? 'bg-white/15 text-white font-semibold shadow-sm border border-white/10'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FolderOpen className="w-3 h-3 text-red-400" />
            <span>{t.projects}</span>
          </button>

          <button
            onClick={() => onChangeTab('converter')}
            className={`flex-1 py-1 px-2 rounded-full flex items-center justify-center gap-1.5 transition-all text-[11px] ${
              activeTab === 'converter'
                ? 'bg-white/15 text-white font-semibold shadow-sm border border-white/10'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-3 h-3 text-amber-400" />
            <span>{t.converter}</span>
          </button>

          <button
            onClick={() => onChangeTab('opensource')}
            className={`flex-1 py-1 px-2 rounded-full flex items-center justify-center gap-1.5 transition-all text-[11px] ${
              activeTab === 'opensource'
                ? 'bg-white/15 text-white font-semibold shadow-sm border border-white/10'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3 text-sky-400" />
            <span>{t.opensource}</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors shrink-0"
          title="Ocultar panel lateral (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Projects Gallery */}
      {activeTab === 'projects' && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-200">{t.templatesTitle}</span>
            <span className="text-[10px] font-mono text-neutral-400">{SAMPLE_PROJECTS.length} modelos</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {SAMPLE_PROJECTS.map((proj) => {
              const isSelected = projectName === proj.name;
              return (
                <div
                  key={proj.id}
                  onClick={() => onLoadProject(proj)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 group ${
                    isSelected
                      ? 'bg-red-600/15 border-red-500/40 shadow-md shadow-red-600/10'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                        isSelected ? 'bg-red-600 text-white' : 'bg-white/10 text-neutral-300'
                      }`}>
                        <FolderOpen className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-white font-sans">{proj.name}</span>
                    </div>

                    {isSelected ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600/20 text-red-300 border border-red-500/30 flex items-center gap-1 font-semibold">
                        <Check className="w-3 h-3" />
                        {t.activeProject}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-200 transition-colors flex items-center gap-1">
                        <span>{t.openProject}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {proj.description || 'Proyecto paramétrico con distribución bioclimática e integración OpenBIM.'}
                  </p>

                  <div className="flex items-center gap-3 pt-1 border-t border-white/[0.04] text-[10px] font-mono text-neutral-400">
                    <span className="text-emerald-400 font-semibold">{proj.totalAreaSqM} m²</span>
                    <span>·</span>
                    <span>{proj.walls.length} muros</span>
                    <span>·</span>
                    <span>{proj.openings.length} huecos</span>
                    <span>·</span>
                    <span>{proj.rooms.length} estancias</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paper to 3D Banner */}
          <div
            onClick={() => onChangeTab('converter')}
            className="mt-2 p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Wand2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">¿Tienes un boceto en papel?</span>
              <span className="text-[11px] text-neutral-400">{t.sketchHint}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Paper-to-3D Converter */}
      {activeTab === 'converter' && (
        <div className="flex-1 overflow-y-auto">
          <PaperTo3DConverter
            language={language}
            onApplyProject={(proj) => {
              onLoadProject(proj);
            }}
            onGoTo3D={onGoTo3D}
            onGoToRender={onGoToRender}
          />
        </div>
      )}

      {/* Tab 3: Open Source Ecosystem */}
      {activeTab === 'opensource' && (
        <div className="flex-1 overflow-y-auto">
          <OpenSourceBank language={language} />
        </div>
      )}
    </aside>
  );
};
