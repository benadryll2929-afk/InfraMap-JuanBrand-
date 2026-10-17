import { useState, useEffect } from "react";
import { ArrowLeft, Camera, Map, X, WifiOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SchoolMap from "../components/SchoolMap";
import MapModal from "../components/MapModal";
import { saveReportOffline } from "@/hooks/useOfflineReports";
import AppHeader from "../components/AppHeader";
import HamburgerMenu from "../components/HamburgerMenu";

const SEVERITY_OPTIONS = [
  { value: "verde", label: "Sin Problema", emoji: "🟢", desc: "No presenta problema" },
  { value: "naranja", label: "Medio", emoji: "🟠", desc: "Requiere atención" },
  { value: "rojo", label: "Urgente", emoji: "🔴", desc: "Atención inmediata" },
];

export default function NewReport() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", severity: "naranja", category: "Otro" });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [location, setLocation] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (!isAuth) { base44.auth.redirectToLogin('/'); return; }
      base44.auth.me().then(setUser);
    });
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description) return alert("Completa el título y descripción");
    if (!location) return alert("Marca la ubicación en el mapa");
    setLoading(true);

    const reportData = {
      title: form.title,
      description: form.description,
      severity: form.severity,
      category: form.category,
      status: "pendiente",
      map_x: location.x,
      map_y: location.y,
      location_label: location.label,
      reporter_name: user?.full_name || "Usuario",
      reporter_email: user?.email || "",
      photo_url: "",
    };

    try {
      if (!isOnline) {
        saveReportOffline(reportData);
        alert("Sin conexión. Tu reporte se guardó y se enviará automáticamente cuando tengas internet. 📶");
        navigate("/");
        return;
      }

      if (photoFile) {
        const res = await base44.integrations.Core.UploadFile({ file: photoFile });
        reportData.photo_url = res.file_url;
      }

      const report = await base44.entities.Report.create(reportData);
      try {
        await base44.entities.Notification.create({
          message: `${user?.full_name || "Un usuario"} reportó "${form.title}" en ${location.label}`,
          report_id: report.id,
          reporter_name: user?.full_name || "Usuario",
          report_title: form.title,
          location_label: location.label,
          is_read: false,
        });
      } catch (error) {
        console.error("El reporte se guardó, pero falló su notificación:", error);
      }
      navigate("/");
    } catch (error) {
      console.error("No se pudo guardar el reporte:", error);
      alert(error.message || "No se pudo guardar el reporte. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-full max-w-sm bg-zinc-950 min-h-screen flex flex-col">

        <AppHeader onMenuClick={() => setMenuOpen(true)} isAdmin={isAdmin} subtitle="Nuevo Reporte" />

        <div className="flex-1 overflow-y-auto px-4 py-5 pb-32 space-y-5">

          {/* Title */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-2 block">Título del daño *</label>
            <input
              type="text"
              placeholder="Ej: Ventana rota en Salón 5"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-2xl px-4 py-3 outline-none focus:border-zinc-500 placeholder:text-zinc-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-2 block">Descripción *</label>
            <textarea
              placeholder="Describe el daño con detalle..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-2xl px-4 py-3 outline-none focus:border-zinc-500 placeholder:text-zinc-600 resize-none"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-2 block">Nivel de gravedad *</label>
            <div className="grid grid-cols-3 gap-2">
              {SEVERITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, severity: opt.value })}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border transition-all ${
                    form.severity === opt.value
                      ? "border-white bg-zinc-800"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-white text-xs font-semibold">{opt.label}</span>
                  <span className="text-zinc-500 text-xs text-center">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-2 block">Categoría *</label>
            <div className="flex flex-wrap gap-2">
              {["Eléctrico", "Sanitario", "Mobiliario", "Infraestructura", "Otro"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    form.category === cat
                      ? "border-white bg-zinc-700 text-white"
                      : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-2 block">Foto del daño</label>
            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={photoPreview} alt="Preview" className="w-full h-44 object-cover" />
                <button
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Tomar foto con cámara */}
                <label className="flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-zinc-700 rounded-2xl cursor-pointer hover:border-zinc-500 transition-colors bg-zinc-900">
                  <Camera className="w-7 h-7 text-zinc-400" />
                  <span className="text-zinc-400 text-xs font-medium text-center">Tomar foto</span>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                </label>
                {/* Elegir de galería */}
                <label className="flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-zinc-700 rounded-2xl cursor-pointer hover:border-zinc-500 transition-colors bg-zinc-900">
                  <span className="text-2xl">🖼️</span>
                  <span className="text-zinc-400 text-xs font-medium text-center">Galería</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>
            )}
          </div>

          {/* Map */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-2 block">Ubicación exacta en el mapa *</label>
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed transition-all font-semibold text-sm ${
                location
                  ? "border-white/30 bg-zinc-800 text-white"
                  : "border-zinc-600 bg-zinc-900 text-zinc-400 hover:border-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Map className="w-5 h-5" />
              {location ? `📍 ${location.label}` : "Abrir Mapa para Reportar"}
            </button>
            {location && (
              <p className="text-zinc-500 text-xs mt-1.5 text-center">Toca el botón para cambiar la ubicación</p>
            )}
          </div>
        </div>

        <MapModal
          isOpen={mapOpen}
          onClose={() => setMapOpen(false)}
          onLocationSelect={(loc) => { setLocation(loc); setMapOpen(false); }}
          selectedX={location?.x}
          selectedY={location?.y}
          selectedLabel={location?.label}
        />

        {/* Submit */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pb-8 pt-4 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent">
          {!isOnline && (
            <div className="flex items-center gap-2 bg-yellow-900/30 border border-yellow-700/40 rounded-xl px-3 py-2 mb-2">
              <WifiOff className="w-4 h-4 text-yellow-400 shrink-0" />
              <p className="text-yellow-400 text-xs">Sin conexión. El reporte se guardará y enviará al recuperar internet.</p>
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-white text-zinc-900 font-bold py-4 rounded-2xl hover:bg-zinc-100 active:scale-95 transition-all disabled:opacity-50 shadow-xl"
          >
            {loading ? "Enviando..." : isOnline ? "📤 Enviar Reporte" : "💾 Guardar Offline"}
          </button>
        </div>

        <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} user={user} />
      </div>
    </div>
  );
}