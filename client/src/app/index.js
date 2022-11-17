import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import { NavBar } from '../components'
import { Game,HowTo,Sandbox} from '../pages'
import { GlobalStyle } from '../style'

import { FloatingButton, Item } from "react-floating-button";
import newGameIcon from  "../assets/NewGame.svg"


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
            {/* <NavSection id="nav-container">
                    <NavBar />
            </NavSection> */}
           {/* <FloatingButton>
                <Item
                    imgSrc={newGameIcon}
                    onClick={() => {
                    console.log("callback function here");
                    }}
                />
                <Item
                    onClick={() => {
                    console.log("callback function here");
                    }}
                />
</FloatingButton>; */}
                    <Router>
                        <Switch>
                            <PageSection id="page-container">
                                <Route path = "/game" exact component={Game} />
                                <Route path = "/howto" exact component={HowTo} />
                            </PageSection>
                        </Switch>
                    </Router>
                    <GlobalStyle />
            </SectionsContainer> 
        </AppContainer>
    )
}

export default App