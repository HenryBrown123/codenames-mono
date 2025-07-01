import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Plus, X, Users, Play, Edit2, Check } from "lucide-react";
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

// Interface for props
interface LobbyInterfaceProps {
  gameId: string;
}

// Mock data structure as fallback with proper typing
const mockLobbyData: LobbyData = {
  publicId: "unknown",
  status: "LOBBY",
  gameType: "SINGLE_DEVICE",
  canModifyGame: true,
  teams: [
    {
      name: "Team Red",
      players: [] as LobbyPlayer[],
    },
    {
      name: "Team Blue",
      players: [] as LobbyPlayer[],
    },
  ],
};

// Styled Components - Simple tile-based design
const Container = styled.div`
  position: relative;
  left: 0;
  bottom: 0;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: auto;
  margin-top: 30px;

  @media (max-width: 768px) {
    margin-top: 30px;
  }
`;

const MainContent = styled.div`
  width: 90%;
  margin: 1rem auto;
  padding: 2rem;
  background-color: rgba(65, 63, 63, 0.8);
  border-radius: 16px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
`;

const GameInfo = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: clamp(1rem, 2vw, 1.2rem);
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusBadge = styled.div<{ ready: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background-color: ${(props) => (props.ready ? "#10b981" : "#f59e0b")};
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
`;

const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin: 3rem 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const TeamTile = styled.div<{ teamColor: string; isDragOver?: boolean }>`
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  border: 3px solid ${(props) => props.teamColor};
  border-radius: 20px;
  padding: 2rem;
  min-height: 300px;
  position: relative;
  backdrop-filter: blur(10px);
  transition: all 0.2s;

  ${(props) =>
    props.isDragOver &&
    `
    border-color: ${props.teamColor}CC;
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0.1)
    );
    transform: scale(1.02);
  `}
`;

const TeamHeader = styled.div<{ teamColor: string }>`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${(props) => props.teamColor}40;
`;

const TeamName = styled.h2<{ teamColor: string }>`
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: bold;
  color: ${(props) => props.teamColor};
  margin-bottom: 0.5rem;
`;

const PlayerCount = styled.div`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
  display: inline-block;
`;

const PlayersArea = styled.div`
  min-height: 150px;
  margin-bottom: 1.5rem;
`;

const PlayerTile = styled.div<{ isDragging?: boolean }>`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;
  cursor: ${(props) => (props.isDragging ? "grabbing" : "grab")};
  opacity: ${(props) => (props.isDragging ? 0.5 : 1)};
  user-select: none;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: ${(props) => (props.isDragging ? "none" : "translateY(-2px)")};
  }

  &:active {
    cursor: grabbing;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const PlayerName = styled.span`
  color: white;
  font-weight: 500;
  font-size: 1.1rem;
  flex: 1;
`;

const PlayerActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionIcon = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  padding: 0.4rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddPlayerArea = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
`;

const AddInput = styled.input`
  flex: 1;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  font-size: 1rem;
  transition: border-color 0.2s;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const AddButton = styled.button<{ teamColor: string }>`
  background: ${(props) => props.teamColor};
  border: none;
  border-radius: 10px;
  padding: 0.8rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 45px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StartSection = styled.div`
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid rgba(255, 255, 255, 0.2);
`;

const Requirements = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  font-size: clamp(1rem, 2vw, 1.2rem);
`;

const StartButton = styled.button<{ canStart: boolean }>`
  background: ${(props) =>
    props.canStart
      ? "linear-gradient(135deg, #10b981, #059669)"
      : "linear-gradient(135deg, #6b7280, #4b5563)"};
  border: none;
  border-radius: 15px;
  padding: 1rem 3rem;
  color: white;
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  font-weight: bold;
  cursor: ${(props) => (props.canStart ? "pointer" : "not-allowed")};
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0 auto;
  transition: all 0.2s;
  opacity: ${(props) => (props.canStart ? 1 : 0.7)};

  &:hover {
    transform: ${(props) => (props.canStart ? "scale(1.05)" : "none")};
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  margin-top: 1rem;
  font-size: 1rem;
  text-align: center;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.3);
`;

const LoadingSpinner = styled.div`
  text-align: center;

  p {
    color: white;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
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

const EditableInput = styled.input`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
  font-weight: 500;
  font-size: 1.1rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: white;
  }
`;

export const LobbyInterface: React.FC<LobbyInterfaceProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  
  // React Query hooks
  const { data: lobbyData, isLoading: initialLoading, error: queryError } = useLobbyQuery(gameId);
  const addPlayerMutation = useAddPlayer(gameId);
  const removePlayerMutation = useRemovePlayer(gameId);
  const renamePlayerMutation = useRenamePlayer(gameId);
  const movePlayerMutation = useMovePlayerToTeam(gameId);
  const startGameMutation = useStartGame(gameId);
  
  // Derived loading and error states
  const isLoading = addPlayerMutation.isPending || 
                   removePlayerMutation.isPending || 
                   renamePlayerMutation.isPending || 
                   movePlayerMutation.isPending || 
                   startGameMutation.isPending;
                   
  const error = queryError?.message || 
               addPlayerMutation.error?.message || 
               removePlayerMutation.error?.message || 
               renamePlayerMutation.error?.message || 
               movePlayerMutation.error?.message || 
               startGameMutation.error?.message;

  // Separate input state for each team
  const [teamRedInput, setTeamRedInput] = useState("");
  const [teamBlueInput, setTeamBlueInput] = useState("");

  // Drag and drop state
  const [draggedPlayer, setDraggedPlayer] = useState<{
    player: LobbyPlayer;
    fromTeam: string;
  } | null>(null);
  const [dragOverTeam, setDragOverTeam] = useState<string | null>(null);

  // Use fallback data when lobbyData is not available
  const currentLobbyData = lobbyData || mockLobbyData;

  // Add debugging info to see what data we have
  console.log("Current lobbyData:", currentLobbyData);
  console.log("Teams:", currentLobbyData?.teams);

  const teamColors = {
    "Team Red": "#ef4444",
    "Team Blue": "#3b82f6",
  };

  // Calculate stats - add safety checks
  const totalPlayers =
    currentLobbyData?.teams?.reduce(
      (sum, team) => sum + (team?.players?.length || 0),
      0,
    ) || 0;
  const canStartGame =
    totalPlayers >= 4 &&
    (currentLobbyData?.teams?.every((team) => (team?.players?.length || 0) >= 2) ||
      false);

  const handleQuickAdd = (teamName: string) => {
    // Get the correct input value based on team
    const playerName =
      teamName === "Team Red" ? teamRedInput.trim() : teamBlueInput.trim();
    if (!playerName) return;

    addPlayerMutation.mutate(
      { playerName, teamName },
      {
        onSuccess: () => {
          // Clear the correct input
          if (teamName === "Team Red") {
            setTeamRedInput("");
          } else {
            setTeamBlueInput("");
          }
        },
      }
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
      }
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
  const handleDragStart = (
    e: React.DragEvent,
    player: LobbyPlayer,
    fromTeam: string,
  ) => {
    setDraggedPlayer({ player, fromTeam });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, teamName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverTeam(teamName);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the team tile entirely
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
      }
    );
  };

  const handleDragEnd = () => {
    setDraggedPlayer(null);
    setDragOverTeam(null);
  };

  // Show current state for debugging
  if (error) {
    return (
      <Container>
        <MainContent>
          <div style={{ color: "white", textAlign: "center", padding: "2rem" }}>
            <h2>Error Loading Lobby</h2>
            <p>{error}</p>
            <pre
              style={{
                textAlign: "left",
                background: "rgba(0,0,0,0.5)",
                padding: "1rem",
                borderRadius: "8px",
                marginTop: "1rem",
              }}
            >
              {JSON.stringify(currentLobbyData, null, 2)}
            </pre>
          </div>
        </MainContent>
      </Container>
    );
  }

  // Show loading spinner during initial load
  if (initialLoading) {
    return (
      <Container>
        <MainContent>
          <LoadingSpinner>
            <p>Loading lobby...</p>
            <div className="spinner"></div>
          </LoadingSpinner>
        </MainContent>
      </Container>
    );
  }

  return (
    <Container>
      <MainContent>
        <Header>
          <Title>Game Lobby</Title>
          <GameInfo>
            <InfoItem>
              <strong>Game ID:</strong> {currentLobbyData?.publicId || "Loading..."}
            </InfoItem>
            <InfoItem>
              <Users size={20} />
              <span>{totalPlayers} Players</span>
            </InfoItem>
            <StatusBadge ready={canStartGame}>
              {canStartGame ? "Ready to Start" : "Need More Players"}
            </StatusBadge>
          </GameInfo>
        </Header>

        <TeamsGrid>
          {currentLobbyData?.teams?.map((team) => (
            <TeamTile
              key={team.name}
              teamColor={
                teamColors[team.name as keyof typeof teamColors] || "#6b7280"
              }
              isDragOver={dragOverTeam === team.name}
              onDragOver={(e) => handleDragOver(e, team.name)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, team.name)}
            >
              <TeamHeader
                teamColor={
                  teamColors[team.name as keyof typeof teamColors] || "#6b7280"
                }
              >
                <TeamName
                  teamColor={
                    teamColors[team.name as keyof typeof teamColors] ||
                    "#6b7280"
                  }
                >
                  {team.name}
                </TeamName>
                <PlayerCount>{team?.players?.length || 0} players</PlayerCount>
              </TeamHeader>

              <PlayersArea>
                {team?.players?.map((player) => (
                  <PlayerTile
                    key={player.publicId}
                    draggable
                    isDragging={
                      draggedPlayer?.player.publicId === player.publicId
                    }
                    onDragStart={(e) => handleDragStart(e, player, team.name)}
                    onDragEnd={handleDragEnd}
                  >
                    {editingPlayer === player.publicId ? (
                      <EditableInput
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                        autoFocus
                      />
                    ) : (
                      <PlayerName>
                        {player?.name || "Unknown Player"}
                      </PlayerName>
                    )}

                    <PlayerActions>
                      {editingPlayer === player.publicId ? (
                        <ActionIcon
                          onClick={handleSaveEdit}
                          disabled={isLoading}
                        >
                          <Check size={16} />
                        </ActionIcon>
                      ) : (
                        <ActionIcon
                          onClick={() => handleEditPlayer(player)}
                          disabled={isLoading}
                        >
                          <Edit2 size={16} />
                        </ActionIcon>
                      )}
                      <ActionIcon
                        onClick={() =>
                          handleRemovePlayer(player?.publicId || "")
                        }
                        disabled={isLoading}
                      >
                        <X size={16} />
                      </ActionIcon>
                    </PlayerActions>
                  </PlayerTile>
                )) || []}
              </PlayersArea>

              <AddPlayerArea>
                <AddInput
                  placeholder="Enter player name..."
                  value={
                    team.name === "Team Red" ? teamRedInput : teamBlueInput
                  }
                  onChange={(e) => {
                    if (team.name === "Team Red") {
                      setTeamRedInput(e.target.value);
                    } else {
                      setTeamBlueInput(e.target.value);
                    }
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleQuickAdd(team.name)
                  }
                  disabled={isLoading}
                />
                <AddButton
                  teamColor={
                    teamColors[team.name as keyof typeof teamColors] ||
                    "#6b7280"
                  }
                  onClick={() => handleQuickAdd(team.name)}
                  disabled={
                    isLoading ||
                    (team.name === "Team Red"
                      ? !teamRedInput.trim()
                      : !teamBlueInput.trim())
                  }
                >
                  <Plus size={20} />
                </AddButton>
              </AddPlayerArea>
            </TeamTile>
          )) || []}
        </TeamsGrid>

        <StartSection>
          <Requirements>
            {canStartGame
              ? "All teams ready! You can start the game now."
              : "Need at least 2 players per team and 4 players total to start."}
          </Requirements>

          {isLoading ? (
            <LoadingSpinner>
              <p>Processing...</p>
              <div className="spinner"></div>
            </LoadingSpinner>
          ) : (
            <StartButton
              canStart={canStartGame}
              onClick={handleStartGame}
              disabled={!canStartGame || isLoading}
            >
              <Play size={24} />
              Start Game
            </StartButton>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </StartSection>
      </MainContent>
    </Container>
  );
};

export default LobbyInterface;
