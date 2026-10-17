import { useState } from "react";
import { MapPin, AlertOctagon, Clock, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

const SEVERITY_WEIGHT = { rojo: 3, naranja: 2, verde: 1 };

export default function ZoneStats({ reports }) {
  const [expanded, setExpanded] = useState(false);
  const [sortBy, setSortBy] = useState("total"); // total | pendientes | gravedad

  // Agrupar por location_label
  const zoneMap = {};
  reports.forEach((r) => {
    const zone = r.location_label || "Sin ubicación";
    if (!zoneMap[zone]) {
      zoneMap[zone] = { zone, total: 0, pendientes: 0, resueltos: 0, urgentes: 0, gravedad: 0 };
    }
    const z = zoneMap[zone];
    z.total++;
    if (r.status === "pendiente") z.pendientes++;
    else z.resueltos++;
    if (r.severity === "rojo") z.urgentes++;
    z.gravedad += SEVERITY_WEIGHT[r.severity] || 0;
  });

  let zones = Object.values(zoneMap);
  zones.sort((a, b) => {
    if (sortBy === "pendientes") return b.pendientes - a.pendientes;
    if (sortBy === "gravedad") return b.gravedad - a.gravedad;
    return b.total - a.total;
  });

  if (zones.length === 0) return null;

  const maxTotal = Math.max(...zones.map((z) => z.total));
  const visibleZones = expanded ? zones : zones.slice(0, 5);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide">Estadísticas por zona</p>
        <span className="text-zinc-600 text-xs">{zones.length} zonas</span>
      </div>

      {/* Sort selector */}
      <div className="flex gap-1.5 mb-3">
        {[
          { key: "total", label: "Más reportes" },
          { key: "pendientes", label: "Más pendientes" },
          { key: "gravedad", label: "Más graves" },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
              sortBy === opt.key
                ? "bg-white text-zinc-900 border-white"
                : "bg-zinc-800 text-zinc-400 border-zinc-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Zone ranking */}
      <div className="space-y-2">
        {visibleZones.map((z, i) => {
          const pct = maxTotal > 0 ? (z.total / maxTotal) * 100 : 0;
          return (
            <div key={z.zone} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-zinc-600 text-xs font-bold w-4 shrink-0">#{i + 1}</span>
                <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                <span className="text-zinc-300 text-xs font-medium flex-1 truncate">{z.zone}</span>
                <span className="text-white text-xs font-bold shrink-0">{z.total}</span>
              </div>
              {/* Bar */}
              <div className="ml-6 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {/* Sub-stats */}
              <div className="ml-6 flex gap-3 text-xs">
                <span className="text-yellow-400 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> {z.pendientes}
                </span>
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> {z.resueltos}
                </span>
                {z.urgentes > 0 && (
                  <span className="text-red-400 flex items-center gap-0.5">
                    <AlertOctagon className="w-2.5 h-2.5" /> {z.urgentes}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {zones.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-center gap-1 text-zinc-400 text-xs font-medium hover:text-zinc-200 transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="w-3.5 h-3.5" /> Ver menos</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /> Ver las {zones.length - 5} zonas restantes</>
          )}
        </button>
      )}
    </div>
  );
}