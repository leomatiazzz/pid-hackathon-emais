"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import {
  BarChart2,
  Map,
  ArrowLeft,
  TrendingUp,
  Zap,
  Factory,
  Leaf,
  Droplets,
  Wind,
  Recycle,
  ArrowRight,
  AlertTriangle,
  FileQuestion,
  ExternalLink,
  Building2,
} from "lucide-react";

/* ─── Tipos ──────────────────────────────────────────────────── */
interface KPI {
  label: string;
  value: string;
  unit?: string;
  delta: string;
  color: string;
  iconName: "factory" | "zap" | "leaf" | "trending";
}

interface Sector {
  label: string;
  pct: number;
  value: string;
}

interface Opportunity {
  tag: string;
  text: string;
  color: string;
}

interface EsgItem {
  label: string;
  value: number; // 0-100
  color: string;
}

/* ─── Data (sem JSX — apenas primitivos) ─────────────────────── */
const KPIS: KPI[] = [
  {
    label:    "Indústrias Cadastradas",
    value:    "326",
    delta:    "+12 este mês",
    color:    "var(--pid-coral)",
    iconName: "factory",
  },
  {
    label:    "Consumo Total",
    value:    "30,4M",
    unit:     "MWh",
    delta:    "Alumínio lidera",
    color:    "#F9C784",
    iconName: "zap",
  },
  {
    label:    "Projetos Aço Verde",
    value:    "10",
    delta:    "Sudeste / Sul",
    color:    "var(--pid-green)",
    iconName: "leaf",
  },
  {
    label:    "Potencial de Redução",
    value:    "~40%",
    unit:     "CO₂",
    delta:    "até 2035",
    color:    "#7DD3FC",
    iconName: "trending",
  },
];

const SECTORS: Sector[] = [
  { label: "Alumínio",      pct: 100, value: "~11M MWh"  },
  { label: "Aço",           pct:  64, value: "~7M MWh"   },
  { label: "Química",       pct:  45, value: "~5M MWh"   },
  { label: "Alimentícia",   pct:  27, value: "~3M MWh"   },
  { label: "Cimenteira",    pct:  25, value: "~2,7M MWh" },
  { label: "Fertilizantes", pct:  12, value: "~1,3M MWh" },
];

const OPPORTUNITIES: Opportunity[] = [
  {
    tag:   "Alto Impacto",
    text:  "10 usinas de Aço no Sudeste com potencial de migração para H₂ Verde.",
    color: "var(--pid-green)",
  },
  {
    tag:   "Médio Prazo",
    text:  "Hubs portuários do ES e RJ como corredores de exportação de biometano.",
    color: "#F9C784",
  },
  {
    tag:   "Prioridade",
    text:  "Alumínio representa 36% do consumo total — maior alavanca de descarbonização.",
    color: "var(--pid-coral)",
  },
];

const ESG_ITEMS: EsgItem[] = [
  { label: "Energia Renovável (%)",  value: 84, color: "var(--pid-green)"  },
  { label: "Redução de Emissões",    value: 62, color: "#7DD3FC"           },
  { label: "Projetos H₂ em Plano",  value: 45, color: "#F9C784"           },
  { label: "Biomassa/Biometano",     value: 31, color: "var(--pid-coral)"  },
];

/* ─── Helper: renderiza ícone pelo nome ──────────────────────── */
function KpiIcon({ name, color }: { name: KPI["iconName"]; color: string }) {
  const props = { size: 18, color } as const;
  if (name === "factory")  return <Factory  {...props} />;
  if (name === "zap")      return <Zap      {...props} />;
  if (name === "leaf")     return <Leaf     {...props} />;
  return <TrendingUp {...props} />;
}

/* ─── Helper: cor da barra por percentual ───────────────────── */
function barGradient(pct: number): string {
  if (pct > 80) return "linear-gradient(90deg, var(--pid-coral-dk), var(--pid-coral))";
  if (pct > 50) return "linear-gradient(90deg, var(--pid-slate), var(--pid-slate-lt))";
  return "var(--pid-slate)";
}

/* ─── Resíduos & Circularidade data ─────────────────────────── */
interface ResidueFlow {
  name: string;
  industry: string;
  volume: string;
  pct: number;
  color: string;
  destination: string;
}

const RESIDUE_FLOWS: ResidueFlow[] = [
  { name: "Escória de alto forno",  industry: "Aço",        volume: "12,4 Mt/ano", pct: 100, color: "var(--pid-coral)",   destination: "Cimento (98%) · Pavimentação (2%)" },
  { name: "Cinza volante",          industry: "Cimenteira", volume: "8,1 Mt/ano",  pct: 65,  color: "#F9C784",           destination: "Concreto (71%) · Aterro (29%)" },
  { name: "Pó de cimento (CKD)",    industry: "Cimenteira", volume: "3,2 Mt/ano",  pct: 26,  color: "var(--pid-muted)",   destination: "Neutralização solo (55%) · Descarte (45%)" },
  { name: "Escuma de alumina",      industry: "Alumínio",   volume: "2,7 Mt/ano",  pct: 22,  color: "#7DD3FC",           destination: "Refratários (60%) · Perdas (40%)" },
  { name: "RSU co-processado",      industry: "Aço",        volume: "1,9 Mt/ano",  pct: 15,  color: "var(--pid-green)",   destination: "Substitui combustível (100%)" },
  { name: "Biogás / Biometano",     industry: "Alimentícia",volume: "0,8 Gm³/ano", pct: 6,   color: "#C084FC",           destination: "Energia interna (65%) · Rede (35%)" },
];

interface CircularOpp {
  tag: string;
  title: string;
  desc: string;
  value: string;
  unit: string;
  color: string;
  borderColor: string;
}

const CIRCULAR_OPPS: CircularOpp[] = [
  { tag: "VCM",      title: "Crédito de Carbono",    desc: "Escória e cinza monetizáveis via mercado voluntário",       value: "R$ 5,1 mi", unit: "/ano", color: "var(--pid-green)",   borderColor: "rgba(34,197,94,0.35)" },
  { tag: "CBAM",     title: "CBAM Evitado (UE)",      desc: "Substituição de materiais virgens reduz exposição fiscal",   value: "R$ 5,8 mi", unit: "/ano", color: "#7DD3FC",           borderColor: "rgba(125,211,252,0.35)" },
  { tag: "RENOVA",   title: "RenovaBio Potencial",    desc: "Biogás e biometano de resíduos orgânicos alimentícios",     value: "R$ 2,9 mi", unit: "/ano", color: "#C084FC",           borderColor: "rgba(192,132,252,0.35)" },
  { tag: "LOGÍSTICA",title: "Economia de Materiais",  desc: "Redução de matéria-prima virgem via economia circular",     value: "R$ 1,9 mi", unit: "/ano", color: "var(--pid-coral-lt)",borderColor: "rgba(232,88,26,0.35)" },
];

const MATERIAL_MATRIX = [
  { from: "Aço",        to: "Cimenteira",   material: "Escória",       volume: "12,4 Mt", status: "ativo" },
  { from: "Cimenteira", to: "Construção",   material: "Cinza volante", volume: "5,8 Mt",  status: "ativo" },
  { from: "Alumínio",   to: "Refratários",  material: "Escuma",        volume: "1,6 Mt",  status: "parcial" },
  { from: "Alimentícia",to: "Energia",      material: "Biogás",        volume: "0,8 Gm³", status: "potencial" },
  { from: "Química",    to: "Fertilizantes",material: "Enxofre",       volume: "0,3 Mt",  status: "potencial" },
];

/* ─── Dados Faltantes data ──────────────────────────────────────── */
type Urgency = "alta" | "média" | "baixa";

interface DataGap {
  id: string;
  icon: string;
  title: string;
  missing: string;          // o que falta
  impact: string;           // impacto de ter esse dado
  action: string;           // ação de política pública necessária
  agency: string;           // órgão responsável
  potentialValue: string;   // valor potencial desbloqueado
  urgency: Urgency;
}

const DATA_GAPS: DataGap[] = [
  {
    id: "rastreio-residuos",
    icon: "📡",
    title: "Rastreamento de Resíduos em Tempo Real",
    missing: "SINIR não disponibiliza dados granulares por unidade industrial. Apenas 34% dos municípios reportam ao sistema.",
    impact: "Sem dados por planta, é impossível calcular créditos de carbono reais (VCM) nem comprovar metas de circularidade para o CBAM.",
    action: "Obrigatoriedade de declaração eletrônica de resíduos via SINIR digital (similar ao SPED fiscal).",
    agency: "MMA · IBAMA",
    potentialValue: "R$ 8,2 bi/ano em VCM desbloqueado",
    urgency: "alta",
  },
  {
    id: "emissoes-unidade",
    icon: "🏭",
    title: "Emissões por Unidade Industrial",
    missing: "O SIRENE agrega dados por setor e estado, não por CNPJ de cada planta. Média mascara as piores plantas.",
    impact: "Política de descarbonização não consegue priorizar as plantas de maior impacto. CBAM não pode ser calculado planta a planta.",
    action: "Relatório anual obrigatório de emissões por CNPJ (protocolo GHG Protocol nacional + sancíono fiscal).",
    agency: "MCTI · MMA",
    potentialValue: "Priorização de R$ 42 bi em investimentos climáticos",
    urgency: "alta",
  },
  {
    id: "scope3",
    icon: "🔗",
    title: "Cadeia de Fornecedores (Escopo 3)",
    missing: "Não existe base nacional de emissões indiretas por cadeia produtiva. Apenas grandes exportadoras fazem apuração voluntária.",
    impact: "70% das emissões da indústria estão no Escopo 3. Sem esses dados, planos de descarbonização cobrem apenas 30% do problema.",
    action: "Obrigatoriedade de relatório Escopo 3 para empresas com receita > R$ 300M. Incentivo fiscal para PMEs aderentes.",
    agency: "BNDES · B3 (ESG) · CVM",
    potentialValue: "Acesso a mercados de exportação de US$ 180 bi (UE + EUA)",
    urgency: "alta",
  },
  {
    id: "preco-carbono",
    icon: "💹",
    title: "Preço de Carbono Interno (ETS)",
    missing: "O Brasil ainda não possui um Mercado Regulado de Carbono (MRC) operável. PL 182/2024 está em tramitação.",
    impact: "Sem preço de carbono, investimentos em descarbonização não têm ROI mensurável. Indústría não tem incentivo econômico claro.",
    action: "Aprovação e regulamentação do PL 182/2024. Definição de preço-piso de R$ 50/tCO₂ para os setores intensivos.",
    agency: "Senado · MFAE · MCTI",
    potentialValue: "R$ 15,3 bi em receita fiscal carbono/ano",
    urgency: "média",
  },
  {
    id: "agua-industrial",
    icon: "💧",
    title: "Consumo de Água por Processo Industrial",
    missing: "ANA possui dados de outorgas, mas não há cruzamento com processos industriais específicos por CNPJ.",
    impact: "Indústria síderúrrica e de cimento usam até 8m³/t de produto. Sem dado, não dá para medir eficiência hídrica nem certificar 'aço verde'.",
    action: "Cruzamento ANA-IBAMA-CNPJ em plataforma única. Relatório hídrico obrigatório integrado ao licenciamento ambiental.",
    agency: "ANA · MMA · IBAMA",
    potentialValue: "Certificação 'Green Steel' para exportação valorizada",
    urgency: "média",
  },
  {
    id: "logistica-residuos",
    icon: "🚚",
    title: "Logística de Resíduos Entre Indústrias",
    missing: "Não existe mapeamento público de oferta e demanda de resíduos entre indústrias (ex: quem gera escória vs quem pode absorver).",
    impact: "Potencial de economia circular de 26 Mt/ano de resíduos fica desperdiçado por falta de 'bolsa de resíduos' estruturada.",
    action: "Plataforma pública de 'Bolsa de Resíduos' (modelo REBIO/EU). Incentivo fiscal para transações de reaproveitamento entre CNPJ.",
    agency: "MDIC · BNDES · SEBRAE",
    potentialValue: "R$ 3,8 bi em economia de matéria-prima/ano",
    urgency: "baixa",
  },
];

const URGENCY_CONFIG: Record<Urgency, { label: string; color: string; bg: string; border: string }> = {
  alta:  { label: "Urgência Alta",  color: "var(--pid-coral-lt)", bg: "rgba(232,88,26,0.12)",  border: "rgba(232,88,26,0.4)" },
  média: { label: "Médio Prazo",   color: "#F9C784",            bg: "rgba(249,199,132,0.12)",border: "rgba(249,199,132,0.4)" },
  baixa: { label: "Longo Prazo",   color: "#7DD3FC",            bg: "rgba(125,211,252,0.12)",border: "rgba(125,211,252,0.4)" },
};

/* ─── Componente principal ─────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "var(--pid-navy)", color: "var(--pid-text)" }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-8"
        style={{
          height:       "var(--pid-header-h, 64px)",
          background:   "var(--pid-header-bg)",
          borderBottom: "1px solid var(--pid-border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-[var(--pid-text)]"
            style={{ color: "var(--pid-muted)" }}
          >
            <ArrowLeft size={13} />
            Voltar
          </Link>
          <span style={{ color: "var(--pid-border)" }}>|</span>
          <a href="https://emaisenergia.org/" target="_blank" rel="noopener noreferrer">
            <Logo height={64} />
          </a>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: "rgba(232,88,26,0.2)", color: "var(--pid-coral-lt)", fontSize: "10px" }}
          >
            INFRAESTRUTURA
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/copilot"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-90"
            style={{
              background: "rgba(232,88,26,0.12)",
              border:     "1px solid rgba(232,88,26,0.3)",
              color:      "var(--pid-coral-lt)",
            }}
          >
            <Image src="/assets/PNG/Ícone.png" alt="Copilot" width={13} height={13} />
            Abrir Copilot GIS
          </Link>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="px-8 py-8 max-w-6xl mx-auto space-y-8">

        {/* Título */}
        <div>
          <h1
            className="text-2xl font-bold pid-txt"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Panorama Executivo
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--pid-muted)" }}>
            Dados consolidados da Plataforma Interativa de Descarbonização · Mai 2026
          </p>
        </div>

        {/* ── KPIs ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPIS.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "var(--pid-surface2)",
                border:     "1px solid var(--pid-border)",
              }}
            >
              {/* Ícone com fundo semi-transparente */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border:     `1px solid rgba(255,255,255,0.08)`,
                }}
              >
                <KpiIcon name={kpi.iconName} color={kpi.color} />
              </div>

              <p className="text-xs mb-1" style={{ color: "var(--pid-muted)" }}>
                {kpi.label}
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: kpi.color, fontFamily: "'Space Grotesk', sans-serif" }}
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

        {/* ── Gráfico + Oportunidades ──────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Consumo por setor — barras CSS */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--pid-surface2)", border: "1px solid var(--pid-border)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 size={16} style={{ color: "var(--pid-coral)" }} />
              <h2
                className="text-sm font-semibold pid-txt"
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
                    <span style={{ color: "var(--pid-text)" }}>{s.value}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--pid-navy-md)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${s.pct}%`, background: barGradient(s.pct) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Oportunidades + CTA */}
          <div
            className="rounded-2xl p-6 flex flex-col justify-between"
            style={{ background: "var(--pid-surface2)", border: "1px solid var(--pid-border)" }}
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf size={16} style={{ color: "var(--pid-green)" }} />
                <h2
                  className="text-sm font-semibold pid-txt"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Oportunidades Identificadas
                </h2>
              </div>
              <div className="space-y-3">
                {OPPORTUNITIES.map((item) => (
                  <div
                    key={item.tag}
                    className="flex gap-3 p-3 rounded-xl"
                    style={{ background: "var(--pid-navy-lt)", border: "1px solid var(--pid-border)" }}
                  >
                    <span
                      className="flex-none text-xs font-semibold px-2 py-0.5 rounded-full h-fit mt-0.5"
                      style={{ color: item.color, border: `1px solid ${item.color}`, opacity: 0.85 }}
                    >
                      {item.tag}
                    </span>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--pid-text-sec)" }}>
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
                color:      "white",
              }}
            >
              <Map size={15} />
              Explorar no Mapa com o Copilot
            </Link>
          </div>
        </div>

        {/* ── Scorecard ESG ────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--pid-surface2)", border: "1px solid var(--pid-border)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Wind size={16} style={{ color: "#7DD3FC" }} />
              <h2
                className="text-sm font-semibold pid-txt"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Scorecard de Transição Energética
              </h2>
            </div>
            <span className="text-xs" style={{ color: "var(--pid-muted)" }}>
              Fonte: EPE · ANEEL · IEA · 2026
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {ESG_ITEMS.map((item) => (
              <div key={item.label} className="flex flex-col gap-2">
                <div className="flex items-end justify-between">
                  <span className="text-xs" style={{ color: "var(--pid-muted)" }}>{item.label}</span>
                  <span className="text-sm font-bold" style={{ color: item.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {item.value}%
                  </span>
                </div>
                {/* Barra de progresso circular emulada com CSS */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--pid-navy-md)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${item.value}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Mini insight */}
          <div
            className="mt-5 flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <Droplets size={14} style={{ color: "var(--pid-green)", marginTop: 1 }} />
            <p className="text-xs leading-relaxed" style={{ color: "var(--pid-text-sec)" }}>
              <strong style={{ color: "var(--pid-green)" }}>84% da matriz elétrica é renovável</strong> — o Brasil está entre os 5 países com maior participação de fontes limpas no mundo. A PID identifica os gargalos restantes e aponta onde investir.
            </p>
          </div>
        </div>

        {/* ── Resíduos & Circularidade ───────────────────────────── */}
        <div
          className="rounded-2xl p-6 space-y-6"
          style={{ background: "var(--pid-surface2)", border: "1px solid var(--pid-border)" }}
        >
          {/* Heading */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Recycle size={16} style={{ color: "var(--pid-green)" }} />
              <h2 className="text-sm font-semibold pid-txt" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Resíduos Industriais &amp; Circularidade
              </h2>
            </div>
            <span className="text-xs" style={{ color: "var(--pid-muted)" }}>
              Fonte: SINIR · IBGE · EPE · 2026
            </span>
          </div>

          {/* CBAM alert */}
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(232,88,26,0.08)", border: "1px solid rgba(232,88,26,0.3)" }}
          >
            <AlertTriangle size={14} style={{ color: "var(--pid-coral)", marginTop: 1, flexShrink: 0 }} />
            <p className="text-xs leading-relaxed" style={{ color: "var(--pid-text-sec)" }}>
              <strong style={{ color: "var(--pid-coral-lt)" }}>Alerta CBAM:</strong>{" "}
              A partir de 2026, exportações para a UE de aço, alumínio e cimento estarão sujeitas ao Carbon Border
              Adjustment Mechanism. Indústrias com alta circularidade reduzem a base de cálculo e economizam até{" "}
              <strong style={{ color: "var(--pid-coral-lt)" }}>R$ 5,8 mi/ano</strong> em taxas.
            </p>
          </div>

          {/* Two-col: fluxo + monetização */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Fluxo de resíduos */}
            <div>
              <p className="text-xs font-semibold mb-4" style={{ color: "var(--pid-muted)", letterSpacing: "0.07em" }}>
                FLUXO DE RESÍDUOS POR SETOR
              </p>
              <div className="space-y-4">
                {RESIDUE_FLOWS.map((r) => (
                  <div key={r.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-medium truncate" style={{ color: "var(--pid-text)" }}>{r.name}</span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded flex-none"
                          style={{ background: "var(--pid-navy-md)", color: "var(--pid-muted)" }}
                        >
                          {r.industry}
                        </span>
                      </div>
                      <span className="text-xs font-bold flex-none ml-2" style={{ color: r.color }}>{r.volume}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "var(--pid-navy-md)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${r.pct}%`, background: r.color, transition: "width 1s ease" }}
                      />
                    </div>
                    <p className="text-[10px]" style={{ color: "var(--pid-slate-lt)" }}>
                      <ArrowRight size={9} className="inline mr-0.5" />
                      {r.destination}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Oportunidades de monetização */}
            <div>
              <p className="text-xs font-semibold mb-4" style={{ color: "var(--pid-muted)", letterSpacing: "0.07em" }}>
                OPORTUNIDADES DE MONETIZAÇÃO
              </p>
              <div className="grid grid-cols-2 gap-3">
                {CIRCULAR_OPPS.map((op) => (
                  <div
                    key={op.tag}
                    className="p-3 rounded-xl"
                    style={{ background: "var(--pid-navy-lt)", border: `1px solid ${op.borderColor}` }}
                  >
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: op.borderColor, color: op.color }}
                    >
                      {op.tag}
                    </span>
                    <p className="text-xs font-semibold mt-2 mb-0.5 pid-txt">{op.title}</p>
                    <p className="text-[10px] mb-2" style={{ color: "var(--pid-muted)" }}>{op.desc}</p>
                    <p className="text-base font-bold" style={{ color: op.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                      {op.value}
                      <span className="text-xs font-normal ml-0.5" style={{ color: "var(--pid-muted)" }}>{op.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
              {/* Totais */}
              <div
                className="mt-3 flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
              >
                <div>
                  <p className="text-[10px]" style={{ color: "var(--pid-muted)" }}>Potencial total circular</p>
                  <p className="text-lg font-bold" style={{ color: "var(--pid-green)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    R$ 15,7 mi
                    <span className="text-xs font-normal ml-1" style={{ color: "var(--pid-muted)" }}>/ano</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px]" style={{ color: "var(--pid-muted)" }}>CO₂ evitado</p>
                  <p className="text-lg font-bold" style={{ color: "var(--pid-green)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    68k tCO₂e
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Matriz de troca entre indústrias */}
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--pid-muted)", letterSpacing: "0.07em" }}>
              MATRIZ DE TROCA ENTRE INDÚSTRIAS
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--pid-border)" }}>
                    {["Origem", "Destino", "Material", "Volume", "Status"].map((h) => (
                      <th key={h} className="text-left pb-2 pr-4 font-semibold" style={{ color: "var(--pid-muted)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MATERIAL_MATRIX.map((row, i) => {
                    const sc =
                      row.status === "ativo"
                        ? "var(--pid-green)"
                        : row.status === "parcial"
                        ? "#F9C784"
                        : "var(--pid-muted)";
                    const sl =
                      row.status === "ativo" ? "Ativo" : row.status === "parcial" ? "Parcial" : "Potencial";
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(30,58,86,0.5)" }}>
                        <td className="py-2.5 pr-4 font-medium" style={{ color: "var(--pid-coral-lt)" }}>{row.from}</td>
                        <td className="py-2.5 pr-4" style={{ color: "var(--pid-text-sec)" }}>{row.to}</td>
                        <td className="py-2.5 pr-4" style={{ color: "var(--pid-muted)" }}>{row.material}</td>
                        <td className="py-2.5 pr-4 font-mono" style={{ color: "var(--pid-text)" }}>{row.volume}</td>
                        <td className="py-2.5">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: `${sc}20`, color: sc, border: `1px solid ${sc}50` }}
                          >
                            {sl}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Dados Faltantes como Oportunidade de Política Pública ── */}
        <div
          className="rounded-2xl p-6 space-y-6"
          style={{ background: "var(--pid-surface2)", border: "1px solid var(--pid-border)" }}
        >
          {/* Heading */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileQuestion size={16} style={{ color: "var(--pid-coral)" }} />
                <h2 className="text-sm font-semibold pid-txt" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Dados Faltantes como Oportunidade de Política Pública
                </h2>
              </div>
              <p className="text-xs" style={{ color: "var(--pid-muted)" }}>
                Lacunas de dados não são limitações — são agendas de política pública que a PID identifica e quantifica.
              </p>
            </div>
            <div className="flex gap-2 flex-none">
              {(["alta", "média", "baixa"] as Urgency[]).map((u) => {
                const cfg = URGENCY_CONFIG[u];
                return (
                  <span
                    key={u}
                    className="text-[10px] font-semibold px-2 py-1 rounded-full"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                  >
                    {cfg.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Insight box */}
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(125,211,252,0.06)", border: "1px solid rgba(125,211,252,0.2)" }}
          >
            <Building2 size={14} style={{ color: "#7DD3FC", marginTop: 1, flexShrink: 0 }} />
            <p className="text-xs leading-relaxed" style={{ color: "var(--pid-text-sec)" }}>
              O Brasil possui <strong style={{ color: "#7DD3FC" }}>84% de matriz renovável</strong>, mas falta rastreabilidade para
              monetizar esse ativo. Cada lacuna de dado listada abaixo representa uma janela de política pública que, se resolvida,
              pode desbloquear <strong style={{ color: "#7DD3FC" }}>mais de R$ 27 bi/ano</strong> em créditos, eficiência e acesso a mercados internacionais.
            </p>
          </div>

          {/* Gap cards grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {DATA_GAPS.map((gap) => {
              const urg = URGENCY_CONFIG[gap.urgency];
              return (
                <div
                  key={gap.id}
                  className="rounded-xl p-4 space-y-3"
                  style={{ background: "var(--pid-navy-lt)", border: `1px solid ${urg.border}` }}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{gap.icon}</span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--pid-text)", fontFamily: "'Space Grotesk', sans-serif" }}>
                          {gap.title}
                        </p>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: urg.bg, color: urg.color }}
                        >
                          {urg.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Missing data */}
                  <div className="rounded-lg px-3 py-2" style={{ background: "rgba(0,0,0,0.2)", border: "1px dashed rgba(122,155,191,0.3)" }}>
                    <p className="text-[10px] font-semibold mb-0.5" style={{ color: "var(--pid-muted)" }}>O QUE FALTA</p>
                    <p className="text-xs" style={{ color: "var(--pid-text-sec)" }}>{gap.missing}</p>
                  </div>

                  {/* Impact + Action in two mini columns */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] font-semibold mb-0.5" style={{ color: "var(--pid-coral-lt)" }}>IMPACTO SEM O DADO</p>
                      <p className="text-[11px] leading-relaxed" style={{ color: "var(--pid-text-sec)" }}>{gap.impact}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold mb-0.5" style={{ color: urg.color }}>AÇÃO NECESSÁRIA</p>
                      <p className="text-[11px] leading-relaxed" style={{ color: "var(--pid-text-sec)" }}>{gap.action}</p>
                    </div>
                  </div>

                  {/* Footer: agency + potential value */}
                  <div
                    className="flex items-center justify-between pt-2"
                    style={{ borderTop: "1px solid var(--pid-border)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <ExternalLink size={10} style={{ color: "var(--pid-muted)" }} />
                      <span className="text-[10px] font-medium" style={{ color: "var(--pid-muted)" }}>{gap.agency}</span>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: urg.bg, color: urg.color }}
                    >
                      {gap.potentialValue}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA footer */}
          <div
            className="flex items-center justify-between px-5 py-4 rounded-xl"
            style={{ background: "rgba(232,88,26,0.08)", border: "1px solid rgba(232,88,26,0.25)" }}
          >
            <div>
              <p className="text-sm font-semibold pid-txt" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                A PID pode ser o repositório nacional dessas lacunas
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--pid-muted)" }}>
                Cada dado coletado aqui alimenta o argumento para políticas públicas mais eficazes — e desbloqueia investimento privado.
              </p>
            </div>
            <Link
              href="/copilot"
              className="flex-none flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, var(--pid-coral), var(--pid-coral-dk))", color: "white" }}
            >
              <Map size={13} />
              Explorar no Copilot
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
