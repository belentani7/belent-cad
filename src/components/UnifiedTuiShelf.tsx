import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Maximize2,
  Minimize2,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  CornerDownLeft,
} from 'lucide-react';
import { CommandContext, executeCommand } from '../services/commandEngine';
import { Language } from '../types/cad';

interface UnifiedTuiShelfProps {
  isOpen: boolean;
  onClose: () => void;
  commandContext: CommandContext;
  language: Language;
}

interface LogLine {
  id: string;
  time: string;
  type: 'cmd' | 'output' | 'error' | 'success' | 'info';
  text: string;
}

export const UnifiedTuiShelf: React.FC<UnifiedTuiShelfProps> = ({
  isOpen,
  onClose,
  commandContext,
  language,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([
    {
      id: 'init-1',
      time: new Date().toLocaleTimeString(),
      type: 'info',
      text: 'BELENT CAD CLI v2.4 // Núcleo de Comandos Unificado Inicializado. Escribe HELP o TESTALL.',
    },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  const handleExecute = async (cmdToRun?: string) => {
    const text = (cmdToRun || inputVal).trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [
      ...prev,
      { id: `${Date.now()}-cmd`, time, type: 'cmd', text: `> ${text}` },
    ]);
    setHistory((prev) => [...prev, text]);
    setHistoryIdx(-1);
    if (!cmdToRun) setInputVal('');

    try {
      const res = await executeCommand(text, commandContext);
      setLogs((prev) => [
        ...prev,
        {
          id: `${Date.now()}-res`,
          time: new Date().toLocaleTimeString(),
          type: res.success ? 'success' : 'error',
          text: res.output,
        },
      ]);
    } catch (e: any) {
      setLogs((prev) => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          time: new Date().toLocaleTimeString(),
          type: 'error',
          text: e.message || 'Error al procesar comando.',
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleExecute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx !== -1) {
        const nextIdx = historyIdx + 1;
        if (nextIdx < history.length) {
          setHistoryIdx(nextIdx);
          setInputVal(history[nextIdx]);
        } else {
          setHistoryIdx(-1);
          setInputVal('');
        }
      }
    }
  };

  const quickActions = [
    { label: '⚡ TESTALL', cmd: 'TESTALL' },
    { label: '+ MURO 0.25', cmd: '/WALL 0,0 6,0' },
    { label: '+ PUERTA 0.90', cmd: '/DOOR 2.0,0' },
    { label: '+ VENTANA 1.50', cmd: '/WINDOW 4.5,0' },
    { label: 'CTE AUDIT', cmd: '/AUDIT' },
    { label: 'CLEAR', cmd: '/CLEAR' },
  ];

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-40 bg-[#090b10]/98 backdrop-blur-2xl border-t border-white/[0.12] shadow-2xl flex flex-col transition-all duration-200 animate-in slide-in-from-bottom select-none font-mono ${
        isMaximized ? 'top-12 h-[calc(100vh-48px)]' : 'h-80 sm:h-96'
      }`}
    >
      {/* Console Header */}
      <div className="h-10 px-4 border-b border-white/[0.08] flex items-center justify-between bg-black/40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-[#e0443e]/50 opacity-80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e] border border-[#d89e24]/50 opacity-80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840] border border-[#1aab29]/50 opacity-80" />
          </div>
          <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>BELENT CONSOLE // TUI & DIAGNÓSTICO</span>
          </span>
          <span className="text-[10px] text-neutral-400 hidden sm:inline">[F2 para alternar]</span>
        </div>

        {/* Quick Action Chips */}
        <div className="hidden md:flex items-center gap-1 text-[10px]">
          {quickActions.map((qa, idx) => (
            <button
              key={idx}
              onClick={() => handleExecute(qa.cmd)}
              className="px-2 py-0.5 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white border border-white/[0.06] transition-colors"
            >
              {qa.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setLogs([])}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Limpiar consola"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title={isMaximized ? 'Restaurar' : 'Maximizar'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Plegar consola (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Output Area */}
      <div
        ref={scrollRef}
        className="flex-1 p-3.5 overflow-y-auto font-mono text-xs flex flex-col gap-1.5 bg-[#07080c] select-text"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 leading-relaxed">
            <span className="text-neutral-600 text-[10px] shrink-0 pt-0.5 select-none">{log.time}</span>
            {log.type === 'cmd' ? (
              <span className="text-white font-semibold">{log.text}</span>
            ) : log.type === 'success' ? (
              <span className="text-emerald-400 flex items-start gap-1.5 whitespace-pre-line">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{log.text}</span>
              </span>
            ) : log.type === 'error' ? (
              <span className="text-red-400 flex items-start gap-1.5 whitespace-pre-line">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{log.text}</span>
              </span>
            ) : (
              <span className="text-neutral-400 whitespace-pre-line">{log.text}</span>
            )}
          </div>
        ))}
      </div>

      {/* Input Prompt Bar */}
      <div className="p-2.5 bg-black/60 border-t border-white/[0.08] flex items-center gap-2">
        <span className="text-emerald-400 font-bold text-xs pl-2 select-none">$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un comando CAD (/WALL, /DOOR, /IFC, TESTALL)..."
          className="flex-1 bg-transparent text-xs font-mono text-white placeholder:text-neutral-600 outline-none"
        />
        <button
          onClick={() => handleExecute()}
          disabled={!inputVal.trim()}
          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white font-mono text-xs font-semibold transition-all flex items-center gap-1"
        >
          <span>EJECUTAR</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
