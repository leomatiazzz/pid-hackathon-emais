/**
 * Tipos compartilhados para o estado do mapa da interface PID Copilot.
 * Separado de page.tsx para evitar acoplamento entre componentes e páginas.
 */

export interface MapState {
  showGreenSteelLayer: boolean;
  activeLayer: string | null;
}
