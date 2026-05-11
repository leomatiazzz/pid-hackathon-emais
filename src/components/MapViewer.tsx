"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { MapState } from "@/types/map";
import { Layers, Info, ChevronRight, ChevronLeft, Eye, EyeOff } from "lucide-react";

// ArcGIS SDK uses browser-only APIs (WebGL, Workers) — must be SSR-disabled
const ArcGISMap = dynamic(() => import("./ArcGISMap"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "var(--pid-navy)" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--pid-coral)" }}
        />
        <span className="text-xs" style={{ color: "var(--pid-muted)" }}>
          Carregando motor ArcGIS…
        </span>
      </div>
    </div>
  ),
});

interface MapViewerProps {
  mapState: MapState;
  onMapStateChange?: (s: Partial<MapState>) => void;
}

/* ─── Definição das camadas para legenda + painel ─────────────── */
interface LegendLayer {
  key: string;
  group: string;
  label: string;
  color: string;
  shape: "circle" | "star" | "diamond";
  available: boolean; // false = placeholder / em breve
  mapStateKey?: keyof MapState; // se controla algo no mapState
}

const LEGEND_LAYERS: LegendLayer[] = [
  {
    key: "hubs",
    group: "Hubs de Descarbonização",
    label: "Hub existente",
    color: "#9333EA",
    shape: "circle",
    available: false,
  },
  {
    key: "portos",
    group: "Instalações Portuárias",
    label: "Porto / Terminal",
    color: "#38BDF8",
    shape: "star",
    available: false,
  },
  {
    key: "biomassa",
    group: "Biomassa",
    label: "Biomassa existente (UTE)",
    color: "#22C55E",
    shape: "circle",
    available: true,
  },
  {
    key: "biometano",
    group: "Biometano Comercial",
    label: "Biometano comercial",
    color: "#F97316",
    shape: "circle",
    available: false,
  },
  {
    key: "eolica",
    group: "Eólica",
    label: "Eólica existente (EOL)",
    color: "#06B6D4",
    shape: "circle",
    available: true,
  },
  {
    key: "solar",
    group: "Solar",
    label: "Solar UFV existente",
    color: "#FBBF24",
    shape: "circle",
    available: true,
  },
  {
    key: "uhe",
    group: "Hidrelétrica",
    label: "Hidrelétrica UHE existente",
    color: "#374151",
    shape: "circle",
    available: true,
  },
  {
    key: "pch",
    group: "Hidrelétrica",
    label: "Hidrelétrica PCH existente",
    color: "#64748B",
    shape: "circle",
    available: true,
  },
  {
    key: "aco-verde",
    group: "Aço Verde",
    label: "Projeto Aço Verde",
    color: "#22C55E",
    shape: "diamond",
    available: false,
    mapStateKey: "showGreenSteelLayer",
  },
];

/* ─── Shape marker SVG ────────────────────────────────────────── */
function ShapeMarker({ color, shape }: { color: string; shape: LegendLayer["shape"] }) {
  if (shape === "star") {
    return (
      <svg width={12} height={12} viewBox="0 0 24 24" fill={color}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    );
  }
  if (shape === "diamond") {
    return (
      <svg width={10} height={10} viewBox="0 0 20 20" fill={color}>
        <polygon points="10,1 19,10 10,19 1,10" />
      </svg>
    );
  }
  return (
    <span
      className="flex-none rounded-full"
      style={{ width: 10, height: 10, background: color, display: "inline-block" }}
    />
  );
}

export default function MapViewer({ mapState, onMapStateChange }: MapViewerProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* ── ArcGIS map (fills entire panel, SSR-disabled) ── */}
      <ArcGISMap mapState={mapState} />

      {/* ── Painel de Camadas (direita, retrátil) ─────────────────── */}
      <div
        className="absolute top-4 right-0 z-1000 flex items-stretch"
        style={{ height: "auto" }}
      >
        {/* Aba de abertura */}
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="flex flex-col items-center justify-center gap-1 px-2 py-4 rounded-l-xl transition-all duration-200"
          style={{
            background: "rgba(13,27,42,0.92)",
            border: "1px solid var(--pid-border)",
            borderRight: panelOpen ? "none" : undefined,
            color: panelOpen ? "var(--pid-coral-lt)" : "var(--pid-muted)",
          }}
          aria-label={panelOpen ? "Fechar painel de camadas" : "Abrir painel de camadas"}
        >
          {panelOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          <Layers size={14} />
          <span
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              transform: "rotate(180deg)",
              fontSize: "9px",
              letterSpacing: "0.1em",
              fontWeight: 600,
              color: "inherit",
            }}
          >
            CAMADAS
          </span>
        </button>

        {/* Conteúdo do painel */}
        <div
          className="overflow-hidden transition-all duration-300"
          style={{
            maxWidth: panelOpen ? "240px" : "0px",
            opacity: panelOpen ? 1 : 0,
          }}
        >
          <div
            className="h-full py-4 px-4 space-y-3"
            style={{
              background: "rgba(13,27,42,0.95)",
              border: "1px solid var(--pid-border)",
              borderLeft: "none",
              minWidth: "220px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <p
              className="text-white font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", letterSpacing: "0.06em" }}
            >
              CAMADAS DO MAPA
            </p>

            {/* Camada reativa: Aço Verde */}
            {onMapStateChange && (
              <div
                className="flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-all"
                style={{
                  background: mapState.showGreenSteelLayer ? "rgba(34,197,94,0.12)" : "transparent",
                  border: `1px solid ${mapState.showGreenSteelLayer ? "rgba(34,197,94,0.35)" : "transparent"}`,
                }}
                onClick={() =>
                  onMapStateChange({ showGreenSteelLayer: !mapState.showGreenSteelLayer })
                }
              >
                <div className="flex items-center gap-2">
                  <ShapeMarker color="#22C55E" shape="diamond" />
                  <span className="text-xs" style={{ color: mapState.showGreenSteelLayer ? "#22C55E" : "var(--pid-muted)" }}>
                    Aço Verde
                  </span>
                </div>
                {mapState.showGreenSteelLayer ? (
                  <Eye size={11} style={{ color: "#22C55E" }} />
                ) : (
                  <EyeOff size={11} style={{ color: "var(--pid-muted)" }} />
                )}
              </div>
            )}

            <div style={{ height: 1, background: "var(--pid-border)" }} />

            {/* Camadas estáticas agrupadas */}
            {Array.from(new Set(LEGEND_LAYERS.filter((l) => l.key !== "aco-verde").map((l) => l.group))).map((group) => {
              const layers = LEGEND_LAYERS.filter((l) => l.group === group && l.key !== "aco-verde");
              return (
                <div key={group}>
                  <p
                    className="text-[10px] font-semibold mb-1"
                    style={{ color: "var(--pid-muted)", letterSpacing: "0.08em" }}
                  >
                    {group.toUpperCase()}
                  </p>
                  {layers.map((layer) => (
                    <div key={layer.key} className="flex items-center justify-between py-1 px-2">
                      <div className="flex items-center gap-2">
                        <ShapeMarker color={layer.color} shape={layer.shape} />
                        <span
                          className="text-xs"
                          style={{ color: layer.available ? "#C8DDF0" : "var(--pid-muted)" }}
                        >
                          {layer.label}
                        </span>
                      </div>
                      {!layer.available && (
                        <span
                          className="text-[9px] px-1 rounded"
                          style={{ background: "rgba(122,155,191,0.12)", color: "var(--pid-muted)" }}
                        >
                          em breve
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Legenda fixa (canto inferior esquerdo) ─────────────────── */}
      <div className="absolute bottom-8 left-4 z-1000">
        <div
          className="px-3 py-3 rounded-xl text-xs space-y-1.5"
          style={{
            background: "rgba(13,27,42,0.88)",
            border: "1px solid var(--pid-border)",
            minWidth: "190px",
          }}
        >
          <p
            className="font-semibold text-white mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", letterSpacing: "0.05em" }}
          >
            Legenda
          </p>

          {/* Aço Verde — condicional */}
          {mapState.showGreenSteelLayer && (
            <div className="flex items-center gap-2">
              <ShapeMarker color="#22C55E" shape="diamond" />
              <span style={{ color: "#22C55E" }}>Projetos Aço Verde</span>
            </div>
          )}

          {/* Hubs de Descarbonização */}
          <div className="flex items-center gap-2">
            <ShapeMarker color="#9333EA" shape="circle" />
            <span style={{ color: "var(--pid-muted)" }}>Hubs de Descarbonização</span>
          </div>

          {/* Instalações Portuárias */}
          <div className="flex items-center gap-2">
            <ShapeMarker color="#38BDF8" shape="star" />
            <span style={{ color: "var(--pid-muted)" }}>Instalações Portuárias</span>
          </div>

          {/* Biomassa */}
          <div>
            <p className="text-[9px] font-semibold mb-1" style={{ color: "#6B7280", letterSpacing: "0.06em" }}>BIOMASSA</p>
            <div className="flex items-center gap-2 ml-1">
              <ShapeMarker color="#22C55E" shape="circle" />
              <span style={{ color: "#C8DDF0" }}>Biomassa existentes</span>
            </div>
          </div>

          {/* Biometano */}
          <div className="flex items-center gap-2">
            <ShapeMarker color="#F97316" shape="circle" />
            <span style={{ color: "var(--pid-muted)" }}>Biometano Comercial</span>
          </div>

          {/* Eólica */}
          <div>
            <p className="text-[9px] font-semibold mb-1" style={{ color: "#6B7280", letterSpacing: "0.06em" }}>EÓLICA</p>
            <div className="flex items-center gap-2 ml-1">
              <ShapeMarker color="#06B6D4" shape="circle" />
              <span style={{ color: "#C8DDF0" }}>Eólica Existente</span>
            </div>
          </div>

          {/* Solar */}
          <div>
            <p className="text-[9px] font-semibold mb-1" style={{ color: "#6B7280", letterSpacing: "0.06em" }}>SOLAR</p>
            <div className="flex items-center gap-2 ml-1">
              <ShapeMarker color="#FBBF24" shape="circle" />
              <span style={{ color: "#C8DDF0" }}>Solar UFV existente</span>
            </div>
          </div>

          {/* Hidrelétrica */}
          <div>
            <p className="text-[9px] font-semibold mb-1" style={{ color: "#6B7280", letterSpacing: "0.06em" }}>HIDRELÉTRICA</p>
            <div className="flex items-center gap-2 ml-1">
              <ShapeMarker color="#374151" shape="circle" />
              <span style={{ color: "#C8DDF0" }}>Hidrelétrica UHE existente</span>
            </div>
            <div className="flex items-center gap-2 ml-1 mt-0.5">
              <ShapeMarker color="#64748B" shape="circle" />
              <span style={{ color: "#C8DDF0" }}>PCH existente</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Attribution ── */}
      <div className="absolute bottom-2 right-2 z-1000">
        <div
          className="flex items-center gap-1 px-2 py-1 rounded"
          style={{
            background: "rgba(13,27,42,0.7)",
            color: "var(--pid-muted)",
            fontSize: "9px",
          }}
        >
          <Info size={9} />
          Dados: EPE · ANEEL/SIGEL · ONS · MME · Esri
        </div>
      </div>
    </div>
  );
}
