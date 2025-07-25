import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  useLobbyQuery,
  useAddPlayer,
  useRemovePlayer,
  useRenamePlayer,
  useMovePlayerToTeam,
  useStartGame,
  type LobbyData,
  type LobbyPlayer,
} from "@frontend/lobby/api";

interface LobbyInterfaceProps {
  gameId: string;
}

// Animations
const glitchAnimation = keyframes`
  0%, 100% {
    text-shadow: 
      0 0 2px var(--color-primary, #00ff88),
      0 0 4px var(--color-primary, #00ff88);
  }
  25% {
    text-shadow: 
      -2px 0 var(--color-accent, #ff0080),
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

const statusBlink = keyframes`
  0%, 49% { 
    opacity: 1; 
  }
  50%, 100% { 
    opacity: 0.3; 
  }
`;

// Create a global style for synchronized animation
const GlobalStatusAnimation = styled.div`
  @keyframes global-status-blink {
    0%,
    49% {
      opacity: 1;
    }
    50%,
    100% {
      opacity: 0.3;
    }
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-primary, #00ff88);
    box-shadow: 0 0 4px var(--color-primary, #00ff88);
    animation: global-status-blink 1.5s step-end infinite;
  }
`;

// Styled Components
const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: auto;
`;

const MainContent = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 30px;
  background: linear-gradient(120deg, rgba(10, 16, 14, 0.76) 65%, rgba(20, 20, 30, 0.7) 100%);
  border: 1px solid var(--color-primary, #00ff88);
  border-radius: 8px;
  box-shadow: 0 0 24px 0 rgba(64, 255, 166, 0.14);
  display: flex;
  flex-direction: column;
  position: relative;
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
    animation: ${scanlineAnimation} 4s linear infinite;
    pointer-events: none;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: bold;
  color: var(--color-primary, #00ff88);
  text-transform: uppercase;
  letter-spacing: 6px;
  margin-bottom: 8px;
  opacity: 0.9;
  font-family: "JetBrains Mono", "Courier New", monospace;
  animation: ${glitchAnimation} 4s ease-in-out infinite;
`;

const GameInfo = styled.div`
  color: var(--color-team-blue, #00d4ff);
  font-size: 1.2rem;
  opacity: 0.7;
  letter-spacing: 2px;
  font-family: "JetBrains Mono", monospace;
`;

const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin: 20px 0 50px 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const TeamTile = styled.div<{ $teamColor: string; $isDragOver?: boolean }>`
  border: 1px solid ${(props) => props.$teamColor};
  border-radius: 4px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(1px);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 400px;

  ${(props) =>
    props.$isDragOver &&
    `
    border-color: ${props.$teamColor};
    background: rgba(0, 0, 0, 0.7);
    box-shadow: 0 0 20px ${props.$teamColor};
    transform: scale(1.02);
  `}
`;

const TeamHeader = styled.div`
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TeamName = styled.h2<{ $teamColor: string }>`
  font-size: 1.3rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 3px;
  opacity: 0.9;
  color: ${(props) => props.$teamColor};
  font-family: "JetBrains Mono", monospace;
`;

const PlayerCount = styled.div`
  color: var(--color-team-blue, #00d4ff);
  font-size: 1rem;
  opacity: 0.7;
  font-family: "JetBrains Mono", monospace;
`;

const PlayersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 12px;
  font-family: "JetBrains Mono", monospace;
  font-size: 1.1rem;
  min-height: 180px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0;
  flex: 1;

  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary, #00ff88) transparent;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-primary, #00ff88);
    opacity: 0.5;
  }
`;

const PlayerTile = styled.div<{ $isDragging?: boolean }>`
  background: transparent;
  border: none;
  padding: 6px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  transition: all 0.1s ease;
  position: relative;
  line-height: 1.4;
  height: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: ${(props) => (props.$isDragging ? "grabbing" : "grab")};
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  user-select: none;

  &::before {
    content: ">";
    color: var(--color-primary, #00ff88);
    opacity: 0.5;
    margin-right: 4px;
  }

  &:hover {
    background: rgba(0, 255, 136, 0.05);
    padding-left: 4px;

    &::before {
      opacity: 1;
    }
  }
`;

const PlayerSlot = styled.div`
  background: transparent;
  border: none;
  padding: 6px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  transition: all 0.1s ease;
  position: relative;
  line-height: 1.4;
  height: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.2);

  &::before {
    content: ">";
    color: rgba(255, 255, 255, 0.1);
    opacity: 0.5;
    margin-right: 4px;
  }
`;

const PlayerName = styled.span`
  color: white;
  font-weight: 500;
  font-size: 1.1rem;
  flex: 1;
`;

const EditableInput = styled.input`
  background: transparent;
  border: 1px solid var(--color-primary, #00ff88);
  color: white;
  font-weight: 500;
  font-size: 1.1rem;
  padding: 0.2rem 0.5rem;
  border-radius: 2px;
  flex: 1;
  font-family: "JetBrains Mono", monospace;

  &:focus {
    outline: none;
    border-color: white;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
  }
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 0, 0, 0.5);
  padding: 0 4px;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  font-family: "JetBrains Mono", monospace;

  ${PlayerTile}:hover & {
    opacity: 1;
  }

  &:hover {
    color: #ff0040;
    background: rgba(255, 0, 0, 0.1);
  }
`;

const AddPlayerArea = styled.div`
  display: flex;
  gap: 8px;
  align-items: stretch;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const AddInput = styled.input`
  flex: 1;
  padding: 12px 15px;
  background-color: rgba(0, 255, 136, 0.05);
  border: 1px solid var(--color-primary, #00ff88);
  border-radius: 3px;
  color: var(--color-primary, #00ff88);
  font-family: "JetBrains Mono", monospace;
  font-size: 1.1rem;
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--color-primary, #00ff88);
    opacity: 0.6;
    font-size: 1rem;
  }

  &:focus {
    outline: none;
    background-color: rgba(0, 255, 136, 0.1);
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
  }
`;

const AddButton = styled.button<{ $teamColor: string }>`
  background-color: ${(props) => props.$teamColor};
  color: #0a0a0f;
  border: none;
  padding: 12px 20px;
  font-family: "JetBrains Mono", monospace;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 0 6px ${(props) => props.$teamColor};
  opacity: 0.92;

  &:hover:not(:disabled) {
    background-color: #fff;
    color: ${(props) => props.$teamColor};
    opacity: 1;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StartButton = styled.button<{ $canStart: boolean }>`
  background: ${(props) => (props.$canStart ? "var(--color-primary, #00ff88)" : "#6b7280")};
  color: #000;
  padding: 20px 60px;
  font-size: 1.8rem;
  margin: 20px auto 0;
  display: block;
  border: 2px solid ${(props) => (props.$canStart ? "var(--color-primary, #00ff88)" : "#6b7280")};
  border-radius: 3px;
  font-family: "JetBrains Mono", monospace;
  box-shadow: ${(props) =>
    props.$canStart
      ? "0 0 30px rgba(0, 255, 136, 0.5), inset 0 0 20px rgba(0, 255, 136, 0.2)"
      : "none"};
  text-shadow: ${(props) => (props.$canStart ? "0 0 5px rgba(0, 255, 136, 0.5)" : "none")};
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
  cursor: ${(props) => (props.$canStart ? "pointer" : "not-allowed")};
  transition: all 0.3s ease;
  opacity: ${(props) => (props.$canStart ? 1 : 0.7)};

  &:hover:not(:disabled) {
    ${(props) =>
      props.$canStart &&
      `
      background: #fff;
      color: #000;
      transform: scale(1.05);
      box-shadow: 0 0 40px rgba(0, 255, 136, 0.7), inset 0 0 30px rgba(0, 255, 136, 0.3);
    `}
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;

  p {
    color: var(--color-primary, #00ff88);
    margin-bottom: 1rem;
    font-size: 1.3rem;
    font-family: "JetBrains Mono", monospace;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 255, 136, 0.3);
    border-top: 4px solid var(--color-primary, #00ff88);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  margin-top: 1rem;
  font-size: 1.1rem;
  text-align: center;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  font-family: "JetBrains Mono", monospace;
`;

// Mock data structure as fallback
const mockLobbyData: LobbyData = {
  publicId: "unknown",
  status: "LOBBY",
  gameType: "SINGLE_DEVICE",
  canModifyGame: true,
  teams: [
    {
      name: "Team Red",
      players: [],
    },
    {
      name: "Team Blue",
      players: [],
    },
  ],
};

/**
 * Lobby interface component with hacker-themed design
 */
export const LobbyInterface: React.FC<LobbyInterfaceProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [teamRedInput, setTeamRedInput] = useState("");
  const [teamBlueInput, setTeamBlueInput] = useState("");
  const [draggedPlayer, setDraggedPlayer] = useState<{
    player: LobbyPlayer;
    fromTeam: string;
  } | null>(null);
  const [dragOverTeam, setDragOverTeam] = useState<string | null>(null);

  // React Query hooks
  const { data: lobbyData, isLoading: initialLoading, error: queryError } = useLobbyQuery(gameId);
  const addPlayerMutation = useAddPlayer(gameId);
  const removePlayerMutation = useRemovePlayer(gameId);
  const renamePlayerMutation = useRenamePlayer(gameId);
  const movePlayerMutation = useMovePlayerToTeam(gameId);
  const startGameMutation = useStartGame(gameId);

  // Derived loading and error states
  const isLoading =
    addPlayerMutation.isPending ||
    removePlayerMutation.isPending ||
    renamePlayerMutation.isPending ||
    movePlayerMutation.isPending ||
    startGameMutation.isPending;

  const error =
    queryError?.message ||
    addPlayerMutation.error?.message ||
    removePlayerMutation.error?.message ||
    renamePlayerMutation.error?.message ||
    movePlayerMutation.error?.message ||
    startGameMutation.error?.message;

  const currentLobbyData = lobbyData || mockLobbyData;

  const teamColors = {
    "Team Red": "var(--color-team-red, #ff0040)",
    "Team Blue": "var(--color-team-blue, #00d4ff)",
  };

  // Calculate stats
  const totalPlayers =
    currentLobbyData?.teams?.reduce((sum, team) => sum + (team?.players?.length || 0), 0) || 0;
  const canStartGame =
    totalPlayers >= 4 &&
    (currentLobbyData?.teams?.every((team) => (team?.players?.length || 0) >= 2) || false);

  const handleQuickAdd = (teamName: string) => {
    const playerName = teamName === "Team Red" ? teamRedInput.trim() : teamBlueInput.trim();
    if (!playerName) return;

    addPlayerMutation.mutate(
      { playerName, teamName },
      {
        onSuccess: () => {
          if (teamName === "Team Red") {
            setTeamRedInput("");
          } else {
            setTeamBlueInput("");
          }
        },
      },
    );
  };

  const handleRemovePlayer = (playerId: string) => {
    removePlayerMutation.mutate(playerId);
  };

  const handleEditPlayer = (player: LobbyPlayer) => {
    setEditingPlayer(player.publicId);
    setEditName(player.name);
  };

  const handleSaveEdit = () => {
    if (!editingPlayer || !editName.trim()) return;

    renamePlayerMutation.mutate(
      { playerId: editingPlayer, newPlayerName: editName.trim() },
      {
        onSuccess: () => {
          setEditingPlayer(null);
          setEditName("");
        },
      },
    );
  };

  const handleStartGame = () => {
    if (!canStartGame) return;

    startGameMutation.mutate(undefined, {
      onSuccess: () => {
        navigate(`/game/${gameId}`);
      },
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, player: LobbyPlayer, fromTeam: string) => {
    setDraggedPlayer({ player, fromTeam });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, teamName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverTeam(teamName);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverTeam(null);
    }
  };

  const handleDrop = (e: React.DragEvent, toTeam: string) => {
    e.preventDefault();
    setDragOverTeam(null);

    if (!draggedPlayer || draggedPlayer.fromTeam === toTeam) {
      setDraggedPlayer(null);
      return;
    }

    movePlayerMutation.mutate(
      { playerId: draggedPlayer.player.publicId, newTeamName: toTeam },
      {
        onSuccess: () => {
          setDraggedPlayer(null);
        },
        onError: () => {
          setDraggedPlayer(null);
        },
      },
    );
  };

  const handleDragEnd = () => {
    setDraggedPlayer(null);
    setDragOverTeam(null);
  };

  // Render empty slots
  const renderEmptySlots = (currentCount: number, maxSlots: number = 6) => {
    const emptyCount = Math.max(0, maxSlots - currentCount);
    return Array.from({ length: emptyCount }).map((_, i) => (
      <PlayerSlot key={`empty-${i}`}>[empty]</PlayerSlot>
    ));
  };

  if (initialLoading) {
    return (
      <Container>
        <MainContent>
          <LoadingSpinner>
            <p>LOADING OPERATIVE CONTROL...</p>
            <div className="spinner"></div>
          </LoadingSpinner>
        </MainContent>
      </Container>
    );
  }

  return (
    <GlobalStatusAnimation>
      <Container>
        <MainContent>
          <Header>
            <Title>OPERATIVE CONTROL</Title>
            <GameInfo>
              Game ID: {currentLobbyData?.publicId || "LOADING..."} | {totalPlayers} Players
            </GameInfo>
          </Header>

          <TeamsGrid>
            {currentLobbyData?.teams?.map((team) => (
              <TeamTile
                key={team.name}
                $teamColor={teamColors[team.name as keyof typeof teamColors] || "#6b7280"}
                $isDragOver={dragOverTeam === team.name}
                onDragOver={(e) => handleDragOver(e, team.name)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, team.name)}
              >
                <TeamHeader>
                  <TeamName
                    $teamColor={teamColors[team.name as keyof typeof teamColors] || "#6b7280"}
                  >
                    {team.name === "Team Red" ? "TEAM RED OPERATIVES" : "TEAM BLUE OPERATIVES"}
                  </TeamName>
                  <PlayerCount>{team?.players?.length || 0}/6 operatives</PlayerCount>
                </TeamHeader>

                <PlayersContainer>
                  {team?.players?.map((player, index) => (
                    <PlayerTile
                      key={player.publicId}
                      draggable
                      $isDragging={draggedPlayer?.player.publicId === player.publicId}
                      onDragStart={(e) => handleDragStart(e, player, team.name)}
                      onDragEnd={handleDragEnd}
                    >
                      {editingPlayer === player.publicId ? (
                        <EditableInput
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit();
                            if (e.key === "Escape") {
                              setEditingPlayer(null);
                              setEditName("");
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <PlayerName onDoubleClick={() => handleEditPlayer(player)}>
                          {player?.name || "Unknown Player"}
                        </PlayerName>
                      )}

                      <div className="status-dot" />

                      <RemoveButton
                        onClick={() => handleRemovePlayer(player?.publicId || "")}
                        disabled={isLoading}
                      >
                        [X]
                      </RemoveButton>
                    </PlayerTile>
                  ))}
                  {renderEmptySlots(team?.players?.length || 0)}
                </PlayersContainer>

                <AddPlayerArea>
                  <AddInput
                    placeholder="Enter operative name..."
                    value={team.name === "Team Red" ? teamRedInput : teamBlueInput}
                    onChange={(e) => {
                      if (team.name === "Team Red") {
                        setTeamRedInput(e.target.value);
                      } else {
                        setTeamBlueInput(e.target.value);
                      }
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleQuickAdd(team.name)}
                    disabled={isLoading}
                  />
                  <AddButton
                    $teamColor={teamColors[team.name as keyof typeof teamColors] || "#6b7280"}
                    onClick={() => handleQuickAdd(team.name)}
                    disabled={
                      isLoading ||
                      (team.name === "Team Red" ? !teamRedInput.trim() : !teamBlueInput.trim())
                    }
                  >
                    ADD
                  </AddButton>
                </AddPlayerArea>
              </TeamTile>
            ))}
          </TeamsGrid>

          <StartButton
            $canStart={canStartGame}
            onClick={handleStartGame}
            disabled={!canStartGame || isLoading}
          >
            START MISSION
          </StartButton>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </MainContent>
      </Container>
    </GlobalStatusAnimation>
  );
};

export default LobbyInterface;
