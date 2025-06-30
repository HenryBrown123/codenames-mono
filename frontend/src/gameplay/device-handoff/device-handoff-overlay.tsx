import React from "react";
import styled, { keyframes } from "styled-components";
import { PlayerRole, PLAYER_ROLE } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { usePlayersQuery } from "@frontend/gameplay/api/queries/use-players-query";
import { FaHandPaper, FaGamepad, FaCrown, FaSearch } from "react-icons/fa";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const BackgroundBlur = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.7);
`;

const HandoffCard = styled.div`
  position: relative;
  background: linear-gradient(135deg, #2a2a40 0%, #1a1a2e 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  animation: ${fadeIn} 0.6s ease-out;
`;

const LoadingCard = styled(HandoffCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #4dabf7;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1.5rem;
`;

const LoadingText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 0;
`;

const HandoffIcon = styled.div<{ $color: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  font-size: 2rem;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  color: white;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 0 0 2rem;
  line-height: 1.5;
`;

const PlayerInfo = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 2rem 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const PlayerName = styled.h2<{ $teamColor?: string }>`
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 0.5rem;
  ${props => props.$teamColor && `
    background: linear-gradient(135deg, ${props.$teamColor}dd, ${props.$teamColor}99);
    padding: 0.5rem 1.5rem;
    border-radius: 12px;
    display: inline-block;
  `}
`;

const RoleInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
`;

const TeamInfo = styled.div<{ $teamColor: string }>`
  display: inline-block;
  background: ${(props) => props.$teamColor};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionText = styled.p`
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.1rem;
  margin: 1.5rem 0 0;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const ContinueButton = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 16px;
  padding: 1rem 2.5rem;
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
  animation: ${pulse} 2s ease-in-out infinite;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem auto 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(16, 185, 129, 0.4);
    animation: none;
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 1.1rem;
  margin: 1rem 0;
`;

interface DeviceHandoffOverlayProps {
  gameData: GameData;
  pendingTransition: {
    stage: PlayerRole;
    scene: string;
  };
  onContinue: (playerId: string) => void;
}

/**
 * Gets icon for a role
 */
const getRoleIcon = (role: string) => {
  switch (role) {
    case PLAYER_ROLE.CODEMASTER:
      return <FaCrown />;
    case PLAYER_ROLE.CODEBREAKER:
      return <FaSearch />;
    case PLAYER_ROLE.SPECTATOR:
      return <FaGamepad />;
    default:
      return <FaHandPaper />;
  }
};

/**
 * Gets color for a role
 */
const getRoleColor = (role: string) => {
  switch (role) {
    case PLAYER_ROLE.CODEMASTER:
      return "linear-gradient(135deg, #f59e0b, #d97706)";
    case PLAYER_ROLE.CODEBREAKER:
      return "linear-gradient(135deg, #3b82f6, #2563eb)";
    case PLAYER_ROLE.SPECTATOR:
      return "linear-gradient(135deg, #6b7280, #4b5563)";
    default:
      return "linear-gradient(135deg, #10b981, #059669)";
  }
};

/**
 * Gets team color
 */
const getTeamColor = (teamName: string) => {
  if (teamName.toLowerCase().includes("red")) return "#dc2626";
  if (teamName.toLowerCase().includes("blue")) return "#2563eb";
  if (teamName.toLowerCase().includes("green")) return "#059669";
  return "#6b7280";
};

/**
 * Formats role name for display
 */
const formatRoleName = (role: string) => {
  return role.charAt(0) + role.slice(1).toLowerCase();
};

/**
 * Gets action text based on role
 */
const getActionText = (role: PlayerRole): string => {
  switch (role) {
    case PLAYER_ROLE.CODEMASTER:
      return "Hide the screen! You're about to see which cards belong to each team. Don't let the codebreakers peek!";
    case PLAYER_ROLE.CODEBREAKER:
      return "Time to guess! Work together to decode your codemaster's clue and find your team's cards.";
    case PLAYER_ROLE.SPECTATOR:
      return "Watch the game unfold!";
    default:
      return "Continue playing";
  }
};

/**
 * Device handoff overlay - queries players to determine next player
 */
export const DeviceHandoffOverlay: React.FC<DeviceHandoffOverlayProps> = ({
  gameData,
  pendingTransition,
  onContinue,
}) => {
  // Query players to find who's active
  const { data: players, isLoading, error } = usePlayersQuery(gameData.publicId);
  
  // Find the next active player
  const nextPlayer = players?.find(p => p.status === 'ACTIVE');
  
  // Show loading state while querying
  if (isLoading) {
    return (
      <OverlayContainer>
        <BackgroundBlur />
        <LoadingCard>
          <LoadingSpinner />
          <LoadingText>Finding next player...</LoadingText>
        </LoadingCard>
      </OverlayContainer>
    );
  }
  
  // Show error if query failed
  if (error) {
    return (
      <OverlayContainer>
        <BackgroundBlur />
        <HandoffCard>
          <Title>Error</Title>
          <ErrorText>Failed to determine next player</ErrorText>
          <ContinueButton onClick={() => window.location.reload()}>
            Reload Game
          </ContinueButton>
        </HandoffCard>
      </OverlayContainer>
    );
  }
  
  // Show error if no active player found
  if (!nextPlayer) {
    return (
      <OverlayContainer>
        <BackgroundBlur />
        <HandoffCard>
          <Title>No Active Player</Title>
          <ErrorText>Unable to find an active player. This shouldn't happen!</ErrorText>
          <ContinueButton onClick={() => window.location.reload()}>
            Reload Game
          </ContinueButton>
        </HandoffCard>
      </OverlayContainer>
    );
  }
  
  // Now we have the next player, determine display details
  const targetRole = nextPlayer.role;
  const targetTeam = nextPlayer.teamName;
  const teamColor = getTeamColor(targetTeam);
  
  // Display name based on role
  const displayName = targetRole === PLAYER_ROLE.CODEMASTER 
    ? nextPlayer.name 
    : `${targetTeam} Codebreakers`;
  
  const actionText = getActionText(targetRole);
  
  const handleContinue = () => {
    // Pass the player ID to parent for context update
    onContinue(nextPlayer.publicId);
  };
  
  return (
    <OverlayContainer>
      <BackgroundBlur />
      <HandoffCard>
        <HandoffIcon $color={getRoleColor(targetRole)}>
          {getRoleIcon(targetRole)}
        </HandoffIcon>

        <Title>Pass the Device</Title>
        <Subtitle>It's time for the next player to take their turn</Subtitle>

        <PlayerInfo>
          <PlayerName $teamColor={targetRole === PLAYER_ROLE.CODEBREAKER ? teamColor : undefined}>
            {displayName}
          </PlayerName>

          {targetRole === PLAYER_ROLE.CODEMASTER && (
            <RoleInfo>
              <TeamInfo $teamColor={teamColor}>
                {targetTeam} Codemaster
              </TeamInfo>
            </RoleInfo>
          )}

          <ActionText>{actionText}</ActionText>
        </PlayerInfo>

        <ContinueButton onClick={handleContinue}>
          I'm Ready
        </ContinueButton>
      </HandoffCard>
    </OverlayContainer>
  );
};