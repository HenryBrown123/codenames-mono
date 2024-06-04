import React , { Component } from 'react'

import styled from 'styled-components'
import CountdownClock  from './CountdownClock'
import ActionButton from './ActionButton'

const Grid = styled.div`
    height:100%;
`;

const DashboardContainer = styled.div`
    display: flex;
    align-items: stretch;
    height:100%;
`;

const DashboardSection = styled.div`
    flex: ${(props) => props.size};
    display: flex;
    align-items: center;
    justify-content: center;
`;

const CenterItemWrapper = styled.div`
`

const CornerButtonContainer = styled.div`

`

const CornerButtonWrapper = styled.div`
    //align-self: flex-start;
`



class Dashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render() {
        return (
            <Grid>
                <DashboardContainer id="dashboard-container">
                    <DashboardSection id="action-section" size={1}><ActionButton/></DashboardSection>
                </DashboardContainer>
            </Grid>
        )
    }
}

export default Dashboard
