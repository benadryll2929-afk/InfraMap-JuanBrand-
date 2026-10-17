import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";

export default function BeforeAfterSection({ report }) {
  if (report.status !== "resuelto" || !report.resolved_photo_url) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-3"
    >
      <h3 className="text-white font-bold text-sm">Resultado de la Reparación</h3>

      <div className="grid grid-cols-2 gap-2">
        {/* Antes */}
        <div className="space-y-1.5">
          <div className="flex justify-center">
            <span className="px-2.5 py-0.5 bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-full">Antes</span>
          </div>
          <div className="rounded-2xl overflow-hidden bg-zinc-800/80 h-36 flex items-center justify-center">
            {report.photo_url ? (
              <img src={report.photo_url} alt="Antes" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-600">
                <ImageOff className="w-7 h-7" />
                <span className="text-xs">Sin foto original</span>
              </div>
            )}
          </div>
        </div>

        {/* Después */}
        <div className="space-y-1.5">
          <div className="flex justify-center">
            <span className="px-2.5 py-0.5 bg-emerald-900/60 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-700/50">Después</span>
          </div>
          <div className="rounded-2xl overflow-hidden bg-zinc-800/80 h-36">
            <img src={report.resolved_photo_url} alt="Después" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Notas del admin */}
      {report.resolved_notes && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="bg-emerald-900/20 border border-emerald-700/40 rounded-2xl p-4"
        >
          <p className="text-emerald-400 text-xs font-semibold mb-1">📝 Nota del administrador</p>
          <p className="text-zinc-300 text-sm leading-relaxed">{report.resolved_notes}</p>
        </motion.div>
      )}
    </motion.div>
  );
}