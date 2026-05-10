"use client";

/**
 * ArcGISMap.tsx
 * Motor real de mapa usando @arcgis/core v5.
 * Carregado APENAS no cliente (via dynamic() em MapViewer.tsx).
 *
 * Camadas estáticas (infraestrutura, sempre visíveis):
 *  - Hubs de Descarbonização  → Roxo
 *  - Instalações Portuárias   → Azul Claro
 *  - Biomassa Existente       → Verde Escuro
 *  - Biometano Comercial      → Laranja
 *  - Eólica Existente         → Ciano
 *  - Solar UFV Existente      → Marrom/Dourado
 *  - Hidrelétrica UHE         → Cinza Escuro
 *
 * Camada reativa ao chat:
 *  - Aço Verde                → Verde Médio (toggle via mapState)
 */

import { useEffect, useRef } from "react";
import type { MapState } from "@/types/map";

/* ═══════════════════════════════════════════════════════════════════
   DATASETS MOCKADOS — representativos das fontes ANEEL/EPE/SIGEL
   Em produção: substituir por FeatureLayer apontando para REST API
   ═══════════════════════════════════════════════════════════════════ */

/** Hubs de Descarbonização — Roxo #9333EA */
const HUBS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "Hub Nordeste",     tipo: "Hub Descarbonização" }, geometry: { type: "Point", coordinates: [-38.512,  -3.717] } },
    { type: "Feature", properties: { name: "Hub Sudeste",      tipo: "Hub Descarbonização" }, geometry: { type: "Point", coordinates: [-43.945, -19.928] } },
    { type: "Feature", properties: { name: "Hub Sul Verde",    tipo: "Hub Descarbonização" }, geometry: { type: "Point", coordinates: [-51.230, -30.034] } },
    { type: "Feature", properties: { name: "Hub Amazônia",     tipo: "Hub Descarbonização" }, geometry: { type: "Point", coordinates: [-60.025,  -3.100] } },
    { type: "Feature", properties: { name: "Hub Centro-Oeste", tipo: "Hub Descarbonização" }, geometry: { type: "Point", coordinates: [-49.264, -16.686] } },
  ],
};

/** Instalações Portuárias — Azul Claro #38BDF8 */
const PORTOS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "Porto de Santos",       tipo: "Instalação Portuária" }, geometry: { type: "Point", coordinates: [-46.333, -23.967] } },
    { type: "Feature", properties: { name: "Porto do Açu",          tipo: "Instalação Portuária" }, geometry: { type: "Point", coordinates: [-41.462, -21.836] } },
    { type: "Feature", properties: { name: "Porto de Itaguaí",      tipo: "Instalação Portuária" }, geometry: { type: "Point", coordinates: [-43.773, -22.866] } },
    { type: "Feature", properties: { name: "Porto de Suape",        tipo: "Instalação Portuária" }, geometry: { type: "Point", coordinates: [-34.947,  -8.399] } },
    { type: "Feature", properties: { name: "Porto de Pecém",        tipo: "Instalação Portuária" }, geometry: { type: "Point", coordinates: [-38.797,  -3.527] } },
    { type: "Feature", properties: { name: "Porto de Paranaguá",    tipo: "Instalação Portuária" }, geometry: { type: "Point", coordinates: [-48.513, -25.520] } },
    { type: "Feature", properties: { name: "Porto de Rio Grande",   tipo: "Instalação Portuária" }, geometry: { type: "Point", coordinates: [-52.098, -32.036] } },
    { type: "Feature", properties: { name: "Porto de Barcarena",    tipo: "Instalação Portuária" }, geometry: { type: "Point", coordinates: [-48.620,  -1.502] } },
  ],
};

/** Biomassa Existente — Verde Escuro #15803D */
const BIOMASSA_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "Usina Bonfim (SP)",        tipo: "Biomassa" }, geometry: { type: "Point", coordinates: [-47.302, -21.060] } },
    { type: "Feature", properties: { name: "Usina Coruripe (AL)",      tipo: "Biomassa" }, geometry: { type: "Point", coordinates: [-36.176,  -9.932] } },
    { type: "Feature", properties: { name: "Usina Jalles Machado (GO)",tipo: "Biomassa" }, geometry: { type: "Point", coordinates: [-49.938, -15.326] } },
    { type: "Feature", properties: { name: "Usina São Martinho (SP)",  tipo: "Biomassa" }, geometry: { type: "Point", coordinates: [-48.120, -20.397] } },
    { type: "Feature", properties: { name: "Usina Itarumã (GO)",       tipo: "Biomassa" }, geometry: { type: "Point", coordinates: [-51.320, -18.748] } },
    { type: "Feature", properties: { name: "Usina Catende (PE)",       tipo: "Biomassa" }, geometry: { type: "Point", coordinates: [-35.714,  -8.677] } },
    { type: "Feature", properties: { name: "Usina Guaíra (SP)",        tipo: "Biomassa" }, geometry: { type: "Point", coordinates: [-48.319, -20.317] } },
  ],
};

/** Biometano Comercial — Laranja #F97316 */
const BIOMETANO_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "Biometano Caieiras (SP)",    tipo: "Biometano" }, geometry: { type: "Point", coordinates: [-46.737, -23.362] } },
    { type: "Feature", properties: { name: "Biometano Nova Iguaçu (RJ)", tipo: "Biometano" }, geometry: { type: "Point", coordinates: [-43.451, -22.745] } },
    { type: "Feature", properties: { name: "Biometano Canoas (RS)",      tipo: "Biometano" }, geometry: { type: "Point", coordinates: [-51.184, -29.919] } },
    { type: "Feature", properties: { name: "Biometano Fortaleza (CE)",   tipo: "Biometano" }, geometry: { type: "Point", coordinates: [-38.543,  -3.717] } },
    { type: "Feature", properties: { name: "Biometano Cuiabá (MT)",      tipo: "Biometano" }, geometry: { type: "Point", coordinates: [-56.096, -15.601] } },
  ],
};

/** Eólica Existente — Ciano #06B6D4 */
const EOLICA_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "Parque Eólico Abará (BA)",        tipo: "Eólica" }, geometry: { type: "Point", coordinates: [-41.850, -11.378] } },
    { type: "Feature", properties: { name: "Parque Eólico Mucuripe (CE)",     tipo: "Eólica" }, geometry: { type: "Point", coordinates: [-38.480,  -3.725] } },
    { type: "Feature", properties: { name: "Parque Eólico Osório (RS)",       tipo: "Eólica" }, geometry: { type: "Point", coordinates: [-50.270, -29.891] } },
    { type: "Feature", properties: { name: "Parque Eólico Alto Sertão (BA)",  tipo: "Eólica" }, geometry: { type: "Point", coordinates: [-42.630, -14.210] } },
    { type: "Feature", properties: { name: "Parque Eólico Lagoa dos Ventos (PI)", tipo: "Eólica" }, geometry: { type: "Point", coordinates: [-41.779,  -8.110] } },
    { type: "Feature", properties: { name: "Parque Eólico Tucano (BA)",       tipo: "Eólica" }, geometry: { type: "Point", coordinates: [-38.780, -11.010] } },
    { type: "Feature", properties: { name: "Parque Eólico São João do Norte (RN)", tipo: "Eólica" }, geometry: { type: "Point", coordinates: [-36.920,  -5.120] } },
    { type: "Feature", properties: { name: "Parque Eólico Ceará Mirim (RN)", tipo: "Eólica" }, geometry: { type: "Point", coordinates: [-35.430,  -5.640] } },
  ],
};

/** Solar UFV Existente — Marrom/Dourado #92400E */
const SOLAR_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "UFV Pirapora (MG)",         tipo: "Solar UFV" }, geometry: { type: "Point", coordinates: [-44.940, -17.341] } },
    { type: "Feature", properties: { name: "UFV Lapa (BA)",             tipo: "Solar UFV" }, geometry: { type: "Point", coordinates: [-43.395, -13.961] } },
    { type: "Feature", properties: { name: "UFV Nova Olímpia (MG)",     tipo: "Solar UFV" }, geometry: { type: "Point", coordinates: [-44.931, -18.020] } },
    { type: "Feature", properties: { name: "UFV São Francisco (MG)",    tipo: "Solar UFV" }, geometry: { type: "Point", coordinates: [-44.862, -15.950] } },
    { type: "Feature", properties: { name: "UFV Floresta (PE)",         tipo: "Solar UFV" }, geometry: { type: "Point", coordinates: [-38.574,  -8.600] } },
    { type: "Feature", properties: { name: "UFV Juazeiro (BA)",         tipo: "Solar UFV" }, geometry: { type: "Point", coordinates: [-40.497,  -9.413] } },
    { type: "Feature", properties: { name: "UFV Sobradinho (BA)",       tipo: "Solar UFV" }, geometry: { type: "Point", coordinates: [-40.830,  -9.455] } },
    { type: "Feature", properties: { name: "UFV Aquiraz (CE)",          tipo: "Solar UFV" }, geometry: { type: "Point", coordinates: [-38.381,  -3.896] } },
  ],
};

/** Hidrelétrica UHE — Cinza Escuro #374151 */
const UHE_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "UHE Itaipu (PR/PY)",       tipo: "Hidrelétrica" }, geometry: { type: "Point", coordinates: [-54.596, -25.408] } },
    { type: "Feature", properties: { name: "UHE Belo Monte (PA)",      tipo: "Hidrelétrica" }, geometry: { type: "Point", coordinates: [-52.391,  -3.117] } },
    { type: "Feature", properties: { name: "UHE Tucuruí (PA)",         tipo: "Hidrelétrica" }, geometry: { type: "Point", coordinates: [-49.618,  -3.830] } },
    { type: "Feature", properties: { name: "UHE Santo Antônio (RO)",   tipo: "Hidrelétrica" }, geometry: { type: "Point", coordinates: [-64.059,  -8.793] } },
    { type: "Feature", properties: { name: "UHE Jirau (RO)",           tipo: "Hidrelétrica" }, geometry: { type: "Point", coordinates: [-64.649,  -9.271] } },
    { type: "Feature", properties: { name: "UHE Ilha Solteira (SP)",   tipo: "Hidrelétrica" }, geometry: { type: "Point", coordinates: [-51.344, -20.423] } },
    { type: "Feature", properties: { name: "UHE Xingó (SE/AL)",        tipo: "Hidrelétrica" }, geometry: { type: "Point", coordinates: [-37.791,  -9.663] } },
    { type: "Feature", properties: { name: "UHE Três Marias (MG)",     tipo: "Hidrelétrica" }, geometry: { type: "Point", coordinates: [-45.265, -18.213] } },
  ],
};

/** Aço Verde — Verde Médio #22C55E (reativo ao chat) */
const ACO_VERDE_GEOJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "Usiminas",                  city: "Ipatinga/MG"      }, geometry: { type: "Point", coordinates: [-42.537, -19.469] } },
    { type: "Feature", properties: { name: "Gerdau Acominas",           city: "Ouro Branco/MG"   }, geometry: { type: "Point", coordinates: [-43.698, -20.529] } },
    { type: "Feature", properties: { name: "ArcelorMittal Brasil",      city: "Serra/ES"         }, geometry: { type: "Point", coordinates: [-40.308, -20.127] } },
    { type: "Feature", properties: { name: "CSN",                       city: "Volta Redonda/RJ" }, geometry: { type: "Point", coordinates: [-44.104, -22.523] } },
    { type: "Feature", properties: { name: "Ternium Brasil",            city: "Rio de Janeiro/RJ"}, geometry: { type: "Point", coordinates: [-43.172, -22.906] } },
    { type: "Feature", properties: { name: "Aperam",                    city: "Timóteo/MG"       }, geometry: { type: "Point", coordinates: [-42.645, -19.582] } },
    { type: "Feature", properties: { name: "Vallourec",                 city: "Jeceaba/MG"       }, geometry: { type: "Point", coordinates: [-43.950, -20.606] } },
    { type: "Feature", properties: { name: "ArcelorMittal Piracicaba",  city: "Piracicaba/SP"    }, geometry: { type: "Point", coordinates: [-47.647, -22.725] } },
    { type: "Feature", properties: { name: "Gerdau",                    city: "Porto Alegre/RS"  }, geometry: { type: "Point", coordinates: [-51.217, -30.034] } },
    { type: "Feature", properties: { name: "ArcelorMittal Resende",     city: "Resende/RJ"       }, geometry: { type: "Point", coordinates: [-44.450, -22.470] } },
  ],
};

/* ─── Configuração visual de cada camada ─────────────────────── */
interface LayerConfig {
  geojson: object;
  color: [number, number, number, number]; // RGBA
  size: string;
  outlineColor: [number, number, number, number];
  title: string;
  emoji: string;
  popupField: string; // campo do GeoJSON para o popup
}

const STATIC_LAYERS: LayerConfig[] = [
  {
    geojson:      HUBS_GEOJSON,
    color:        [147, 51, 234, 0.92],  // Roxo    #9333EA
    outlineColor: [255, 255, 255, 0.7],
    size:         "16px",
    title:        "Hubs Descarbonização",
    emoji:        "🟣",
    popupField:   "name",
  },
  {
    geojson:      PORTOS_GEOJSON,
    color:        [56, 189, 248, 0.92],  // Azul Claro #38BDF8
    outlineColor: [255, 255, 255, 0.7],
    size:         "13px",
    title:        "Inst. Portuárias",
    emoji:        "🔵",
    popupField:   "name",
  },
  {
    geojson:      BIOMASSA_GEOJSON,
    color:        [21, 128, 61, 0.92],   // Verde Escuro #15803D
    outlineColor: [255, 255, 255, 0.6],
    size:         "12px",
    title:        "Biomassa Existente",
    emoji:        "🟢",
    popupField:   "name",
  },
  {
    geojson:      BIOMETANO_GEOJSON,
    color:        [249, 115, 22, 0.92],  // Laranja  #F97316
    outlineColor: [255, 255, 255, 0.6],
    size:         "12px",
    title:        "Biometano Comercial",
    emoji:        "🟠",
    popupField:   "name",
  },
  {
    geojson:      EOLICA_GEOJSON,
    color:        [6, 182, 212, 0.92],   // Ciano    #06B6D4
    outlineColor: [255, 255, 255, 0.6],
    size:         "12px",
    title:        "Energia Eólica",
    emoji:        "🩵",
    popupField:   "name",
  },
  {
    geojson:      SOLAR_GEOJSON,
    color:        [146, 64, 14, 0.92],   // Marrom   #92400E
    outlineColor: [255, 255, 255, 0.6],
    size:         "12px",
    title:        "Solar UFV",
    emoji:        "🟤",
    popupField:   "name",
  },
  {
    geojson:      UHE_GEOJSON,
    color:        [55, 65, 81, 0.92],    // Cinza Escuro #374151
    outlineColor: [255, 255, 255, 0.6],
    size:         "13px",
    title:        "Hidrelétrica UHE",
    emoji:        "⚫",
    popupField:   "name",
  },
];

/* ─── Props ──────────────────────────────────────────────────── */
interface ArcGISMapProps {
  mapState: MapState;
}

/* ─── Component ──────────────────────────────────────────────── */
export default function ArcGISMap({ mapState }: ArcGISMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const viewRef         = useRef<__esri.MapView | null>(null);
  const acoVerdeLayerRef = useRef<__esri.GeoJSONLayer | null>(null);
  const initializedRef  = useRef(false);

  /* ── Inicialização do mapa (executa 1× ao montar) ─────────── */
  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    let view: __esri.MapView;

    const init = async () => {
      // ─ 1. Assets path — usa cópia local em /public/arcgis-assets
      //      (evita mismatch entre SDK v5.0.19 e CDN 4.32)
      const { default: esriConfig } = await import("@arcgis/core/config.js");
      esriConfig.assetsPath = "/arcgis-assets";
      if (esriConfig.log) (esriConfig.log as { level: string }).level = "error";

      // ─ 2. Imports dinâmicos
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

      /** Utilitário: cria GeoJSONLayer a partir de um objeto GeoJSON inline */
      const makeLayer = (cfg: LayerConfig): __esri.GeoJSONLayer => {
        const blob    = new Blob([JSON.stringify(cfg.geojson)], { type: "application/json" });
        const blobUrl = URL.createObjectURL(blob);

        return new GeoJSONLayer({
          url: blobUrl,
          title: cfg.title,
          visible: true,
          renderer: new SimpleRenderer({
            symbol: new SimpleMarkerSymbol({
              color: cfg.color,
              size:  cfg.size,
              style: "circle",
              outline: { color: cfg.outlineColor, width: 1.5 },
            }),
          }),
          popupTemplate: new PopupTemplate({
            title:   `${cfg.emoji} ${cfg.title} — {${cfg.popupField}}`,
            content: "<b>Tipo:</b> {tipo}",
          }),
        });
      };

      // ─ 3. Cria as camadas estáticas de infraestrutura
      const staticLayers = STATIC_LAYERS.map(makeLayer);

      // ─ 4. Camada reativa Aço Verde (inicia invisível)
      const acoVerdeBlob    = new Blob([JSON.stringify(ACO_VERDE_GEOJSON)], { type: "application/json" });
      const acoVerdeBlobUrl = URL.createObjectURL(acoVerdeBlob);
      const acoVerdeLayer   = new GeoJSONLayer({
        url: acoVerdeBlobUrl,
        title: "Aço Verde",
        visible: false,
        renderer: new SimpleRenderer({
          symbol: new SimpleMarkerSymbol({
            color: [34, 197, 94, 0.95],   // #22C55E
            size:  "15px",
            style: "circle",
            outline: { color: [255, 255, 255, 0.8], width: 2 },
          }),
        }),
        popupTemplate: new PopupTemplate({
          title:   "🟢 Aço Verde — {name}",
          content: "<b>Localização:</b> {city}",
        }),
      });
      acoVerdeLayerRef.current = acoVerdeLayer;

      // ─ 5. Basemap CLARO via Carto Positron (tiles públicas, sem auth Esri)
      //      light-gray-vector requer autenticação ArcGIS Online — não usável
      //      em ambiente local sem credenciais.
      const { default: Basemap }      = await import("@arcgis/core/Basemap.js");
      const { default: WebTileLayer } = await import("@arcgis/core/layers/WebTileLayer.js");

      const lightBasemap = new Basemap({
        baseLayers: [
          new WebTileLayer({
            // Carto Positron — minimalista, cinza claro, sem crédito extra além de © Carto
            urlTemplate: "https://{subDomain}.basemaps.cartocdn.com/light_all/{level}/{col}/{row}.png",
            subDomains: ["a", "b", "c", "d"],
            copyright: "© OpenStreetMap contributors, © CARTO",
            title: "Carto Light",
          }),
        ],
        title: "Light Gray",
      });

      // ─ 6. Mapa com basemap claro + todas as camadas
      const map = new Map({
        basemap: lightBasemap,
        layers:  [...staticLayers, acoVerdeLayer],   // Aço Verde por cima
      });

      // ─ 6. MapView centrado no Brasil
      view = new MapView({
        container: containerRef.current!,
        map,
        center: [-51.9253, -14.235],
        zoom: 4,
        ui: { components: ["zoom", "compass"] },
        popup: {
          dockEnabled: true,
          dockOptions: { position: "top-right" },
        },
      });
      viewRef.current = view;

      await view.when();

      // ─ 7. Aplica estado inicial (caso chat já tenha sido usado)
      applyMapState(acoVerdeLayer, view, mapState.showGreenSteelLayer);
    };

    init().catch(console.error);

    return () => {
      viewRef.current?.destroy();
      viewRef.current        = null;
      acoVerdeLayerRef.current = null;
      initializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Observa mudanças no mapState (chat → mapa) ─────────────── */
  useEffect(() => {
    const layer = acoVerdeLayerRef.current;
    const view  = viewRef.current;
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

/* ─── Helper: toggle Aço Verde + animação de câmera ─────────── */
function applyMapState(
  layer: __esri.GeoJSONLayer,
  view:  __esri.MapView,
  isActive: boolean
) {
  layer.visible = isActive;

  if (isActive) {
    layer
      .queryExtent()
      .then((result) => {
        if (result.extent) {
          view.goTo(result.extent.expand(1.6), {
            duration: 1600,
            easing:   "ease-in-out",
          });
        }
      })
      .catch(() => {
        view.goTo(
          { center: [-43.5, -21.0], zoom: 7 },
          { duration: 1400, easing: "ease-in-out" }
        );
      });
  } else {
    view.goTo(
      { center: [-51.9253, -14.235], zoom: 4 },
      { duration: 1200, easing: "ease-out" }
    );
  }
}
