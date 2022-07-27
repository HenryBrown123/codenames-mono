import React, { Component } from 'react'
import styled from 'styled-components'

import logo from './logo.png'

const Wrapper = styled.a.attrs({
    className: 'navbar-brand',
})``

class Logo extends Component {
    render() {
        return (
            <Wrapper>
                <img src={logo} width="150" height="50" alt="sambarros.com" />
            </Wrapper>
        )
    }
}

export default Logo 