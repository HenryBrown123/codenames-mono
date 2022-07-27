import React from 'react';
import styled from 'styled-components';

const Ul = styled.ul` 
  list-style: none;
  display: flex;
  flex-flow: row nowrap;  
  height: 100%
  
  li {
    padding-left: 10px;
    padding-right: 10px;
    color: white;
    display: inline-block;
    text-align: center;
    height: 100%;
    line-height: 40px;
    vertical-align: center;

  }
  @media (max-width: 768px) {
    flex-flow: column nowrap;   
    background-color: #0D2538;
    position: fixed;
    transform: ${({ open }) => open ? 'translateX(0)' : 'translateX(100%)'};
    top: 0;
    right: 0;
    height: 100vh;
    width: 300px;
    padding-top: 3.5rem;
    transition: transform 0.3s ease-in-out;
    li {
      color: #fff;
    }
  }
`;

const Wrapper = styled.div`
  background-color: #0D2538;
  margin-top: none;
  margin-bottom: none;
  height: 100%;
`

const SideBar = ({ open }) => {
  return (
    <Wrapper id="side-bar">
    <Ul open={open}>
      <li>Home</li>
      <li>Play</li>
      <li>How to</li>
    </Ul>
    </Wrapper>
  )
}

export default SideBar