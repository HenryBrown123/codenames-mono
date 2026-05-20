import { ComponentType } from "react";
import { VisibilityContext } from "./context";

/** A panel registration — its component and the rule that gates its render. */
export interface PanelConfig {
  id: string;
  component: ComponentType;
  shouldRender: (ctx: VisibilityContext) => boolean;
}

/** Ordered panel lists for each dashboard region. */
export interface PanelSlots {
  header: PanelConfig[];
  middle: PanelConfig[];
  bottom: PanelConfig[];
}
