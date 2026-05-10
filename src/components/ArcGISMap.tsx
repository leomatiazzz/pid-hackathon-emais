"use client";

/**
 * ArcGISMap.tsx
 * Motor real de mapa usando @arcgis/core v5.
 * Carregado APENAS no cliente (via dynamic() em MapViewer.tsx).
 *
 * Lógica de estado:
 *  - mapState.showGreenSteelLayer === false → camada invisible, view centrada no Brasil
 *  - mapState.showGreenSteelLayer === true  → camada visível + view.goTo(extent) animado
 */

import { useEffect, useRef } from "react";
import type { MapState } from "@/app/page";

/* ─── GeoJSON mock — Aço Verde (Sudeste/Sul) ─────────────────── */
const ACO_VERDE_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Usiminas", city: "Ipatinga/MG" },
      geometry: { type: "Point", coordinates: [-42.537, -19.469] },
    },
    {
      type: "Feature",
      properties: { name: "Gerdau Acominas", city: "Ouro Branco/MG" },
      geometry: { type: "Point", coordinates: [-43.698, -20.529] },
    },
    {
      type: "Feature",
      properties: { name: "ArcelorMittal Brasil", city: "Serra/ES" },
      geometry: { type: "Point", coordinates: [-40.308, -20.127] },
    },
    {
      type: "Feature",
      properties: { name: "CSN", city: "Volta Redonda/RJ" },
      geometry: { type: "Point", coordinates: [-44.104, -22.523] },
    },
    {
      type: "Feature",
      properties: { name: "Ternium Brasil", city: "Rio de Janeiro/RJ" },
      geometry: { type: "Point", coordinates: [-43.172, -22.906] },
    },
    {
      type: "Feature",
      properties: { name: "Aperam", city: "Timóteo/MG" },
      geometry: { type: "Point", coordinates: [-42.645, -19.582] },
    },
    {
      type: "Feature",
      properties: { name: "Vallourec", city: "Jeceaba/MG" },
      geometry: { type: "Point", coordinates: [-43.950, -20.606] },
    },
    {
      type: "Feature",
      properties: { name: "ArcelorMittal Piracicaba", city: "Piracicaba/SP" },
      geometry: { type: "Point", coordinates: [-47.647, -22.725] },
    },
    {
      type: "Feature",
      properties: { name: "Gerdau", city: "Porto Alegre/RS" },
      geometry: { type: "Point", coordinates: [-51.217, -30.034] },
    },
    {
      type: "Feature",
      properties: { name: "ArcelorMittal Resende", city: "Resende/RJ" },
      geometry: { type: "Point", coordinates: [-44.450, -22.470] },
    },
  ],
};

/* ─── Props ──────────────────────────────────────────────────── */
interface ArcGISMapProps {
  mapState: MapState;
}

/* ─── Component ──────────────────────────────────────────────── */
export default function ArcGISMap({ mapState }: ArcGISMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs para os objetos ArcGIS (não reativam re-renders)
  const viewRef = useRef<__esri.MapView | null>(null);
  const layerRef = useRef<__esri.GeoJSONLayer | null>(null);
  const initializedRef = useRef(false);

  /* ── Inicialização do mapa (executa 1× ao montar) ─────────── */
  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    let view: __esri.MapView;

    const init = async () => {
      // ─ 1. Configura assets path para o CDN (evita copiar assets localmente)
      const { default: esriConfig } = await import("@arcgis/core/config.js");
      esriConfig.assetsPath =
        "https://js.arcgis.com/4.32/@arcgis/core/assets";
      // Suprime logs verbose do SDK em dev (workers e asset chunks)
      // @ts-expect-error — log property exists at runtime but not in typedefs
      if (esriConfig.log) esriConfig.log.level = "error";

      // ─ 2. Imports dinâmicos (todos client-side)
      const [
        { default: Map },
        { default: MapView },
        { default: GeoJSONLayer },
        { default: SimpleRenderer },
        { default: SimpleMarkerSymbol },
        { default: PopupTemplate },
      ] = await Promise.all([
        import("@arcgis/core/Map.js"),
        import("@arcgis/core/views/MapView.js"),
        import("@arcgis/core/layers/GeoJSONLayer.js"),
        import("@arcgis/core/renderers/SimpleRenderer.js"),
        import("@arcgis/core/symbols/SimpleMarkerSymbol.js"),
        import("@arcgis/core/PopupTemplate.js"),
      ]);

      // ─ 3. Cria Blob URL do GeoJSON (resolve CORS de Feature Services locais)
      const blob = new Blob([JSON.stringify(ACO_VERDE_GEOJSON)], {
        type: "application/json",
      });
      const blobUrl = URL.createObjectURL(blob);

      // ─ 4. Renderer — marcador verde com glow
      const renderer = new SimpleRenderer({
        symbol: new SimpleMarkerSymbol({
          color: [34, 197, 94, 0.92],   // #22C55E — var(--pid-green)
          size: "14px",
          style: "circle",
          outline: {
            color: [255, 255, 255, 0.55],
            width: 1.5,
          },
        }),
      });

      // ─ 5. PopupTemplate
      const popupTemplate = new PopupTemplate({
        title: "🟢 Aço Verde — {name}",
        content: "<b>Localização:</b> {city}",
      });

      // ─ 6. GeoJSONLayer — inicia invisível
      const layer = new GeoJSONLayer({
        url: blobUrl,
        renderer,
        popupTemplate,
        visible: false,
        title: "Aço Verde",
      });
      layerRef.current = layer;

      // ─ 7. Mapa com basemap escuro
      const map = new Map({
        basemap: "dark-gray-vector",
        layers: [layer],
      });

      // ─ 8. MapView centrado no Brasil
      view = new MapView({
        container: containerRef.current!,
        map,
        center: [-51.9253, -14.235],
        zoom: 4,
        ui: {
          components: ["zoom", "compass"],
        },
        // Suprime o popup de atribuição padrão (temos overlay próprio)
        popup: {
          dockEnabled: true,
          dockOptions: { position: "top-right" },
        },
      });

      viewRef.current = view;

      await view.when();

      // ─ 9. Aplica o estado atual imediatamente após inicializar
      //      (caso o chat já tenha sido interagido antes do mapa montar)
      applyMapState(layer, view, mapState.showGreenSteelLayer);
    };

    init().catch(console.error);

    return () => {
      // Cleanup ao desmontar
      viewRef.current?.destroy();
      viewRef.current = null;
      layerRef.current = null;
      initializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [] → executa só uma vez

  /* ── Observa mudanças no mapState ───────────────────────────── */
  useEffect(() => {
    const layer = layerRef.current;
    const view = viewRef.current;
    if (!layer || !view) return;

    applyMapState(layer, view, mapState.showGreenSteelLayer);
  }, [mapState.showGreenSteelLayer]);

  return (
    <div
      ref={containerRef}
      id="arcgis-map-container"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

/* ─── Helper: aplica visibilidade + câmera ───────────────────── */
function applyMapState(
  layer: __esri.GeoJSONLayer,
  view: __esri.MapView,
  isActive: boolean
) {
  layer.visible = isActive;

  if (isActive) {
    // Zoom animado para o extent da camada Aço Verde
    layer
      .queryExtent()
      .then((result) => {
        if (result.extent) {
          view.goTo(result.extent.expand(1.6), {
            duration: 1600,
            easing: "ease-in-out",
          });
        }
      })
      .catch(() => {
        // Fallback: foca no Sudeste manualmente
        view.goTo(
          { center: [-43.5, -21.0], zoom: 7 },
          { duration: 1400, easing: "ease-in-out" }
        );
      });
  } else {
    // Volta ao Brasil completo
    view.goTo(
      { center: [-51.9253, -14.235], zoom: 4 },
      { duration: 1200, easing: "ease-out" }
    );
  }
}
