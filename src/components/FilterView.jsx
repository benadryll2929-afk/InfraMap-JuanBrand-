import { Clock, CheckCircle2, Leaf, AlertTriangle, AlertOctagon, User, LayoutDashboard } from "lucide-react";

const FILTER_CONFIG = {
  null: {
    label: "Todos los Reportes",
    icon: LayoutDashboard,
    color: "text-white",
    bg: "bg-zinc-800",
    desc: "Vista general de todos los reportes de la institución",
  },
  pendiente: {
    label: "Pendientes",
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-900/20 border border-yellow-800/30",
    desc: "Reportes que aún no han sido atendidos",
  },
  resuelto: {
    label: "Resueltos",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-900/20 border border-emerald-800/30",
    desc: "Daños que ya fueron reparados",
  },
  verde: {
    label: "Sin Problema",
    icon: Leaf,
    color: "text-green-400",
    bg: "bg-green-900/20 border border-green-800/30",
    desc: "Reportes de baja prioridad",
  },
  naranja: {
    label: "Prioridad Media",
    icon: AlertTriangle,
    color: "text-orange-400",
    bg: "bg-orange-900/20 border border-orange-800/30",
    desc: "Daños que requieren atención pronto",
  },
  rojo: {
    label: "Urgentes",
    icon: AlertOctagon,
    color: "text-red-400",
    bg: "bg-red-900/20 border border-red-800/30",
    desc: "Daños críticos que requieren atención inmediata",
  },
  "mis-reportes": {
    label: "Mis Reportes",
    icon: User,
    color: "text-blue-400",
    bg: "bg-blue-900/20 border border-blue-800/30",
    desc: "Reportes que has enviado tú",
  },
};

export default function FilterView({ activeFilter, count, onClear }) {
  const key = activeFilter || "null";
  const config = FILTER_CONFIG[key] || FILTER_CONFIG["null"];
  const Icon = config.icon;

  if (!activeFilter) return null;

  return (
    <div className={`mx-4 my-2 rounded-2xl px-4 py-3 flex items-center gap-3 ${config.bg}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-zinc-800/60`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${config.color}`}>{config.label}</p>
        <p className="text-zinc-500 text-xs">{count} reporte{count !== 1 ? "s" : ""} • {config.desc}</p>
      </div>
      <button onClick={onClear} className="text-zinc-600 text-xs hover:text-zinc-300 transition-colors whitespace-nowrap">
        Ver todos
      </button>
    </div>
  );
}