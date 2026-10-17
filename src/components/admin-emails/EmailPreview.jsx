import { useState } from "react";
import { Send, Loader2, Eye, Edit3 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function EmailPreview({ flow, template, onTemplateChange, onSent }) {
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sendError, setSendError] = useState("");

  const handleSendTest = async () => {
    if (!testEmail) return;
    setSending(true);
    setSendError("");
    try {
      await base44.integrations.Core.SendEmail({
        to: testEmail,
        subject: template.subject,
        body: template.body,
        flow_type: flow,
      });
      onSent?.();
    } catch (error) {
      setSendError(error.message || "No se pudo enviar el correo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="font-outfit text-lg font-semibold text-slate-900">Plantilla de correo</h3>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-xs font-medium font-inter"
          >
            {showPreview ? <><Edit3 className="w-3.5 h-3.5" /> Editar</> : <><Eye className="w-3.5 h-3.5" /> Vista previa</>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div>
          <label className="text-slate-500 text-xs font-semibold uppercase tracking-wide font-inter">Asunto</label>
          <input
            type="text"
            value={template.subject}
            onChange={(e) => onTemplateChange({ ...template, subject: e.target.value })}
            disabled={showPreview}
            className="w-full mt-1.5 px-3 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 disabled:opacity-60 font-inter"
          />
        </div>

        <div>
          <label className="text-slate-500 text-xs font-semibold uppercase tracking-wide font-inter">Cuerpo del correo</label>
          {showPreview ? (
            <div className="mt-1.5 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 font-inter leading-relaxed">{template.body}</pre>
            </div>
          ) : (
            <textarea
              value={template.body}
              onChange={(e) => onTemplateChange({ ...template, body: e.target.value })}
              rows={12}
              className="w-full mt-1.5 px-3 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 resize-none font-inter leading-relaxed"
            />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded font-mono">{"{nombre}"}</span>
          <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded font-mono">{"{codigo}"}</span>
          <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded font-mono">{"{enlace}"}</span>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-200 bg-slate-50">
        <label className="text-slate-500 text-xs font-semibold uppercase tracking-wide font-inter">Enviar correo de prueba</label>
        <div className="flex gap-2 mt-1.5">
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 px-3 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-400 font-inter"
          />
          <button
            onClick={handleSendTest}
            disabled={sending || !testEmail}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Enviar
          </button>
        </div>
        {sendError && <p role="alert" className="mt-2 text-sm text-red-600">{sendError}</p>}
      </div>
    </div>
  );
}