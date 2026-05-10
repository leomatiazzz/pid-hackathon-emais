"use client";

/**
 * ArcGISMap.tsx
 * Motor real de mapa usando @arcgis/core v5.
 * Carregado APENAS no cliente (via dynamic() em MapViewer.tsx).
 *
 * ─── Arquitetura de Dados ──────────────────────────────────────────────────
 * As camadas de infraestrutura consomem FeatureLayers reais do SIGEL/ANEEL:
 *   Base: https://sigel.aneel.gov.br/arcgis/rest/services/PORTAL/Camadas_Downloads/FeatureServer/{id}
 *
 *   ID  │ Camada
 *   ────┼──────────────────────────────────────────────────────
 *    0  │ Central Geradora Eólica - EOL          (Point)
 *    2  │ Usinas Hidrelétricas - UHE             (Point)
 *    3  │ Pequenas Centrais Hidrelétricas - PCH  (Point)
 *    8  │ Aerogeradores                          (Point)
 *   18  │ Usinas Termelétricas - UTE (≈ Biomassa)(Point)
 *   21  │ Centrais Geradoras Solares UFV         (Point)
 *
 * Camadas sem FeatureLayer nativo da ANEEL (placeholder para integração futura):
 *   - Hubs de Descarbonização       → URL_PLACEHOLDER_HUBS_DESCARB
 *   - Instalações Portuárias        → URL_PLACEHOLDER_PORTOS
 *   - Biometano Comercial           → URL_PLACEHOLDER_BIOMETANO
 *
 * Camada reativa ao chat:
 *   - Aço Verde                     → URL_PLACEHOLDER_ACO_VERDE (ex: MapBiomas/IBGE)
 *
 * ─── Basemap ──────────────────────────────────────────────────────────────
 * Carto Positron via WebTileLayer (público, sem auth Esri)
 * Assets locais em /public/arcgis-assets (SDK v5.0.19)
 */

import { useEffect, useRef } from "react";
import type { MapState } from "@/types/map";
import type EsriFeatureLayer from "@arcgis/core/layers/FeatureLayer";


/* ═══════════════════════════════════════════════════════════════════
   BASE URL — SIGEL/ANEEL FeatureServer (descoberto via REST catalog)
   https://sigel.aneel.gov.br/arcgis/rest/services/PORTAL/Camadas_Downloads/FeatureServer
   ═══════════════════════════════════════════════════════════════════ */
const SIGEL_BASE =
  "https://sigel.aneel.gov.br/arcgis/rest/services/PORTAL/Camadas_Downloads/FeatureServer";

/* ═══════════════════════════════════════════════════════════════════
   CONFIGURAÇÃO DAS CAMADAS
   Cada entrada define:
     url      → Endpoint REST FeatureServer/{layerId} (SIGEL real ou placeholder)
     color    → RGBA para override do renderer nativo
     size     → Tamanho do marcador
     title    → Nome exibido na legenda/popup
     emoji    → Ícone para o header do popup
     source   → Instituição fonte (para attribution)
     isPlaceholder → true = URL ainda não confirmada, não tentará carregar
   ═══════════════════════════════════════════════════════════════════ */
interface LayerConfig {
  url: string;
  color: [number, number, number, number]; // RGBA 0-255
  outlineColor: [number, number, number, number];
  size: string;
  title: string;
  emoji: string;
  source: string;
  isPlaceholder?: boolean;
}

const STATIC_LAYERS: LayerConfig[] = [
  // ── Fontes com FeatureServer SIGEL/ANEEL confirmadas ──────────────────
  {
    // Camada 0 — EOL: Central Geradora Eólica
    url:          `${SIGEL_BASE}/0`,
    color:        [6, 182, 212, 0.88],   // Ciano    #06B6D4
    outlineColor: [255, 255, 255, 0.7],
    size:         "11px",
    title:        "Energia Eólica",
    emoji:        "🩵",
    source:       "SIGEL/ANEEL",
  },
  {
    // Camada 2 — UHE: Usinas Hidrelétricas
    url:          `${SIGEL_BASE}/2`,
    color:        [55, 65, 81, 0.9],     // Cinza Escuro #374151
    outlineColor: [255, 255, 255, 0.65],
    size:         "12px",
    title:        "Hidrelétrica UHE",
    emoji:        "⚫",
    source:       "SIGEL/ANEEL",
  },
  {
    // Camada 3 — PCH: Pequenas Centrais Hidrelétricas
    url:          `${SIGEL_BASE}/3`,
    color:        [100, 116, 139, 0.85], // Slate     #64748B
    outlineColor: [255, 255, 255, 0.6],
    size:         "9px",
    title:        "Hidrelétrica PCH",
    emoji:        "🔘",
    source:       "SIGEL/ANEEL",
  },
  {
    // Camada 18 — UTE: Termelétricas (inclui biomassa/biometano)
    url:          `${SIGEL_BASE}/18`,
    color:        [21, 128, 61, 0.88],   // Verde Escuro #15803D
    outlineColor: [255, 255, 255, 0.65],
    size:         "11px",
    title:        "Biomassa / UTE",
    emoji:        "🟢",
    source:       "SIGEL/ANEEL",
  },
  {
    // Camada 21 — UFV: Centrais Solares Fotovoltaicas
    url:          `${SIGEL_BASE}/21`,
    color:        [146, 64, 14, 0.88],   // Marrom/Âmbar #92400E
    outlineColor: [255, 255, 255, 0.6],
    size:         "11px",
    title:        "Solar UFV",
    emoji:        "🟤",
    source:       "SIGEL/ANEEL",
  },

  // ── Fontes ainda sem FeatureServer público mapeado (placeholders) ────
  {
    // TODO: mapear endpoint real (ex: EPE FeatureServer ou MapBiomas WFS)
    url:          "URL_PLACEHOLDER_HUBS_DESCARB",
    color:        [147, 51, 234, 0.9],   // Roxo     #9333EA
    outlineColor: [255, 255, 255, 0.75],
    size:         "14px",
    title:        "Hubs Descarbonização",
    emoji:        "🟣",
    source:       "EPE / BNDES",
    isPlaceholder: true,
  },
  {
    // TODO: mapear endpoint real (ex: ANTAQ / SEP FeatureServer)
    url:          "URL_PLACEHOLDER_PORTOS",
    color:        [56, 189, 248, 0.88],  // Azul Claro #38BDF8
    outlineColor: [255, 255, 255, 0.7],
    size:         "12px",
    title:        "Inst. Portuárias",
    emoji:        "🔵",
    source:       "ANTAQ / SEP",
    isPlaceholder: true,
  },
  {
    // TODO: mapear endpoint real (ex: ANP Biometano FeatureServer)
    url:          "URL_PLACEHOLDER_BIOMETANO",
    color:        [249, 115, 22, 0.88],  // Laranja  #F97316
    outlineColor: [255, 255, 255, 0.65],
    size:         "11px",
    title:        "Biometano Comercial",
    emoji:        "🟠",
    source:       "ANP / MME",
    isPlaceholder: true,
  },
];

/** Camada reativa ao chat — ativada quando usuário pergunta sobre Aço Verde */
const ACO_VERDE_LAYER: LayerConfig = {
  // TODO: substituir pelo FeatureServer real do MapBiomas ou IBGE (indústrias siderúrgicas)
  url:          "URL_PLACEHOLDER_ACO_VERDE",
  color:        [34, 197, 94, 0.95],   // Verde Médio #22C55E
  outlineColor: [255, 255, 255, 0.85],
  size:         "14px",
  title:        "Aço Verde",
  emoji:        "🟢",
  source:       "MapBiomas / IBGE",
  isPlaceholder: true,
};

/* ─── Props ──────────────────────────────────────────────────── */
interface ArcGISMapProps {
  mapState: MapState;
}

/* ─── Component ──────────────────────────────────────────────── */
export default function ArcGISMap({ mapState }: ArcGISMapProps) {
  const containerRef    = useRef<HTMLDivElement>(null);
  const viewRef         = useRef<__esri.MapView | null>(null);
  const acoVerdeRef     = useRef<EsriFeatureLayer | null>(null);
  const initializedRef  = useRef(false);

  /* ── Inicialização do mapa (executa 1× ao montar) ─────────── */
  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    let view: __esri.MapView;

    const init = async () => {
      // ─ 1. Assets path — cópia local (evita mismatch SDK v5.0.19 vs CDN 4.32)
      const { default: esriConfig } = await import("@arcgis/core/config.js");
      esriConfig.assetsPath = "/arcgis-assets";
      if (esriConfig.log) (esriConfig.log as { level: string }).level = "error";

      // ─ 2. Imports dinâmicos (todos client-side)
      const [
        { default: Map },
        { default: MapView },
        { default: FeatureLayer },
        { default: SimpleRenderer },
        { default: SimpleMarkerSymbol },
        { default: PopupTemplate },
        { default: Basemap },
        { default: WebTileLayer },
      ] = await Promise.all([
        import("@arcgis/core/Map.js"),
        import("@arcgis/core/views/MapView.js"),
        import("@arcgis/core/layers/FeatureLayer.js"),
        import("@arcgis/core/renderers/SimpleRenderer.js"),
        import("@arcgis/core/symbols/SimpleMarkerSymbol.js"),
        import("@arcgis/core/PopupTemplate.js"),
        import("@arcgis/core/Basemap.js"),
        import("@arcgis/core/layers/WebTileLayer.js"),
      ]);

      /**
       * Fábrica de FeatureLayer.
       * Se cfg.isPlaceholder === true, a camada NÃO é instanciada
       * (evita erros de rede com URLs inválidas) — retorna null.
       */
      const makeLayer = (cfg: LayerConfig): EsriFeatureLayer | null => {
        if (cfg.isPlaceholder) {
          console.info(
            `[PID Copilot] Camada "${cfg.title}" aguarda URL real — placeholder ignorado.`
          );
          return null;
        }

        return new FeatureLayer({
          url:     cfg.url,
          title:   cfg.title,
          visible: true,
          // Sobrescreve o renderer nativo do serviço com nossa paleta visual
          renderer: new SimpleRenderer({
            symbol: new SimpleMarkerSymbol({
              color:   cfg.color,
              size:    cfg.size,
              style:   "circle",
              outline: { color: cfg.outlineColor, width: 1.5 },
            }),
          }),
          popupTemplate: new PopupTemplate({
            title:   `${cfg.emoji} ${cfg.title}`,
            // {NomEmpreendimento} é o campo padrão do SIGEL/ANEEL
            // Caso o serviço use outro campo, o SDK exibe o valor do campo disponível
            content: [
              {
                type: "fields",
                fieldInfos: [
                  { fieldName: "NomEmpreendimento", label: "Empreendimento" },
                  { fieldName: "SigUF",             label: "Estado"         },
                  { fieldName: "MdaPotenciaInstalada", label: "Potência (MW)" },
                  { fieldName: "DscFaseUsina",      label: "Fase"           },
                ],
              },
            ],
          }),
        });
      };

      // ─ 3. Cria camadas estáticas (skip placeholders)
      const staticLayers = STATIC_LAYERS
        .map(makeLayer)
        .filter((l): l is EsriFeatureLayer => l !== null);

      // ─ 4. Camada reativa Aço Verde (inicia invisível)
      //      Placeholder por enquanto — mapa reage via goTo() mesmo sem dados reais
      const acoVerdeLayer: EsriFeatureLayer | null = ACO_VERDE_LAYER.isPlaceholder
        ? null
        : makeLayer(ACO_VERDE_LAYER);

      acoVerdeRef.current = acoVerdeLayer;

      // ─ 5. Basemap CLARO — Carto Positron (tiles públicas, sem auth Esri)
      //      light-gray-vector exige credenciais ArcGIS Online — não disponível aqui
      const lightBasemap = new Basemap({
        baseLayers: [
          new WebTileLayer({
            urlTemplate: "https://{subDomain}.basemaps.cartocdn.com/light_all/{level}/{col}/{row}.png",
            subDomains:  ["a", "b", "c", "d"],
            copyright:   "© OpenStreetMap contributors, © CARTO",
            title:       "Carto Positron",
          }),
        ],
        title: "Light Gray",
      });

      // ─ 6. Mapa + todas as camadas ativas
      const allLayers: EsriFeatureLayer[] = [
        ...staticLayers,
        ...(acoVerdeLayer ? [acoVerdeLayer] : []),
      ];

      const map = new Map({ basemap: lightBasemap, layers: allLayers });

      // ─ 7. MapView centrado no Brasil
      view = new MapView({
        container: containerRef.current!,
        map,
        center: [-51.9253, -14.235],
        zoom:   4,
        ui:     { components: ["zoom", "compass"] },
        popup: {
          dockEnabled: true,
          dockOptions: { position: "top-right" },
        },
      });
      viewRef.current = view;

      await view.when();

      // ─ 8. Aplica estado inicial (caso o chat já tenha sido usado antes do mapa montar)
      applyMapState(acoVerdeLayer, view, mapState.showGreenSteelLayer);
    };

    init().catch(console.error);

    return () => {
      viewRef.current?.destroy();
      viewRef.current        = null;
      acoVerdeRef.current    = null;
      initializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Reage a mudanças vindas do chat ─────────────────────────── */
  useEffect(() => {
    const layer = acoVerdeRef.current;
    const view  = viewRef.current;
    if (!view) return; // view é obrigatória mesmo sem a camada
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

/* ─── Helper: toggle Aço Verde + animação fly-to ─────────────── */
function applyMapState(
  layer: EsriFeatureLayer | null,
  view:  __esri.MapView,
  isActive: boolean
) {
  // Controla visibilidade apenas se a camada real existir
  if (layer) {
    layer.visible = isActive;
  }

  if (isActive) {
    if (layer) {
      // Zoom animado para o extent real dos dados
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
        .catch(() => fallbackGoTo(view));
    } else {
      // Placeholder ativo: apenas faz o fly-to para o Sudeste
      fallbackGoTo(view);
    }
  } else {
    // Volta ao Brasil completo
    view.goTo(
      { center: [-51.9253, -14.235], zoom: 4 },
      { duration: 1200, easing: "ease-out" }
    );
  }
}

/** Fly-to de fallback — foca no cluster Sudeste/Sul das siderúrgicas */
function fallbackGoTo(view: __esri.MapView) {
  view.goTo(
    { center: [-43.5, -21.0], zoom: 7 },
    { duration: 1400, easing: "ease-in-out" }
  );
}
