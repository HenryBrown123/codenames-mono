import styled from 'styled-components'

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