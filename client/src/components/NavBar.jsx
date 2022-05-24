import React, { Component } from 'react'
import styled from 'styled-components'

import Logo from './Logo'
import Links from './Links'

const Container = styled.div.attrs({
    className: 'container',
})`
`

const Wrapper = styled.div.attrs({
    className: 'wrapper',
})` @media (min-width: 1200px) {
    max-width:100%;
  }
`

const Nav = styled.nav.attrs({
    className: 'navbar navbar-expand-lg navbar-dark bg-dark',
})`
    margin-bottom: 20 px;
`

class NavBar extends Component {
    render() {
        return (
            <Wrapper>
                    <Nav>
                        <Links />
                    </Nav>
            </Wrapper>
        )
    }
}

export default NavBar