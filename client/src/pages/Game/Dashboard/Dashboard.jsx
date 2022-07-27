import React , { Component } from 'react'

import styled from 'styled-components'

const Grid = styled.div`

`;

const Row = styled.div`
    display: flex;
`;

const Col = styled.div`
    flex: ${(props) => props.size}
`;



class Dashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render() {
        return (
            <Grid>
                <Row>
                    <Col size={1}>LOOOOOOONG COL</Col>
                    <Col size={1}>LOOOOOOONG COL</Col>
                </Row>
            </Grid>
        )
    }
}

export default Dashboard
