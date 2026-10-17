import { X } from "lucide-react";
import SchoolMap from "./SchoolMap";

export default function MapModal({ isOpen, onClose, onLocationSelect, selectedX, selectedY, selectedLabel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4 border-b border-zinc-800 bg-zinc-950">
        <div>
          <h2 className="text-white font-bold text-lg">Seleccionar Ubicación</h2>
          <p className="text-zinc-400 text-xs mt-0.5">Toca el punto exacto del daño en el mapa</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
        >
          <X className="w-5 h-5 text-zinc-300" />
        </button>
      </div>

      {/* Map fullscreen */}
      <div className="flex-1 flex flex-col px-3 py-4 gap-3 overflow-hidden">
        <div className="flex-1 relative rounded-2xl overflow-hidden border border-zinc-700">
          <SchoolMap
            onLocationSelect={(loc) => {
              onLocationSelect(loc);
            }}
            selectedX={selectedX}
            selectedY={selectedY}
            selectedLabel={selectedLabel}
          />
        </div>

        {/* Selected location display */}
        {selectedX !== undefined ? (
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-xs">Ubicación seleccionada:</p>
              <p className="text-white font-semibold text-sm mt-0.5">📍 {selectedLabel}</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white text-zinc-900 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-zinc-100 active:scale-95 transition-all"
            >
              Confirmar
            </button>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl px-4 py-3 text-center">
            <p className="text-zinc-500 text-sm">👆 Toca cualquier zona del mapa para marcarla</p>
          </div>
        )}
      </div>
    </div>
  );
}