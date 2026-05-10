"use client";

import Link from "next/link";
import {
  BarChart2,
  Map,
  ArrowLeft,
  TrendingUp,
  Zap,
  Factory,
  Leaf,
} from "lucide-react";

/* ─── KPI mock data ─────────────────────────────────────────── */
const KPIS = [
  {
    icon: <Factory size={18} />,
    label: "Indústrias Cadastradas",
    value: "326",
    delta: "+12 este mês",
    color: "var(--pid-coral)",
  },
  {
    icon: <Zap size={18} />,
    label: "Consumo Total",
    value: "30,4M",
    unit: "MWh",
    delta: "Alumínio lidera",
    color: "#F9C784",
  },
  {
    icon: <Leaf size={18} />,
    label: "Projetos Aço Verde",
    value: "10",
    delta: "Sudeste / Sul",
    color: "var(--pid-green)",
  },
  {
    icon: <TrendingUp size={18} />,
    label: "Potencial de Redução",
    value: "~40%",
    unit: "CO₂",
    delta: "até 2035",
    color: "var(--pid-muted)",
  },
];

const SECTORS = [
  { label: "Alumínio", pct: 100, value: "~11M MWh" },
  { label: "Aço", pct: 64, value: "~7M MWh" },
  { label: "Química", pct: 45, value: "~5M MWh" },
  { label: "Alimentícia", pct: 27, value: "~3M MWh" },
  { label: "Cimenteira", pct: 25, value: "~2,7M MWh" },
  { label: "Fertilizantes", pct: 12, value: "~1,3M MWh" },
];

export default function DashboardPage() {
  return (
    <div
      className="min-h-screen w-full overflow-auto"
      style={{ background: "var(--pid-navy)", color: "#E2EDF8" }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-8 h-14"
        style={{
          background: "rgba(13,27,42,0.96)",
          borderBottom: "1px solid var(--pid-border)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: "var(--pid-muted)" }}
          >
            <ArrowLeft size={13} />
            Voltar
          </Link>
          <span style={{ color: "var(--pid-border)" }}>|</span>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ background: "var(--pid-coral)" }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span
              className="font-bold text-sm text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              PID
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                background: "rgba(232,88,26,0.2)",
                color: "var(--pid-coral-lt)",
                fontSize: "10px",
              }}
            >
              VISÃO EXECUTIVA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/copilot"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              background: "rgba(232,88,26,0.12)",
              border: "1px solid rgba(232,88,26,0.3)",
              color: "var(--pid-coral-lt)",
            }}
          >
            <Map size={12} />
            Abrir Copilot
          </Link>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="px-8 py-8 max-w-6xl mx-auto space-y-8">
        {/* Title */}
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Panorama Executivo
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--pid-muted)" }}>
            Dados consolidados da Plataforma Interativa de Descarbonização · Mai 2026
          </p>
        </div>

        {/* ── KPI Row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPIS.map((kpi, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "var(--pid-surface2)",
                border: "1px solid var(--pid-border)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{
                  background: `color-mix(in srgb, ${kpi.color} 15%, transparent)`,
                  color: kpi.color,
                }}
              >
                {kpi.icon}
              </div>
              <p className="text-xs mb-1" style={{ color: "var(--pid-muted)" }}>
                {kpi.label}
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  color: kpi.color,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {kpi.value}
                {kpi.unit && (
                  <span className="text-sm font-normal ml-1" style={{ color: "var(--pid-muted)" }}>
                    {kpi.unit}
                  </span>
                )}
              </p>
              <p className="text-xs mt-1.5" style={{ color: "var(--pid-slate-lt)" }}>
                {kpi.delta}
              </p>
            </div>
          ))}
        </div>

        {/* ── Charts row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Bar chart – consumo por setor */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "var(--pid-surface2)",
              border: "1px solid var(--pid-border)",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 size={16} style={{ color: "var(--pid-coral)" }} />
              <h2
                className="text-sm font-semibold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Consumo (MWh) por Setor Industrial
              </h2>
            </div>
            <div className="space-y-3">
              {SECTORS.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1" style={{ color: "var(--pid-muted)" }}>
                    <span>{s.label}</span>
                    <span style={{ color: "white" }}>{s.value}</span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--pid-navy-md)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${s.pct}%`,
                        background:
                          s.pct > 80
                            ? "linear-gradient(90deg, var(--pid-coral-dk), var(--pid-coral))"
                            : s.pct > 50
                            ? "linear-gradient(90deg, var(--pid-slate), var(--pid-slate-lt))"
                            : "var(--pid-slate)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunity panel */}
          <div
            className="rounded-2xl p-6 flex flex-col justify-between"
            style={{
              background: "var(--pid-surface2)",
              border: "1px solid var(--pid-border)",
            }}
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf size={16} style={{ color: "var(--pid-green)" }} />
                <h2
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Oportunidades Identificadas
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  { tag: "Alto Impacto", text: "10 usinas de Aço no Sudeste com potencial de migração para H₂ Verde.", color: "var(--pid-green)" },
                  { tag: "Médio Prazo", text: "Hubs portuários do ES e RJ como corredores de exportação de biometano.", color: "#F9C784" },
                  { tag: "Prioridade", text: "Alumínio representa 36% do consumo total — maior alavanca de descarbonização.", color: "var(--pid-coral)" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3 rounded-xl"
                    style={{ background: "var(--pid-navy-lt)", border: "1px solid var(--pid-border)" }}
                  >
                    <span
                      className="flex-none text-xs font-semibold px-2 py-0.5 rounded-full h-fit mt-0.5"
                      style={{
                        background: `color-mix(in srgb, ${item.color} 15%, transparent)`,
                        color: item.color,
                        border: `1px solid color-mix(in srgb, ${item.color} 30%, transparent)`,
                      }}
                    >
                      {item.tag}
                    </span>
                    <p className="text-xs leading-relaxed" style={{ color: "#C8DDF0" }}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/copilot"
              className="mt-5 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, var(--pid-coral), var(--pid-coral-dk))",
                color: "white",
              }}
            >
              <Map size={15} />
              Explorar no Mapa com o Copilot
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
