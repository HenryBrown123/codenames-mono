import React, { Component } from 'react'
import api from 'api'

import styled from 'styled-components'

const Title = styled.h1.attrs({
    className: 'h1',
})``

const Wrapper = styled.div.attrs({
    className: 'form-group',
})`
    margin: 0 30px;
`

const Label = styled.label`
    margin: 5px;
`

const InputText = styled.input.attrs({
    className: 'form-control',
})`
    margin: 5px;
`

const Button = styled.button.attrs({
    className: `btn btn-primary`,
})`
    margin: 15px 15px 15px 5px;
`

const CancelButton = styled.a.attrs({
    className: `btn btn-danger`,
})`
    margin: 15px 15px 15px 5px;
`

const Container = styled.div.attrs({
    className: 'container',
})`
    padding-top:5px;
`
const Panel = styled.div.attrs({
    className : 'panel',
})`
    padding: 15px 15px 15px 15px
    margin-top:5px;
    background: #f59042;
`

export const HowTo = () => {
   
        return(
            <Container>
                <Panel>
                    <h1>How to play</h1>
                    <p>
                        how to play text...
                    </p>
                </Panel>
            </Container>
        )
        }