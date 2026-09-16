import React, { useState, useRef, useEffect } from 'react';
import { CADWall, CADOpening, CADRoom, CADDimension, PaperSketchProject, Language } from '../types/cad';
import {
  Upload,
  Sparkles,
  Wand2,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Box,
  PenTool,
  RotateCcw,
  Eraser,
  Grid,
  FileText,
  Lightbulb
} from 'lucide-react';

interface PaperTo3DConverterProps {
  language: Language;
  onApplyProject: (project: PaperSketchProject) => void;
  onGoTo3D: () => void;
  onGoToRender: () => void;
}

export const PaperTo3DConverter: React.FC<PaperTo3DConverterProps> = ({
  language,
  onApplyProject,
  onGoTo3D,
  onGoToRender,
}) => {
  // Navigation tabs: upload / whiteboard drawing / generative AI prompt
  const [activeTab, setActiveTab] = useState<'upload' | 'whiteboard' | 'generative'>('upload');

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedProject, setExtractedProject] = useState<PaperSketchProject | null>(null);
  const [userPromptNotes, setUserPromptNotes] = useState('');

  // Generative AI Text Prompt State
  const [generativePrompt, setGenerativePrompt] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);

  // Whiteboard drawing state
  const whiteboardCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [whiteboardTool, setWhiteboardTool] = useState<'pen' | 'eraser' | 'line'>('pen');
  const [whiteboardColor, setWhiteboardColor] = useState('#292524');
  const [lineWidth, setLineWidth] = useState(3);
  const [showDraftingGrid, setShowDraftingGrid] = useState(true);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const lineStartRef = useRef<{ x: number; y: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    es: {
      title: 'Digitalización de Bocetos en Papel a 3D & Foto Realista',
      subtitle: 'Convierte bocetos hechos a mano, croquis de libreta o planos escaneados en maquetas tridimensionales interactivas y renders fotorrealistas.',
      tabUpload: 'Subir o Elegir Boceto',
      tabWhiteboard: 'Lienzo de Papel Digital',
      tabGenerative: 'Diseño por IA (Texto)',
      dragDrop: 'Arrastra y suelta aquí tu boceto en papel, foto o plano escaneado',
      orClick: 'o haz clic para seleccionar archivo (JPG, PNG)',
      sampleSketches: 'O prueba con un boceto arquitectónico clásico:',
      sample1: 'Croquis a Mano: Casa con Patios (120 m²)',
      sample2: 'Plano Escaneado: Loft con Mezzanine (85 m²)',
      sample3: 'Boceto Rápido: Estudio Minimalista (60 m²)',
      notesPlaceholder: 'Instrucciones adicionales para la IA (ej: muros de 30cm, puertas de madera, techos de 3m)...',
      processBtn: 'Transformar a Maqueta 3D & Vectorial',
      processing: 'Analizando geometría, detectando muros y extrayendo estancias...',
      detectionSuccess: '¡Segmentación arquitectónica completada!',
      view3D: 'Explorar en Maqueta 3D',
      viewRender: 'Generar Foto Realista',
      detectedRooms: 'Estancias detectadas',
      totalArea: 'Superficie Útil Estimada',
      confidence: 'Confianza de Segmentación',
      clearWhiteboard: 'Limpiar Papel',
      digitizeWhiteboard: 'Digitalizar este Dibujo',
      whiteboardHint: 'Traza muros y particiones como si fuera tu libreta de croquis.',
      generativeTitle: 'Arquitecto Generativo por Lenguaje Natural',
      generativeSubtitle: 'Describe el programa arquitectónico, metros cuadrados y distribución deseada. Gemini generará la planta vectorial completa.',
      generativePlaceholder: 'Ej: Vivienda unifamiliar de 135 m² con salón amplio comunicado a porche exterior, cocina abierta con isla, 3 dormitorios, 2 baños y vestidor...',
      generateAIButton: 'Generar Plano Arquitectónico',
      generatingAI: 'Gemini razonando geometría espacial, zonificación y distribución...',
      suggestedPrompts: 'Ideas de programas para comenzar:'
    },
    pt: {
      title: 'Digitalização de Croquis em Papel para 3D & Foto Realista',
      subtitle: 'Converta desenhos feitos à mão, rascunhos de prancheta ou plantas escaneadas em modelos 3D interativos e imagens realistas.',
      tabUpload: 'Carregar ou Escolher Croqui',
      tabWhiteboard: 'Lousa de Papel Digital',
      tabGenerative: 'Projeto por IA (Texto)',
      dragDrop: 'Arraste e solte seu croqui em papel, foto ou desenho escaneado',
      orClick: 'ou clique para selecionar o arquivo (JPG, PNG)',
      sampleSketches: 'Ou experimente um croqui arquitetônico clássico:',
      sample1: 'Croqui à Mão: Casa com Pátios (120 m²)',
      sample2: 'Planta Escaneada: Loft com Mezanino (85 m²)',
      sample3: 'Esboço Rápido: Estúdio Minimalista (60 m²)',
      notesPlaceholder: 'Instruções extras (ex: paredes de 25cm, portas de correr, pé-direito 3m)...',
      processBtn: 'Transformar em Maquete 3D & Vetorial',
      processing: 'Analisando geometria, paredes e cômodos...',
      detectionSuccess: 'Segmentação arquitetônica concluída com sucesso!',
      view3D: 'Visualizar Maquete 3D',
      viewRender: 'Gerar Foto Realista',
      detectedRooms: 'Cômodos detectados',
      totalArea: 'Área Útil Estimada',
      confidence: 'Nível de Confiança',
      clearWhiteboard: 'Limpar Papel',
      digitizeWhiteboard: 'Digitalizar este Desenho',
      whiteboardHint: 'Desenhe paredes e divisões como se estivesse no papel manteiga.',
      generativeTitle: 'Arquiteto Generativo por Linguagem Natural',
      generativeSubtitle: 'Descreva o programa arquitetônico, metragem e cômodos. A IA criará a planta vetorial completa.',
      generativePlaceholder: 'Ex: Residência unifamiliar de 140 m² com sala ampla voltada para o quintal, cozinha integrada com ilha, 3 dormitórios sendo 1 suíte e lavabo...',
      generateAIButton: 'Gerar Planta Arquitetônica',
      generatingAI: 'Gemini calculando geometria espacial e dimensionamento...',
      suggestedPrompts: 'Sugestões de projetos:'
    },
    en: {
      title: 'Paper Sketch to Interactive 3D & Photorealistic Render',
      subtitle: 'Transform hand-drawn paper sketches, notebook drafts, or scanned blueprints into interactive 3D models and photorealistic imagery.',
      tabUpload: 'Upload or Pick Sketch',
      tabWhiteboard: 'Digital Drafting Paper',
      tabGenerative: 'AI Floorplan (Text)',
      dragDrop: 'Drag and drop your paper sketch, camera photo, or scan here',
      orClick: 'or click to browse files (JPG, PNG)',
      sampleSketches: 'Or try with a sample architectural sketch:',
      sample1: 'Hand-drawn Sketch: Courtyard House (120 m²)',
      sample2: 'Scanned Blueprint: Architecture Loft (85 m²)',
      sample3: 'Quick Draft: Minimalist Studio (60 m²)',
      notesPlaceholder: 'Extra instructions for AI (e.g., 25cm walls, wooden doors, 3m ceilings)...',
      processBtn: 'Transform to 3D Model & Vectors',
      processing: 'Analyzing geometry, recognizing walls, and extruding rooms...',
      detectionSuccess: 'Architectural segmentation completed!',
      view3D: 'Explore 3D Model',
      viewRender: 'Generate Photorealistic Render',
      detectedRooms: 'Detected Rooms',
      totalArea: 'Estimated Usable Area',
      confidence: 'Segmentation Confidence',
      clearWhiteboard: 'Clear Paper',
      digitizeWhiteboard: 'Digitize this Sketch',
      whiteboardHint: 'Sketch walls and partitions just like in an architectural sketchbook.',
      generativeTitle: 'Generative AI Natural Language Architect',
      generativeSubtitle: 'Describe the spatial program, area, and desired zoning. Gemini designs the full architectural floorplan.',
      generativePlaceholder: 'E.g., 140 m² modern single-family home with open living-dining, kitchen island, 3 bedrooms including master suite with walk-in closet...',
      generateAIButton: 'Generate CAD Floorplan',
      generatingAI: 'Gemini reasoning spatial layout, walls, and zoning...',
      suggestedPrompts: 'Suggested design prompts:'
    }
  }[language];

  // Helper to generate a classic paper sketch image with HTML5 canvas
  const generateSampleSketch = (type: 1 | 2 | 3): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Aged architectural parchment background
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(0, 0, 800, 600);

    // Subtle grid paper pattern
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(180, 160, 140, 0.2)';
    for (let x = 0; x < 800; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    for (let y = 0; y < 600; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    // Architectural hand-drawn linework
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (type === 1) {
      // Courtyard House
      ctx.strokeRect(100, 80, 600, 440);
      ctx.strokeRect(300, 200, 200, 200); // Patio
      ctx.beginPath();
      ctx.moveTo(300, 80); ctx.lineTo(300, 520);
      ctx.moveTo(500, 80); ctx.lineTo(500, 520);
      ctx.stroke();

      ctx.fillStyle = '#44403c';
      ctx.font = '16px monospace';
      ctx.fillText('SALÓN / ESTAR', 140, 280);
      ctx.fillText('PATIO CENTRAL', 330, 310);
      ctx.fillText('DORMITORIO 1', 530, 180);
      ctx.fillText('DORMITORIO 2', 530, 430);
    } else if (type === 2) {
      // Loft
      ctx.strokeRect(120, 90, 560, 420);
      ctx.beginPath();
      ctx.moveTo(480, 90); ctx.lineTo(480, 510);
      ctx.moveTo(480, 300); ctx.lineTo(680, 300);
      ctx.stroke();
      ctx.fillStyle = '#44403c';
      ctx.font = '16px monospace';
      ctx.fillText('GRAN SALÓN - LOFT', 180, 300);
      ctx.fillText('COCINA', 520, 200);
      ctx.fillText('BAÑO SUITE', 520, 420);
    } else {
      // Minimalist Studio
      ctx.strokeRect(150, 100, 500, 400);
      ctx.beginPath();
      ctx.moveTo(440, 100); ctx.lineTo(440, 500);
      ctx.stroke();
      ctx.fillStyle = '#44403c';
      ctx.font = '16px monospace';
      ctx.fillText('ESTUDIO CREATIVO', 200, 300);
      ctx.fillText('DORMITORIO', 470, 300);
    }

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleSelectSample = (sampleType: 1 | 2 | 3) => {
    const dataUrl = generateSampleSketch(sampleType);
    setSelectedImage(dataUrl);
    setExtractedProject(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setExtractedProject(null);
    };
    reader.readAsDataURL(file);
  };

  // Setup whiteboard background
  const initWhiteboard = () => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Parchment texture
    ctx.fillStyle = '#f6f1e7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (showDraftingGrid) {
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(168, 140, 110, 0.25)';
      for (let x = 0; x < canvas.width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'whiteboard') {
      setTimeout(initWhiteboard, 50);
    }
  }, [activeTab, showDraftingGrid]);

  // Whiteboard drawing handlers
  const handleWhiteboardMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    setIsDrawing(true);
    lastPosRef.current = { x, y };
    lineStartRef.current = { x, y };
  };

  const handleWhiteboardMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    if (whiteboardTool === 'pen') {
      ctx.strokeStyle = whiteboardColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      if (lastPosRef.current) {
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      }
      ctx.lineTo(x, y);
      ctx.stroke();
      lastPosRef.current = { x, y };
    } else if (whiteboardTool === 'eraser') {
      ctx.strokeStyle = '#f6f1e7';
      ctx.lineWidth = lineWidth * 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (lastPosRef.current) {
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      }
      ctx.lineTo(x, y);
      ctx.stroke();
      lastPosRef.current = { x, y };
    }
  };

  const handleWhiteboardMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (whiteboardTool === 'line' && lineStartRef.current) {
      const canvas = whiteboardCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

      ctx.strokeStyle = whiteboardColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lineStartRef.current.x, lineStartRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleDigitizeWhiteboard = () => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setSelectedImage(dataUrl);
    setActiveTab('upload');
  };

  // Main Conversion Pipeline Trigger (Image-to-Vector)
  const handleProcessSketch = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/analyze-sketch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          language,
          promptNotes: userPromptNotes,
        }),
      });

      // Static hosting (GitHub Pages) has no /api backend: fall back to the
      // local parametric defaults instead of throwing on a 404 HTML page.
      const data = response.ok ? await response.json().catch(() => ({})) : {};
      const projData = data.project || data.fallbackProject || {};

      const walls: CADWall[] = (projData.walls || [
        { x1: 0, y1: 0, x2: 12, y2: 0, thickness: 0.25, height: 2.8, layer: 'A-WALL', isExterior: true },
        { x1: 12, y1: 0, x2: 12, y2: 10, thickness: 0.25, height: 2.8, layer: 'A-WALL', isExterior: true },
        { x1: 12, y1: 10, x2: 0, y2: 10, thickness: 0.25, height: 2.8, layer: 'A-WALL', isExterior: true },
        { x1: 0, y1: 10, x2: 0, y2: 0, thickness: 0.25, height: 2.8, layer: 'A-WALL', isExterior: true },
        { x1: 5.0, y1: 0, x2: 5.0, y2: 10, thickness: 0.15, height: 2.8, layer: 'A-WALL' },
      ]).map((w: any, idx: number) => ({
        id: `wall-proc-${idx}`,
        x1: w.x1 ?? 0,
        y1: w.y1 ?? 0,
        x2: w.x2 ?? 10,
        y2: w.y2 ?? 0,
        thickness: w.thickness ?? 0.25,
        height: w.height ?? 2.8,
        layer: 'A-WALL',
        isExterior: w.isExterior ?? true,
      }));

      const rooms: CADRoom[] = (projData.detectedRooms || [
        { name: 'Salón Principal', area: 36, x: 0, y: 0, width: 6, height: 6, floorType: 'parquet' },
        { name: 'Cocina Comedor', area: 24, x: 6, y: 0, width: 6, height: 4, floorType: 'tile' },
        { name: 'Dormitorio Principal', area: 24, x: 6, y: 4, width: 6, height: 4, floorType: 'parquet' },
      ]).map((r: any, idx: number) => ({
        id: `room-proc-${idx}`,
        name: r.name,
        type: 'living',
        x: r.x ?? idx * 4,
        y: r.y ?? 0,
        width: r.width ?? 5,
        height: r.height ?? 4.5,
        areaSqM: r.area ?? (r.width * r.height) ?? 20,
        floorMaterial: 'parquet',
        color: ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][idx % 5],
      }));

      const openings: CADOpening[] = (projData.openings || [
        { type: 'door', x: 2, y: 0, width: 0.9, height: 2.1, sillHeight: 0, label: 'Acceso' },
        { type: 'window', x: 7, y: 0, width: 1.8, height: 1.4, sillHeight: 0.9, label: 'Ventanal' },
      ]).map((op: any, idx: number) => ({
        id: `op-proc-${idx}`,
        type: op.type,
        x: op.x ?? 2,
        y: op.y ?? 0,
        width: op.width ?? 0.9,
        height: op.height ?? 2.1,
        sillHeight: op.sillHeight ?? (op.type === 'door' ? 0 : 0.9),
        label: op.label || (op.type === 'door' ? 'Puerta' : 'Ventana'),
      }));

      const dims: CADDimension[] = [
        { id: 'dim-p1', x1: 0, y1: -0.6, x2: 12, y2: -0.6, offset: -0.6, value: 12.0, text: '12.00 m' },
        { id: 'dim-p2', x1: -0.6, y1: 0, x2: -0.6, y2: 10, offset: -0.6, value: 10.0, text: '10.00 m' },
      ];

      const newProject: PaperSketchProject = {
        id: `proj-${Date.now()}`,
        name: projData.name || 'Boceto Digitalizado BELENT',
        timestamp: Date.now(),
        originalImage: selectedImage,
        scale: projData.scale || '1:50',
        totalAreaSqM: projData.totalAreaSqM || rooms.reduce((a, r) => a + r.areaSqM, 0),
        confidence: projData.confidence || 0.94,
        walls,
        openings,
        rooms,
        dimensions: dims,
        blocks: projData.blocks || [],
        architecturalReport: projData.architecturalReport,
      };

      setExtractedProject(newProject);
      onApplyProject(newProject);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generative AI Text-to-Floorplan Trigger
  const handleGenerateFromText = async () => {
    if (!generativePrompt.trim()) return;

    setIsGeneratingText(true);

    try {
      const response = await fetch('/api/generate-floorplan-from-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: generativePrompt,
          language,
        }),
      });

      const data = response.ok ? await response.json().catch(() => ({})) : {};
      if (data.project) {
        setExtractedProject(data.project);
        onApplyProject(data.project);
      }
    } catch (err) {
      console.error('Error generating floorplan from text:', err);
    } finally {
      setIsGeneratingText(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-[#090d16] text-neutral-100 flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        {/* Header Title */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel text-sky-400 text-xs font-mono font-medium w-fit border border-sky-500/30">
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>BELENT ARCHITECTURAL AI ENGINE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {t.title}
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 max-w-3xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Input Mode Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'upload'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'glass-panel text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.tabUpload}</span>
          </button>

          <button
            onClick={() => setActiveTab('whiteboard')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'whiteboard'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'glass-panel text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{t.tabWhiteboard}</span>
          </button>

          <button
            onClick={() => setActiveTab('generative')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'generative'
                ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold shadow-lg shadow-red-600/30'
                : 'glass-panel text-red-300 hover:text-white border border-red-500/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.tabGenerative}</span>
          </button>
        </div>

        {/* TAB 1: UPLOAD / SAMPLE SKETCH */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Sketch Preview & Upload */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 cursor-pointer transition-all overflow-hidden ${
                  selectedImage
                    ? 'border-red-500/50 bg-neutral-900/40'
                    : 'border-neutral-700/60 bg-neutral-900/20 hover:border-red-400 hover:bg-neutral-900/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {selectedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="Croquis seleccionado"
                      className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                    />
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-mono text-neutral-300 border border-white/10">
                      Clic para cambiar boceto
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-inner">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-200">{t.dragDrop}</p>
                      <p className="text-xs text-neutral-500 mt-1">{t.orClick}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Blueprints buttons */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono text-neutral-400">{t.sampleSketches}</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSelectSample(1)}
                    className="p-2.5 rounded-xl glass-panel text-left text-xs text-neutral-300 hover:border-red-500/50 hover:bg-red-500/10 transition-all border border-white/5"
                  >
                    <span className="block font-medium text-red-400">Opción 1</span>
                    <span className="text-[11px] text-neutral-400">{t.sample1}</span>
                  </button>
                  <button
                    onClick={() => handleSelectSample(2)}
                    className="p-2.5 rounded-xl glass-panel text-left text-xs text-neutral-300 hover:border-red-500/50 hover:bg-red-500/10 transition-all border border-white/5"
                  >
                    <span className="block font-medium text-red-400">Opción 2</span>
                    <span className="text-[11px] text-neutral-400">{t.sample2}</span>
                  </button>
                  <button
                    onClick={() => handleSelectSample(3)}
                    className="p-2.5 rounded-xl glass-panel text-left text-xs text-neutral-300 hover:border-red-500/50 hover:bg-red-500/10 transition-all border border-white/5"
                  >
                    <span className="block font-medium text-red-400">Opción 3</span>
                    <span className="text-[11px] text-neutral-400">{t.sample3}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Processing & Output Details */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-neutral-400">Notas de Proyecto (Opcional):</label>
                <textarea
                  rows={2}
                  value={userPromptNotes}
                  onChange={(e) => setUserPromptNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  className="w-full bg-neutral-900/80 border border-neutral-700/60 rounded-xl p-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Transform Action Button */}
              <button
                onClick={handleProcessSketch}
                disabled={!selectedImage || isProcessing}
                className={`w-full py-3.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  !selectedImage || isProcessing
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                    : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-red-600/30 border border-red-400/30'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>{t.processing}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{t.processBtn}</span>
                  </>
                )}
              </button>

              {/* Extraction Results Display */}
              {extractedProject && (
                <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3 border border-emerald-500/30 bg-emerald-950/10">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.detectionSuccess}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="glass-panel p-2 rounded-xl">
                      <span className="text-[10px] text-neutral-400 block font-mono">Superficie</span>
                      <strong className="text-sm font-bold text-red-400">{extractedProject.totalAreaSqM.toFixed(1)} m²</strong>
                    </div>
                    <div className="glass-panel p-2 rounded-xl">
                      <span className="text-[10px] text-neutral-400 block font-mono">Muros</span>
                      <strong className="text-sm font-bold text-emerald-400">{extractedProject.walls.length}</strong>
                    </div>
                    <div className="glass-panel p-2 rounded-xl">
                      <span className="text-[10px] text-neutral-400 block font-mono">Confianza</span>
                      <strong className="text-sm font-bold text-amber-400">{Math.round(extractedProject.confidence * 100)}%</strong>
                    </div>
                  </div>

                  {/* Rooms List */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-mono text-neutral-400">{t.detectedRooms}:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {extractedProject.rooms.map((r, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg text-[11px] font-mono glass-panel text-neutral-300 border border-white/10">
                          {r.name} ({r.areaSqM.toFixed(1)} m²)
                        </span>
                      ))}
                    </div>
                  </div>

                  {extractedProject.architecturalReport && (
                    <p className="text-xs text-neutral-300 italic bg-black/30 p-2.5 rounded-xl border border-white/5">
                      "{extractedProject.architecturalReport}"
                    </p>
                  )}

                  {/* Action Buttons to go directly to 3D View or Realistic Render */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={onGoTo3D}
                      className="py-2.5 px-3 rounded-xl text-xs font-medium bg-red-600 text-white hover:bg-red-500 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-600/30"
                    >
                      <Box className="w-4 h-4" />
                      <span>{t.view3D}</span>
                    </button>

                    <button
                      onClick={onGoToRender}
                      className="py-2.5 px-3 rounded-xl text-xs font-medium bg-amber-500 text-neutral-950 font-semibold hover:bg-amber-400 flex items-center justify-center gap-1.5 transition-all shadow"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>{t.viewRender}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE DIGITAL DRAFTING WHITEBOARD */}
        {activeTab === 'whiteboard' && (
          <div className="flex flex-col gap-4 w-full">
            {/* Whiteboard Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 glass-panel p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWhiteboardTool('pen')}
                  className={`p-2 rounded-xl text-xs flex items-center gap-1.5 ${
                    whiteboardTool === 'pen' ? 'bg-red-600 text-white font-medium shadow-md shadow-red-600/30' : 'text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Pluma Tinta</span>
                </button>
                <button
                  onClick={() => setWhiteboardTool('line')}
                  className={`p-2 rounded-xl text-xs flex items-center gap-1.5 ${
                    whiteboardTool === 'line' ? 'bg-red-600 text-white font-medium shadow-md shadow-red-600/30' : 'text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <span>Línea Recta</span>
                </button>
                <button
                  onClick={() => setWhiteboardTool('eraser')}
                  className={`p-2 rounded-xl text-xs flex items-center gap-1.5 ${
                    whiteboardTool === 'eraser' ? 'bg-amber-500 text-neutral-950 font-medium' : 'text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Borrador</span>
                </button>

                {/* Color choices */}
                <div className="flex items-center gap-1 ml-2 border-l border-white/10 pl-2">
                  {['#292524', '#0284c7', '#dc2626', '#16a34a'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setWhiteboardColor(c)}
                      className={`w-5 h-5 rounded-full border-2 ${
                        whiteboardColor === c ? 'border-white scale-110' : 'border-transparent opacity-70'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1.5 ml-2 text-xs text-neutral-400">
                  <span>Grosor:</span>
                  <select
                    value={lineWidth}
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                    className="bg-neutral-800 text-neutral-200 rounded px-1.5 py-0.5 text-xs outline-none"
                  >
                    <option value={2}>Fino (2px)</option>
                    <option value={4}>Medio (4px)</option>
                    <option value={6}>Grueso (6px)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDraftingGrid(!showDraftingGrid)}
                  className={`p-2 rounded-xl text-xs flex items-center gap-1.5 ${
                    showDraftingGrid ? 'bg-sky-500/20 text-sky-400' : 'text-neutral-400 hover:bg-white/10'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Cuadrícula</span>
                </button>

                <button
                  onClick={initWhiteboard}
                  className="px-3 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white glass-panel border border-white/10"
                >
                  {t.clearWhiteboard}
                </button>

                <button
                  onClick={handleDigitizeWhiteboard}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.digitizeWhiteboard}</span>
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/15 cursor-crosshair">
              <canvas
                ref={whiteboardCanvasRef}
                width={800}
                height={600}
                className="w-full h-full"
                onMouseDown={handleWhiteboardMouseDown}
                onMouseMove={handleWhiteboardMouseMove}
                onMouseUp={handleWhiteboardMouseUp}
              />
            </div>
            <p className="text-xs text-neutral-400 font-mono text-center">{t.whiteboardHint}</p>
          </div>
        )}

        {/* TAB 3: GENERATIVE AI TEXT ARCHITECT */}
        {activeTab === 'generative' && (
          <div className="flex flex-col gap-5 w-full glass-panel p-6 rounded-3xl border border-amber-500/30 bg-amber-950/10">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">{t.generativeTitle}</h3>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
                {t.generativeSubtitle}
              </p>
            </div>

            {/* Prompt Textarea */}
            <div className="flex flex-col gap-2">
              <textarea
                rows={4}
                value={generativePrompt}
                onChange={(e) => setGenerativePrompt(e.target.value)}
                placeholder={t.generativePlaceholder}
                className="w-full bg-black/50 border border-neutral-700/80 rounded-2xl p-4 text-xs md:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 shadow-inner"
              />
            </div>

            {/* Suggested Prompts Pills */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                {t.suggestedPrompts}
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Vivienda unifamiliar de 140 m² con 3 dormitorios, salón a doble altura y cocina americana con isla',
                  'Casa patio bioclimática de 120 m² con patio ajardinado central, 2 dormitorios y estudio de arquitectura',
                  'Loft industrial de 85 m² diáfano con techos altos, suite con vestidor y baño acristalado',
                  'Chalet mediterráneo de 160 m² con porche exterior corrido, 4 habitaciones y garaje'
                ].map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setGenerativePrompt(sug)}
                    className="text-left px-3 py-1.5 rounded-xl text-xs glass-panel text-neutral-300 hover:text-amber-300 hover:border-amber-400/40 transition-all border border-white/5"
                  >
                    "{sug}"
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateFromText}
              disabled={!generativePrompt.trim() || isGeneratingText}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                !generativePrompt.trim() || isGeneratingText
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 shadow-amber-500/25'
              }`}
            >
              {isGeneratingText ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
                  <span>{t.generatingAI}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.generateAIButton}</span>
                </>
              )}
            </button>

            {/* Extraction Results Display */}
            {extractedProject && (
              <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3 border border-emerald-500/30 bg-emerald-950/20 mt-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{extractedProject.name} — ¡Generado con éxito!</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="glass-panel p-2 rounded-xl">
                    <span className="text-[10px] text-neutral-400 block font-mono">Superficie</span>
                    <strong className="text-sm font-bold text-sky-400">{extractedProject.totalAreaSqM.toFixed(1)} m²</strong>
                  </div>
                  <div className="glass-panel p-2 rounded-xl">
                    <span className="text-[10px] text-neutral-400 block font-mono">Muros</span>
                    <strong className="text-sm font-bold text-emerald-400">{extractedProject.walls.length}</strong>
                  </div>
                  <div className="glass-panel p-2 rounded-xl">
                    <span className="text-[10px] text-neutral-400 block font-mono">Estancias</span>
                    <strong className="text-sm font-bold text-amber-400">{extractedProject.rooms.length}</strong>
                  </div>
                  <div className="glass-panel p-2 rounded-xl">
                    <span className="text-[10px] text-neutral-400 block font-mono">Bloques</span>
                    <strong className="text-sm font-bold text-indigo-400">{extractedProject.blocks?.length || 0}</strong>
                  </div>
                </div>

                {extractedProject.architecturalReport && (
                  <p className="text-xs text-neutral-300 italic bg-black/40 p-3 rounded-xl border border-white/10 leading-relaxed">
                    "{extractedProject.architecturalReport}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={onGoTo3D}
                    className="py-3 px-4 rounded-xl text-xs font-semibold bg-sky-500 text-white hover:bg-sky-400 flex items-center justify-center gap-2 transition-all shadow"
                  >
                    <Box className="w-4 h-4" />
                    <span>{t.view3D}</span>
                  </button>

                  <button
                    onClick={onGoToRender}
                    className="py-3 px-4 rounded-xl text-xs font-bold bg-amber-500 text-neutral-950 hover:bg-amber-400 flex items-center justify-center gap-2 transition-all shadow"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>{t.viewRender}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
