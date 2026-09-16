import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Terminal,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Compass,
  CornerDownLeft,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CommandContext, executeCommand } from '../services/commandEngine';

interface AppleSpotlightCommandProps {
  isOpen: boolean;
  onClose: () => void;
  commandContext: CommandContext;
  onExecutionComplete?: (msg: string, isSuccess: boolean) => void;
}

export const AppleSpotlightCommand: React.FC<AppleSpotlightCommandProps> = ({
  isOpen,
  onClose,
  commandContext,
  onExecutionComplete,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const inputRef = useRef<HTMLInputElement>(null);

  const presetPrompts = [
    { label: 'Vivienda 140m² (3 dorm)', text: 'Vivienda contemporánea 140m² con 3 dormitorios, patio y cocina abierta' },
    { label: 'Optimizar CTE DB-HS', text: 'Optimizar distribución y ventilación según CTE DB-HS' },
    { label: 'Pabellón estudio 75m²', text: 'Pabellón estudio 75m² con galería vidriada y suite' },
    { label: 'Casa patio 180m²', text: 'Casa patio mediterránea 180m² con ventilación cruzada' },
  ];

  const quickCadCommands = [
    { cmd: '/WALL 0,0 8,0', desc: 'Muro 8m horizontal' },
    { cmd: '/DOOR 3.0,0', desc: 'Puerta batiente 0.90m' },
    { cmd: '/WINDOW 5.0,0', desc: 'Ventana 1.50m' },
    { cmd: '/STAIR 2.8 1.0 0.28', desc: 'Escalera CTE Blondel' },
    { cmd: '/BLOCK shower 2,2', desc: 'Plato ducha accesible' },
    { cmd: '/BLOCK bathtub 2,3', desc: 'Bañera ergonómica' },
    { cmd: '/PLUGINS', desc: 'Centro de Plugins' },
    { cmd: '/EXPORT IFC', desc: 'Compilar OpenBIM' },
    { cmd: '/CLEAR', desc: 'Reiniciar lienzo' },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setStatusMessage(null);
    }
  }, [isOpen]);

  // Global Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRun = async (textToRun?: string) => {
    const text = textToRun || prompt;
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    setStatusMessage('Sintetizando arquitectura paramétrica y auditando grafo espacial...');
    setStatusType('info');

    try {
      const res = await executeCommand(text, commandContext);
      setIsProcessing(false);
      setStatusMessage(res.output);
      setStatusType(res.success ? 'success' : 'error');
      if (onExecutionComplete) {
        onExecutionComplete(res.output, res.success);
      }
      if (res.success && !textToRun) {
        setPrompt('');
      }
    } catch (e: any) {
      setIsProcessing(false);
      setStatusMessage(e.message || 'Error en ejecución arquitectónica.');
      setStatusType('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md transition-all animate-in fade-in duration-150">
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Spotlight Window Card */}
      <div className="relative w-full max-w-2xl bg-[#0e1017]/95 text-neutral-100 rounded-2xl border border-white/[0.12] shadow-2xl shadow-black/80 backdrop-blur-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150">
        {/* Top Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-red-600/30 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRun();
            }}
            placeholder="Pide un proyecto a la IA o escribe comandos directos (Ej: /WALL, /DOOR, /CLEAR)..."
            disabled={isProcessing}
            className="flex-1 bg-transparent text-sm sm:text-base font-sans text-white placeholder:text-neutral-500 outline-none"
          />

          <div className="flex items-center gap-2 shrink-0">
            {prompt.trim() && (
              <button
                onClick={() => handleRun()}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/30 transition-all"
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Ejecutar</span>
                    <CornerDownLeft className="w-3 h-3" />
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Cerrar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Status / Execution Result */}
        {statusMessage && (
          <div
            className={`p-3 mx-4 mt-3 rounded-xl text-xs font-mono flex items-start gap-2.5 border transition-all ${
              statusType === 'success'
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                : statusType === 'error'
                ? 'bg-red-950/40 text-red-300 border-red-500/30'
                : 'bg-neutral-900/80 text-neutral-300 border-white/10'
            }`}
          >
            {statusType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : statusType === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <Loader2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5 animate-spin" />
            )}
            <div className="whitespace-pre-line leading-relaxed text-[11px] flex-1">{statusMessage}</div>
          </div>
        )}

        {/* Content Body: Suggestions & CAD Direct Commands */}
        <div className="p-4 flex flex-col gap-3 max-h-[50vh] overflow-y-auto">
          {/* Natural Language Architectural Presets */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1 px-1">
              <Compass className="w-3 h-3 text-red-400" />
              Sugerencias de Síntesis Arquitectónica
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {presetPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(p.text);
                    handleRun(p.text);
                  }}
                  disabled={isProcessing}
                  className="text-left px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/15 border border-white/[0.06] transition-all flex flex-col gap-0.5 group"
                >
                  <span className="text-xs font-medium text-neutral-200 group-hover:text-white flex items-center justify-between">
                    <span>{p.label}</span>
                    <ArrowRight className="w-3 h-3 text-neutral-500 group-hover:text-red-400 transition-colors" />
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate">{p.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Direct CLI Commands */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.06]">
            <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1 px-1">
              <Terminal className="w-3 h-3 text-emerald-400" />
              Comandos Directos de Precisión
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[11px]">
              {quickCadCommands.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(c.cmd);
                    handleRun(c.cmd);
                  }}
                  disabled={isProcessing}
                  className="text-left px-2.5 py-1.5 rounded-lg bg-black/40 hover:bg-white/[0.06] border border-white/[0.05] transition-all flex flex-col"
                >
                  <span className="text-red-400 font-semibold">{c.cmd}</span>
                  <span className="text-[10px] text-neutral-400">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Apple Keyboard Shortcut Hints */}
        <div className="px-4 py-2 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono text-[10px]">↵</kbd>
              <span>Ejecutar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono text-[10px]">ESC</kbd>
              <span>Cerrar</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auditoría CTE & NBR Activa</span>
          </div>
        </div>
      </div>
    </div>
  );
};
