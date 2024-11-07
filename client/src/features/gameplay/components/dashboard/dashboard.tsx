import styled from 'styled-components';
import ActionButton from './action-button';
import StageInputForm from './codemaster-input';
import { Stage } from '@game/game-common-types';

const Grid = styled.div`
    height: 100vh; /* Ensures the grid takes the full height of the viewport */
    display: flex;
    align-items: center; /* Centers the content vertically */
        justify-content: center; /* Centers the content horizontally */
`;

const DashboardContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
`;

type DashboardSectionProps = {
    size: number;
}

const DashboardSection = styled.div<DashboardSectionProps>`
    flex: ${(props) => props.size};
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
`;

type DashboardProps = {
    stage: Stage;  
}

export const Dashboard: React.FC<DashboardProps> = ({ stage }) => {
    return (
        <Grid>
            <DashboardContainer>
                <DashboardSection size={1}>
                    {/* Conditionally render based on the stage */}
                    {stage === 'intro' && <ActionButton onClick={() => console.log('Clicked!')} text="PLAY" />}
                    {stage === 'codemaster' && <StageInputForm />}
                </DashboardSection>
            </DashboardContainer>
        </Grid>
    );
};
