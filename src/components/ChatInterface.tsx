"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Zap,
  Factory,
  BarChart2,
  Layers,
  Sparkles,
  MapPin,
} from "lucide-react";
import type { MapState } from "@/types/map";

/* ─── Types ─────────────────────────────────────────────────── */
type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isTyping?: boolean;
  kpis?: KPI[];
}

interface KPI {
  label: string;
  value: string;
  unit?: string;
  color?: string;
}

interface Suggestion {
  icon: React.ReactNode;
  label: string;
  query: string;
}

/* ─── API Integration ────────────────────────────────────────── */
const PID_API_BASE = "http://localhost:5280/api";

/**
 * Extrai o setor mencionado na query para passar ao endpoint /industries.
 * Retorna null se nenhum setor específico for detectado (retorna todos).
 */
function extractSector(query: string): string | null {
  const q = query.toLowerCase();
  if (q.includes("aço verde") || q.includes("aco verde")) return "Aço Verde";
  if (q.includes("alumin"))                                 return "Aluminio";
  if (q.includes("quím") || q.includes("quim"))            return "Quimica";
  if (q.includes("ciment"))                                 return "Cimenteira";
  if (q.includes("fertiliz"))                               return "Fertilizantes";
  if (q.includes("aliment"))                                return "Alimenticia";
  if (q.includes("hidrog") || q.includes("h2"))            return null; // roteado separado
  return null; // sem setor → retorna todas
}

/** Detecta se a query é sobre hidrogênio */
function isHydrogenQuery(q: string) {
  const l = q.toLowerCase();
  return l.includes("hidrog") || l.includes("h2v") || l.includes("h₂");
}

/** Detecta se a query é sobre infraestrutura elétrica */
function isInfraQuery(q: string) {
  const l = q.toLowerCase();
  return (
    l.includes("infraestrutura") ||
    l.includes("usina") ||
    l.includes("transmiss") ||
    l.includes("hub") ||
    l.includes("descarboniz")
  );
}

/** Detecta se a query é sobre panorama industrial / aço verde */
function isIndustryQuery(q: string) {
  const l = q.toLowerCase();
  return (
    l.includes("panorama") ||
    l.includes("consumo") ||
    l.includes("indústr") ||
    l.includes("industr") ||
    l.includes("aço") ||
    l.includes("aco") ||
    l.includes("alumin") ||
    l.includes("quím") ||
    l.includes("setor")
  );
}

/** Formata a resposta de /api/industries em texto de chat + KPIs */
function formatIndustriesResponse(data: Record<string, unknown>, sector: string | null): {
  text: string;
  kpis: KPI[];
  activateGreenSteel: boolean;
} {
  const total = (data.totalIndustriesReal as number) ?? 0;
  const consumo = (data.totalConsumoFormatted as string) ?? "—";
  const items = (data.data as Array<Record<string, unknown>>) ?? [];
  const activateGreenSteel =
    !sector || sector.toLowerCase().includes("aço") || sector.toLowerCase().includes("aco");

  let text: string;

  if (!sector) {
    // Resposta geral
    text =
      `A API PID retornou **${total} indústrias** cadastradas, somando um consumo total de **${consumo}**. ` +
      `O setor de **Alumínio** lidera com ~11M MWh, seguido pelo **Aço** (~7M MWh), Química (~5M MWh) e Alimentícia (~3M MWh).\n\n` +
      `Acabei de ativar no mapa a camada de **Aço Verde** para sua visualização. ` +
      `Os marcadores em verde indicam instalações com potencial de descarbonização na região Sudeste/Sul.`;
  } else {
    const leader = items[0]
      ? `**${items[0].nome as string}** (${items[0].estado as string}, ${((items[0].consumoMWh as number) / 1_000_000).toFixed(1)}M MWh)`
      : "—";
    text =
      `Filtro **${sector}** aplicado via PID.Api: encontrei **${total} instalações** com consumo total de **${consumo}**.\n\n` +
      `Maior consumidor: ${leader}. ` +
      (activateGreenSteel
        ? `Camada **Aço Verde** ativada no mapa — observe os marcadores verdes no Sudeste/Sul.`
        : `Dados atualizados com base em IBGE e MapBiomas.`);
  }

  const kpis: KPI[] = [
    { label: "Indústrias encontradas", value: String(total), color: "var(--pid-coral)" },
    { label: "Consumo Total", value: consumo, color: "#F9C784" },
    { label: "Filtro", value: sector ?? "Todas", color: "var(--pid-muted)" },
    { label: "Camada Ativa", value: activateGreenSteel ? "Aço Verde" : "—", color: "var(--pid-green)" },
  ];

  return { text, kpis, activateGreenSteel };
}

/** Formata a resposta de /api/hydrogen */
function formatHydrogenResponse(data: Record<string, unknown>): { text: string; kpis: KPI[] } {
  const total = (data.totalHubs as number) ?? 0;
  const ativos = (data.ativosCount as number) ?? 0;
  const hubs = (data.data as Array<Record<string, unknown>>) ?? [];
  const hubList = hubs
    .slice(0, 3)
    .map((h) => `**${h.nome as string}** (${h.estado as string} · ${h.status as string})`)
    .join(", ");

  return {
    text:
      `A PID.Api identificou **${total} projetos** de Hidrogênio Verde no Brasil, dos quais **${ativos} estão ativos**.\n\n` +
      `Destaques: ${hubList} e outros. A capacidade combinada ultrapassa 1.700 kt/ano.\n\n` +
      `Dados consolidados do IEA H₂ Projects Database e EPE Painel H₂.`,
    kpis: [
      { label: "Total de HUBs H₂", value: String(total), color: "var(--pid-coral)" },
      { label: "Ativos", value: String(ativos), color: "var(--pid-green)" },
      { label: "Planejados", value: String(total - ativos), color: "#F9C784" },
      { label: "Fonte", value: "IEA + EPE", color: "var(--pid-muted)" },
    ],
  };
}

/** Formata a resposta de /api/infrastructure */
function formatInfraResponse(data: Record<string, unknown>): { text: string; kpis: KPI[] } {
  const d = (data.data as Record<string, unknown>) ?? {};
  const hidro = d.usinaHidreletrica as Record<string, unknown>;
  const eolica = d.eolicaESolar as Record<string, unknown>;

  return {
    text:
      `A infraestrutura do setor elétrico brasileiro (SIGEL-ANEEL / EPE) conta com ` +
      `**${(hidro?.count as number)?.toLocaleString("pt-BR") ?? "—"} usinas hidrelétricas** ` +
      `(${((hidro?.capacidadeMW as number) / 1000).toFixed(0)} GW) e ` +
      `**${(eolica?.count as number)?.toLocaleString("pt-BR") ?? "—"} instalações eólicas/solares** ` +
      `(${((eolica?.capacidadeMW as number) / 1000).toFixed(0)} GW).\n\n` +
      `A malha de transmissão cobre **180 mil km**, com tensão máxima de 765 kV. ` +
      `Existem 4 Hubs de Descarbonização ativos ou em implantação no país.`,
    kpis: [
      { label: "UHEs", value: (hidro?.count as number)?.toLocaleString("pt-BR") ?? "—", color: "var(--pid-coral)" },
      { label: "Eólica + Solar", value: (eolica?.count as number)?.toLocaleString("pt-BR") ?? "—", color: "#F9C784" },
      { label: "Transmissão", value: "180mil km", color: "var(--pid-muted)" },
      { label: "Hubs Descarbon.", value: "4", color: "var(--pid-green)" },
    ],
  };
}

/* ─── Demo fallback (mantido intacto para resiliência) ───────── */
const DEMO_RESPONSE_TEXT =
  "Atualmente temos **326 indústrias** cadastradas na PID, somando um consumo total de **30,4M MWh**. " +
  "O setor de **Alumínio** lidera com ~11M MWh, seguido pelo **Aço** (~7M MWh), Química (~5M MWh) e Alimentícia (~3M MWh).\n\n" +
  "Acabei de ativar no mapa a camada de **Aço Verde** para sua visualização. Os marcadores em verde indicam instalações com potencial de descarbonização na região Sudeste/Sul.";

const DEMO_KPIS: KPI[] = [
  { label: "Total de Indústrias", value: "326", color: "var(--pid-coral)" },
  { label: "Consumo Total", value: "30,4M", unit: "MWh", color: "#F9C784" },
  { label: "Setor Líder", value: "Alumínio", unit: "~11M MWh", color: "var(--pid-muted)" },
  { label: "Camada Ativa", value: "Aço Verde", color: "var(--pid-green)" },
];

/* ─── Suggestions ───────────────────────────────────────────── */
const SUGGESTIONS: Suggestion[] = [
  {
    icon: <BarChart2 size={12} />,
    label: "Panorama das Indústrias",
    query:
      "Faça um panorama do consumo das indústrias cadastradas e destaque as instalações de Aço Verde.",
  },
  {
    icon: <Zap size={12} />,
    label: "Fontes de Energia",
    query: "Quais são as principais fontes de energia na infraestrutura?",
  },
  {
    icon: <MapPin size={12} />,
    label: "Hubs de Descarbonização",
    query: "Onde estão os Hubs de Descarbonização no Brasil?",
  },
  {
    icon: <Layers size={12} />,
    label: "Camadas disponíveis",
    query: "Quais camadas de dados estão disponíveis na plataforma?",
  },
];

/* ─── Bold text renderer ─────────────────────────────────────── */
function renderBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ color: "white", fontWeight: 600 }}>
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

/* ─── Props ─────────────────────────────────────────────────── */
interface ChatInterfaceProps {
  onMapStateChange: (state: Partial<MapState>) => void;
  mapState: MapState;
}

/* ─── Component ─────────────────────────────────────────────── */
export default function ChatInterface({ onMapStateChange, mapState }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Olá! Sou o **PID Copilot**, seu assistente de análise geoespacial para descarbonização no Brasil. Posso ajudá-lo a explorar camadas de dados, analisar consumo industrial e identificar oportunidades de transição energética.\n\nComo posso ajudar hoje?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addMessage = (msg: Omit<Message, "id" | "timestamp">) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: crypto.randomUUID(), timestamp: new Date() },
    ]);
  };

  const handleSend = async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || isTyping) return;

    setInput("");
    addMessage({ role: "user", text: query });
    setIsTyping(true);

    // ── Tenta chamada real à PID.Api ──────────────────────────
    try {
      let responseText = "";
      let responseKpis: KPI[] = [];
      let shouldActivateGreenSteel = false;

      if (isHydrogenQuery(query)) {
        // ── Rota: /api/hydrogen ─────────────────────────────────
        const res = await fetch(`${PID_API_BASE}/hydrogen`, {
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as Record<string, unknown>;
        const formatted = formatHydrogenResponse(data);
        responseText = formatted.text;
        responseKpis = formatted.kpis;

      } else if (isInfraQuery(query)) {
        // ── Rota: /api/infrastructure ──────────────────────────
        const res = await fetch(`${PID_API_BASE}/infrastructure`, {
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as Record<string, unknown>;
        const formatted = formatInfraResponse(data);
        responseText = formatted.text;
        responseKpis = formatted.kpis;

      } else if (isIndustryQuery(query)) {
        // ── Rota: /api/industries (com filtro opcional) ─────────
        const sector = extractSector(query);
        const url = sector
          ? `${PID_API_BASE}/industries?sector=${encodeURIComponent(sector)}`
          : `${PID_API_BASE}/industries`;

        const res = await fetch(url, {
          signal: AbortSignal.timeout(8000),
        });

        if (res.status === 404) {
          // Setor inexistente → fallback gracioso sem lançar erro
          responseText =
            `Não encontrei indústrias para o setor **"${sector}"** na base de dados PID. ` +
            `Setores disponíveis: Aço, Aço Verde, Alumínio, Química, Cimenteira, Fertilizantes, Alimentícia.`;
          responseKpis = [];
        } else {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json() as Record<string, unknown>;
          const formatted = formatIndustriesResponse(data, sector);
          responseText = formatted.text;
          responseKpis = formatted.kpis;
          shouldActivateGreenSteel = formatted.activateGreenSteel;
        }

      } else {
        // ── Query genérica — sem rota de API correspondente ────
        responseText =
          "Posso ajudá-lo a consultar **indústrias por setor**, **HUBs de Hidrogênio Verde** " +
          "ou a **infraestrutura elétrica** do Brasil. Experimente:\n\n" +
          "• _\"Faça um panorama das indústrias de Aço Verde\"_\n" +
          "• _\"Quais são os HUBs de hidrogênio ativos?\"_\n" +
          "• _\"Mostre a infraestrutura de transmissão\"_";
      }

      setIsTyping(false);

      // ── Atualiza o mapa (sempre, independente do resultado) ──
      if (shouldActivateGreenSteel) {
        onMapStateChange({ showGreenSteelLayer: true, activeLayer: "acoVerde" });
      }

      addMessage({ role: "assistant", text: responseText, kpis: responseKpis.length ? responseKpis : undefined });

    } catch (err) {
      // ── Fallback de segurança: backend offline ou CORS ───────
      console.warn("[PID Copilot] API indisponível — usando dados de demonstração:", err);

      setIsTyping(false);

      // O mapa SEMPRE reage, mesmo no fallback
      if (isIndustryQuery(query)) {
        onMapStateChange({ showGreenSteelLayer: true, activeLayer: "acoVerde" });
      }

      addMessage({
        role: "assistant",
        text:
          `⚠️ API temporariamente indisponível — exibindo dados de demonstração.\n\n` +
          DEMO_RESPONSE_TEXT,
        kpis: DEMO_KPIS,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--pid-surface)" }}>
      {/* ── Chat header ────────────────────────────────────────── */}
      <div className="flex-none px-5 py-4 border-b"
           style={{ borderColor: "var(--pid-border)", background: "var(--pid-surface2)" }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: "linear-gradient(135deg, var(--pid-coral), var(--pid-coral-dk))" }}>
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--pid-green)] border-2"
                  style={{ borderColor: "var(--pid-surface2)" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white"
               style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              PID Copilot
            </p>
            <p className="text-xs" style={{ color: "var(--pid-muted)" }}>
              Assistente de Descarbonização · Online
            </p>
            {/* ── Status badges ── */}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {mapState.showGreenSteelLayer && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: "rgba(34, 197, 94, 0.15)", color: "var(--pid-green)" }}>
                  🟢 Aço Verde
                </span>
              )}
              {mapState.activeLayer && mapState.activeLayer !== "default" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: "rgba(6, 182, 212, 0.15)", color: "#06B6D4" }}>
                  🔷 {mapState.activeLayer === "eol" && "Eólica"}
                  {mapState.activeLayer === "uhe" && "Hidrelétrica"}
                  {mapState.activeLayer === "ute" && "Térmica"}
                  {mapState.activeLayer === "ufv" && "Solar"}
                  {mapState.activeLayer === "acoVerde" && "Aço Verde"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Messages area ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}
               className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse msg-user" : "msg-bot"}`}>
            {/* Avatar */}
            <div className="flex-none">
              {msg.role === "assistant" ? (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                     style={{ background: "linear-gradient(135deg, var(--pid-coral), var(--pid-coral-dk))" }}>
                  <Bot size={14} className="text-white" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                     style={{ background: "var(--pid-slate)" }}>
                  <User size={14} className="text-white" />
                </div>
              )}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col gap-2 max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                   style={
                     msg.role === "user"
                       ? {
                           background: "linear-gradient(135deg, var(--pid-coral), var(--pid-coral-dk))",
                           color: "white",
                           borderRadius: "18px 4px 18px 18px",
                         }
                       : {
                           background: "var(--pid-navy-lt)",
                           color: "#C8DDF0",
                           border: "1px solid var(--pid-border)",
                           borderRadius: "4px 18px 18px 18px",
                         }
                   }>
                {msg.text.split("\n\n").map((para, i) => (
                  <p key={i} className={i > 0 ? "mt-2" : ""}>
                    {renderBold(para)}
                  </p>
                ))}
              </div>

              {/* KPI Cards */}
              {msg.kpis && (
                <div className="grid grid-cols-2 gap-2 w-full fade-in-up">
                  {msg.kpis.map((kpi, i) => (
                    <div key={i} className="px-3 py-2.5 rounded-xl"
                         style={{ background: "var(--pid-navy-md)", border: "1px solid var(--pid-border)" }}>
                      <p className="text-xs mb-0.5" style={{ color: "var(--pid-muted)" }}>
                        {kpi.label}
                      </p>
                      <p className="text-base font-bold" style={{ color: kpi.color ?? "white", fontFamily: "'Space Grotesk', sans-serif" }}>
                        {kpi.value}
                      </p>
                      {kpi.unit && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--pid-muted)" }}>
                          {kpi.unit}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <span className="text-xs" style={{ color: "var(--pid-slate-lt)" }}>
                {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 msg-bot">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-none"
                 style={{ background: "linear-gradient(135deg, var(--pid-coral), var(--pid-coral-dk))" }}>
              <Bot size={14} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                 style={{ background: "var(--pid-navy-lt)", border: "1px solid var(--pid-border)", borderRadius: "4px 18px 18px 18px" }}>
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggestion chips ────────────────────────────────────── */}
      {messages.length <= 1 && (
        <div className="flex-none px-4 pb-2 fade-in-up">
          <p className="text-xs mb-2" style={{ color: "var(--pid-muted)" }}>
            Sugestões rápidas:
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s.label} className="chip" onClick={() => handleSend(s.query)}>
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input bar ───────────────────────────────────────────── */}
      <div className="flex-none p-4 border-t" style={{ borderColor: "var(--pid-border)", background: "var(--pid-surface2)" }}>
        <div className="flex items-end gap-3 px-4 py-3 rounded-2xl"
             style={{ background: "var(--pid-navy-lt)", border: "1px solid var(--pid-border)" }}>
          <Factory size={16} className="flex-none mb-0.5" style={{ color: "var(--pid-muted)" }} />
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre camadas, indústrias, consumo energético..."
            rows={1}
            className="chat-input flex-1 bg-transparent resize-none text-sm leading-relaxed"
            style={{
              color: "#E2EDF8",
              maxHeight: "120px",
              outline: "none",
              border: "none",
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="flex-none w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: input.trim() && !isTyping
                ? "linear-gradient(135deg, var(--pid-coral), var(--pid-coral-dk))"
                : "var(--pid-slate)",
              transform: input.trim() && !isTyping ? "scale(1)" : "scale(0.9)",
            }}>
            <Send size={14} className="text-white" style={{ marginLeft: "1px" }} />
          </button>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: "var(--pid-slate-lt)" }}>
          PID Copilot · Dados: EPE, ANEEL, ONS, MME
        </p>
      </div>
    </div>
  );
}
