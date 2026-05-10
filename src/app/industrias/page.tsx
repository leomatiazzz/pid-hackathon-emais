"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import {
  ArrowLeft, ChevronDown, Flame, Recycle, BarChart2, AlertTriangle, ChevronRight,
  Zap, MapPin, Lightbulb, SlidersHorizontal, MessageSquare,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────── */
type Setor = "Cimenteira" | "Aço" | "Alumínio" | "Química" | "Fertilizantes" | "Alimentícia";
type Regiao = "Nacional" | "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";
type CbamLevel = "Baixa" | "Média" | "Alta";

interface SetorData {
  co2Reduction: number;       // %
  circularEconomy: number;    // R$ M
  circularityIndex: number;   // 0-100
  cbam: CbamLevel;
  residuos: { nome: string; volume: string }[];
}

/* ─── Setor data ─────────────────────────────────────────────── */
const SETOR_CONFIG: Record<Setor, SetorData> = {
  Cimenteira: {
    co2Reduction: 12, circularEconomy: 2.4, circularityIndex: 67, cbam: "Média",
    residuos: [
      { nome: "RSU (Resíduo Sólido Urbano)", volume: "1.200 t/mês" },
      { nome: "Escória de Alto-Forno",       volume: "800 t/mês" },
      { nome: "Cinza Volante",               volume: "450 t/mês" },
    ],
  },
  "Aço": {
    co2Reduction: 18, circularEconomy: 5.1, circularityIndex: 78, cbam: "Alta",
    residuos: [
      { nome: "Escória Siderúrgica",   volume: "3.200 t/mês" },
      { nome: "Pó de Aciaria",        volume: "980 t/mês" },
      { nome: "Lama de Alto-Forno",   volume: "620 t/mês" },
    ],
  },
  Alumínio: {
    co2Reduction: 9, circularEconomy: 1.8, circularityIndex: 54, cbam: "Alta",
    residuos: [
      { nome: "Escuma de Alumina",     volume: "740 t/mês" },
      { nome: "Lodo de Tratamento",   volume: "310 t/mês" },
    ],
  },
  Química: {
    co2Reduction: 7, circularEconomy: 1.2, circularityIndex: 42, cbam: "Média",
    residuos: [
      { nome: "Enxofre",              volume: "220 t/mês" },
      { nome: "Catalisador Gasto",    volume: "85 t/mês" },
    ],
  },
  Fertilizantes: {
    co2Reduction: 5, circularEconomy: 0.9, circularityIndex: 38, cbam: "Baixa",
    residuos: [
      { nome: "Gesso Agrícola",       volume: "1.800 t/mês" },
      { nome: "Fosfogesso",           volume: "640 t/mês" },
    ],
  },
  Alimentícia: {
    co2Reduction: 4, circularEconomy: 0.7, circularityIndex: 31, cbam: "Baixa",
    residuos: [
      { nome: "Biogás / Biometano",   volume: "0,8 Gm³/mês" },
      { nome: "Lodo de ETE",          volume: "290 t/mês" },
      { nome: "Cascas / Bagaço",      volume: "420 t/mês" },
    ],
  },
};

const SETORES: Setor[] = ["Cimenteira", "Aço", "Alumínio", "Química", "Fertilizantes", "Alimentícia"];
const REGIOES: Regiao[] = ["Nacional", "Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

const CBAM_CONFIG: Record<CbamLevel, { color: string; bg: string; border: string; text: string }> = {
  Baixa: { color: "var(--pid-green)",   bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.4)",  text: "Exposição Baixa" },
  Média: { color: "#F9C784",            bg: "rgba(249,199,132,0.12)",border: "rgba(249,199,132,0.4)",text: "Exposição Média" },
  Alta:  { color: "var(--pid-coral-lt)",bg: "rgba(232,88,26,0.12)",  border: "rgba(232,88,26,0.4)",  text: "Exposição Alta" },
};

/* ─── Multiplicadores regionais (dinamismo) ───────────────────── */
const REGION_MULTS: Record<Regiao, { co2: number; eco: number; circ: number; label: string }> = {
  Nacional:      { co2: 1.00, eco: 1.00, circ:  0, label: "Média Nacional" },
  Norte:         { co2: 1.05, eco: 0.85, circ: -5, label: "Alta Biomassa" },
  Nordeste:      { co2: 1.18, eco: 1.22, circ: +8, label: "Solar + RenovaBio" },
  "Centro-Oeste":{ co2: 0.98, eco: 0.90, circ: -3, label: "Foco Agro" },
  Sudeste:       { co2: 1.00, eco: 1.00, circ:  0, label: "Base Industrial" },
  Sul:           { co2: 0.94, eco: 1.12, circ: +5, label: "Melhores Práticas" },
};

/* ─── Dados de destinação de resíduos (pizza) ────────────────── */
interface PieSlice { label: string; pct: number; color: string }
const PIE_DATA: Record<Setor, PieSlice[]> = {
  Cimenteira:   [
    { label: "Coprocessamento",  pct: 42, color: "var(--pid-coral)" },
    { label: "Reciclagem",       pct: 28, color: "var(--pid-green)" },
    { label: "Aterro Industrial",pct: 19, color: "var(--pid-muted)" },
    { label: "Energia",          pct: 11, color: "#7DD3FC" },
  ],
  "Aço":        [
    { label: "Reciclagem",       pct: 58, color: "var(--pid-green)" },
    { label: "Coprocessamento",  pct: 24, color: "var(--pid-coral)" },
    { label: "Aterro Industrial",pct: 12, color: "var(--pid-muted)" },
    { label: "Energia",          pct:  6, color: "#7DD3FC" },
  ],
  Alumínio:     [
    { label: "Refratários",      pct: 48, color: "#7DD3FC" },
    { label: "Reciclagem",       pct: 22, color: "var(--pid-green)" },
    { label: "Aterro Industrial",pct: 30, color: "var(--pid-muted)" },
  ],
  Química:      [
    { label: "Fertilizantes",    pct: 35, color: "var(--pid-green)" },
    { label: "Reciclagem",       pct: 18, color: "#C084FC" },
    { label: "Aterro Industrial",pct: 47, color: "var(--pid-muted)" },
  ],
  Fertilizantes:[
    { label: "Uso Agrícola",     pct: 55, color: "var(--pid-green)" },
    { label: "Aterro",           pct: 30, color: "var(--pid-muted)" },
    { label: "Outros",           pct: 15, color: "#F9C784" },
  ],
  Alimentícia:  [
    { label: "Biogás/Energia",   pct: 38, color: "#C084FC" },
    { label: "Compostagem",      pct: 32, color: "var(--pid-green)" },
    { label: "Aterro",           pct: 30, color: "var(--pid-muted)" },
  ],
};

/* ─── Strategic Matching data ────────────────────────────────── */
interface Partner {
  nome: string; km: number; volume: string; tipo: string;
}
const MATCHES: Record<Setor, Partner[]> = {
  Cimenteira:   [
    { nome: "Siderúrgica Alfa",  km: 18, volume: "950 t/mês",  tipo: "Escória" },
    { nome: "Siderúrgica Beta",  km: 33, volume: "620 t/mês",  tipo: "Escória" },
    { nome: "Siderúrgica Gama",  km: 47, volume: "440 t/mês",  tipo: "Cinza" },
  ],
  "Aço":        [
    { nome: "Cimenteira Norte",  km: 22, volume: "1.800 t/mês", tipo: "Escória" },
    { nome: "Pavimentação Sul",  km: 38, volume: "900 t/mês",  tipo: "Escória" },
  ],
  Alumínio:     [
    { nome: "Refratários Leste", km: 29, volume: "680 t/mês",  tipo: "Escuma" },
    { nome: "Cerâmica Vale",     km: 55, volume: "310 t/mês",  tipo: "Lodo" },
  ],
  Química:      [
    { nome: "Fertilizantes ABC", km: 41, volume: "210 t/mês",  tipo: "Enxofre" },
  ],
  Fertilizantes:[
    { nome: "Agro Cerrado",      km: 15, volume: "1.500 t/mês", tipo: "Gesso" },
    { nome: "Solo Tech",         km: 60, volume: "580 t/mês",  tipo: "Fosfogesso" },
  ],
  Alimentícia:  [
    { nome: "Bioenergia Oeste",  km: 25, volume: "0,6 Gm³/mês",tipo: "Biogás" },
    { nome: "ETE Municipal",     km: 8,  volume: "250 t/mês",  tipo: "Lodo" },
  ],
};

const POLICY_INSIGHTS: Record<Setor, string> = {
  Cimenteira:   "Há lacuna de dados sobre o descarte de CKD (Pó de Cimento) no SINIR. Estabelecer métricas representa oportunidade inexplorada de posicionamento estratégico e captação de créditos de carbono.",
  "Aço":        "Emissões Escopo 3 da cadeia siderúrgica não são reportadas por CNPJ. A rastreabilidade planta-a-planta desbloquearia acesso ao mercado europeu de aço verde (US$ 180 bi).",
  Alumínio:     "Dados de consumo de água por processo alumínio são fragmentados na ANA. Relatório integrado permitiria certificação 'Green Aluminium' para exportação valorizada.",
  Química:      "Não há inventário nacional de catalisadores gastos. Uma 'Bolsa de Catalisadores' pública criaria mercado circular estimado em R$ 400M/ano.",
  Fertilizantes:"O fosfogesso gerado no Brasil (25Mt/ano) tem apenas 15% aproveitamento. Incentivo fiscal para uso agrícola resolveria problema ambiental e reduziria importação de gesso.",
  Alimentícia:  "Potencial de biogás da agroindústria (50 Gm³/ano) é subutilizado por ausência de marco regulatório para injeção na rede de gás natural. PL 4.173/2023 em tramitação.",
};

/* ─── Sub-components ─────────────────────────────────────────── */
function Select<T extends string>({
  label, icon, value, options, onChange,
}: {
  label: string; icon: React.ReactNode; value: T; options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex-1 min-w-0">
      <label className="flex items-center gap-1.5 text-xs font-medium mb-2" style={{ color: "var(--pid-muted)" }}>
        {icon} {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full appearance-none px-4 pr-9 py-2.5 rounded-xl text-sm font-medium"
          style={{
            background: "var(--pid-surface2)", border: "1.5px solid var(--pid-border)",
            color: "white", outline: "none", cursor: "pointer",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--pid-coral)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--pid-border)")}
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--pid-muted)" }} />
      </div>
    </div>
  );
}

function CircularityGauge({ value }: { value: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = value >= 70 ? "var(--pid-green)" : value >= 50 ? "#F9C784" : "var(--pid-coral)";
  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
      <svg width={72} height={72} viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={36} cy={36} r={r} fill="none" stroke="var(--pid-navy-md)" strokeWidth={6} />
        <circle
          cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</span>
        <span className="text-[9px]" style={{ color: "var(--pid-muted)" }}>/ 100</span>
      </div>
    </div>
  );
}

function PieChart({ slices, size = 120 }: { slices: PieSlice[]; size?: number }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  let cumPct = 0;
  const arcs = slices.map((s) => {
    const startAngle = (cumPct / 100) * 2 * Math.PI - Math.PI / 2;
    cumPct += s.pct;
    const endAngle = (cumPct / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = s.pct > 50 ? 1 : 0;
    return { ...s, d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z` };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} stroke="var(--pid-navy)" strokeWidth={1.5} />)}
      <circle cx={cx} cy={cy} r={r * 0.48} fill="var(--pid-navy-lt)" />
    </svg>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function IndustriasPage() {
  const [setor, setSetor] = useState<Setor>("Cimenteira");
  const [regiao, setRegiao] = useState<Regiao>("Sudeste");
  const [analyzed, setAnalyzed] = useState(true);
  const [rsu, setRsu] = useState(40);
  const [biomassa, setBiomassa] = useState(25);

  // Dynamic values — base × regional multiplier
  const base = SETOR_CONFIG[setor];
  const mult = REGION_MULTS[regiao];
  const dynCo2   = Math.round(base.co2Reduction * mult.co2);
  const dynEco   = (base.circularEconomy * mult.eco).toFixed(1);
  const dynCirc  = Math.min(100, Math.max(0, base.circularityIndex + mult.circ));
  const simCo2   = Math.round(dynCo2 * (1 + (rsu + biomassa) / 200));
  const simEco   = (parseFloat(dynEco) * (1 + (rsu + biomassa) / 150)).toFixed(1);

  const data = base;
  const cbam = CBAM_CONFIG[data.cbam];
  const pieSlices = PIE_DATA[setor];
  // Sector comparison bar chart (top 4 sectors by circular economy)
  const sectorBars: { label: string; val: number; color: string }[] = [
    { label: "Aço",        val: parseFloat((SETOR_CONFIG["Aço"].circularEconomy * mult.eco).toFixed(1)),        color: "var(--pid-coral)" },
    { label: "Cimenteira", val: parseFloat((SETOR_CONFIG.Cimenteira.circularEconomy * mult.eco).toFixed(1)),  color: "var(--pid-green)" },
    { label: "Alumínio",  val: parseFloat((SETOR_CONFIG.Alumínio.circularEconomy * mult.eco).toFixed(1)),   color: "#7DD3FC" },
    { label: "Química",   val: parseFloat((SETOR_CONFIG.Química.circularEconomy * mult.eco).toFixed(1)),    color: "#C084FC" },
  ];
  const barMax = Math.max(...sectorBars.map((b) => b.val));

  return (
    <div style={{ background: "var(--pid-navy)", color: "var(--pid-text)", minHeight: "100vh" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6"
        style={{
          height: "var(--pid-header-h, 64px)",
          background: "rgba(13,27,42,0.97)",
          borderBottom: "1px solid var(--pid-border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs hover:text-[var(--pid-text)] transition-colors"
            style={{ color: "var(--pid-muted)" }}
          >
            <ArrowLeft size={13} /> Voltar
          </Link>
          <span style={{ color: "var(--pid-border)" }}>|</span>
          <a href="https://emaisenergia.org/" target="_blank" rel="noopener noreferrer">
            <Logo height={32} />
          </a>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(232,88,26,0.2)", color: "var(--pid-coral-lt)" }}>
            INDÚSTRIAS
          </span>
        </div>
        {/* Right: ThemeToggle + CBAM badge */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: cbam.bg, border: `1px solid ${cbam.border}`, color: cbam.color }}
          >
            <AlertTriangle size={12} />
            SCORECARD CBAM · {cbam.text}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ── Onboarding inline ──────────────────────────────────── */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--pid-surface2)", border: "1px solid var(--pid-border)" }}
        >
          <div className="mb-4">
            <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: "var(--pid-coral)", letterSpacing: "0.1em" }}>
              PLATAFORMA INDUSTRIAL DE DESCARBONIZAÇÃO
            </p>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Dashboard — Indústria {setor}{" "}
              <span className="font-normal text-lg" style={{ color: "var(--pid-muted)" }}>| {regiao}</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <Select<Setor>
              label="Setor Industrial"
              icon={<BarChart2 size={12} />}
              value={setor}
              options={SETORES}
              onChange={(v) => { setSetor(v); setAnalyzed(true); }}
            />
            <Select<Regiao>
              label="Região"
              icon={<span className="text-[10px]">📍</span>}
              value={regiao}
              options={REGIOES}
              onChange={(v) => { setRegiao(v); setAnalyzed(true); }}
            />
            <button
              onClick={() => setAnalyzed(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 flex-none"
              style={{ background: "linear-gradient(135deg, var(--pid-coral), var(--pid-coral-dk))", color: "white" }}
            >
              Atualizar análise <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* ── KPI cards ──────────────────────────────────────────── */}
        {analyzed && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* CO2 */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--pid-surface2)", border: "1px solid var(--pid-border)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Flame size={14} style={{ color: "var(--pid-coral)" }} />
                <span className="text-[10px] font-semibold tracking-wider" style={{ color: "var(--pid-muted)" }}>
                  REDUÇÃO PROJETADA (CO₂)
                </span>
              </div>
              <p className="text-4xl font-bold" style={{ color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>
                {dynCo2}%
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--pid-coral-lt)" }}>↘ vs. meta anual · {mult.label}</p>
            </div>

            {/* Circular economy */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--pid-surface2)", border: "1px solid var(--pid-border)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Recycle size={14} style={{ color: "var(--pid-green)" }} />
                <span className="text-[10px] font-semibold tracking-wider" style={{ color: "var(--pid-muted)" }}>
                  ECONOMIA CIRCULAR ESTIMADA
                </span>
              </div>
              <p className="text-4xl font-bold" style={{ color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>
                R$ {dynEco}M
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--pid-green)" }}>↗ {regiao} · pot. circular</p>
            </div>

            {/* Circularity index */}
            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: "var(--pid-surface2)", border: "1px solid var(--pid-border)" }}
            >
              <CircularityGauge value={dynCirc} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart2 size={14} style={{ color: "#7DD3FC" }} />
                  <span className="text-[10px] font-semibold tracking-wider" style={{ color: "var(--pid-muted)" }}>
                    ÍNDICE DE CIRCULARIDADE
                  </span>
                </div>
                <p className="text-xs mt-2" style={{ color: dynCirc >= 70 ? "var(--pid-green)" : dynCirc >= 50 ? "#F9C784" : "var(--pid-coral-lt)" }}>
                  {dynCirc >= 70 ? "↗ Acima da média" : dynCirc >= 50 ? "→ Na média" : "↘ Abaixo da média"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--pid-muted)" }}>Benchmarking setorial EPE</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Gráficos ────────────────────────────────────────────── */}
        {analyzed && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Pizza: Destinação de Resíduos */}
            <div className="rounded-2xl p-6" style={{ background: "var(--pid-surface2)", border: "1px solid var(--pid-border)" }}>
              <p className="text-xs font-semibold mb-4" style={{ color: "var(--pid-muted)", letterSpacing: "0.08em" }}>DESTINAÇÃO DE RESÍDUOS (%)</p>
              <div className="flex items-center gap-6">
                <PieChart slices={pieSlices} size={140} />
                <div className="space-y-2 flex-1">
                  {pieSlices.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-none" style={{ background: s.color }} />
                      <span className="text-xs flex-1" style={{ color: "#C8DDF0" }}>{s.label}</span>
                      <span className="text-xs font-bold" style={{ color: s.color }}>{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] mt-4" style={{ color: "var(--pid-muted)" }}>Fonte: SINIR · IBGE · 2026 · Setor: {setor}</p>
            </div>
            {/* Barras: Economia Circular por Setor */}
            <div className="rounded-2xl p-6" style={{ background: "var(--pid-surface2)", border: "1px solid var(--pid-border)" }}>
              <p className="text-xs font-semibold mb-4" style={{ color: "var(--pid-muted)", letterSpacing: "0.08em" }}>ECONOMIA CIRCULAR POR SETOR · R$ M ({regiao})</p>
              <div className="space-y-3">
                {sectorBars.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: b.label === setor ? "white" : "var(--pid-muted)" }}>
                        {b.label === setor && <span className="mr-1" style={{ color: "var(--pid-coral)" }}>▶</span>}{b.label}
                      </span>
                      <span className="text-xs font-bold" style={{ color: b.color }}>R$ {b.val}M</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--pid-navy-md)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(b.val / barMax) * 100}%`, background: b.color, opacity: b.label === setor ? 1 : 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] mt-4" style={{ color: "var(--pid-muted)" }}>Destaque: setor atual (▶) · EPE 2026</p>
            </div>
          </div>
        )}

        {/* ── Strategic Matching ─────────────────────────────────── */}
        {analyzed && (
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--pid-surface2)", border: "1px solid var(--pid-border)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Zap size={15} style={{ color: "var(--pid-coral)" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--pid-coral)", letterSpacing: "0.08em" }}>IA INDUSTRIAL</span>
                <h2 className="text-sm font-bold text-white ml-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Strategic Matching</h2>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.12)", color: "var(--pid-green)", border: "1px solid rgba(34,197,94,0.3)" }}>
                {MATCHES[setor].length} matches ativos
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Sua Demanda */}
              <div className="rounded-xl p-4" style={{ background: "var(--pid-navy-lt)", border: "1px solid var(--pid-border)" }}>
                <p className="text-[10px] font-semibold mb-3" style={{ color: "var(--pid-muted)", letterSpacing: "0.08em" }}>SUA DEMANDA</p>
                <div className="space-y-2">
                  {SETOR_CONFIG[setor].residuos.map((r) => (
                    <div key={r.nome} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-none" style={{ background: "var(--pid-coral)" }} />
                      <span className="text-xs text-white flex-1">{r.nome}</span>
                      <span className="text-xs font-mono" style={{ color: "var(--pid-coral-lt)" }}>{r.volume}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Oportunidades */}
              <div className="rounded-xl p-4" style={{ background: "var(--pid-navy-lt)", border: "1px solid var(--pid-border)" }}>
                <p className="text-[10px] font-semibold mb-3" style={{ color: "var(--pid-muted)", letterSpacing: "0.08em" }}>OPORTUNIDADES · raio 50km</p>
                <div className="space-y-2">
                  {MATCHES[setor].map((p) => (
                    <div key={p.nome} className="flex items-center gap-2 py-1 px-2 rounded-lg" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                      <MapPin size={11} style={{ color: "var(--pid-green)", flexShrink: 0 }} />
                      <span className="text-xs text-white flex-1 font-medium">{p.nome}</span>
                      <span className="text-[10px]" style={{ color: "var(--pid-muted)" }}>{p.km}km</span>
                      <span className="text-[10px] font-mono" style={{ color: "var(--pid-green)" }}>{p.volume}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Simulador de Cenários ───────────────────────────────── */}
        {analyzed && (
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--pid-surface2)", border: "1px solid var(--pid-border)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <SlidersHorizontal size={15} style={{ color: "#7DD3FC" }} />
              <span className="text-xs font-semibold" style={{ color: "#7DD3FC", letterSpacing: "0.08em" }}>IA PREDITIVA</span>
              <h2 className="text-sm font-bold text-white ml-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Simulador de Cenários</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Sliders */}
              <div className="space-y-6">
                {/* RSU slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-medium" style={{ color: "var(--pid-muted)" }}>Uso de RSU (%)</label>
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "rgba(232,88,26,0.15)", color: "var(--pid-coral-lt)" }}>{rsu}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={rsu} onChange={(e) => setRsu(+e.target.value)}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: "var(--pid-coral)", background: `linear-gradient(to right, var(--pid-coral) ${rsu}%, var(--pid-navy-md) ${rsu}%)` }}
                  />
                  <div className="flex justify-between text-[10px] mt-1" style={{ color: "var(--pid-muted)" }}><span>0%</span><span>100%</span></div>
                </div>
                {/* Biomassa slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-medium" style={{ color: "var(--pid-muted)" }}>Uso de Biomassa (%)</label>
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.15)", color: "var(--pid-green)" }}>{biomassa}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={biomassa} onChange={(e) => setBiomassa(+e.target.value)}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: "var(--pid-green)", background: `linear-gradient(to right, var(--pid-green) ${biomassa}%, var(--pid-navy-md) ${biomassa}%)` }}
                  />
                  <div className="flex justify-between text-[10px] mt-1" style={{ color: "var(--pid-muted)" }}><span>0%</span><span>100%</span></div>
                </div>
                {/* Presets */}
                <div>
                  <p className="text-[10px] font-semibold mb-2" style={{ color: "var(--pid-muted)", letterSpacing: "0.08em" }}>CENÁRIOS PREDEFINIDOS</p>
                  <div className="flex gap-2">
                    {([{l:"Conservador",r:20,b:10},{l:"Moderado",r:40,b:25},{l:"Agressivo",r:80,b:60}] as const).map((c) => (
                      <button key={c.l} onClick={() => { setRsu(c.r); setBiomassa(c.b); }}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: rsu===c.r&&biomassa===c.b ? "rgba(232,88,26,0.15)" : "var(--pid-navy-lt)", border: `1px solid ${rsu===c.r&&biomassa===c.b?"var(--pid-coral)":"var(--pid-border)"}`, color: rsu===c.r&&biomassa===c.b?"var(--pid-coral-lt)":"var(--pid-muted)" }}
                      >{c.l}</button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Preview */}
              <div className="rounded-xl p-5 flex flex-col justify-center" style={{ background: "var(--pid-navy-lt)", border: "1px solid var(--pid-border)" }}>
                <p className="text-[10px] font-semibold mb-4" style={{ color: "var(--pid-muted)", letterSpacing: "0.08em" }}>PRÉVIA DO RESULTADO</p>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="text-center">
                    <p className="text-[10px] mb-1" style={{ color: "var(--pid-muted)" }}>Redução CO₂</p>
                    <p className="text-3xl font-bold" style={{ color: "var(--pid-coral-lt)", fontFamily: "'Space Grotesk', sans-serif" }}>{simCo2}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] mb-1" style={{ color: "var(--pid-muted)" }}>Economia</p>
                    <p className="text-3xl font-bold" style={{ color: "var(--pid-green)", fontFamily: "'Space Grotesk', sans-serif" }}>R$ {simEco}M</p>
                  </div>
                </div>
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, var(--pid-coral), var(--pid-coral-dk))", color: "white" }}
                >
                  Aplicar Simulação →
                </button>
                <p className="text-[10px] mt-2 text-center" style={{ color: "var(--pid-muted)" }}>Os resultados são projeções estimadas</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Insight de Política Pública ─────────────────────────── */}
        {analyzed && (
          <div
            className="flex items-start gap-3 px-5 py-4 rounded-2xl"
            style={{ background: "rgba(232,88,26,0.07)", border: "1px solid rgba(232,88,26,0.3)" }}
          >
            <Lightbulb size={16} style={{ color: "var(--pid-coral)", marginTop: 1, flexShrink: 0 }} />
            <div>
              <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--pid-coral)", letterSpacing: "0.08em" }}>INSIGHT DE POLÍTICA PÚBLICA</p>
              <p className="text-xs leading-relaxed" style={{ color: "#C8DDF0" }}>{POLICY_INSIGHTS[setor]}</p>
            </div>
          </div>
        )}
      </main>

      {/* ── Botão flutuante do Copilot ──────────────────────────── */}
      <Link
        href="/copilot"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl transition-all duration-200 hover:scale-105 hover:opacity-95 active:scale-95"
        style={{
          background: "linear-gradient(135deg, var(--pid-coral), var(--pid-coral-dk))",
          color: "white",
          boxShadow: "0 8px 32px rgba(232,88,26,0.4)",
        }}
        aria-label="Abrir PID Copilot GIS"
      >
        <Image src="/assets/PNG/Ícone.png" alt="Copilot" width={18} height={18} />
        <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          PID Copilot
        </span>
      </Link>
    </div>
  );
}
