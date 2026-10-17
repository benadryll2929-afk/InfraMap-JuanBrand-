import { useState, useRef } from "react";
import { MapPin } from "lucide-react";

const MAP_IMAGE = "https://media.base44.com/images/public/user_6a10f82f7fa62cce17ef491b/0f922d48b_image.png";

const SCHOOL_ZONES = [
  { label: "Salón 1", x: 88, y: 12 },
  { label: "Rectoría", x: 80, y: 10 },
  { label: "Sistemas 2", x: 80, y: 25 },
  { label: "Sistemas 1", x: 80, y: 40 },
  { label: "Secretaría", x: 80, y: 52 },
  { label: "Laboratorio Químico", x: 62, y: 35 },
  { label: "Salón 5", x: 65, y: 50 },
  { label: "Salón 6", x: 62, y: 60 },
  { label: "Tesorería", x: 58, y: 70 },
  { label: "Archivo", x: 62, y: 75 },
  { label: "Almacén", x: 70, y: 75 },
  { label: "Fuente", x: 62, y: 20 },
  { label: "Mecánica", x: 38, y: 22 },
  { label: "Salón 15", x: 22, y: 72 },
  { label: "Edu. Física", x: 30, y: 75 },
  { label: "Auditorio", x: 34, y: 72 },
  { label: "Cafetería", x: 34, y: 62 },
  { label: "Sala Docente", x: 38, y: 60 },
  { label: "Coliseo", x: 12, y: 38 },
  { label: "P.A.E.", x: 16, y: 70 },
  { label: "Baño Hombres", x: 36, y: 10 },
  { label: "Baño Mujeres", x: 36, y: 16 },
  { label: "Baño Docente", x: 85, y: 22 },
  { label: "Coord. AM y PM", x: 40, y: 12 },
  { label: "Portería Norte", x: 54, y: 4 },
  { label: "Portería Sur", x: 20, y: 78 },
  { label: "Parqueadero", x: 22, y: 85 },
  { label: "Cancha", x: 22, y: 92 },
  { label: "Pasillo Central", x: 52, y: 45 },
  { label: "Maloka", x: 84, y: 65 },
  { label: "A.R.E.S.", x: 78, y: 68 },
];

export default function SchoolMap({ onLocationSelect, selectedX, selectedY, selectedLabel, readOnly = false }) {
  const mapRef = useRef(null);
  const [hoveredZone, setHoveredZone] = useState(null);

  const handleMapClick = (e) => {
    if (readOnly) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Find closest zone within 8% radius
    let closestZone = null;
    let minDist = Infinity;
    SCHOOL_ZONES.forEach((zone) => {
      const dist = Math.sqrt(Math.pow(zone.x - x, 2) + Math.pow(zone.y - y, 2));
      if (dist < minDist) {
        minDist = dist;
        closestZone = zone;
      }
    });

    const label = minDist < 8 ? closestZone.label : `Zona (${x.toFixed(0)}%, ${y.toFixed(0)}%)`;
    onLocationSelect && onLocationSelect({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)), label });
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900">
      {/* Map container */}
      <div
        ref={mapRef}
        className={`relative w-full ${readOnly ? "cursor-default" : "cursor-crosshair"}`}
        style={{ paddingBottom: "56.25%" }}
        onClick={handleMapClick}
      >
        <img
          src={MAP_IMAGE}
          alt="Mapa del Colegio IETI Rafael Navia Varón"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Hover zone labels */}
        {!readOnly && SCHOOL_ZONES.map((zone) => (
          <div
            key={zone.label}
            className="absolute"
            style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: "translate(-50%, -50%)" }}
            onMouseEnter={() => setHoveredZone(zone.label)}
            onMouseLeave={() => setHoveredZone(null)}
          >
            <div className={`w-3 h-3 rounded-full transition-all ${hoveredZone === zone.label ? "bg-white scale-150" : "bg-white/20"}`} />
            {hoveredZone === zone.label && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 border border-zinc-600">
                {zone.label}
              </div>
            )}
          </div>
        ))}

        {/* Selected pin */}
        {selectedX !== undefined && selectedY !== undefined && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{ left: `${selectedX}%`, top: `${selectedY}%`, transform: "translate(-50%, -100%)" }}
          >
            <div className="flex flex-col items-center">
              <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded mb-1 whitespace-nowrap shadow-lg border border-red-400">
                {selectedLabel || "Ubicación seleccionada"}
              </div>
              <MapPin className="w-7 h-7 text-red-500 drop-shadow-lg" fill="currentColor" />
            </div>
          </div>
        )}
      </div>

      {/* Instruction bar */}
      {!readOnly && (
        <div className="bg-zinc-800 px-3 py-2 text-center">
          <p className="text-zinc-400 text-xs">
            {selectedX !== undefined
              ? `📍 Ubicación: ${selectedLabel}`
              : "Toca el mapa para marcar la ubicación exacta del daño"}
          </p>
        </div>
      )}
    </div>
  );
}