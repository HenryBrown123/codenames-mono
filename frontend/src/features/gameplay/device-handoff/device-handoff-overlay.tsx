import React from "react";
import styled, { keyframes } from "styled-components";
import { PlayerRole, PLAYER_ROLE } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
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

const HandoffIcon = styled.div<{ $roleColor: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${(props) => props.$roleColor};
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

const PlayerName = styled.h2`
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 0.5rem;
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
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin: 1rem 0 0;
  font-style: italic;
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

const RoundInfo = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
`;

interface DeviceHandoffOverlayProps {
  gameData: GameData;
  pendingTransition: {
    stage: PlayerRole;
    scene: string;
  };
  onContinue: () => void;
}

/**
 * Device handoff overlay integrated with UI state machine
 */
export const DeviceHandoffOverlay: React.FC<DeviceHandoffOverlayProps> = ({
  gameData,
  pendingTransition,
  onContinue,
}) => {
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

  const getTeamColor = (teamName: string) => {
    if (teamName.toLowerCase().includes("red")) return "#dc2626";
    if (teamName.toLowerCase().includes("blue")) return "#2563eb";
    if (teamName.toLowerCase().includes("green")) return "#059669";
    return "#6b7280";
  };

  const formatRoleName = (role: string) => {
    return role.charAt(0) + role.slice(1).toLowerCase();
  };

  const getActionNeeded = (role: PlayerRole, gameData: GameData): string => {
    const activeTurn = gameData.currentRound?.turns?.find(
      (t) => t.status === "ACTIVE",
    );

    switch (role) {
      case PLAYER_ROLE.CODEMASTER:
        return "give a clue to your team";
      case PLAYER_ROLE.CODEBREAKER:
        return activeTurn?.clue
          ? `make guesses based on the clue "${activeTurn.clue.word}"`
          : "wait for your codemaster's clue";
      case PLAYER_ROLE.SPECTATOR:
        return "watch the game";
      default:
        return "continue playing";
    }
  };

  const getPlayerName = (role: PlayerRole, teamName: string): string => {
    return `${teamName} ${formatRoleName(role)}`;
  };

  const targetRole = pendingTransition.stage;
  const targetTeam = gameData.playerContext.teamName;
  const targetPlayer = getPlayerName(targetRole, targetTeam);
  const actionNeeded = getActionNeeded(targetRole, gameData);

  return (
    <OverlayContainer>
      <BackgroundBlur />
      <HandoffCard>
        {gameData.currentRound && (
          <RoundInfo>Round {gameData.currentRound.roundNumber}</RoundInfo>
        )}

        <HandoffIcon $roleColor={getRoleColor(targetRole)}>
          {getRoleIcon(targetRole)}
        </HandoffIcon>

        <Title>Pass the Device</Title>
        <Subtitle>It's time for the next player to take their turn</Subtitle>

        <PlayerInfo>
          <PlayerName>{targetPlayer}</PlayerName>

          <RoleInfo>
            {getRoleIcon(targetRole)}
            <span>{formatRoleName(targetRole)}</span>
          </RoleInfo>

          <TeamInfo $teamColor={getTeamColor(targetTeam)}>
            {targetTeam}
          </TeamInfo>

          <ActionText>Ready to {actionNeeded}</ActionText>
        </PlayerInfo>

        <ContinueButton onClick={onContinue}>
          <FaHandPaper />
          Continue as {targetPlayer}
        </ContinueButton>
      </HandoffCard>
    </OverlayContainer>
  );
};
