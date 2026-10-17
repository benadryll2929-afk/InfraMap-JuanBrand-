import { useState, useEffect, useRef } from "react";
import { Plus, MapPin, AlertOctagon, AlertTriangle, Leaf, CheckCircle2, Clock, RefreshCw, Search, Zap, Droplets, Sofa, Building2, Package, Menu } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SchoolMap from "../components/SchoolMap";
import BottomNavbar from "../components/BottomNavbar";
import NotificationBell from "../components/NotificationBell";
import { Link, useNavigate } from "react-router-dom";
import FilterView from "../components/FilterView";
import StatsBar from "../components/StatsBar";
import ResolveModal from "../components/ResolveModal";
import HamburgerMenu from "../components/HamburgerMenu";
import TermsAcceptance from "../components/TermsAcceptance";
import AppHeader from "../components/AppHeader";
import { motion } from "framer-motion";
import { isAllowedEmail } from "@/lib/userAccess";

const CATEGORY_CHIPS = [
  { label: "Eléctrico", icon: Zap },
  { label: "Sanitario", icon: Droplets },
  { label: "Mobiliario", icon: Sofa },
  { label: "Infraestructura", icon: Building2 },
  { label: "Otro", icon: Package },
];

const SEVERITY_CONFIG = {
  verde: { label: "Sin problema", color: "bg-green-500", textColor: "text-green-400", glow: "shadow-[0_0_12px_rgba(34,197,94,0.25)]", border: "border-green-900/40", icon: Leaf },
  naranja: { label: "Medio", color: "bg-orange-500", textColor: "text-orange-400", glow: "shadow-[0_0_12px_rgba(249,115,22,0.25)]", border: "border-orange-900/40", icon: AlertTriangle },
  rojo: { label: "Urgente", color: "bg-red-500", textColor: "text-red-400", glow: "shadow-[0_0_14px_rgba(239,68,68,0.35)]", border: "border-red-900/50", icon: AlertOctagon },
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const listRef = useRef(null);
  const touchStartY = useRef(0);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [mapView, setMapView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get("filter");
    setActiveFilter(filter);
  }, []);

  useEffect(() => {
    loadUser();
    loadReports();
    const unsub = base44.entities.Report.subscribe((event) => {
      if (event.type === "create") setReports((prev) => [event.data, ...prev]);
      else if (event.type === "update") setReports((prev) => prev.map((r) => r.id === event.id ? event.data : r));
      else if (event.type === "delete") setReports((prev) => prev.filter((r) => r.id !== event.id));
    });
    return unsub;
  }, []);

  const loadUser = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin("/");
      return;
    }
    const u = await base44.auth.me();
    if (!u) {
      base44.auth.redirectToLogin("/");
      return;
    }
    // Validate allowed email domain
    const allowed = isAllowedEmail(u.email);
    if (!allowed) {
      await base44.auth.logout("/");
      return;
    }
    setUser(u);

    // Verificar aceptación de TyC
    if (!u.tyc_accepted) {
      setShowTerms(true);
      return;
    }

    // Correo de bienvenida la primera vez
    if (!u.welcome_sent) {
      const isFirstTime = !u.created_date || (Date.now() - new Date(u.created_date).getTime() < 1000 * 60 * 60 * 24 * 7);
      const subject = isFirstTime
        ? "¡Bienvenido/a a InfraMap! 🎉"
        : "¡Bienvenido/a de vuelta a InfraMap! 👋";
      const body = isFirstTime
        ? `Hola ${u.full_name?.split(" ")[0] || ""},\n\n¡Nos alegra tenerte en InfraMap! 🏫\n\nEsta app te permite reportar daños e inconvenientes en el colegio de forma rápida y sencilla, para que todos podamos tener un mejor ambiente.\n\nYa puedes empezar a explorar y hacer tu primer reporte. ¡Tu participación hace la diferencia!\n\nCon cariño,\nEl equipo de InfraMap 💙`
        : `Hola ${u.full_name?.split(" ")[0] || ""},\n\n¡Qué bueno verte de vuelta en InfraMap! 😊\n\nRecuerda que puedes reportar cualquier daño o inconveniente en el colegio para que sea atendido a tiempo.\n\n¡Gracias por seguir cuidando nuestro colegio!\n\nCon cariño,\nEl equipo de InfraMap 💙`;
      try {
        await base44.integrations.Core.SendEmail({ to: u.email, subject, body });
        await base44.auth.updateMe({ welcome_sent: true });
      } catch (error) {
        console.error("No se pudo enviar el correo de bienvenida:", error);
      }
    }
  };

  const loadReports = async () => {
    const data = await base44.entities.Report.list("-created_date", 50);
    setReports(data);
  };

  const SEVERITY_WEIGHT = { rojo: 3, naranja: 2, verde: 1 };

  const filteredReports = reports
    .filter((r) => {
      // Status/severity filter
      if (activeFilter === "mis-reportes" && r.reporter_email !== user?.email) return false;
      if (activeFilter === "pendiente" && r.status !== "pendiente") return false;
      if (activeFilter === "resuelto" && r.status !== "resuelto") return false;
      if (["verde", "naranja", "rojo"].includes(activeFilter) && r.severity !== activeFilter) return false;
      // Category filter
      if (activeCategoryFilter && r.category !== activeCategoryFilter) return false;
      // Text search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inTitle = r.title?.toLowerCase().includes(q);
        const inLocation = r.location_label?.toLowerCase().includes(q);
        if (!inTitle && !inLocation) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Pendientes antes que resueltos
      if (a.status !== b.status) return a.status === "pendiente" ? -1 : 1;
      // Mayor gravedad primero
      const wa = SEVERITY_WEIGHT[a.severity] || 0;
      const wb = SEVERITY_WEIGHT[b.severity] || 0;
      if (wa !== wb) return wb - wa;
      // Más reciente primero
      return new Date(b.created_date) - new Date(a.created_date);
    });

  const handleResolved = (updatedReport) => {
    setReports((prev) => prev.map((r) => r.id === updatedReport.id ? updatedReport : r));
  };

  const deleteReport = async (reportId) => {
    await base44.entities.Report.delete(reportId);
  };

  const filterLabel = {
    pendiente: "Pendientes",
    resuelto: "Resueltos",
    verde: "Sin Problema",
    naranja: "Prioridad Media",
    rojo: "Urgentes",
    "mis-reportes": "Mis Reportes",
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      {/* Mobile container */}
      <div className="w-full max-w-sm bg-zinc-950 min-h-screen flex flex-col relative">

        <AppHeader onMenuClick={() => setMenuOpen(true)} isAdmin={isAdmin} />

        {/* Search bar */}
        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por título o ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-2xl pl-9 pr-4 py-2.5 outline-none focus:border-zinc-500 placeholder:text-zinc-600"
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="px-4 pt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORY_CHIPS.map(({ label, icon: Icon }) => {
            const active = activeCategoryFilter === label;
            return (
              <button
                key={label}
                onClick={() => setActiveCategoryFilter(active ? null : label)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shrink-0 ${
                  active
                    ? "bg-white text-zinc-900 border-white"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Admin dashboard shortcut */}
        {isAdmin && (
          <Link to="/admin">
            <div className="mx-4 mt-3 flex items-center gap-2 bg-amber-900/20 border border-amber-700/40 rounded-xl px-3 py-2">
              <span className="text-amber-400 text-xs">📊</span>
              <p className="text-amber-400 text-xs font-semibold">Abrir Dashboard de Administración</p>
              <span className="ml-auto text-amber-600 text-xs">→</span>
            </div>
          </Link>
        )}

        <StatsBar reports={reports} />

        <FilterView
          activeFilter={activeFilter}
          count={filteredReports.length}
          onClear={() => { setActiveFilter(null); navigate("/"); }}
        />

        {/* Toggle: Map / List */}
        <div className="px-4 py-3 flex gap-2">
          <button
            onClick={() => setMapView(false)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${!mapView ? "bg-white text-zinc-900" : "bg-zinc-800 text-zinc-400"}`}
          >
            Lista
          </button>
          <button
            onClick={() => setMapView(true)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${mapView ? "bg-white text-zinc-900" : "bg-zinc-800 text-zinc-400"}`}
          >
            🗺️ Mapa
          </button>
        </div>

        {/* Map View */}
        {mapView && (
          <div className="px-4" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
            <div className="relative">
              <SchoolMap readOnly={true} />
              {/* Overlay pins for reports */}
              {filteredReports.filter(r => r.map_x && r.map_y).map((report) => {
                const cfg = SEVERITY_CONFIG[report.severity];
                const isUrgent = report.severity === "rojo" && report.status === "pendiente";
                return (
                  <div
                    key={report.id}
                    className="absolute pointer-events-none z-10"
                    style={{
                      left: `${report.map_x}%`,
                      top: `${report.map_y}%`,
                      transform: "translate(-50%, -100%)"
                    }}
                  >
                    {isUrgent ? (
                      <motion.div
                        animate={{ scale: [1, 1.35, 1], opacity: [1, 0.6, 1] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                        className={`w-4 h-4 rounded-full ${cfg.color} border-2 border-white shadow-lg`}
                      />
                    ) : (
                      <div className={`w-4 h-4 rounded-full ${cfg.color} border-2 border-white shadow-lg`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex gap-3 justify-center">
              {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${cfg.color}`} />
                  <span className="text-zinc-400 text-xs capitalize">{key}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List View */}
        {!mapView && (
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 space-y-3"
            style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
            onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
            onTouchMove={(e) => {
              if (listRef.current?.scrollTop === 0) {
                const dist = e.touches[0].clientY - touchStartY.current;
                if (dist > 0) setPullY(Math.min(dist * 0.4, 60));
              }
            }}
            onTouchEnd={async () => {
              if (pullY > 40) {
                setRefreshing(true);
                await loadReports();
                setRefreshing(false);
              }
              setPullY(0);
            }}
          >
            {(pullY > 0 || refreshing) && (
              <div className="flex justify-center items-center overflow-hidden transition-all" style={{ height: `${Math.max(pullY, refreshing ? 40 : 0)}px` }}>
                <RefreshCw className={`w-5 h-5 text-zinc-400 ${refreshing ? 'animate-spin' : ''}`} />
              </div>
            )}
            {filteredReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-500 text-sm text-center">No hay reportes aún.<br/>¡Sé el primero en reportar!</p>
              </div>
            ) : (
              filteredReports.map((report, i) => {
                const cfg = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.verde;
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3, ease: "easeOut" }}
                  >
                  <Link to={`/report/${report.id}`}>
                    <div className={`bg-gradient-to-b from-zinc-800/80 to-zinc-900 border rounded-2xl overflow-hidden transition-all ${cfg.glow} ${report.status === "resuelto" ? "border-emerald-800/50" : cfg.border}`}>
                      {/* Photo */}
                      {report.photo_url && (
                        <div className="relative">
                          <img src={report.photo_url} alt={report.title} className="w-full h-36 object-cover" />
                          {report.status === "resuelto" && (
                            <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Resuelto
                            </div>
                          )}
                          {report.status === "pendiente" && (
                            <div className="absolute top-2 right-2 bg-zinc-900/80 text-yellow-400 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 border border-yellow-800/50">
                              <Clock className="w-3 h-3" /> Pendiente
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-3">
                        {/* Severity + title */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 ${cfg.textColor}`}>
                            <Icon className="w-3 h-3" />
                            <span className="text-xs font-semibold">{cfg.label}</span>
                          </div>
                          {!report.photo_url && report.status === "resuelto" && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 text-xs font-semibold border border-emerald-800/50">
                              <CheckCircle2 className="w-3 h-3" /> Resuelto
                            </div>
                          )}
                        </div>

                        <h3 className="text-white font-semibold text-sm">{report.title}</h3>
                        <p className="text-zinc-400 text-xs mt-0.5 line-clamp-2">{report.description}</p>

                        <div className="flex items-center gap-1.5 mt-2">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          <span className="text-zinc-500 text-xs">{report.location_label || "Ubicación no especificada"}</span>
                        </div>

                        <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-500 text-xs">👤 {report.reporter_name}</span>
                            {report.upvotes?.length > 0 && (
                              <span className="flex items-center gap-0.5 text-blue-400 text-xs font-medium">
                                👍 {report.upvotes.length}
                              </span>
                            )}
                          </div>
                          <span className="text-zinc-600 text-xs">
                            {new Date(report.created_date).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                          </span>
                        </div>

                        {/* Admin controls */}
                        {isAdmin && (
                          <div className="mt-2 pt-2 border-t border-zinc-800 flex gap-2">
                            {report.status === "pendiente" && (
                              <button
                                onClick={(e) => { e.preventDefault(); setResolveTarget(report); }}
                                className="flex-1 bg-emerald-900/40 border border-emerald-700/50 text-emerald-400 text-xs py-1.5 rounded-xl hover:bg-emerald-900/60 transition-colors font-medium"
                              >
                                ✓ Marcar Resuelto
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.preventDefault(); deleteReport(report.id); }}
                              className="flex-1 bg-red-900/20 border border-red-800/40 text-red-400 text-xs py-1.5 rounded-xl hover:bg-red-900/40 transition-colors font-medium"
                            >
                              🗑 Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* FAB - New Report */}
        <div className="fixed z-30" style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))', right: '1.5rem' }}>
          <Link to="/new-report">
            <button className="w-14 h-14 bg-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-zinc-100 active:scale-95 transition-all">
              <Plus className="w-6 h-6 text-zinc-900" />
            </button>
          </Link>
        </div>
      </div>

      {showTerms && (
        <TermsAcceptance
          onAccepted={() => setShowTerms(false)}
          onDeclined={() => { base44.auth.logout("/"); }}
        />
      )}

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={user} />

      {resolveTarget && (
        <ResolveModal
          report={resolveTarget}
          onClose={() => setResolveTarget(null)}
          onResolved={handleResolved}
        />
      )}

      <BottomNavbar />
    </div>
  );
}