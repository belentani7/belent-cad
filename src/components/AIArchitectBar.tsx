import React, { useState } from 'react';
import { Sparkles, Terminal, ArrowRight, CheckCircle2, AlertCircle, Loader2, Compass, ShieldCheck } from 'lucide-react';
import { CommandContext, executeCommand } from '../services/commandEngine';

interface AIArchitectBarProps {
  commandContext: CommandContext;
  onExecutionComplete?: (msg: string, isSuccess: boolean) => void;
}

export const AIArchitectBar: React.FC<AIArchitectBarProps> = ({
  commandContext,
  onExecutionComplete,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  const presetPrompts = [
    'Vivienda contemporánea 140m² con 3 dormitorios, patio y cocina abierta',
    'Optimizar distribución y ventilación según CTE DB-HS',
    'Pabellón estudio 75m² con galería vidriada y suite',
    'Casa patio mediterránea 180m² con ventilación cruzada',
  ];

  const handleRun = async (textToRun?: string) => {
    const text = textToRun || prompt;
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    setStatusMessage('Sintetizando modelo espacial y auditando relaciones BIM...');
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
    <div className="w-full bg-[#090d16]/95 backdrop-blur-2xl border border-red-500/20 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 font-sans select-none">
      {/* Title & Senior Architect badge */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="text-xs font-mono font-bold text-white tracking-wider">
            MOTOR ARQUITECTO IA // SÍNTESIS ESPACIAL BIM
          </span>
          <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
            (Ejecuta comandos directos o lenguaje natural)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Normativa CTE / NBR</span>
        </div>
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2 bg-black/60 border border-white/10 focus-within:border-red-500/60 rounded-xl p-1.5 transition-colors">
        <Terminal className="w-4 h-4 text-red-500 shrink-0 ml-2" />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRun();
          }}
          placeholder="Ej: Vivienda unifamiliar 120m² con 3 dormitorios, o comando /WALL 0,0 6,0..."
          disabled={isProcessing}
          className="flex-1 bg-transparent text-xs font-mono text-white placeholder:text-neutral-500 outline-none"
        />
        <button
          onClick={() => handleRun()}
          disabled={isProcessing || !prompt.trim()}
          className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white font-mono text-xs font-bold transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5 shrink-0"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>GENERANDO...</span>
            </>
          ) : (
            <>
              <span>EJECUTAR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Preset Fast Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono py-0.5">
        <span className="text-neutral-500 shrink-0 text-[10px] flex items-center gap-1">
          <Compass className="w-3 h-3 text-red-400" />
          Preajustes:
        </span>
        {presetPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrompt(p);
              handleRun(p);
            }}
            disabled={isProcessing}
            className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-red-600/20 text-neutral-300 hover:text-red-300 border border-white/5 hover:border-red-500/30 whitespace-nowrap transition-colors text-[10px]"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Status Output Line */}
      {statusMessage && (
        <div
          className={`p-2 rounded-xl text-xs font-mono flex items-start gap-2 border ${
            statusType === 'success'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
              : statusType === 'error'
              ? 'bg-red-950/40 text-red-300 border-red-500/30'
              : 'bg-neutral-900 text-neutral-300 border-white/10'
          }`}
        >
          {statusType === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : statusType === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <Loader2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5 animate-spin" />
          )}
          <div className="whitespace-pre-line leading-relaxed text-[11px]">{statusMessage}</div>
        </div>
      )}
    </div>
  );
};
