import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';

import { Game, HowTo } from '../pages';
import { GlobalStyle, lightTheme, darkTheme  } from '../style'; // Ensure this path is correct

// Styled Components
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

const ToggleButton = styled.button`
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: var(--color-text);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: var(--color-secondary);
  }
`;

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyle />
      <AppContainer id="app-container">
        <SectionsContainer id="sections-container">
          <PageSection id="page-container">
            <Router>
              <Routes>
                <Route path="/game" element={<Game />} />
                <Route path="/howto" element={<HowTo />} />
              </Routes>
            </Router>
          </PageSection>
        </SectionsContainer>
        {/*<ToggleButton onClick={toggleTheme}>
          {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </ToggleButton>*/}
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
