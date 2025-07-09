import { createGlobalStyle } from "styled-components";
import { GlobalDesignSystemStyles } from "./design-system-theme";

export const GlobalStyles = createGlobalStyle`
  ${GlobalDesignSystemStyles}
`;