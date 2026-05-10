"use client";

import dynamic from "next/dynamic";
import type { MapState } from "@/types/map";
import { Layers, Info } from "lucide-react";

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


/* ─── Mock green steel sites (Sudeste / Sul) ─────────────────── */
export const GREEN_STEEL_SITES = [
  { id: 1, name: "Ternium Brasil – Rio de Janeiro/RJ",   lat: -22.9068, lng: -43.1729, sector: "Aço Verde" },
  { id: 2, name: "Usiminas – Ipatinga/MG",               lat: -19.4697, lng: -42.5370, sector: "Aço Verde" },
  { id: 3, name: "Gerdau Acominas – Ouro Branco/MG",     lat: -20.5290, lng: -43.6985, sector: "Aço Verde" },
  { id: 4, name: "ArcelorMittal – Serra/ES",             lat: -20.1272, lng: -40.3082, sector: "Aço Verde" },
  { id: 5, name: "Aperam – Timóteo/MG",                  lat: -19.5826, lng: -42.6457, sector: "Aço Verde" },
  { id: 6, name: "ArcelorMittal – Piracicaba/SP",        lat: -22.7251, lng: -47.6476, sector: "Aço Verde" },
  { id: 7, name: "Vallourec – Jeceaba/MG",               lat: -20.6060, lng: -43.9501, sector: "Aço Verde" },
  { id: 8, name: "ArcelorMittal – Resende/RJ",           lat: -22.4705, lng: -44.4503, sector: "Aço Verde" },
  { id: 9, name: "CSN – Volta Redonda/RJ",               lat: -22.5231, lng: -44.1048, sector: "Aço Verde" },
  { id: 10, name: "Gerdau – Porto Alegre/RS",             lat: -30.0346, lng: -51.2177, sector: "Aço Verde" },
];

interface MapViewerProps {
  mapState: MapState;
}

export default function MapViewer({ mapState }: MapViewerProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* ── ArcGIS map (fills entire panel, SSR-disabled) ── */}
      <ArcGISMap mapState={mapState} />

      {/* ── Top toolbar overlay ── */}
      <div className="absolute top-4 left-4 z-[1000] flex gap-2">
        {/* Layer badge */}
        <div className="map-overlay flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
             style={{
               background: "rgba(13,27,42,0.85)",
               border: "1px solid var(--pid-border)",
               color: "var(--pid-muted)",
             }}>
          <Layers size={13} />
          <span>
            {mapState.showGreenSteelLayer
              ? "Camada: Aço Verde"
              : "Selecione uma camada"}
          </span>
          {mapState.showGreenSteelLayer && (
            <span className="w-2 h-2 rounded-full bg-[var(--pid-green)] animate-pulse" />
          )}
        </div>
      </div>

      {/* ── Legend overlay (bottom left) ── */}
      <div className="absolute bottom-8 left-4 z-[1000]">
        <div className="map-overlay px-4 py-3 rounded-xl text-xs space-y-2"
             style={{
               background: "rgba(13,27,42,0.9)",
               border: "1px solid var(--pid-border)",
               minWidth: "180px",
             }}>
          <p className="font-semibold text-white mb-2"
             style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", letterSpacing: "0.05em" }}>
            LEGENDA
          </p>
          {mapState.showGreenSteelLayer && (
            <div className="flex items-center gap-2" style={{ color: "var(--pid-green)" }}>
              <span className="flex-none w-3 h-3 rounded-full"
                    style={{ background: "var(--pid-green)", boxShadow: "0 0 6px var(--pid-green)" }} />
              Aço Verde
            </div>
          )}
          <div className="flex items-center gap-2" style={{ color: "var(--pid-muted)" }}>
            <span className="flex-none w-3 h-3 rounded-full bg-purple-400" />
            Hubs Descarbonização
          </div>
          <div className="flex items-center gap-2" style={{ color: "var(--pid-muted)" }}>
            <span className="flex-none w-3 h-3 rounded-full bg-sky-400" />
            Inst. Portuárias
          </div>
          <div className="flex items-center gap-2" style={{ color: "var(--pid-muted)" }}>
            <span className="flex-none w-3 h-3 rounded-full bg-emerald-400" />
            Energia Eólica
          </div>
        </div>
      </div>

      {/* ── Attribution ── */}
      <div className="absolute bottom-2 right-2 z-[1000]">
        <div className="map-overlay flex items-center gap-1 px-2 py-1 rounded text-xs"
             style={{
               background: "rgba(13,27,42,0.7)",
               color: "var(--pid-muted)",
               fontSize: "9px",
             }}>
          <Info size={9} />
          Dados: EPE · ANEEL · ONS · MME · Esri
        </div>
      </div>
    </div>
  );
}
