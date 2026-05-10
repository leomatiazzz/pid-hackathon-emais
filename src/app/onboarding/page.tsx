"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, Recycle, Zap, Globe, Anchor, TrendingUp, FileText } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────── */
type IndustryType = "Cimenteira" | "Aço" | "Alumínio" | "Química" | "Fertilizantes" | "Alimentícia";

interface Sede {
  id: string;
  city: string;
  state: string;
  hasPilot: boolean;
  x: number; // SVG position %
  y: number;
}

/* ─── Mock Sedes por Indústria ───────────────────────────────── */
const SEDES: Record<IndustryType, Sede[]> = {
  Cimenteira: [
    { id: "for", city: "Fortaleza",    state: "CE", hasPilot: true,  x: 78, y: 26 },
    { id: "sob", city: "Sobral",       state: "CE", hasPilot: false, x: 68, y: 28 },
    { id: "ara", city: "Araripina",    state: "PE", hasPilot: false, x: 76, y: 32 },
    { id: "set", city: "Sete Lagoas", state: "MG", hasPilot: true,  x: 72, y: 57 },
    { id: "can", city: "Cantagalo",    state: "RJ", hasPilot: false, x: 76, y: 63 },
    { id: "rio", city: "Rio Branco",   state: "AC", hasPilot: false, x: 22, y: 50 },
  ],
  "Aço": [
    { id: "vit", city: "Vitória",        state: "ES", hasPilot: true,  x: 78, y: 59 },
    { id: "ipa", city: "Ipatinga",       state: "MG", hasPilot: true,  x: 73, y: 55 },
    { id: "sjc", city: "S.J. dos Campos", state: "SP", hasPilot: false, x: 67, y: 67 },
  ],
  Alumínio: [
    { id: "bar", city: "Barcarena",  state: "PA", hasPilot: true,  x: 62, y: 20 },
    { id: "ovi", city: "Ouro Preto", state: "MG", hasPilot: false, x: 72, y: 59 },
  ],
  Química: [
    { id: "cam", city: "Camaçari",      state: "BA", hasPilot: true,  x: 72, y: 42 },
    { id: "duc", city: "Duque de Caxias", state: "RJ", hasPilot: false, x: 75, y: 64 },
  ],
  Fertilizantes: [
    { id: "uba", city: "Uberaba", state: "MG", hasPilot: false, x: 63, y: 56 },
    { id: "ara2", city: "Araxá", state: "MG", hasPilot: true,  x: 61, y: 58 },
  ],
  Alimentícia: [
    { id: "cam2", city: "Campinas",     state: "SP", hasPilot: true,  x: 64, y: 67 },
    { id: "pgr",  city: "Ponta Grossa", state: "PR", hasPilot: false, x: 60, y: 73 },
  ],
};

const INDUSTRIES: IndustryType[] = ["Cimenteira", "Aço", "Alumínio", "Química", "Fertilizantes", "Alimentícia"];

/* ─── Step Indicator ─────────────────────────────────────────── */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <div
            key={n}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
            style={{
              background: active
                ? "var(--pid-coral)"
                : done
                ? "rgba(232,88,26,0.25)"
                : "var(--pid-surface2)",
              color: active ? "white" : done ? "var(--pid-coral-lt)" : "var(--pid-muted)",
              border: `1px solid ${active ? "var(--pid-coral)" : done ? "rgba(232,88,26,0.4)" : "var(--pid-border)"}`,
            }}
          >
            {done ? <Check size={14} /> : n}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Brazil SVG Map ─────────────────────────────────────────── */
function BrazilMap({ sedes, selected, onToggle }: {
  sedes: Sede[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="relative rounded-xl overflow-hidden" style={{
      background: "var(--pid-navy-lt)",
      border: "1px solid var(--pid-border)",
      aspectRatio: "1 / 1.15",
    }}>
      {/* Grid overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(var(--pid-border) 1px, transparent 1px), linear-gradient(90deg, var(--pid-border) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        opacity: 0.3,
      }} />
      {/* Brazil outline via SVG */}
      <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full" style={{ opacity: 0.25 }}>
        <path
          d="M62,2 L70,4 L78,8 L84,14 L86,22 L82,28 L78,32 L80,40 L78,48 L74,54 L76,62 L78,70 L74,76 L68,80 L64,86 L60,92 L54,96 L48,98 L42,94 L36,90 L30,86 L26,80 L24,72 L22,62 L20,52 L22,42 L20,34 L18,26 L22,18 L28,12 L36,8 L44,4 Z"
          fill="none"
          stroke="var(--pid-slate-lt)"
          strokeWidth="1"
        />
      </svg>
      {/* Sede markers */}
      {sedes.map((s) => {
        const isSel = selected.includes(s.id);
        return (
          <button
            key={s.id}
            onClick={() => onToggle(s.id)}
            title={`${s.city} (${s.state})`}
            className="absolute transition-transform hover:scale-125"
            style={{ left: `${s.x}%`, top: `${s.y}%`, transform: "translate(-50%,-50%)" }}
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 transition-all" style={{
              background: isSel
                ? s.hasPilot ? "var(--pid-green)" : "var(--pid-coral)"
                : "var(--pid-muted)",
              borderColor: isSel ? "white" : "var(--pid-border)",
              boxShadow: isSel ? `0 0 8px ${s.hasPilot ? "var(--pid-green)" : "var(--pid-coral)"}` : "none",
            }} />
          </button>
        );
      })}
      <div className="absolute bottom-2 left-2 text-xs" style={{ color: "var(--pid-muted)" }}>
        Brasil
      </div>
    </div>
  );
}

/* ─── Step 1 — Entender a Operação ──────────────────────────── */
function Step1({
  industry, setIndustry, hasPilots, setHasPilots, numPlants, setNumPlants,
}: {
  industry: IndustryType | null;
  setIndustry: (v: IndustryType) => void;
  hasPilots: boolean | null;
  setHasPilots: (v: boolean) => void;
  numPlants: string;
  setNumPlants: (v: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Vamos entender sua operação
        </h1>
        <p className="text-sm" style={{ color: "var(--pid-muted)" }}>
          Suas respostas personalizam as recomendações de descarbonização
        </p>
      </div>

      {/* Industry type */}
      <div>
        <p className="text-sm font-medium text-white mb-3">1. Qual o tipo de indústria?</p>
        <div className="grid grid-cols-3 gap-2">
          {INDUSTRIES.map((ind) => {
            const active = industry === ind;
            return (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={{
                  background: active ? "rgba(232,88,26,0.15)" : "var(--pid-surface2)",
                  border: `1.5px solid ${active ? "var(--pid-coral)" : "var(--pid-border)"}`,
                  color: active ? "var(--pid-coral-lt)" : "var(--pid-muted)",
                }}
              >
                {active && <Check size={12} className="inline mr-1.5" />}
                {ind}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pilot projects */}
      <div>
        <p className="text-sm font-medium text-white mb-3">2. Você já tem projetos piloto a avaliar?</p>
        <div className="flex gap-3">
          {[true, false].map((val) => {
            const active = hasPilots === val;
            return (
              <button
                key={String(val)}
                onClick={() => setHasPilots(val)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: active ? "rgba(232,88,26,0.15)" : "var(--pid-surface2)",
                  border: `1.5px solid ${active ? "var(--pid-coral)" : "var(--pid-border)"}`,
                  color: active ? "var(--pid-coral-lt)" : "var(--pid-muted)",
                }}
              >
                {val ? "Sim" : "Não"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Number of plants */}
      <div>
        <p className="text-sm font-medium text-white mb-3">3. Quantas usinas industriais você possui?</p>
        <input
          type="number"
          min="1"
          max="999"
          value={numPlants}
          onChange={(e) => setNumPlants(e.target.value)}
          placeholder="Ex: 6"
          className="w-full px-4 py-2.5 rounded-xl text-sm"
          style={{
            background: "var(--pid-surface2)",
            border: "1.5px solid var(--pid-border)",
            color: "white",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--pid-coral)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--pid-border)")}
        />
        <p className="text-xs mt-1" style={{ color: "var(--pid-muted)" }}>Sedes</p>
      </div>
    </div>
  );
}

/* ─── Step 2 — Selecionar Sedes ──────────────────────────────── */
function Step2({ sedes, selected, onToggle }: {
  sedes: Sede[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Selecione suas sedes industriais
        </h1>
        <p className="text-sm" style={{ color: "var(--pid-muted)" }}>
          Marque as sedes que deseja incluir na análise
        </p>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4">
        {/* Map */}
        <BrazilMap sedes={sedes} selected={selected} onToggle={onToggle} />

        {/* List */}
        <div className="space-y-2">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--pid-muted)", letterSpacing: "0.08em" }}>
            SUAS SEDES
          </p>
          {sedes.map((s) => {
            const isSel = selected.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => onToggle(s.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: isSel ? "rgba(232,88,26,0.08)" : "var(--pid-surface2)",
                  border: `1px solid ${isSel ? "rgba(232,88,26,0.35)" : "var(--pid-border)"}`,
                }}
              >
                {/* Color dot */}
                <span className="flex-none w-3 h-3 rounded-full" style={{
                  background: isSel
                    ? s.hasPilot ? "var(--pid-green)" : "var(--pid-coral-lt)"
                    : "var(--pid-muted)",
                }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: isSel ? "white" : "var(--pid-muted)" }}>
                    Sede {s.city} ({s.state})
                  </p>
                  <p className="text-[10px]" style={{ color: s.hasPilot ? "var(--pid-green)" : "var(--pid-slate-lt)" }}>
                    {s.hasPilot ? "Com Piloto" : "Sem Piloto"}
                  </p>
                </div>
                <div className="flex-none w-4 h-4 rounded flex items-center justify-center" style={{
                  background: isSel ? "var(--pid-coral)" : "var(--pid-surface2)",
                  border: `1px solid ${isSel ? "var(--pid-coral)" : "var(--pid-border)"}`,
                }}>
                  {isSel && <Check size={10} className="text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3 — Fluxo de Materiais ───────────────────────────── */
const RESIDUE_TYPES = [
  { id: "slag", label: "Escória", icon: "🏭", desc: "Resíduo sólido de alto forno" },
  { id: "ash", label: "Cinza volante", icon: "💨", desc: "Subproduto da combustão" },
  { id: "co2", label: "CO₂ capturado", icon: "🌿", desc: "Gás para sequestro ou uso" },
  { id: "heat", label: "Calor residual", icon: "🔥", desc: "Energia térmica reaproveitável" },
  { id: "water", label: "Água tratada", icon: "💧", desc: "Efluente industrial tratado" },
  { id: "dust", label: "Pó de cimento", icon: "🪨", desc: "Material particulado reutilizável" },
];

function Step3({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Fluxo de Materiais
        </h1>
        <p className="text-sm" style={{ color: "var(--pid-muted)" }}>
          Quais resíduos sua operação gera e que podem ser reaproveitados?
        </p>
      </div>
      <div
        className="flex gap-3 px-4 py-3 rounded-xl"
        style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
      >
        <Recycle size={16} style={{ color: "var(--pid-green)", marginTop: 2, flexShrink: 0 }} />
        <p className="text-xs leading-relaxed" style={{ color: "#C8DDF0" }}>
          A <strong style={{ color: "var(--pid-green)" }}>economia circular</strong> transforma resíduos de uma
          indústria em insumo de outra. Selecione os materiais gerados para identificar oportunidades de monetização.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {RESIDUE_TYPES.map((r) => {
          const isSel = selected.includes(r.id);
          return (
            <button
              key={r.id}
              onClick={() => onToggle(r.id)}
              className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
              style={{
                background: isSel ? "rgba(232,88,26,0.1)" : "var(--pid-surface2)",
                border: `1.5px solid ${isSel ? "var(--pid-coral)" : "var(--pid-border)"}`,
              }}
            >
              <span className="text-xl">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: isSel ? "white" : "var(--pid-muted)" }}>
                  {r.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--pid-slate-lt)" }}>
                  {r.desc}
                </p>
              </div>
              {isSel && (
                <div className="flex-none w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "var(--pid-coral)" }}>
                  <Check size={10} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Step 4 — Recomendações + Plano de Escala ───────────────── */
const RECS = [
  { icon: Zap, title: "Energia recomendada", value: "Biomassa + Solar", desc: "Melhor custo-benefício e alta disponibilidade nas regiões selecionadas", color: "var(--pid-green)", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.3)" },
  { icon: Globe, title: "Alternativa de longo prazo", value: "Hidrogênio Verde", desc: "Recomendado para descarbonização profunda a partir de 2030", color: "#7DD3FC", bg: "rgba(125,211,252,0.08)", border: "rgba(125,211,252,0.3)" },
  { icon: TrendingUp, title: "Melhor região p/ expansão", value: "Nordeste", desc: "Maior potencial de geração renovável e incentivos regionais", color: "var(--pid-coral-lt)", bg: "rgba(232,88,26,0.08)", border: "rgba(232,88,26,0.3)" },
  { icon: Anchor, title: "Prioridade logística", value: "Porto do Pecém e Suape", desc: "Facilidade para exportação e redução de custos logísticos", color: "#C084FC", bg: "rgba(192,132,252,0.08)", border: "rgba(192,132,252,0.3)" },
];

const PHASES = [
  { n: 1, range: "0 – 6 meses",   sedes: ["Fortaleza (CE)", "Sobral (CE)"],   pilotStatus: [true, false] },
  { n: 2, range: "6 – 18 meses",  sedes: ["Araripina (PE)", "Sete Lagoas (MG)"], pilotStatus: [false, true] },
  { n: 3, range: "18 – 24 meses", sedes: ["Cantagalo (RJ)", "Rio Branco (AC)"],  pilotStatus: [false, false] },
];

function Step4() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Recomendações Estratégicas
        </h1>
        <p className="text-sm" style={{ color: "var(--pid-muted)" }}>
          Com base nos dados da PID, essas são as recomendações para sua operação
        </p>
      </div>
      {/* Rec cards */}
      <div className="grid grid-cols-2 gap-3">
        {RECS.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.value} className="p-4 rounded-xl" style={{ background: r.bg, border: `1px solid ${r.border}` }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={13} style={{ color: r.color }} />
                <span className="text-[10px] font-medium" style={{ color: r.color }}>{r.title}</span>
              </div>
              <p className="text-base font-bold mb-1" style={{ color: r.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                {r.value}
              </p>
              <p className="text-xs" style={{ color: "var(--pid-muted)" }}>{r.desc}</p>
            </div>
          );
        })}
      </div>
      {/* Scale plan */}
      <div>
        <p className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Plano de escala da descarbonização</p>
        <p className="text-xs mb-4" style={{ color: "var(--pid-muted)" }}>Roteiro sugerido para seu projeto piloto</p>
        <div className="flex gap-4">
          {/* Timeline */}
          <div className="flex-1 space-y-3">
            {PHASES.map((ph) => (
              <div key={ph.n} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-none" style={{ background: "var(--pid-coral)" }}>
                    {ph.n}
                  </div>
                  {ph.n < PHASES.length && <div className="flex-1 w-px mt-1" style={{ background: "var(--pid-border)" }} />}
                </div>
                <div className="pb-3 flex-1">
                  <p className="text-xs font-semibold text-white">Fase {ph.n}</p>
                  <p className="text-[10px] mb-2" style={{ color: "var(--pid-muted)" }}>{ph.range}</p>
                  {ph.sedes.map((s, i) => (
                    <div key={s} className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-sm flex-none" style={{ background: ph.pilotStatus[i] ? "var(--pid-coral)" : "var(--pid-border)" }} />
                      <span className="text-xs" style={{ color: "#C8DDF0" }}>{s}</span>
                      <span className="text-[10px]" style={{ color: ph.pilotStatus[i] ? "var(--pid-coral-lt)" : "var(--pid-muted)" }}>
                        {ph.pilotStatus[i] ? "Com Piloto" : "Sem Piloto"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Summary */}
          <div className="rounded-xl p-4 self-start" style={{ background: "var(--pid-surface2)", border: "1px solid var(--pid-border)", minWidth: 130 }}>
            {[
              { label: "Duração total", value: "24 meses" },
              { label: "Sedes incluídas", value: "6 sedes" },
              { label: "Investimento est.", value: "42,3 mi" },
              { label: "Redução anual CO₂", value: "68.000 tCO₂e" },
            ].map((item) => (
              <div key={item.label} className="mb-3 last:mb-0">
                <p className="text-[10px]" style={{ color: "var(--pid-muted)" }}>{item.label}</p>
                <p className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 5 — Impacto Financeiro ────────────────────────────── */
const FIN_CARDS = [
  { title: "Crédito de carbono (VCM)", value: "R$ 5,1 mi", unit: "/ ano", sub: "68.000 créditos/ano",                color: "var(--pid-green)",   border: "rgba(34,197,94,0.4)" },
  { title: "CBAM evitado (UE)",        value: "R$ 5,8 mi", unit: "/ ano", sub: "Impostos de carbono evitados",    color: "#7DD3FC",             border: "rgba(125,211,252,0.4)" },
  { title: "Financiamento verde",      value: "R$ 1,9 mi", unit: "",      sub: "Juros menores e linhas verdes",   color: "#C084FC",             border: "rgba(192,132,252,0.4)" },
  { title: "RenovaBio (potencial)",    value: "R$ 2,9 mi", unit: "/ ano", sub: "Receita com biocombustíveis",     color: "var(--pid-coral-lt)", border: "rgba(232,88,26,0.4)" },
];

function Step5() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Impacto Financeiro
        </h1>
        <p className="text-sm" style={{ color: "var(--pid-muted)" }}>
          Potencial de receita e economia para o plano completo (24 meses)
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {FIN_CARDS.map((c) => (
          <div key={c.title} className="p-4 rounded-xl" style={{ background: "var(--pid-surface2)", border: `1px solid ${c.border}` }}>
            <p className="text-[10px] mb-2" style={{ color: c.color }}>{c.title}</p>
            <p className="text-xl font-bold" style={{ color: c.color, fontFamily: "'Space Grotesk', sans-serif" }}>
              {c.value}<span className="text-xs font-normal ml-1" style={{ color: "var(--pid-muted)" }}>{c.unit}</span>
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--pid-slate-lt)" }}>{c.sub}</p>
          </div>
        ))}
      </div>
      {/* Total */}
      <div className="p-5 rounded-xl" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs" style={{ color: "var(--pid-muted)" }}>Impacto financeiro total</p>
            <p className="text-2xl font-bold" style={{ color: "var(--pid-green)", fontFamily: "'Space Grotesk', sans-serif" }}>R$ 11,0 milhões<span className="text-sm font-normal ml-1" style={{ color: "var(--pid-muted)" }}>/ano</span></p>
            <p className="text-xs mt-0.5" style={{ color: "var(--pid-muted)" }}>Receita + economia potencial</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: "var(--pid-muted)" }}>Payback</p>
            <p className="text-2xl font-bold" style={{ color: "var(--pid-green)", fontFamily: "'Space Grotesk', sans-serif" }}>1,2 ano</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--pid-muted)" }}>(Antes: 3,7 anos)</p>
          </div>
        </div>
      </div>
      <p className="text-xs" style={{ color: "var(--pid-slate-lt)" }}>* Valores estimados para o plano completo (24 meses)</p>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState<IndustryType | null>(null);
  const [hasPilots, setHasPilots] = useState<boolean | null>(null);
  const [numPlants, setNumPlants] = useState("");
  const [selectedSedes, setSelectedSedes] = useState<string[]>([]);
  const [selectedResidues, setSelectedResidues] = useState<string[]>([]);

  const sedes = industry ? SEDES[industry] : [];

  const handleIndustryChange = (ind: IndustryType) => {
    setIndustry(ind);
    setSelectedSedes(SEDES[ind].map((s) => s.id));
  };

  const toggleSede = (id: string) =>
    setSelectedSedes((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const toggleResidue = (id: string) =>
    setSelectedResidues((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );

  const canProceed = () => {
    if (step === 1) return industry !== null && hasPilots !== null && numPlants !== "";
    if (step === 2) return selectedSedes.length > 0;
    if (step === 3) return selectedResidues.length > 0;
    return true;
  };

  const TOTAL_STEPS = 5;
  const STEP_LABELS = ["", "Próxima etapa", "Confirmar seleção", "Ver recomendações", "Ver impacto financeiro", "Gerar relatório"];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pid-navy)" }}>
      {/* Header */}
      <header className="flex-none flex items-center justify-between px-6 h-14" style={{
        background: "rgba(13,27,42,0.97)",
        borderBottom: "1px solid var(--pid-border)",
      }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-xs hover:text-white transition-colors" style={{ color: "var(--pid-muted)" }}>
            <ArrowLeft size={13} />
            Voltar
          </Link>
          <span style={{ color: "var(--pid-border)" }}>|</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "var(--pid-coral)" }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-sm text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>PID</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(232,88,26,0.2)", color: "var(--pid-coral-lt)" }}>
              ANÁLISE INDUSTRIAL
            </span>
          </div>
        </div>
        <span className="text-xs" style={{ color: "var(--pid-muted)" }}>
          Etapa {step} de {TOTAL_STEPS}
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-xl">
          <StepDots current={step} total={TOTAL_STEPS} />

          {step === 1 && (
            <Step1
              industry={industry}
              setIndustry={handleIndustryChange}
              hasPilots={hasPilots}
              setHasPilots={setHasPilots}
              numPlants={numPlants}
              setNumPlants={setNumPlants}
            />
          )}
          {step === 2 && (
            <Step2
              sedes={sedes}
              selected={selectedSedes}
              onToggle={toggleSede}
            />
          )}
          {step === 3 && (
            <Step3 selected={selectedResidues} onToggle={toggleResidue} />
          )}
          {step === 4 && <Step4 />}
          {step === 5 && <Step5 />}

          {/* Navigation */}
          <div className="flex gap-3 mt-10">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all"
                style={{ background: "var(--pid-surface2)", border: "1px solid var(--pid-border)", color: "var(--pid-muted)" }}
              >
                <ArrowLeft size={14} />
                Voltar
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: canProceed() ? "linear-gradient(135deg, var(--pid-coral), var(--pid-coral-dk))" : "var(--pid-surface2)",
                  color: canProceed() ? "white" : "var(--pid-muted)",
                  border: `1px solid ${canProceed() ? "transparent" : "var(--pid-border)"}`,
                  cursor: canProceed() ? "pointer" : "not-allowed",
                }}
              >
                {STEP_LABELS[step]}
                <ChevronRight size={15} />
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, var(--pid-coral), var(--pid-coral-dk))", color: "white" }}
              >
                <FileText size={15} />
                Gerar relatório completo
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
