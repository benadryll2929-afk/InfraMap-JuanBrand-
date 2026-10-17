import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { base44 } from "@/api/base44Client";

export default function ExportExcel() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      // Cargar todos los reportes y comentarios
      const [reports, comments] = await Promise.all([
        base44.entities.Report.list("-created_date", 500),
        base44.entities.Comment.list("-created_date", 500),
      ]);

      const wb = XLSX.utils.book_new();

      // --- Hoja 1: Reportes ---
      const reportRows = reports.map((r) => ({
        "ID": r.id,
        "Título": r.title || "",
        "Descripción": r.description || "",
        "Gravedad": r.severity === "rojo" ? "Urgente" : r.severity === "naranja" ? "Medio" : "Sin problema",
        "Categoría": r.category || "",
        "Estado": r.status === "resuelto" ? "Resuelto" : "Pendiente",
        "Ubicación": r.location_label || "",
        "Mapa X": r.map_x ?? "",
        "Mapa Y": r.map_y ?? "",
        "Reportante": r.reporter_name || "",
        "Correo": r.reporter_email || "",
        "Apoyos": r.upvotes?.length || 0,
        "Foto (URL)": r.photo_url || "",
        "Foto Reparación (URL)": r.resolved_photo_url || "",
        "Notas de Resolución": r.resolved_notes || "",
        "Fecha de Creación": r.created_date ? new Date(r.created_date).toLocaleString("es-CO") : "",
        "Última Actualización": r.updated_date ? new Date(r.updated_date).toLocaleString("es-CO") : "",
      }));
      const wsReports = XLSX.utils.json_to_sheet(reportRows);
      wsReports["!cols"] = [
        { wch: 20 }, { wch: 30 }, { wch: 40 }, { wch: 12 }, { wch: 16 },
        { wch: 12 }, { wch: 24 }, { wch: 8 }, { wch: 8 }, { wch: 20 },
        { wch: 28 }, { wch: 8 }, { wch: 30 }, { wch: 30 }, { wch: 40 },
        { wch: 22 }, { wch: 22 },
      ];
      XLSX.utils.book_append_sheet(wb, wsReports, "Reportes");

      // --- Hoja 2: Comentarios ---
      const commentRows = comments.map((c) => ({
        "ID": c.id,
        "ID Reporte": c.report_id || "",
        "Usuario": c.user_name || "",
        "Correo": c.user_email || "",
        "Comentario": c.content || "",
        "Fecha": c.created_date ? new Date(c.created_date).toLocaleString("es-CO") : "",
      }));
      const wsComments = XLSX.utils.json_to_sheet(commentRows);
      wsComments["!cols"] = [
        { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 28 }, { wch: 50 }, { wch: 22 },
      ];
      XLSX.utils.book_append_sheet(wb, wsComments, "Comentarios");

      // --- Hoja 3: Resumen ---
      const total = reports.length;
      const pendientes = reports.filter((r) => r.status === "pendiente").length;
      const resueltos = reports.filter((r) => r.status === "resuelto").length;
      const urgentes = reports.filter((r) => r.severity === "rojo").length;
      const medios = reports.filter((r) => r.severity === "naranja").length;
      const leves = reports.filter((r) => r.severity === "verde").length;
      const tasaResolucion = total > 0 ? Math.round((resueltos / total) * 100) : 0;

      const summaryRows = [
        { "Métrica": "Total de Reportes", "Valor": total },
        { "Métrica": "Reportes Pendientes", "Valor": pendientes },
        { "Métrica": "Reportes Resueltos", "Valor": resueltos },
        { "Métrica": "Tasa de Resolución (%)", "Valor": tasaResolucion },
        { "Métrica": "Urgentes (Rojo)", "Valor": urgentes },
        { "Métrica": "Medios (Naranja)", "Valor": medios },
        { "Métrica": "Leves (Verde)", "Valor": leves },
        { "Métrica": "Total de Comentarios", "Valor": comments.length },
        { "Métrica": "Fecha de Exportación", "Valor": new Date().toLocaleString("es-CO") },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      wsSummary["!cols"] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

      // Descargar
      const fileName = `InfraMap_BaseDatos_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Error exportando:", err);
      alert("Error al exportar la base de datos. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm py-3 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Generando Excel...</>
      ) : (
        <><Download className="w-4 h-4" /> Descargar base de datos (Excel)</>
      )}
    </button>
  );
}