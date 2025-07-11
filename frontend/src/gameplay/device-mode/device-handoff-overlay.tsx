import React, { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { PlayerRole, PLAYER_ROLE } from "@codenames/shared/types";
import { GameData } from "@frontend/shared-types";
import { usePlayersQuery } from "../shared/api";
import { FaLeaf } from "react-icons/fa";

// Hacker theme animations
const glitchAnimation = keyframes`
  0%, 100% {
    text-shadow: 
      0 0 2px var(--color-primary, #00ff88),
      0 0 4px var(--color-primary, #00ff88);
  }
  25% {
    text-shadow: 
      -2px 0 var(--color-team-red, #ff0040),
      2px 0 var(--color-team-blue, #00d4ff);
  }
  50% {
    text-shadow: 
      2px 0 var(--color-accent, #ff0080),
      -2px 0 var(--color-primary, #00ff88);
  }
  75% {
    text-shadow: 
      0 0 2px var(--color-team-blue, #00d4ff),
      0 0 4px var(--color-team-blue, #00d4ff);
  }
`;

const scanlineAnimation = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`;

const electricFlicker = keyframes`
  0%, 100% {
    opacity: 0.6;
    filter: brightness(0.8);
  }
  10% {
    opacity: 1;
    filter: brightness(1.5);
  }
  20% {
    opacity: 0.7;
    filter: brightness(0.9);
  }
  30% {
    opacity: 1;
    filter: brightness(1.3);
  }
  50% {
    opacity: 1;
    filter: brightness(1.2);
  }
  70% {
    opacity: 0.8;
    filter: brightness(1);
  }
  90% {
    opacity: 1;
    filter: brightness(1.4);
  }
`;

const hackerPulse = keyframes`
  0%, 100% {
    border-color: rgba(0, 255, 136, 0.3);
    box-shadow: 
      0 0 10px rgba(0, 255, 136, 0.2),
      inset 0 0 10px rgba(0, 255, 136, 0.05);
  }
  50% {
    border-color: rgba(0, 255, 136, 0.6);
    box-shadow: 
      0 0 20px rgba(0, 255, 136, 0.4),
      inset 0 0 20px rgba(0, 255, 136, 0.1);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
    filter: blur(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
`;

const fadeOutBlur = keyframes`
  from {
    opacity: 1;
    filter: blur(0px);
  }
  to {
    opacity: 0;
    filter: blur(10px);
  }
`;

const OverlayContainer = styled.div<{ $isExiting: boolean }>`
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
  animation: ${(props) => (props.$isExiting ? fadeOutBlur : "none")} 0.6s ease-out forwards;
`;

const BackgroundBlur = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(8px);
  background: 
    radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 0, 128, 0.1) 0%, transparent 50%),
    var(--color-background, #0a0a0f);
`;

const HandoffCard = styled.div`
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(10, 10, 15, 0.98) 0%,
    rgba(26, 26, 46, 0.98) 100%
  );
  border: 2px solid var(--color-primary, #00ff88);
  border-radius: 16px;
  padding: 3rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  backdrop-filter: blur(20px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(0, 255, 136, 0.3);
  animation: ${fadeIn} 0.6s ease-out, ${hackerPulse} 3s ease-in-out infinite;
  font-family: "JetBrains Mono", "Courier New", monospace;
  overflow: hidden;

  /* Scanline effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(0, 255, 136, 0.8) 50%,
      transparent 100%
    );
    animation: ${scanlineAnimation} 3s linear infinite;
    pointer-events: none;
  }

  /* Terminal header */
  &::after {
    content: "CLASSIFIED HANDOFF";
    position: absolute;
    top: 1rem;
    left: 1rem;
    font-size: 0.7rem;
    color: var(--color-primary, #00ff88);
    opacity: 0.5;
    letter-spacing: 0.2em;
    animation: ${glitchAnimation} 2s infinite;
  }

  @media (max-width: 768px) {
    padding: 2rem;
    width: 95%;
    max-width: 400px;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    width: 90%;
    border-radius: 12px;
  }
`;

const HandoffIcon = styled.div<{ $teamColor: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.$teamColor}dd, ${props => props.$teamColor}99);
  border: 2px solid var(--color-primary, #00ff88);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  font-size: 2rem;
  color: white;
  font-weight: 900;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 136, 0.3);
  animation: ${electricFlicker} 2s ease-in-out infinite;

  @media (max-width: 480px) {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

const Title = styled.h1`
  color: var(--color-primary, #00ff88);
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: "JetBrains Mono", "Courier New", monospace;
  animation: ${glitchAnimation} 4s ease-in-out infinite;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
  }
`;

const Subtitle = styled.p`
  color: var(--color-text-muted, rgba(255, 255, 255, 0.7));
  font-size: 1.1rem;
  margin: 0 0 2rem;
  line-height: 1.5;
  font-family: "JetBrains Mono", "Courier New", monospace;

  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
`;

const PlayerInfo = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  position: relative;
  overflow: hidden;

  /* Inner glow */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 0%,
      rgba(0, 255, 136, 0.05) 50%,
      transparent 100%
    );
    pointer-events: none;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    margin: 1.5rem 0;
    border-radius: 8px;
  }
`;

const PlayerName = styled.h2<{ $teamColor?: string }>`
  color: var(--color-text, white);
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  font-family: "JetBrains Mono", "Courier New", monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  ${(props) =>
    props.$teamColor &&
    css`
    background: linear-gradient(135deg, ${props.$teamColor}dd, ${props.$teamColor}99);
    padding: 0.5rem 1.5rem;
    border-radius: 8px;
    border: 1px solid ${props.$teamColor};
    display: inline-block;
    animation: ${hackerPulse} 2s ease-in-out infinite;
  `}

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
    padding: 0.4rem 1rem;
  }
`;

const TeamInfo = styled.div<{ $teamColor: string }>`
  display: inline-block;
  background: linear-gradient(135deg, ${props => props.$teamColor}dd, ${props => props.$teamColor}99);
  border: 1px solid ${props => props.$teamColor};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: "JetBrains Mono", "Courier New", monospace;
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
`;

const ActionText = styled.p`
  color: var(--color-text-muted, rgba(255, 255, 255, 0.8));
  font-size: 1.1rem;
  margin: 1.5rem 0 0;
  line-height: 1.6;
  white-space: pre-wrap;
  font-family: "JetBrains Mono", "Courier New", monospace;

  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-top: 1rem;
    line-height: 1.4;
  }
`;

const ContinueButton = styled.button`
  background: transparent;
  border: 1px solid var(--color-primary, #00ff88);
  color: var(--color-primary, #00ff88);
  border-radius: 8px;
  padding: 1rem 2.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "JetBrains Mono", "Courier New", monospace;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
  animation: ${hackerPulse} 2s ease-in-out infinite;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem auto 0;
  min-height: 44px;
  min-width: 44px;
  position: relative;
  overflow: hidden;

  /* Data stream effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 2px,
      rgba(0, 255, 136, 0.03) 2px,
      rgba(0, 255, 136, 0.03) 4px
    );
    animation: ${scanlineAnimation} 10s linear infinite;
    pointer-events: none;
  }

  &:hover:not(:disabled) {
    background-color: var(--color-primary, #00ff88);
    color: #000;
    transform: translateY(-2px);
    box-shadow: 
      0 6px 25px rgba(0, 255, 136, 0.4),
      inset 0 0 20px rgba(0, 255, 136, 0.1);
    animation: none;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    animation: none;
  }

  @media (max-width: 768px) {
    padding: 0.9rem 2rem;
    font-size: 1.1rem;
  }

  @media (max-width: 480px) {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    margin-top: 1.5rem;
    border-radius: 6px;
  }
`;

const ErrorText = styled.p`
  color: var(--color-accent, #ff0080);
  font-size: 1.1rem;
  margin: 1rem 0;
  font-family: "JetBrains Mono", "Courier New", monospace;
  animation: ${glitchAnimation} 1s infinite;
`;

interface DeviceHandoffOverlayProps {
  gameData: GameData;
  onContinue: (playerId: string) => void;
}

/**
 * Gets team symbol using the same symbols as game cards
 */
const getTeamSymbol = (teamName: string) => {
  const team = teamName.toLowerCase();
  if (team.includes("red")) return "★";
  if (team.includes("blue")) return "♦";
  if (team.includes("green")) return <FaLeaf />;
  return "●";
};

/**
 * Gets role symbol
 */
const getRoleSymbol = (role: string) => {
  switch (role) {
    case PLAYER_ROLE.CODEMASTER:
      return "⚡";
    case PLAYER_ROLE.CODEBREAKER:
      return "🔍";
    case PLAYER_ROLE.SPECTATOR:
      return "👁";
    default:
      return "◆";
  }
};

/**
 * Gets team color using design system colors
 */
const getTeamColor = (teamName: string) => {
  const team = teamName.toLowerCase();
  if (team.includes("red")) return "var(--color-team-red, #ff0040)";
  if (team.includes("blue")) return "var(--color-team-blue, #00d4ff)";
  if (team.includes("green")) return "var(--color-primary, #00ff88)";
  return "var(--color-neutral, #888888)";
};

/**
 * Gets action text based on role - hacker themed
 */
const getActionText = (role: PlayerRole): string => {
  switch (role) {
    case PLAYER_ROLE.CODEMASTER:
      return ">>> CLASSIFIED DATA INCOMING\n>>> HIDE SCREEN FROM OPERATIVES\n>>> INTEL COMPROMISED IF SEEN";
    case PLAYER_ROLE.CODEBREAKER:
      return ">>> DECODE TRANSMISSION\n>>> ANALYZE OPERATIVE INTEL\n>>> LOCATE TARGET ASSETS";
    case PLAYER_ROLE.SPECTATOR:
      return ">>> SURVEILLANCE MODE ACTIVE\n>>> MONITOR FIELD OPERATIONS";
    default:
      return ">>> CONTINUE MISSION";
  }
};

/**
 * Device handoff overlay - queries players to determine next player
 */
export const DeviceHandoffOverlay: React.FC<DeviceHandoffOverlayProps> = ({
  gameData,
  onContinue,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Query players to find who's active
  const { data: players } = usePlayersQuery(gameData.publicId);

  // Find the next active player - if no data yet, we'll show loading state
  const nextPlayer = players?.find((p) => p.status === "ACTIVE");
  const isReady = !!nextPlayer;

  // Handle continue click
  const handleContinueClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setIsExiting(true);
  };

  // Handle animation end
  const handleAnimationEnd = () => {
    if (isExiting && selectedPlayerId) {
      onContinue(selectedPlayerId);
    }
  };

  // Determine display values - use placeholders if still loading
  const targetRole = nextPlayer?.role || PLAYER_ROLE.NONE;
  const targetTeam = nextPlayer?.teamName || "Team";
  const teamColor = getTeamColor(targetTeam);

  // Display name based on role
  const displayName = nextPlayer
    ? targetRole === PLAYER_ROLE.CODEMASTER
      ? nextPlayer.name
      : `${targetTeam} Operatives`
    : "LOADING...";

  const actionText = getActionText(targetRole);

  return (
    <OverlayContainer $isExiting={isExiting} onAnimationEnd={handleAnimationEnd}>
      <BackgroundBlur />
      <HandoffCard>
        <HandoffIcon $teamColor={teamColor}>
          {targetRole === PLAYER_ROLE.CODEMASTER ? getRoleSymbol(targetRole) : getTeamSymbol(targetTeam)}
        </HandoffIcon>

        <Title>Device Handoff</Title>
        <Subtitle>
          {isReady
            ? ">>> TRANSFERRING CONTROL"
            : ">>> ESTABLISHING CONNECTION..."}
        </Subtitle>

        <PlayerInfo style={{ opacity: isReady ? 1 : 0.5 }}>
          <PlayerName $teamColor={targetRole === PLAYER_ROLE.CODEBREAKER ? teamColor : undefined}>
            {displayName}
          </PlayerName>

          {targetRole === PLAYER_ROLE.CODEMASTER && nextPlayer && (
            <TeamInfo $teamColor={teamColor}>{targetTeam} Spymaster</TeamInfo>
          )}

          <ActionText>{actionText}</ActionText>
        </PlayerInfo>

        <ContinueButton
          onClick={() => nextPlayer && handleContinueClick(nextPlayer.publicId)}
          disabled={!isReady}
        >
          {isReady ? "EXECUTE" : "LOADING..."}
        </ContinueButton>
      </HandoffCard>
    </OverlayContainer>
  );
};