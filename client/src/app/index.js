import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { Game, HowTo } from "pages";
import { GlobalStyle } from "style";

import styled from "styled-components";

const AppContainer = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 100vh;
`;

const SectionsContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const PageSection = styled.div`
  flex: 10;
  position: relative;
`;

function App() {
  return (
    <AppContainer id="app-container">
      <SectionsContainer id="sections-container">
        <PageSection id="page-container">
          <Router>
            <Routes>
              <Route path="/game" exact element={<Game />} />
              <Route path="/howto" exact element={<HowTo />} />
            </Routes>
          </Router>
          <GlobalStyle />
        </PageSection>
      </SectionsContainer>
    </AppContainer>
  );
}

export default App;
