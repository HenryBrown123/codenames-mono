import { ComponentType } from "react";
import { VisibilityContext } from "./context";

export interface PanelConfig {
  id: string;
  component: ComponentType;
  shouldRender: (ctx: VisibilityContext) => boolean;
}

export interface PanelSlots {
  header: PanelConfig[];
  middle: PanelConfig[];
  bottom: PanelConfig[];
}
