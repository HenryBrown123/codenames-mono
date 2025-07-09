import React, { ReactNode } from "react";
import styled from "styled-components";

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


const Content = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  flex-direction: column;
  overflow: auto;
  /* margin-top: 30px; <- Remove this */

  @media (max-width: 768px) {
    /* margin-top: 30px; <- Remove this too */
  }
`;

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => (
  <Wrapper>
    {/* Main content area where route/page content is rendered */}
    <Content>{children}</Content>
  </Wrapper>
);

export default PageLayout;
