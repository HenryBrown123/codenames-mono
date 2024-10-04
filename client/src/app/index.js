import React from 'react'

import {
    BrowserRouter as Router,
    Routes,
    Route
  } from "react-router-dom";

import { Game,HowTo} from '../pages'
import { GlobalStyle } from '../style'


import styled from 'styled-components'

const AppContainer = styled.div`
    position:absolute;
    left:0;
    bottom:0;
    right:0;
    height:100vh;
`;

const SectionsContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
`;

const NavSection = styled.div`
    flex: 1;
    position: relative;

    @media (max-width: 768px) {
        flex:0;
      }
`;

const PageSection = styled.div`
    flex: 10;
    position: relative;
`;

function App() {
    return (
        <AppContainer id="app-container">
            <SectionsContainer id="sections-container">
                <PageSection>
                    <Router>
                        <Routes>
                                <Route path = "/game"  element={<Game />} />
                                <Route path = "/howto"  element={<HowTo />} />
                        </Routes>
                    </Router>
                    </PageSection>
                    <GlobalStyle />
            </SectionsContainer> 
        </AppContainer>
    )
}

export default App