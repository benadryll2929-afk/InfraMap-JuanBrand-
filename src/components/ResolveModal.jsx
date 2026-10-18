import { useState } from "react";
import { X, Camera, CheckCircle2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ResolveModal({ report, onClose, onResolved }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleConfirm = async () => {
    setLoading(true);

    try {
      let resolved_photo_url = "";
      if (photoFile) {
        const res = await base44.integrations.Core.UploadFile({ file: photoFile });
        resolved_photo_url = res.file_url;
      }

      const updated = await base44.entities.Report.update(report.id, {
        status: "resuelto",
        resolved_photo_url,
        resolved_notes: notes,
      });
      try {
        await base44.entities.Notification.create({
          message: `✅ Tu reporte "${report.title}" en ${report.location_label || "el colegio"} ha sido marcado como resuelto.`,
          report_id: report.id,
          reporter_name: report.reporter_name,
          report_title: report.title,
          location_label: report.location_label || "",
          recipient_email: report.reporter_email,
          is_read: false,
        });
      } catch (error) {
        console.error("El reporte se resolvió, pero no se pudo crear la notificación:", error);
      }

      onResolved(updated);
      onClose();
    } catch (error) {
      console.error("No se pudo resolver el reporte:", error);
      window.alert(error.message || "No se pudo resolver el reporte. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-zinc-900/95 backdrop-blur-lg border border-white/10 rounded-t-3xl px-5 pt-5 pb-8 space-y-5">
        {/* Handle */}
        <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-2" />

        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-base">Marcar como Resuelto</h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Foto reparación */}
        <div>
          <p className="text-zinc-400 text-xs font-medium mb-2">Foto de la reparación (recomendada)</p>
          {photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden">
              <img src={photoPreview} alt="Reparación" className="w-full h-40 object-cover" />
              <button
                onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-zinc-700 rounded-2xl cursor-pointer hover:border-zinc-500 transition-colors bg-zinc-950">
                <Camera className="w-6 h-6 text-zinc-400" />
                <span className="text-zinc-400 text-xs">Tomar foto</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
              </label>
              <label className="flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-zinc-700 rounded-2xl cursor-pointer hover:border-zinc-500 transition-colors bg-zinc-950">
                <span className="text-2xl">🖼️</span>
                <span className="text-zinc-400 text-xs">Galería</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
          )}
        </div>

        {/* Notas */}
        <div>
          <p className="text-zinc-400 text-xs font-medium mb-2">Nota del administrador (opcional)</p>
          <textarea
            placeholder="Ej: Ventana reemplazada por el técnico el 7 de junio..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-700 text-white text-sm rounded-2xl px-4 py-3 outline-none focus:border-zinc-500 placeholder:text-zinc-600 resize-none"
          />
        </div>

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
          ) : (
            <><CheckCircle2 className="w-4 h-4" /> Confirmar Resolución</>
          )}
        </button>
      </div>
    </div>
  );
}