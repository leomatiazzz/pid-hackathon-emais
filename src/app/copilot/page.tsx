"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import ChatInterface from "@/components/ChatInterface";
import MapViewer from "@/components/MapViewer";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import type { MapState } from "@/types/map";
import { X, ChevronLeft } from "lucide-react";

const CHAT_MIN = 280;
const CHAT_MAX = 580;
const CHAT_DEFAULT = 380;

export default function CopilotPage() {
  const [mapState, setMapState] = useState<MapState>({
    showGreenSteelLayer: false,
    activeLayer: null,
  });

  // ── Estado da sidebar retrátil + largura ajustável ─────────────────
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(CHAT_DEFAULT);
  const [isResizing, setIsResizing] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(CHAT_DEFAULT);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    setIsResizing(true); // <-- AVISA O REACT QUE COMEÇOU A ARRASTAR
    startX.current = e.clientX;
    startWidth.current = chatWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = ev.clientX - startX.current;
      const next = Math.min(CHAT_MAX, Math.max(CHAT_MIN, startWidth.current + delta));
      setChatWidth(next);
    };
    
    const onUp = () => {
      isDragging.current = false;
      setIsResizing(false); // <-- AVISA O REACT QUE PAROU DE ARRASTAR
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [chatWidth]);

  const handleMapStateChange = (newState: Partial<MapState>) => {
    setMapState((prev) => ({ ...prev, ...newState }));
  };

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-(--pid-navy)">

      {/* ══════════════════════════════════════════════════════════
          HEADER — fixo no topo (var(--pid-header-h) = 80px)
          ══════════════════════════════════════════════════════════ */}
      <header
        className="flex-none flex items-center justify-between px-6 z-50"
        style={{
          height: "var(--pid-header-h, 80px)",
          background: "var(--pid-header-bg)",
          borderBottom: "1px solid var(--pid-border)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Logo — clica para emaisenergia.org */}
        <div className="flex items-center gap-3">
          <a href="https://emaisenergia.org/" target="_blank" rel="noopener noreferrer">
            <Logo height={64} />
          </a>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              background: "rgba(232,88,26,0.2)",
              color: "var(--pid-coral-lt)",
              fontSize: "10px",
            }}
          >
            COPILOT
          </span>
        </div>

        {/* Nav links */}
        <nav
          className="flex items-center gap-5 text-xs"
          style={{ color: "var(--pid-text)" }}
        >
          <Link href="/" className="hover:opacity-70 transition-opacity">Início</Link>
          <Link href="/infra" className="hover:opacity-70 transition-opacity">Infraestrutura</Link>
          <Link href="/industrias" className="hover:opacity-70 transition-opacity">Indústrias</Link>
          <span className="hover:opacity-70 cursor-pointer transition-opacity">Saiba mais</span>

          {/* Botão toggle Copilot com ícone real */}
          <button
            id="btn-toggle-copilot"
            onClick={() => setIsCopilotOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background: isCopilotOpen ? "rgba(232,88,26,0.18)" : "rgba(255,255,255,0.06)",
              color: isCopilotOpen ? "var(--pid-coral-lt)" : "var(--pid-muted)",
              border: `1px solid ${isCopilotOpen ? "rgba(232,88,26,0.4)" : "var(--pid-border)"}`,
            }}
            aria-label={isCopilotOpen ? "Fechar painel do Copilot" : "Abrir painel do Copilot"}
          >
            {isCopilotOpen ? (
              <><X size={13} /> Fechar Copilot</>
            ) : (
              <>
                <Image src="/assets/PNG/Ícone.png" alt="Copilot" width={13} height={13} />
                Abrir Copilot
              </>
            )}
          </button>

          <ThemeToggle />
        </nav>

        {/* Right side — status */}
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--pid-muted)" }}>
          {mapState.showGreenSteelLayer && (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(34,197,94,0.15)",
                color: "var(--pid-green)",
                border: "1px solid rgba(34,197,94,0.3)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-(--pid-green) animate-pulse inline-block" />
              Aço Verde Ativo
            </span>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          BODY — flex-row com sidebar retrátil + mapa expansível
          ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Sidebar do Copilot ─────────────────────────────────
            Largura dinâmica (chatWidth). Transição desativada durante drag.
        ────────────────────────────────────────────────────────── */}
        <div
          className="flex-none overflow-hidden"
          style={{
            width:    isCopilotOpen ? chatWidth : 0,
            maxWidth: isCopilotOpen ? chatWidth : 0,
            opacity:  isCopilotOpen ? 1 : 0,
            transition: isResizing ? "none" : "width 0.3s ease, max-width 0.3s ease, opacity 0.3s ease",
            borderRight: isCopilotOpen ? "1px solid var(--pid-border)" : "none",
          }}
          aria-hidden={!isCopilotOpen}
        >
          {/* Mantemos o chat montado (não desmontado) para não perder o histórico */}
          <div style={{ width: chatWidth }} className="h-full">
            <ChatInterface
              onMapStateChange={handleMapStateChange}
              mapState={mapState}
            />
          </div>
        </div>

        {/* ── Drag handle (resize) ────────────────────────────────── */}
        {isCopilotOpen && (
          <div
            onMouseDown={onDragStart}
            className="flex-none flex items-center justify-center z-900 group"
            style={{
              width: 6,
              cursor: "col-resize",
              flexShrink: 0,
            }}
            title="Arraste para redimensionar o chat"
          >
            <div
              className="h-full w-px transition-all duration-150 relative"
              style={{ background: "var(--pid-border)" }}
            >
              {/* Pill central — aparece no hover */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{
                  width: 4,
                  height: 48,
                  background: "var(--pid-coral)",
                  boxShadow: "0 0 10px rgba(232,88,26,0.55)",
                }}
              />
            </div>
          </div>
        )}

        {/* ── Mapa — ocupa todo o espaço restante ──────────────── */}
        <div className="flex-1 relative min-w-0 h-full">
          <MapViewer mapState={mapState} onMapStateChange={handleMapStateChange} />

          {/* Aba flutuante para reabrir o Copilot quando fechado */}
          {!isCopilotOpen && (
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="absolute top-1/2 left-3 -translate-y-1/2 z-1001
                         flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg
                         transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "rgba(13,27,42,0.92)",
                border: "1px solid var(--pid-border)",
                color: "var(--pid-coral-lt)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}
              aria-label="Abrir painel do Copilot"
            >
              <Image src="/assets/PNG/Ícone.png" alt="Copilot" width={16} height={16} />
              <ChevronLeft size={12} style={{ color: "var(--pid-muted)" }} />
              <span
                className="text-[9px] font-semibold tracking-widest"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: "rotate(180deg)",
                  color: "var(--pid-muted)",
                  letterSpacing: "0.12em",
                }}
              >
                COPILOT
              </span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
