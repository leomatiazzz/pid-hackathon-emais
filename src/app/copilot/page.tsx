"use client";

import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import MapViewer from "@/components/MapViewer";

export type MapState = {
  showGreenSteelLayer: boolean;
  activeLayer: string | null;
};

export default function CopilotPage() {
  const [mapState, setMapState] = useState<MapState>({
    showGreenSteelLayer: false,
    activeLayer: null,
  });

  const handleMapStateChange = (newState: Partial<MapState>) => {
    setMapState((prev) => ({ ...prev, ...newState }));
  };

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[var(--pid-navy)]">
      {/* ── Header bar ───────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14"
        style={{
          background: "rgba(13,27,42,0.95)",
          borderBottom: "1px solid var(--pid-border)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--pid-coral)" }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span
              className="font-bold text-sm tracking-wide text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              PID
            </span>
            <span
              className="text-xs ml-1.5 px-1.5 py-0.5 rounded"
              style={{
                background: "rgba(232,88,26,0.2)",
                color: "var(--pid-coral-lt)",
                fontSize: "10px",
              }}
            >
              COPILOT
            </span>
          </div>
        </div>

        <nav
          className="flex items-center gap-6 text-xs"
          style={{ color: "var(--pid-muted)" }}
        >
          <span>Início</span>
          <span>Infraestrutura</span>
          <span>Indústrias</span>
          <span style={{ color: "var(--pid-coral-lt)" }}>PID</span>
          <span>Saiba mais</span>
        </nav>

        <div
          className="flex items-center gap-3 text-xs"
          style={{ color: "var(--pid-muted)" }}
        >
          {mapState.showGreenSteelLayer && (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(34,197,94,0.15)",
                color: "var(--pid-green)",
                border: "1px solid rgba(34,197,94,0.3)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--pid-green)] animate-pulse inline-block" />
              Aço Verde Ativo
            </span>
          )}
          <span
            className="px-2 py-0.5 rounded"
            style={{
              background: "var(--pid-surface2)",
              color: "var(--pid-muted)",
            }}
          >
            PT
          </span>
          <span style={{ color: "var(--pid-border)" }}>|</span>
          <span>EN</span>
        </div>
      </div>

      {/* ── Split Layout ──────────────────────────────────────── */}
      <div className="flex w-full h-full pt-14">
        <div
          className="flex-none w-[35%] h-full border-r"
          style={{ borderColor: "var(--pid-border)" }}
        >
          <ChatInterface
            onMapStateChange={handleMapStateChange}
            mapState={mapState}
          />
        </div>
        <div className="flex-1 h-full">
          <MapViewer mapState={mapState} />
        </div>
      </div>
    </main>
  );
}
