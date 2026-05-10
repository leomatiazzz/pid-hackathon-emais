"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import type { MapState } from "@/types/map";
import { GREEN_STEEL_SITES } from "./MapViewer";

/* Fix Leaflet default icon paths in Next.js */
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* ─── Smooth fly-to when green steel activates ─────────────── */
function MapController({ showGreenSteelLayer }: { showGreenSteelLayer: boolean }) {
  const map = useMap();
  const hasFlown = useRef(false);

  useEffect(() => {
    if (showGreenSteelLayer && !hasFlown.current) {
      hasFlown.current = true;
      // Fly to Southeast Brazil to frame the Aço Verde markers
      map.flyTo([-21.5, -43.5], 6, { duration: 1.8 });
    }
    if (!showGreenSteelLayer) {
      hasFlown.current = false;
      map.flyTo([-15.0, -53.0], 4, { duration: 1.5 });
    }
  }, [showGreenSteelLayer, map]);

  return null;
}

/* ─── Pulsing circle with CSS class ────────────────────────── */
function PulsingMarker({
  position,
  name,
  pulsing,
}: {
  position: [number, number];
  name: string;
  pulsing: boolean;
}) {
  return (
    <CircleMarker
      center={position}
      radius={pulsing ? 9 : 6}
      pathOptions={{
        color: pulsing ? "#22C55E" : "#7A9BBF",
        fillColor: pulsing ? "#22C55E" : "#3D6494",
        fillOpacity: pulsing ? 0.85 : 0.6,
        weight: pulsing ? 2.5 : 1.5,
      }}
      className={pulsing ? "green-steel-marker" : ""}
    >
      <Tooltip
        permanent={false}
        direction="top"
        offset={[0, -8]}
        className="pid-tooltip"
      >
        <div style={{
          background: "#0D1B2A",
          border: "1px solid #1E3A56",
          borderRadius: "8px",
          padding: "6px 10px",
          color: "#E2EDF8",
          fontSize: "11px",
          fontFamily: "Inter, sans-serif",
        }}>
          <strong style={{ color: "#22C55E" }}>⬤ Aço Verde</strong>
          <br />
          {name}
        </div>
      </Tooltip>
    </CircleMarker>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
interface LeafletMapProps {
  mapState: MapState;
}

// Dark tile layer (CartoDB Dark Matter)
const DARK_TILE = "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png";
const LABEL_TILE = "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png";

export default function LeafletMap({ mapState }: LeafletMapProps) {
  const { showGreenSteelLayer } = mapState;

  return (
    <MapContainer
      center={[-15.0, -53.0]}
      zoom={4}
      style={{ width: "100%", height: "100%", background: "#0a1929" }}
      zoomControl={true}
      attributionControl={false}
    >
      {/* Dark basemap */}
      <TileLayer url={DARK_TILE} />
      {/* Labels on top */}
      <TileLayer url={LABEL_TILE} />

      {/* ── Controller (fly-to logic) ── */}
      <MapController showGreenSteelLayer={showGreenSteelLayer} />

      {/* ── Green Steel markers (activated by chat) ── */}
      {showGreenSteelLayer &&
        GREEN_STEEL_SITES.map((site) => (
          <PulsingMarker
            key={site.id}
            position={[site.lat, site.lng]}
            name={site.name}
            pulsing
          />
        ))}
    </MapContainer>
  );
}
