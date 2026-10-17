import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

const SEVERITY_COLORS = {
  rojo: "#ef4444",
  naranja: "#f97316",
  verde: "#22c55e",
};

const STATUS_COLORS = {
  pendiente: "#eab308",
  resuelto: "#10b981",
};

export default function AdminCharts({ reports }) {
  // Datos para gráfico de gravedad
  const severityData = ["rojo", "naranja", "verde"].map((sev) => ({
    name: sev === "rojo" ? "Urgente" : sev === "naranja" ? "Medio" : "Sin problema",
    value: reports.filter((r) => r.severity === sev).length,
    color: SEVERITY_COLORS[sev],
  })).filter((d) => d.value > 0);

  // Datos para gráfico de estado
  const statusData = [
    { name: "Pendientes", value: reports.filter((r) => r.status === "pendiente").length, color: STATUS_COLORS.pendiente },
    { name: "Resueltos", value: reports.filter((r) => r.status === "resuelto").length, color: STATUS_COLORS.resuelto },
  ].filter((d) => d.value > 0);

  // Datos para gráfico de categorías
  const categoryData = ["Eléctrico", "Sanitario", "Mobiliario", "Infraestructura", "Otro"].map((cat) => ({
    name: cat,
    reportes: reports.filter((r) => r.category === cat).length,
  })).filter((d) => d.reportes > 0);

  // Tasa de resolución
  const total = reports.length;
  const resueltos = reports.filter((r) => r.status === "resuelto").length;
  const tasaResolucion = total > 0 ? Math.round((resueltos / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <div className="space-y-4">
      {/* Tasa de resolución */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-2">Tasa de resolución</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${tasaResolucion}%` }}
            />
          </div>
          <span className="text-white font-bold text-lg w-12 text-right">{tasaResolucion}%</span>
        </div>
      </div>

      {/* Gráfico de gravedad (Pie) */}
      {severityData.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-3">Distribución por gravedad</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px", fontSize: "12px" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend
                formatter={(value) => <span className="text-zinc-400 text-xs">{value}</span>}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico de categorías (Barras) */}
      {categoryData.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-3">Reportes por categoría</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={categoryData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px", fontSize: "12px" }}
                labelStyle={{ color: "#fff" }}
                cursor={{ fill: "#27272a" }}
              />
              <Bar dataKey="reportes" fill="#fbbf24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}