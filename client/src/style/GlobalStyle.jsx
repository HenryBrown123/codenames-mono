import { createGlobalStyle } from 'styled-components';

// border can be used to toggle boarders around all divs... useful for debug
const GlobalStyle = createGlobalStyle`
* {
  box-sizing: border-box
  color: #000
  font-family: 'Courier New', monospace;
}

div {
    border: 1px dashed red; 
}
`

export default GlobalStyle