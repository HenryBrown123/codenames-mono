import React , { Component } from 'react'
import ReactCountdownClock  from 'react-countdown-clock'
import styled from 'styled-components'

const ClockWrapper = styled.div`
  
`

const StyledClock = styled(ReactCountdownClock)`
   
`

class CountdownClock extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render() {
        return (
            <ClockWrapper>
                <StyledClock seconds={100}
                    color= 'red'
                    alpha={0.9}
                    size={150}
                    />
            </ClockWrapper>
        )
    }
}

export default CountdownClock

