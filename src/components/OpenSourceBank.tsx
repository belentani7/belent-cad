import React, { useState } from 'react';
import { OPEN_SOURCE_TOOLS, NORMATIVAS_DATA } from '../services/openSourceDatabase';
import { Language, OpenSourceTool } from '../types/cad';
import { Search, ExternalLink, Terminal, Copy, Check, BookOpen, ShieldCheck, Cpu, Code2, Globe } from 'lucide-react';

interface OpenSourceBankProps {
  language: Language;
}

export const OpenSourceBank: React.FC<OpenSourceBankProps> = ({ language }) => {
  const [activeTab, setActiveTab] = useState<'tools' | 'normativas'>('tools');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const t = {
    es: {
      title: 'Banco Mundial de Arquitectura de Código Abierto',
      subtitle: 'El compendio libre más completo de motores CAD, pipelines 2D→3D, inteligencia artificial y normativas en español y portugués.',
      tabTools: 'Ecosistema de Software Libre',
      tabNormativas: 'Normativas Técnicas (CTE & ABNT)',
      searchPlaceholder: 'Buscar software, librerías, repositorios...',
      all: 'Todos',
      cat2d3d: 'Boceto a 3D',
      catCadBim: 'CAD & BIM',
      catAi: 'IA Generativa',
      catFormats: 'Formatos Abiertos (IFC/DXF)',
      copyCommand: 'Copiar comando de instalación',
      copied: '¡Copiado!',
      visitRepo: 'Visitar Repositorio',
      license: 'Licencia'
    },
    pt: {
      title: 'Banco Mundial de Arquitetura de Código Aberto',
      subtitle: 'O acervo aberto mais completo de motores CAD, pipelines 2D→3D, IA e normativas em português e espanhol.',
      tabTools: 'Ecossistema de Software Livre',
      tabNormativas: 'Normas Técnicas (ABNT & CTE)',
      searchPlaceholder: 'Pesquisar software, bibliotecas, repositórios...',
      all: 'Todos',
      cat2d3d: 'Croqui para 3D',
      catCadBim: 'CAD & BIM',
      catAi: 'IA Generativa',
      catFormats: 'Formatos Abertos (IFC/DXF)',
      copyCommand: 'Copiar comando de instalação',
      copied: 'Copiado!',
      visitRepo: 'Visitar Repositório',
      license: 'Licença'
    },
    en: {
      title: 'Global Open Source Architecture Knowledge Bank',
      subtitle: 'The comprehensive open repository of CAD engines, 2D→3D pipelines, generative AI, and regional building standards.',
      tabTools: 'Open Source Software Ecosystem',
      tabNormativas: 'Building Regulations & Standards',
      searchPlaceholder: 'Search software, libraries, repositories...',
      all: 'All',
      cat2d3d: 'Sketch to 3D',
      catCadBim: 'CAD & BIM',
      catAi: 'Generative AI',
      catFormats: 'Open Formats (IFC/DXF)',
      copyCommand: 'Copy install command',
      copied: 'Copied!',
      visitRepo: 'Visit Repository',
      license: 'License'
    }
  }[language];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTools = OPEN_SOURCE_TOOLS.filter((tool) => {
    const matchesCat = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const normativas = NORMATIVAS_DATA[language] || NORMATIVAS_DATA.es;

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-[#090d16] text-neutral-100 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel-accent text-red-400 text-xs font-mono font-medium w-fit">
            <Globe className="w-3.5 h-3.5" />
            <span>BANCO DE DADOS ABERTO · ESPAÑOL & PORTUGUÊS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {t.title}
          </h1>
          <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Top Tabs */}
        <div className="flex items-center gap-2 glass-panel p-1.5 rounded-2xl w-fit border border-white/10">
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
              activeTab === 'tools' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>{t.tabTools}</span>
          </button>
          <button
            onClick={() => setActiveTab('normativas')}
            className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
              activeTab === 'normativas' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.tabNormativas}</span>
          </button>
        </div>

        {activeTab === 'tools' ? (
          <div className="flex flex-col gap-5">
            {/* Search & Categories Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {[
                  { id: 'all', label: t.all },
                  { id: '2d-to-3d', label: t.cat2d3d },
                  { id: 'cad-bim', label: t.catCadBim },
                  { id: 'ai-generative', label: t.catAi },
                  { id: 'formats-standards', label: t.catFormats },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                      selectedCategory === c.id
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-semibold'
                        : 'glass-panel text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-neutral-900/90 border border-neutral-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="glass-panel rounded-2xl p-5 flex flex-col justify-between gap-4 border border-white/10 hover:border-red-500/40 transition-all group"
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">
                          {tool.badge}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1 group-hover:text-red-300 transition-colors">
                          {tool.name}
                        </h3>
                      </div>
                      <a
                        href={tool.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl glass-panel text-neutral-400 hover:text-red-400 hover:border-red-500/30 transition-all shrink-0"
                        title={t.visitRepo}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {tool.description[language]}
                    </p>

                    {/* Tech Stack Pills */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tool.techStack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700/60"
                        >
                          {tech}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                        {tool.license}
                      </span>
                    </div>

                    {/* Key features bullets */}
                    <ul className="text-[11px] text-neutral-400 list-disc list-inside space-y-1 mt-1">
                      {tool.keyFeatures[language].map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Copyable CLI Command snippet */}
                  {tool.commandExample && (
                    <div className="bg-black/50 rounded-xl p-2.5 flex items-center justify-between gap-2 border border-white/5 font-mono text-[11px] text-neutral-300">
                      <div className="flex items-center gap-2 overflow-x-auto truncate">
                        <Terminal className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">{tool.commandExample}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(tool.commandExample!, tool.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors shrink-0"
                        title={t.copyCommand}
                      >
                        {copiedId === tool.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Normativas Técnicas Tab */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {normativas.map((norm, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl flex flex-col gap-2.5 border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {norm.code}
                  </span>
                  <h3 className="text-sm font-semibold text-white">{norm.title}</h3>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {norm.details}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
