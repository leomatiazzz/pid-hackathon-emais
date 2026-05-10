/**
 * Ambient type declarations for @arcgis/core v5.
 * These give TypeScript access to the __esri namespace used in ArcGISMap.tsx.
 */

// Re-export the __esri namespace from the SDK
import type MapView from "@arcgis/core/views/MapView.js";
import type GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer.js";

declare global {
  namespace __esri {
    type MapView = InstanceType<typeof import("@arcgis/core/views/MapView.js").default>;
    type GeoJSONLayer = InstanceType<typeof import("@arcgis/core/layers/GeoJSONLayer.js").default>;
  }
}

export {};
