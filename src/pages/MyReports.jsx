import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, AlertOctagon, AlertTriangle, Leaf, CheckCircle2, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import BottomNavbar from "../components/BottomNavbar";
import AppHeader from "../components/AppHeader";
import HamburgerMenu from "../components/HamburgerMenu";

const SEVERITY_CONFIG = {
  verde: { label: "Sin problema", color: "bg-green-500", textColor: "text-green-400", icon: Leaf },
  naranja: { label: "Medio", color: "bg-orange-500", textColor: "text-orange-400", icon: AlertTriangle },
  rojo: { label: "Urgente", color: "bg-red-500", textColor: "text-red-400", icon: AlertOctagon },
};

export default function MyReports() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (isAuth) => {
      if (!isAuth) { base44.auth.redirectToLogin("/"); return; }
      const u = await base44.auth.me();
      setUser(u);
      const data = await base44.entities.Report.filter({ reporter_email: u.email }, "-created_date", 50);
      setReports(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-full max-w-sm bg-zinc-950 min-h-screen flex flex-col">

        <AppHeader onMenuClick={() => setMenuOpen(true)} isAdmin={isAdmin} subtitle={`Mis Reportes${reports.length > 0 ? ` (${reports.length})` : ""}`} />

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
          {loading ? (
            <div className="flex justify-center pt-16">
              <div className="w-8 h-8 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm text-center">Aún no has enviado reportes.</p>
            </div>
          ) : (
            reports.map((report) => {
              const cfg = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.verde;
              const Icon = cfg.icon;
              return (
                <Link key={report.id} to={`/report/${report.id}`}>
                  <div className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all hover:border-zinc-600 mb-3 ${report.status === "resuelto" ? "border-emerald-800/50" : "border-zinc-800"}`}>
                    {report.photo_url && (
                      <img src={report.photo_url} alt={report.title} className="w-full h-32 object-cover" />
                    )}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 ${cfg.textColor}`}>
                          <Icon className="w-3 h-3" />
                          <span className="text-xs font-semibold">{cfg.label}</span>
                        </div>
                        {report.status === "resuelto" ? (
                          <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Resuelto
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5" /> Pendiente
                          </div>
                        )}
                      </div>
                      <h3 className="text-white font-semibold text-sm">{report.title}</h3>
                      {report.category && (
                        <span className="text-zinc-500 text-xs">🏷️ {report.category}</span>
                      )}
                      <div className="flex items-center gap-1.5 mt-2">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        <span className="text-zinc-500 text-xs">{report.location_label || "Sin ubicación"}</span>
                      </div>
                      <p className="text-zinc-600 text-xs mt-1">
                        {new Date(report.created_date).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={user} />

        <BottomNavbar />
      </div>
    </div>
  );
}