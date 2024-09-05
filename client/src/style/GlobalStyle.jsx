import { createGlobalStyle } from 'styled-components';

// border can be used to toggle boarders around all divs... useful for debug
const GlobalStyle = createGlobalStyle`
* {
  box-sizing: border-box;
  font-family: 'Courier New', monospace;
}

div {
    // border: 1px dashed red;// put boarder around all divs on page for layout development
}

html {
    --color-text: black;
    --color-background: #c2bdbd;
    --color-primary: #44a85a;
    --color-secondary: #a6eb25ba;
    --color-card: #00000096;
    --color-dashboard: black;
    --color-team1: #5050eae2;
    --color-team2: #ea4b4b;

  }
`;

export default GlobalStyle