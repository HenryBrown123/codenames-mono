import React, { Component } from 'react'
import styled from 'styled-components'
import { slide as Menu } from "react-burger-menu";

import Burger from './Burger'

const Wrapper = styled.div.attrs({
    className: 'wrapper', 
})` 
    position:absolute;
    left:0;
    top: 0;
    right:0;
    height: 100%;

@media (min-width: 1200px) {
    max-width:100%;
  }
`

class NavBar extends Component {
    render() {
        return (
            <Wrapper id="burger-wrapper">
                    <Burger/>
            </Wrapper>
        )
    }
}

export default NavBar