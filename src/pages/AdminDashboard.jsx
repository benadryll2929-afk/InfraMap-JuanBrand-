import { useState, useEffect } from "react";
import { ArrowLeft, AlertOctagon, AlertTriangle, Leaf, CheckCircle2, Clock, BarChart3, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import BottomNavbar from "../components/BottomNavbar";
import ResolveModal from "../components/ResolveModal";
import AdminCharts from "../components/AdminCharts";
import ZoneStats from "../components/ZoneStats";
import ExportExcel from "../components/ExportExcel";
import AppHeader from "../components/AppHeader";
import HamburgerMenu from "../components/HamburgerMenu";

const SEVERITY_CONFIG = {
  verde: { label: "Sin problema", textColor: "text-green-400", bg: "bg-green-900/30 border-green-800/40", icon: Leaf },
  naranja: { label: "Medio", textColor: "text-orange-400", bg: "bg-orange-900/30 border-orange-800/40", icon: AlertTriangle },
  rojo: { label: "Urgente", textColor: "text-red-400", bg: "bg-red-900/30 border-red-800/40", icon: AlertOctagon },
};

const CATEGORIES = ["Todos", "Eléctrico", "Sanitario", "Mobiliario", "Infraestructura", "Otro"];
const STATUSES = ["Todos", "pendiente", "resuelto"];
const SEVERITIES = ["Todos", "verde", "naranja", "rojo"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterSeverity, setFilterSeverity] = useState("Todos");
  const [filterCategory, setFilterCategory] = useState("Todos");
  const [resolveTarget, setResolveTarget] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (isAuth) => {
      if (!isAuth) { base44.auth.redirectToLogin("/"); return; }
      const u = await base44.auth.me();
      setUser(u);
      if (u.role !== "admin") { navigate("/"); return; }
      const data = await base44.entities.Report.list("-created_date", 100);
      setReports(data);
      setLoading(false);
    });
  }, []);

  const filtered = reports.filter((r) => {
    if (filterStatus !== "Todos" && r.status !== filterStatus) return false;
    if (filterSeverity !== "Todos" && r.severity !== filterSeverity) return false;
    if (filterCategory !== "Todos" && r.category !== filterCategory) return false;
    return true;
  });

  const stats = {
    total: reports.length,
    pendientes: reports.filter((r) => r.status === "pendiente").length,
    resueltos: reports.filter((r) => r.status === "resuelto").length,
    urgentes: reports.filter((r) => r.severity === "rojo").length,
  };

  const FilterChip = ({ options, value, onChange }) => (
    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-all border ${
            value === opt
              ? "bg-white text-zinc-900 border-white"
              : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"
          }`}
        >
          {opt === "pendiente" ? "Pendiente" : opt === "resuelto" ? "Resuelto" : opt}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-full max-w-sm bg-zinc-950 min-h-screen flex flex-col">

        <AppHeader onMenuClick={() => setMenuOpen(true)} isAdmin subtitle="Dashboard Admin" />

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <p className="text-zinc-500 text-xs">Total Reportes</p>
              <p className="text-white font-bold text-3xl mt-1">{stats.total}</p>
            </div>
            <div className="bg-zinc-900 border border-red-900/40 rounded-2xl p-4">
              <p className="text-red-400 text-xs">Urgentes</p>
              <p className="text-white font-bold text-3xl mt-1">{stats.urgentes}</p>
            </div>
            <div className="bg-zinc-900 border border-yellow-900/40 rounded-2xl p-4">
              <p className="text-yellow-400 text-xs">Pendientes</p>
              <p className="text-white font-bold text-3xl mt-1">{stats.pendientes}</p>
            </div>
            <div className="bg-zinc-900 border border-emerald-900/40 rounded-2xl p-4">
              <p className="text-emerald-400 text-xs">Resueltos</p>
              <p className="text-white font-bold text-3xl mt-1">{stats.resueltos}</p>
            </div>
          </div>

          {/* Gráficos analíticos */}
          <AdminCharts reports={reports} />

          {/* Estadísticas por zona */}
          <ZoneStats reports={reports} />

          {/* Exportar a Excel */}
          <ExportExcel />

          {/* Gestión de correos en español */}
          <Link to="/admin/emails">
            <div className="w-full bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 font-semibold text-sm py-3 rounded-2xl transition-all hover:bg-indigo-900/60 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" /> Gestionar correos en español
            </div>
          </Link>

          {/* Filters */}
          <div className="space-y-2">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide">Estado</p>
            <FilterChip options={STATUSES} value={filterStatus} onChange={setFilterStatus} />
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide">Gravedad</p>
            <FilterChip options={SEVERITIES} value={filterSeverity} onChange={setFilterSeverity} />
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide">Categoría</p>
            <FilterChip options={CATEGORIES} value={filterCategory} onChange={setFilterCategory} />
          </div>

          <p className="text-zinc-500 text-xs">{filtered.length} reporte{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>

          {/* Report list */}
          {loading ? (
            <div className="flex justify-center pt-8">
              <div className="w-8 h-8 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
            </div>
          ) : filtered.map((report) => {
            const cfg = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.verde;
            const Icon = cfg.icon;
            return (
              <div key={report.id}>
                <Link to={`/report/${report.id}`}>
                  <div className={`bg-zinc-900 border rounded-2xl p-3 mb-2 transition-all hover:border-zinc-600 ${report.status === "resuelto" ? "border-emerald-800/40" : "border-zinc-800"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm truncate">{report.title}</h3>
                        <p className="text-zinc-500 text-xs mt-0.5">👤 {report.reporter_name}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.textColor}`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </div>
                        {report.status === "resuelto" ? (
                          <span className="text-emerald-400 text-xs flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Resuelto</span>
                        ) : (
                          <span className="text-yellow-400 text-xs flex items-center gap-0.5"><Clock className="w-3 h-3" /> Pendiente</span>
                        )}
                      </div>
                    </div>
                    {report.category && (
                      <p className="text-zinc-600 text-xs mt-1.5">🏷️ {report.category} · {report.location_label || "Sin ubicación"}</p>
                    )}
                    <p className="text-zinc-700 text-xs mt-1">
                      {new Date(report.created_date).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    {report.status === "pendiente" && (
                      <button
                        onClick={(e) => { e.preventDefault(); setResolveTarget(report); }}
                        className="mt-2 w-full bg-emerald-900/40 border border-emerald-700/50 text-emerald-400 text-xs py-1.5 rounded-xl hover:bg-emerald-900/60 transition-colors font-medium"
                      >
                        ✓ Marcar Resuelto
                      </button>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {resolveTarget && (
          <ResolveModal
            report={resolveTarget}
            onClose={() => setResolveTarget(null)}
            onResolved={(updated) => {
              setReports((prev) => prev.map((r) => r.id === updated.id ? updated : r));
              setResolveTarget(null);
            }}
          />
        )}

        <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={user} />

        <BottomNavbar />
      </div>
    </div>
  );
}