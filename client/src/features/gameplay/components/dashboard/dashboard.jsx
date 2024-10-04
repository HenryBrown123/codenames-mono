import React , { Component } from 'react'

import styled from 'styled-components'
import ActionButton from './action-button'
import DashboardMessage from './dashboard-message'

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

export const Dashboard = () =>{

    return (
        <Grid>
            <DashboardContainer id="dashboard-container">
                <DashboardSection id="action-section" size={2}>
                    <DashboardMessage messageText={'Very very long message............ even longer message that wraps....'} messageType = {'test'} />
                </DashboardSection>    
                <DashboardSection id="action-section" size={1}>
                    <ActionButton/>
                </DashboardSection>                    
            </DashboardContainer>     
        </Grid>
    )
}



