/**
 * dataSources.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Registro centralizado das fontes de dados oficiais da Plataforma Interativa
 * de Descarbonização (PID), conforme documentado no PID-LEIAME-v.2.pdf.
 *
 * Como usar:
 *   import { DATA_SOURCES, getSourcesByCategory } from "@/config/dataSources";
 *
 * Os componentes devem sempre referenciar estas constantes em vez de
 * hardcodar URLs — facilitando manutenção e futuras integrações com a
 * REST API real do ArcGIS.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

export type DataCategory =
  | "infraestrutura"
  | "industrias"
  | "hidrogenio";

export interface DataSource {
  /** Identificador único (slug) da fonte */
  id: string;
  /** Nome da instituição / portal de dados */
  institution: string;
  /** Sigla ou nome curto para exibição em badges e tooltips */
  shortName: string;
  /** URL pública do portal ou dataset */
  url: string;
  /** Categoria temática da PID a que pertence */
  category: DataCategory;
  /** Descrição resumida do que essa fonte provê */
  description: string;
}

/* ─── Registro completo ──────────────────────────────────────────────────── */

export const DATA_SOURCES: DataSource[] = [
  // ── Infraestrutura ────────────────────────────────────────────────────────
  {
    id: "sigel-aneel",
    institution: "Agência Nacional de Energia Elétrica",
    shortName: "SIGEL/ANEEL",
    url: "https://dadosabertos-aneel.opendata.arcgis.com/",
    category: "infraestrutura",
    description:
      "Sistema de Informações Geográficas do Setor Elétrico. Dados de usinas, linhas de transmissão, subestações e geração distribuída.",
  },
  {
    id: "ide-sisema",
    institution: "Sistema Estadual de Meio Ambiente e Recursos Hídricos (MG)",
    shortName: "IDE-Sisema",
    url: "https://idesisema.meioambiente.mg.gov.br/geonetwork/srv/api/records/c8b6a846-8eb0-4908-bdec-43686cf66982",
    category: "infraestrutura",
    description:
      "Infraestrutura de Dados Espaciais de Minas Gerais. Camadas geoespaciais de uso do solo, recursos hídricos e meio ambiente.",
  },
  {
    id: "epe-webmap",
    institution: "Empresa de Pesquisa Energética",
    shortName: "EPE",
    url: "https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/webmap-epe",
    category: "infraestrutura",
    description:
      "WebMap EPE com dados de planejamento energético, potencial renovável e infraestrutura do setor elétrico nacional.",
  },

  // ── Indústrias ────────────────────────────────────────────────────────────
  {
    id: "ibge-malhas",
    institution: "Instituto Brasileiro de Geografia e Estatística",
    shortName: "IBGE",
    url: "https://www.ibge.gov.br/geociencias/organizacao-do-territorio/malhas-territoriais/15774-malhas",
    category: "industrias",
    description:
      "Malhas territoriais digitais (municipais, estaduais e federais) para cruzamento geoespacial com dados industriais.",
  },
  {
    id: "mapbiomas",
    institution: "MapBiomas Brasil",
    shortName: "MapBiomas",
    url: "https://brasil.mapbiomas.org/dados-de-infraestrutura/",
    category: "industrias",
    description:
      "Mapeamento anual da cobertura e uso do solo no Brasil, incluindo infraestrutura industrial e agropecuária.",
  },

  // ── Hidrogênio ────────────────────────────────────────────────────────────
  {
    id: "iea-hydrogen",
    institution: "International Energy Agency",
    shortName: "IEA",
    url: "https://www.iea.org/data-and-statistics/data-product/hydrogen-production-and-infrastructure-projects-database",
    category: "hidrogenio",
    description:
      "Base de dados global de projetos de produção e infraestrutura de hidrogênio, incluindo hidrogênio verde.",
  },
  {
    id: "epe-hidrogenio",
    institution: "Empresa de Pesquisa Energética",
    shortName: "EPE H₂",
    url: "https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/painel-de-dados-de-potencial-tecnico-de-producao-de-hidrogenio",
    category: "hidrogenio",
    description:
      "Painel de potencial técnico de produção de hidrogênio no Brasil por fonte primária (solar, eólica, biomassa).",
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/**
 * Retorna todas as fontes de uma categoria específica.
 *
 * @example
 * const infraSources = getSourcesByCategory("infraestrutura");
 */
export function getSourcesByCategory(category: DataCategory): DataSource[] {
  return DATA_SOURCES.filter((s) => s.category === category);
}

/**
 * Retorna uma fonte pelo seu id único.
 * Lança um erro em dev se o id não existir (facilita detecção de typos).
 *
 * @example
 * const aneel = getSourceById("sigel-aneel");
 */
export function getSourceById(id: string): DataSource {
  const source = DATA_SOURCES.find((s) => s.id === id);
  if (!source) {
    throw new Error(
      `[dataSources] Fonte com id "${id}" não encontrada. ` +
        `IDs disponíveis: ${DATA_SOURCES.map((s) => s.id).join(", ")}`
    );
  }
  return source;
}

/**
 * Mapa de rótulos legíveis por categoria (para uso em UI).
 */
export const CATEGORY_LABELS: Record<DataCategory, string> = {
  infraestrutura: "Infraestrutura Energética",
  industrias: "Indústrias",
  hidrogenio: "Hidrogênio Verde",
};

/**
 * Siglas das instituições para exibição no footer/attribution,
 * espelhando o padrão já usado no basemap Esri do projeto.
 *
 * @example
 * // Resultado: "ANEEL · EPE · IBGE · MapBiomas · IEA"
 */
export const ATTRIBUTION_STRING = DATA_SOURCES.map((s) => s.shortName)
  .filter((v, i, arr) => arr.indexOf(v) === i) // deduplicar EPE
  .join(" · ");
