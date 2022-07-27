import React, { Component } from 'react'
import api from '../../api'

import styled from 'styled-components'


const Wrapper = styled.div.attrs({
    className: 'form-group',
})`
    margin: 0 30px;
`

const Button = styled.button.attrs({
    className: `btn btn-primary`,
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



class Landing extends Component{
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render(){
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
}

export default Landing