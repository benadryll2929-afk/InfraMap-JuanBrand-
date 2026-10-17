import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, AlertOctagon, AlertTriangle, Leaf, CheckCircle2, Clock, Trash2, ThumbsUp } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SchoolMap from "../components/SchoolMap";
import ResolveModal from "../components/ResolveModal";
import BeforeAfterSection from "../components/BeforeAfterSection";
import CommentsSection from "../components/CommentsSection";
import AppHeader from "../components/AppHeader";
import HamburgerMenu from "../components/HamburgerMenu";

const SEVERITY_CONFIG = {
  verde: { label: "Sin problema", color: "bg-green-500/20 text-green-400 border-green-800/50", icon: Leaf },
  naranja: { label: "Prioridad Media", color: "bg-orange-500/20 text-orange-400 border-orange-800/50", icon: AlertTriangle },
  rojo: { label: "Urgente", color: "bg-red-500/20 text-red-400 border-red-800/50", icon: AlertOctagon },
};

export default function ReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [user, setUser] = useState(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const hasUpvoted = user && report?.upvotes?.includes(user.email);
  const upvoteCount = report?.upvotes?.length || 0;

  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (!isAuth) { base44.auth.redirectToLogin('/'); return; }
      base44.auth.me().then(setUser);
      base44.entities.Report.get(reportId).then(setReport);
    });
  }, [reportId]);

  const handleUpvote = async () => {
    if (!user || !report) return;
    const current = report.upvotes || [];
    const updated = hasUpvoted
      ? current.filter((e) => e !== user.email)
      : [...current, user.email];
    const updatedReport = await base44.entities.Report.update(report.id, { upvotes: updated });
    setReport(updatedReport);
  };

  const handleResolved = (updated) => {
    setReport(updated);
  };

  const deleteReport = async () => {
    await base44.entities.Report.delete(reportId);
    navigate("/");
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const cfg = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.verde;
  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-full max-w-sm bg-zinc-950 min-h-screen flex flex-col">

        <AppHeader onMenuClick={() => setMenuOpen(true)} isAdmin={isAdmin} subtitle="Detalle del Reporte" />

        <div className="flex-1 overflow-y-auto pb-32">
          {/* Status badge */}
          <div className="px-4 pt-4">
            {report.status === "resuelto" ? (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-900/40 border border-emerald-700/50 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold">Resuelto</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/20 border border-yellow-800/30 rounded-full">
                <Clock className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-semibold">Pendiente</span>
              </div>
            )}
          </div>

          {/* Photo */}
          {report.photo_url && (
            <img src={report.photo_url} alt={report.title} className="w-full h-52 object-cover" />
          )}

          <div className="px-4 py-5 space-y-5">
            {/* Title + severity */}
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold mb-3 ${cfg.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {cfg.label}
              </div>
              <h2 className="text-white font-bold text-xl">{report.title}</h2>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{report.description}</p>
            </div>

            {/* Reporter */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <p className="text-zinc-500 text-xs mb-1">Reportado por</p>
              <p className="text-white font-semibold text-sm">👤 {report.reporter_name}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{report.reporter_email}</p>
              <p className="text-zinc-600 text-xs mt-2">
                {new Date(report.created_date).toLocaleDateString("es-CO", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric"
                })}
              </p>
            </div>

            {/* Location */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-300 text-sm font-medium">{report.location_label || "Ubicación en el mapa"}</span>
              </div>
              {report.map_x && report.map_y ? (
                <SchoolMap
                  readOnly
                  selectedX={report.map_x}
                  selectedY={report.map_y}
                  selectedLabel={report.location_label}
                />
              ) : (
                <p className="text-zinc-500 text-xs">No se especificó ubicación en el mapa</p>
              )}
            </div>

            {/* Antes y Después */}
            <BeforeAfterSection report={report} />

            {/* Botón de apoyo */}
            <button
              onClick={handleUpvote}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border font-semibold text-sm transition-all active:scale-95 ${
                hasUpvoted
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                  : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? "fill-blue-400" : ""}`} />
              {hasUpvoted ? "Ya apoyaste este reporte" : "Me pasa a mí también"}
              {upvoteCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${hasUpvoted ? "bg-blue-500/30 text-blue-300" : "bg-zinc-800 text-zinc-400"}`}>
                  {upvoteCount}
                </span>
              )}
            </button>

            {/* Comentarios */}
            <CommentsSection reportId={reportId} user={user} />
          </div>
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pb-8 pt-4 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent space-y-2">
            {report.status === "pendiente" && (
              <button
                onClick={() => setResolveOpen(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95"
              >
                ✓ Marcar como Resuelto
              </button>
            )}
            <button
              onClick={deleteReport}
              className="w-full bg-zinc-900 border border-red-800/50 text-red-400 font-semibold py-3 rounded-2xl hover:bg-red-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Eliminar Reporte
            </button>
          </div>
        )}

        {resolveOpen && (
          <ResolveModal
            report={report}
            onClose={() => setResolveOpen(false)}
            onResolved={handleResolved}
          />
        )}

        <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={user} />
      </div>
    </div>
  );
}