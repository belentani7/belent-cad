import React, { useState } from 'react';
import { CADWall, CADRoom, Language, RenderStyleConfig } from '../types/cad';
import { RENDER_STYLES } from '../services/sampleBlueprints';
import {
  Sparkles,
  Sliders,
  Sun,
  Camera,
  Download,
  Layers,
  Check,
  RefreshCw,
  Eye,
  Columns
} from 'lucide-react';

interface PhotorealisticStudioProps {
  walls: CADWall[];
  rooms: CADRoom[];
  originalSketch?: string;
  language: Language;
  onApplyStyle: (style: RenderStyleConfig) => void;
}

export const PhotorealisticStudio: React.FC<PhotorealisticStudioProps> = ({
  walls,
  rooms,
  originalSketch,
  language,
  onApplyStyle,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<RenderStyleConfig>(RENDER_STYLES[0]);
  const [selectedLighting, setSelectedLighting] = useState<'golden-hour' | 'noon-sun' | 'blue-hour' | 'overcast'>('golden-hour');
  const [lensFocal, setLensFocal] = useState<'16mm' | '24mm' | '50mm'>('24mm');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // comparison split %
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<any | null>(null);

  const t = {
    es: {
      title: 'Estudio de Renderizado Fotorrealista',
      subtitle: 'Simulación fotométrica avanzada y transmutación de bocetos 3D en fotografías arquitectónicas de revista.',
      styles: 'Estilos Arquitectónicos',
      lighting: 'Ambiente & Iluminación Solar',
      lens: 'Óptica de Cámara',
      generate: 'Generar Render Fotorrealista',
      generating: 'Calculando iluminación global, rebote de luz y texturas PBR...',
      download: 'Descargar Fotografía en Alta Resolución',
      comparisonHint: 'Desliza el cursor sobre la imagen para comparar el Boceto Original con la Foto Realista',
      sketchLabel: 'Boceto / Maqueta 3D',
      renderLabel: 'Fotografía Realista Final'
    },
    pt: {
      title: 'Estúdio de Renderização Fotorrealista',
      subtitle: 'Simulação fotométrica avançada para transformar modelos 3D em fotografias de arquitetura de alta qualidade.',
      styles: 'Estilos Arquitetônicos',
      lighting: 'Ambiente & Iluminação Solar',
      lens: 'Lentes e Enquadramento',
      generate: 'Gerar Render Fotorrealista',
      generating: 'Calculando iluminação global e materiais PBR...',
      download: 'Baixar Foto em Alta Resolução',
      comparisonHint: 'Arraste a barra para comparar o Croqui Original com a Foto Realista',
      sketchLabel: 'Croqui / Modelo 3D',
      renderLabel: 'Fotografia Realista'
    },
    en: {
      title: 'Photorealistic Architectural Studio',
      subtitle: 'Advanced photometric simulation and transformation of 3D geometry into publication-grade architectural photographs.',
      styles: 'Architectural Styles',
      lighting: 'Atmosphere & Sunlight',
      lens: 'Camera Optics',
      generate: 'Generate Photorealistic Render',
      generating: 'Computing global illumination and PBR textures...',
      download: 'Download High-Res Photograph',
      comparisonHint: 'Slide over the image to compare Original Sketch vs Realistic Render',
      sketchLabel: 'Sketch / 3D Model',
      renderLabel: 'Realistic Photo'
    }
  }[language];

  // Trigger Render Engine API
  const handleGenerateRender = async () => {
    setIsRendering(true);
    try {
      const response = await fetch('/api/photorealistic-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: selectedStyle.name,
          timeOfDay: selectedLighting,
          materials: [selectedStyle.wallColor, selectedStyle.floorTexture],
          rooms: rooms.map((r) => r.name),
          language,
        }),
      });
      // Graceful offline fallback when no /api backend is reachable (static host).
      const data = response.ok
        ? await response.json().catch(() => ({}))
        : {
            status: 'offline',
            title: `Visualización ${selectedStyle.name}`,
            lightingSetup: `Luz natural ${selectedLighting} calibrada a 5500K`,
            materialPalette: [selectedStyle.wallColor, selectedStyle.floorTexture],
            renderNotes: 'Render generado en modo local (sin backend de IA).',
          };
      setAiReport(data);
      onApplyStyle(selectedStyle);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRendering(false);
    }
  };

  const currentRenderImage = selectedStyle.sampleImage;
  const currentSketchImage = originalSketch || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-[#090d16] text-neutral-100 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel-accent text-sky-400 text-xs font-mono font-medium w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BELENT PHOTOREALISTIC ENGINE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {t.title}
          </h1>
          <p className="text-sm text-neutral-400 max-w-2xl">
            {t.subtitle}
          </p>
        </div>

        {/* Main Split-Screen Comparison Viewport */}
        <div className="relative w-full h-96 md:h-[480px] rounded-2xl overflow-hidden glass-panel border border-white/15 select-none shadow-2xl">
          {/* Base Layer: Sketch / Wireframe */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={currentSketchImage}
              alt="Sketch / Wireframe"
              className="w-full h-full object-cover filter contrast-125"
            />
            <span className="absolute top-4 left-4 glass-panel px-3 py-1 rounded-lg text-xs font-mono text-neutral-200 border border-white/10 z-10">
              {t.sketchLabel}
            </span>
          </div>

          {/* Top Layer: Realistic Render with Clip Path */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
          >
            <img
              src={currentRenderImage}
              alt="Realistic Render"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 right-4 glass-panel px-3 py-1 rounded-lg text-xs font-mono text-red-300 border border-red-500/30 z-10">
              {t.renderLabel} ({selectedStyle.name})
            </span>
          </div>

          {/* Interactive Split Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] cursor-ew-resize z-20 flex items-center justify-center pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-neutral-900/90 border border-white/40 text-white flex items-center justify-center text-[10px] shadow-lg">
              <Columns className="w-4 h-4" />
            </div>
          </div>

          {/* Invisible Range Input Slider */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          />

          {/* Footer Bar hint */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 glass-panel px-4 py-1.5 rounded-full text-[11px] font-mono text-neutral-300 z-10 border border-white/10 pointer-events-none">
            {t.comparisonHint}
          </div>
        </div>

        {/* Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Architectural Styles */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono text-neutral-400 font-semibold uppercase tracking-wider">{t.styles}</span>
            <div className="flex flex-col gap-2">
              {RENDER_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setSelectedStyle(style);
                    onApplyStyle(style);
                  }}
                  className={`p-3 rounded-xl glass-panel text-left flex items-start gap-3 transition-all ${
                    selectedStyle.id === style.id
                      ? 'border-red-500/50 bg-red-500/15 shadow-lg shadow-red-950/40'
                      : 'hover:border-white/20'
                  }`}
                >
                  <img
                    src={style.sampleImage}
                    alt={style.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-white/10"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-white">{style.name}</span>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-tight">
                      {style.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Lighting & Optics Settings */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono text-neutral-400 font-semibold uppercase tracking-wider">{t.lighting}</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'golden-hour', label: 'Golden Hour (3200K)' },
                  { id: 'noon-sun', label: 'Sol Cenital (5500K)' },
                  { id: 'blue-hour', label: 'Blue Hour (Crepúsculo)' },
                  { id: 'overcast', label: 'Cielo Nórdico Difuso' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLighting(item.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium glass-panel transition-all ${
                      selectedLighting === item.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono text-neutral-400 font-semibold uppercase tracking-wider">{t.lens}</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '16mm', label: '16mm Gran Angular' },
                  { id: '24mm', label: '24mm Tilt-Shift' },
                  { id: '50mm', label: '50mm Detalle' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLensFocal(item.id as any)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-mono glass-panel transition-all ${
                      lensFocal === item.id
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Trigger Button */}
            <button
              onClick={handleGenerateRender}
              disabled={isRendering}
              className="mt-2 w-full py-3.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-lg shadow-red-600/30 transition-all border border-red-500/40"
            >
              {isRendering ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.generating}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t.generate}</span>
                </>
              )}
            </button>
          </div>

          {/* Technical Specifications & Report */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono text-neutral-400 font-semibold uppercase tracking-wider">Ficha Técnica Fotométrica</span>
            <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3 text-xs border border-white/10">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Estilo:</span>
                <span className="font-semibold text-neutral-200">{selectedStyle.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Pavimento:</span>
                <span className="font-mono text-neutral-200">{selectedStyle.floorTexture}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Iluminación:</span>
                <span className="font-mono text-amber-300">{selectedLighting}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">Distancia Focal:</span>
                <span className="font-mono text-red-300">{lensFocal} f/8 ISO 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Resolución:</span>
                <span className="font-mono text-emerald-400">3840 x 2160 (4K UHD)</span>
              </div>

              {aiReport && (
                <div className="mt-2 p-3 bg-black/40 rounded-xl border border-red-500/20 text-[11px] leading-relaxed text-neutral-300">
                  <p className="font-semibold text-red-400 mb-1">{aiReport.title}</p>
                  <p className="text-neutral-300">{aiReport.atmosphereDescription || aiReport.lightingSetup}</p>
                </div>
              )}

              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = currentRenderImage;
                  a.download = `BELENT_CAD_Render_${selectedStyle.id}_${Date.now()}.jpg`;
                  a.target = '_blank';
                  a.click();
                }}
                className="mt-2 py-2 px-3 rounded-xl glass-panel text-xs font-medium text-red-300 hover:bg-red-500/20 border border-red-500/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.download}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
