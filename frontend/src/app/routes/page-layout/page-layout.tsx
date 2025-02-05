import React, { ReactNode } from "react";
import styled from "styled-components";
import { Menu } from "./menu";

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Banner = styled.div`
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9;
  padding: 0 10px;
  background-color: transparent; /* Add a background if desired */
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  flex-direction: column;
  overflow: auto;
  margin-top: 30px;

  @media (max-width: 768px) {
    margin-top: 30px;
  }
`;

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => (
  <Wrapper>
    {/* Menu placed at the top of the page */}
    <Banner>
      <Menu />
    </Banner>

    {/* Main content area where route/page content is rendered */}
    <Content>{children}</Content>
  </Wrapper>
);

export default PageLayout;
