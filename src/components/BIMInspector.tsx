import React, { useState } from 'react';
import {
  CADWall,
  CADOpening,
  CADRoom,
  CADSlab,
  CADColumn,
  Language,
} from '../types/cad';
import {
  Layers,
  Box,
  Flame,
  Volume2,
  Thermometer,
  Shield,
  DollarSign,
  ChevronRight,
  Filter,
  Check,
  Edit3,
} from 'lucide-react';

interface BIMInspectorProps {
  walls: CADWall[];
  openings: CADOpening[];
  rooms: CADRoom[];
  slabs?: CADSlab[];
  columns?: CADColumn[];
  language: Language;
  onUpdateWall?: (wall: CADWall) => void;
  onUpdateOpening?: (op: CADOpening) => void;
  onUpdateRoom?: (room: CADRoom) => void;
}

export const BIMInspector: React.FC<BIMInspectorProps> = ({
  walls,
  openings,
  rooms,
  slabs = [],
  columns = [],
  language,
  onUpdateWall,
  onUpdateOpening,
  onUpdateRoom,
}) => {
  const [selectedType, setSelectedType] = useState<'all' | 'walls' | 'openings' | 'rooms' | 'structure'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(walls[0]?.id || null);

  // Selected item lookup
  const selectedWall = walls.find((w) => w.id === selectedId);
  const selectedOpening = openings.find((o) => o.id === selectedId);
  const selectedRoom = rooms.find((r) => r.id === selectedId);
  const selectedSlab = slabs.find((s) => s.id === selectedId);
  const selectedColumn = columns.find((c) => c.id === selectedId);

  return (
    <div className="w-full h-full bg-[#05070c] text-neutral-200 flex flex-col md:flex-row overflow-hidden font-sans select-none">
      {/* Sidebar / Tree of BIM Entities */}
      <div className="w-full md:w-80 border-r border-red-500/20 bg-[#090d16]/90 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              BIM MODEL TREE (IFC 2x3)
            </span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
            {walls.length + openings.length + rooms.length + slabs.length + columns.length} Entidades
          </span>
        </div>

        {/* Filter Chips */}
        <div className="p-2 border-b border-white/5 flex gap-1 overflow-x-auto text-[11px] font-mono">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'walls', label: `Muros (${walls.length})` },
            { id: 'openings', label: `Vanos (${openings.length})` },
            { id: 'rooms', label: `Espacios (${rooms.length})` },
            { id: 'structure', label: `Estructura (${slabs.length + columns.length})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id as any)}
              className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                selectedType === cat.id
                  ? 'bg-red-600/30 text-red-300 border border-red-500/40 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Entity List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-1 font-mono text-xs">
          {/* Walls */}
          {(selectedType === 'all' || selectedType === 'walls') &&
            walls.map((w, i) => (
              <button
                key={w.id}
                onClick={() => setSelectedId(w.id)}
                className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition-colors ${
                  selectedId === w.id ? 'bg-red-600/20 text-white border border-red-500/30' : 'text-neutral-400 hover:bg-white/5'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-neutral-200">
                    {`IfcWall_${i + 1} (${w.isExterior ? 'Exterior' : 'Interior'})`}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    e={w.thickness}m | h={w.height}m | L={Math.hypot(w.x2 - w.x1, w.y2 - w.y1).toFixed(2)}m
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
              </button>
            ))}

          {/* Openings */}
          {(selectedType === 'all' || selectedType === 'openings') &&
            openings.map((op, i) => (
              <button
                key={op.id}
                onClick={() => setSelectedId(op.id)}
                className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition-colors ${
                  selectedId === op.id ? 'bg-red-600/20 text-white border border-red-500/30' : 'text-neutral-400 hover:bg-white/5'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-neutral-200">
                    {op.type === 'door' ? `IfcDoor_${op.label || i + 1}` : `IfcWindow_${op.label || i + 1}`}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {`${op.width.toFixed(2)}x${op.height.toFixed(2)}m | antep: ${op.sillHeight.toFixed(2)}m`}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
              </button>
            ))}

          {/* Rooms */}
          {(selectedType === 'all' || selectedType === 'rooms') &&
            rooms.map((r, i) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition-colors ${
                  selectedId === r.id ? 'bg-red-600/20 text-white border border-red-500/30' : 'text-neutral-400 hover:bg-white/5'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-neutral-200">{`IfcSpace_${r.name}`}</span>
                  <span className="text-[10px] text-neutral-500">
                    {`S.Útil: ${(r.areaSqM || r.width * r.height).toFixed(1)} m² | ${r.floorMaterial}`}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
              </button>
            ))}
        </div>
      </div>

      {/* Property Inspector Details */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col gap-5">
        {selectedWall && (
          <div className="flex flex-col gap-5">
            <div className="border-b border-red-500/20 pb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-mono text-xs font-bold border border-red-500/30">
                    IfcWallStandardCase
                  </span>
                  <h3 className="text-base font-bold text-white font-mono">{`Muro #${selectedWall.id}`}</h3>
                </div>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  Elemento constructivo vertical delimitador de espacio.
                </p>
              </div>
            </div>

            {/* Dimensional & Physical Properties */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col">
                <span className="text-[10px] font-mono text-neutral-500">LONGITUD CALCULADA</span>
                <span className="text-lg font-bold font-mono text-white mt-1">
                  {Math.hypot(selectedWall.x2 - selectedWall.x1, selectedWall.y2 - selectedWall.y1).toFixed(2)} m
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col">
                <span className="text-[10px] font-mono text-neutral-500">ALTURA LIBRE</span>
                <span className="text-lg font-bold font-mono text-white mt-1">{selectedWall.height} m</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col">
                <span className="text-[10px] font-mono text-neutral-500">ESPESOR</span>
                <span className="text-lg font-bold font-mono text-white mt-1">{selectedWall.thickness} m</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col">
                <span className="text-[10px] font-mono text-neutral-500">VOLUMEN APROX.</span>
                <span className="text-lg font-bold font-mono text-amber-400 mt-1">
                  {(
                    Math.hypot(selectedWall.x2 - selectedWall.x1, selectedWall.y2 - selectedWall.y1) *
                    selectedWall.thickness *
                    selectedWall.height
                  ).toFixed(2)}{' '}
                  m³
                </span>
              </div>
            </div>

            {/* Semantic BIM Attributes Configuration */}
            <div className="p-4 rounded-2xl bg-[#090d16]/90 border border-white/10 flex flex-col gap-4">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-red-400" />
                <span>ATRIBUTOS TÉCNICOS Y PRESTACIONALES</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                {/* Material */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-400">Material de Fábrica:</label>
                  <select
                    value={selectedWall.material || 'white-stucco'}
                    onChange={(e) => {
                      if (onUpdateWall) onUpdateWall({ ...selectedWall, material: e.target.value as any });
                    }}
                    className="p-2 rounded-lg bg-black/50 border border-white/10 text-white focus:border-red-500 outline-none"
                  >
                    <option value="white-stucco">Estuco Blanco / Revoco Fino</option>
                    <option value="concrete">Hormigón Visto Encofrado</option>
                    <option value="brick">Ladrillo Cerámico Termoarcilla</option>
                    <option value="wood">Entramado de Madera SATE</option>
                    <option value="glass">Vidrio Laminado Estructural</option>
                    <option value="stone">Mampostería de Piedra Natural</option>
                  </select>
                </div>

                {/* Fire Rating */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-400 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-400" />
                    <span>Resistencia al Fuego (CTE DB-SI):</span>
                  </label>
                  <select
                    value={selectedWall.fireRating || (selectedWall.isExterior ? 'EI-120' : 'EI-60')}
                    onChange={(e) => {
                      if (onUpdateWall) onUpdateWall({ ...selectedWall, fireRating: e.target.value as any });
                    }}
                    className="p-2 rounded-lg bg-black/50 border border-white/10 text-white focus:border-red-500 outline-none"
                  >
                    <option value="EI-30">EI-30 (Tabiquería 30 min)</option>
                    <option value="EI-60">EI-60 (Sectorización 60 min)</option>
                    <option value="EI-90">EI-90 (Muro Portante 90 min)</option>
                    <option value="EI-120">EI-120 (Muro Fachada 120 min)</option>
                  </select>
                </div>

                {/* Thermal Transmittance */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-400 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-sky-400" />
                    <span>Transmitancia Térmica U (W/m²K):</span>
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={selectedWall.thermalU ?? (selectedWall.isExterior ? 0.28 : 0.65)}
                    onChange={(e) => {
                      if (onUpdateWall) onUpdateWall({ ...selectedWall, thermalU: parseFloat(e.target.value) || 0.3 });
                    }}
                    className="p-2 rounded-lg bg-black/50 border border-white/10 text-white focus:border-red-500 outline-none"
                  />
                </div>

                {/* Acoustic Rating */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-400 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-amber-400" />
                    <span>Aislamiento Acústico Ra (dB):</span>
                  </label>
                  <input
                    type="number"
                    value={selectedWall.acousticDb ?? (selectedWall.isExterior ? 50 : 38)}
                    onChange={(e) => {
                      if (onUpdateWall) onUpdateWall({ ...selectedWall, acousticDb: parseInt(e.target.value) || 45 });
                    }}
                    className="p-2 rounded-lg bg-black/50 border border-white/10 text-white focus:border-red-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* If Opening Selected */}
        {selectedOpening && (
          <div className="flex flex-col gap-5">
            <div className="border-b border-red-500/20 pb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 font-mono text-xs font-bold border border-blue-500/30">
                    {selectedOpening.type === 'door' ? 'IfcDoor' : 'IfcWindow'}
                  </span>
                  <h3 className="text-base font-bold text-white font-mono">{selectedOpening.label}</h3>
                </div>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  Carpintería y hueco arquitectónico en cerramiento.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[10px] text-neutral-500">ANCHO DE VANO</span>
                <div className="text-lg font-bold text-white mt-1">{selectedOpening.width.toFixed(2)} m</div>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[10px] text-neutral-500">ALTURA LIBRE</span>
                <div className="text-lg font-bold text-white mt-1">{selectedOpening.height.toFixed(2)} m</div>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[10px] text-neutral-500">ANTEPECHO</span>
                <div className="text-lg font-bold text-white mt-1">{selectedOpening.sillHeight.toFixed(2)} m</div>
              </div>
            </div>
          </div>
        )}

        {/* If Room Selected */}
        {selectedRoom && (
          <div className="flex flex-col gap-5">
            <div className="border-b border-red-500/20 pb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
                    IfcSpace
                  </span>
                  <h3 className="text-base font-bold text-white font-mono">{selectedRoom.name}</h3>
                </div>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  Volumen espacial habitable y computabilidad de superficies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[10px] text-neutral-500">SUPERFICIE ÚTIL</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {(selectedRoom.areaSqM || selectedRoom.width * selectedRoom.height).toFixed(1)} m²
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[10px] text-neutral-500">PAVIMENTO SELECCIONADO</span>
                <div className="text-sm font-bold text-white mt-1 capitalize">{selectedRoom.floorMaterial}</div>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[10px] text-neutral-500">RATIO VENTILACIÓN REQUERIDO</span>
                <div className="text-sm font-bold text-sky-400 mt-1">10% (CTE DB-HS 3)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
