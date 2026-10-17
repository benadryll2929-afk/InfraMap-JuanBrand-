import { Mail, KeyRound } from "lucide-react";

const FLOW_LABELS = {
  registro_otp: { label: "Registro OTP", icon: Mail },
  restablecer_contrasena: { label: "Restablecer", icon: KeyRound },
};

export default function ActivityLog({ logs, loading }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-200">
        <h3 className="font-outfit text-lg font-semibold text-slate-900">Registro de actividad</h3>
        <p className="text-slate-500 text-xs mt-0.5 font-inter">Correos en español enviados</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-slate-400 text-sm font-inter">Sin correos enviados todavía</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-2.5 font-inter">Destinatario</th>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-2.5 font-inter">Flujo</th>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-2.5 font-inter">Estado</th>
                <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-4 py-2.5 font-inter">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => {
                const flowInfo = FLOW_LABELS[log.flow_type] || FLOW_LABELS.registro_otp;
                const FlowIcon = flowInfo.icon;
                return (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700 font-inter truncate max-w-[120px]">{log.recipient_email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <FlowIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm text-slate-600 font-inter">{flowInfo.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${log.status === "enviado" ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span className={`text-xs font-medium font-inter ${log.status === "enviado" ? "text-emerald-600" : "text-red-500"}`}>
                          {log.status === "enviado" ? "Enviado" : "Error"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-inter whitespace-nowrap">
                      {log.created_date ? new Date(log.created_date).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}