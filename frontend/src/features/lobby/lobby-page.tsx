import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Plus, X, Users, Play, Edit2, Save } from "lucide-react";
import {
  addPlayer,
  removePlayer,
  modifyPlayer,
  startGame,
  getLobbyState,
} from "@frontend/features/lobby/api/lobby-api";

// Interface for props
interface LobbyInterfaceProps {
  gameId: string;
}

// Define types locally to match API
interface LobbyPlayer {
  publicId: string;
  name: string; // API uses 'name', not 'playerName'
  isActive: boolean;
}

interface LobbyTeam {
  name: string; // API uses 'name', not 'teamName'
  score: number;
  players: LobbyPlayer[];
}

interface LobbyData {
  publicId: string;
  status: string;
  gameType: string;
  gameFormat?: string; // Make optional
  createdAt?: string; // Make optional
  teams: LobbyTeam[];
  currentRound?: any; // Make optional
  playerContext?: {
    playerName: string;
    teamName: string;
    role: string;
  }; // Make optional
}

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #be185d 100%);
  padding: 1rem;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #c7d2fe;
  margin-bottom: 1rem;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: #c7d2fe;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusDot = styled.span<{ ready: boolean }>`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: ${(props) => (props.ready ? "#10b981" : "#eab308")};
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
`;

const AddPlayerForm = styled.div`
  display: flex;
  gap: 1rem;
  align-items: end;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const InputGroup = styled.div`
  flex: 1;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #c7d2fe;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 1rem;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  option {
    background-color: #374151;
    color: white;
  }
`;

const Button = styled.button<{ variant?: string; large?: boolean }>`
  padding: 0.5rem 1.5rem;
  background: ${(props) =>
    props.variant === "primary"
      ? "#4f46e5"
      : props.variant === "success"
        ? "linear-gradient(to right, #059669, #047857)"
        : props.variant === "danger"
          ? "#dc2626"
          : "#6b7280"};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${(props) => (props.large ? "1.125rem" : "1rem")};
  padding: ${(props) => (props.large ? "1rem 2rem" : "0.5rem 1.5rem")};

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.variant === "primary"
        ? "#4338ca"
        : props.variant === "success"
          ? "linear-gradient(to right, #047857, #065f46)"
          : props.variant === "danger"
            ? "#b91c1c"
            : "#4b5563"};
    transform: ${(props) => (props.large ? "scale(1.05)" : "none")};
  }

  &:disabled {
    background: #6b7280;
    cursor: not-allowed;
    transform: none;
  }
`;

const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const TeamCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const TeamHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const TeamName = styled.h3<{ teamName: string }>`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${(props) => (props.teamName === "Team Red" ? "#f87171" : "#60a5fa")};
`;

const PlayerCount = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
`;

const PlayersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const EmptyState = styled.div`
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 1rem;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
`;

const PlayerRow = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const TeamDot = styled.div<{ teamName: string }>`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: ${(props) =>
    props.teamName === "Team Red" ? "#ef4444" : "#3b82f6"};
`;

const PlayerName = styled.span`
  color: white;
  font-weight: 500;
`;

const PlayerActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SmallSelect = styled(Select)`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  min-width: 80px;
`;

const IconButton = styled.button<{ variant?: string }>`
  padding: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.2s;
  color: ${(props) =>
    props.variant === "edit"
      ? "#60a5fa"
      : props.variant === "save"
        ? "#10b981"
        : "#f87171"};

  &:hover:not(:disabled) {
    color: ${(props) =>
      props.variant === "edit"
        ? "#3b82f6"
        : props.variant === "save"
          ? "#059669"
          : "#dc2626"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditInput = styled(Input)`
  flex: 1;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
`;

const EditContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

const RequirementsCard = styled(Card)``;

const RequirementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  font-size: 0.875rem;
`;

const RequirementItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RequirementDot = styled.span<{ met: boolean }>`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: ${(props) => (props.met ? "#10b981" : "#ef4444")};
`;

const RequirementText = styled.span`
  color: rgba(255, 255, 255, 0.8);
`;

const StartGameContainer = styled.div`
  text-align: center;
`;

const StartGameButton = styled(Button)`
  box-shadow: ${(props) =>
    props.variant === "success"
      ? "0 10px 25px rgba(16, 185, 129, 0.25)"
      : "none"};
`;

const HelpText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.875rem;
  text-align: center;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.3);
`;

// Mock data structure as fallback with proper typing
const mockLobbyData: LobbyData = {
  publicId: "game-123",
  status: "LOBBY",
  gameType: "SINGLE_DEVICE",
  gameFormat: "QUICK",
  createdAt: new Date().toISOString(),
  teams: [
    {
      name: "Team Red", // Match API structure
      score: 0,
      players: [] as LobbyPlayer[],
    },
    {
      name: "Team Blue", // Match API structure
      score: 0,
      players: [] as LobbyPlayer[],
    },
  ],
  currentRound: null,
  playerContext: {
    playerName: "",
    teamName: "",
    role: "NONE",
  },
};

const LobbyInterface: React.FC<LobbyInterfaceProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const [lobbyData, setLobbyData] = useState<LobbyData>(mockLobbyData);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("Team Red"); // Fixed: Match backend team names
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load lobby state on component mount
  useEffect(() => {
    const loadLobbyState = async () => {
      try {
        console.log("Loading lobby state for game:", gameId);
        setInitialLoading(true);
        const data = await getLobbyState(gameId);
        console.log("Lobby state loaded:", data);

        // Handle the nested response structure
        let gameData;
        if (data.game && data.game.teams) {
          gameData = data.game;
        } else if (data.teams) {
          gameData = data;
        } else {
          console.warn("Received invalid lobby data structure:", data);
          setError("Invalid lobby data received from server");
          return;
        }

        setLobbyData(gameData);

        // Update selectedTeam to match actual team names from backend
        if (
          gameData.teams.length > 0 &&
          !gameData.teams.some((team) => team.name === selectedTeam)
        ) {
          console.log(
            "Updating selectedTeam from",
            selectedTeam,
            "to",
            gameData.teams[0].name,
          );
          setSelectedTeam(gameData.teams[0].name);
        }
      } catch (err) {
        console.error("Failed to load lobby state:", err);
        setError("Failed to load lobby data. Using mock data for now.");
        // Keep mock data as fallback
      } finally {
        setInitialLoading(false);
      }
    };

    if (gameId) {
      loadLobbyState();
    }
  }, [gameId, selectedTeam]);

  // Calculate total players and team counts - with null safety
  const totalPlayers =
    lobbyData?.teams?.reduce(
      (total, team) => total + (team.players?.length || 0),
      0,
    ) || 0;
  const teamCounts =
    lobbyData?.teams?.map((team) => team.players?.length || 0) || [];
  const minPlayersPerTeam = teamCounts.length > 0 ? Math.min(...teamCounts) : 0;
  const canStartGame =
    totalPlayers >= 4 && teamCounts.length >= 2 && minPlayersPerTeam >= 2;

  // Add player function
  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;

    console.log("About to send to API:", {
      gameId,
      playerName: newPlayerName.trim(),
      teamName: selectedTeam,
    });

    console.log(
      "Starting to add player:",
      newPlayerName.trim(),
      "to team:",
      selectedTeam,
    );
    setIsLoading(true);
    setError(null);
    try {
      console.log("Calling addPlayer API...");
      const response = await addPlayer(
        gameId,
        newPlayerName.trim(),
        selectedTeam,
      );
      console.log("Add player response:", response);

      console.log("Refreshing lobby state...");
      const updatedData = await getLobbyState(gameId);
      console.log("Updated lobby data:", updatedData);

      // Handle nested response structure
      const gameData = updatedData.game || updatedData;
      // Merge with existing data to preserve all properties
      setLobbyData((prevData) => ({
        ...prevData,
        ...gameData,
        teams: gameData.teams || prevData.teams,
      }));
      setNewPlayerName("");
    } catch (error) {
      console.error("Failed to add player:", error);
      setError("Failed to add player. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove player function
  const handleRemovePlayer = async (playerId: string) => {
    console.log("Starting to remove player:", playerId);
    setIsLoading(true);
    setError(null);
    try {
      console.log("Calling removePlayer API...");
      await removePlayer(gameId, playerId);
      console.log("Player removed successfully");

      console.log("Refreshing lobby state...");
      const updatedData = await getLobbyState(gameId);
      console.log("Updated lobby data:", updatedData);
      const gameData = updatedData.game || updatedData;
      setLobbyData((prevData) => ({
        ...prevData,
        ...gameData,
        teams: gameData.teams || prevData.teams,
      }));
    } catch (error) {
      console.error("Failed to remove player:", error);
      setError("Failed to remove player. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit player name
  const handleEditPlayer = (player: LobbyPlayer) => {
    setEditingPlayer(player.publicId);
    setEditName(player.name);
  };

  const handleSaveEdit = async (playerId: string) => {
    if (!editName.trim()) return;

    console.log(
      "Starting to edit player:",
      playerId,
      "new name:",
      editName.trim(),
    );
    setIsLoading(true);
    setError(null);
    try {
      console.log("Calling modifyPlayer API...");
      await modifyPlayer(gameId, playerId, { playerName: editName.trim() });
      console.log("Player modified successfully");

      console.log("Refreshing lobby state...");
      const updatedData = await getLobbyState(gameId);
      console.log("Updated lobby data:", updatedData);
      const gameData = updatedData.game || updatedData;
      setLobbyData((prevData) => ({
        ...prevData,
        ...gameData,
        teams: gameData.teams || prevData.teams,
      }));

      setEditingPlayer(null);
      setEditName("");
    } catch (error) {
      console.error("Failed to edit player:", error);
      setError("Failed to update player name. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Move player between teams
  const handleMovePlayer = async (playerId: string, newTeamName: string) => {
    const currentTeam = (lobbyData?.teams || []).find((team) =>
      (team.players || []).some((p) => p.publicId === playerId),
    );
    if (!currentTeam || currentTeam.name === newTeamName) return;

    console.log("Starting to move player:", playerId, "to team:", newTeamName);
    setIsLoading(true);
    setError(null);
    try {
      console.log("Calling modifyPlayer API...");
      await modifyPlayer(gameId, playerId, { teamName: newTeamName });
      console.log("Player moved successfully");

      console.log("Refreshing lobby state...");
      const updatedData = await getLobbyState(gameId);
      console.log("Updated lobby data:", updatedData);
      const gameData = updatedData.game || updatedData;
      setLobbyData((prevData) => ({
        ...prevData,
        ...gameData,
        teams: gameData.teams || prevData.teams,
      }));
    } catch (error) {
      console.error("Failed to move player:", error);
      setError("Failed to move player. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Start game function
  const handleStartGame = async () => {
    if (!canStartGame) return;

    console.log("Starting game with players:", lobbyData?.teams || []);
    setIsLoading(true);
    setError(null);
    try {
      console.log("Calling startGame API...");
      const response = await startGame(gameId);
      console.log("Game started successfully:", response);

      // Navigate to the actual gameplay
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error("Failed to start game:", error);
      setError(
        "Failed to start game. Please check that all requirements are met.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Container>
        <MainContent>
          <Header>
            <Title>Loading Lobby...</Title>
            <Subtitle>Please wait while we load the game data</Subtitle>
          </Header>
        </MainContent>
      </Container>
    );
  }

  return (
    <Container>
      <MainContent>
        {/* Header */}
        <Header>
          <Title>Codenames Lobby</Title>
          <Subtitle>Set up your teams for single device play</Subtitle>
          <StatsContainer>
            <StatItem>
              <Users size={16} />
              <span>{totalPlayers} players total</span>
            </StatItem>
            <StatItem>
              <StatusDot ready={canStartGame} />
              <span>
                {canStartGame
                  ? "Ready to start!"
                  : "Need 4+ players, 2+ per team"}
              </span>
            </StatItem>
          </StatsContainer>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Header>

        {/* Debug: Show raw data */}
        <Card style={{ marginBottom: "1rem" }}>
          <SectionTitle>Debug Info</SectionTitle>
          <div
            style={{
              color: "white",
              fontSize: "12px",
              backgroundColor: "rgba(0,0,0,0.3)",
              padding: "10px",
              borderRadius: "5px",
              maxHeight: "200px",
              overflow: "auto",
            }}
          >
            <div>
              <strong>Selected Team:</strong> "{selectedTeam}"
            </div>
            <div>
              <strong>Teams Available:</strong>{" "}
              {(lobbyData?.teams || [])
                .map((t, index) => `"${t.name}"`)
                .join(", ")}
            </div>
            <div>
              <strong>Raw Lobby Data:</strong>
            </div>
            <pre style={{ fontSize: "10px", whiteSpace: "pre-wrap" }}>
              {JSON.stringify(lobbyData, null, 2)}
            </pre>
          </div>
        </Card>

        {/* Add Player Section */}
        <Card>
          <SectionTitle>Add New Player</SectionTitle>
          <AddPlayerForm>
            <InputGroup>
              <Label>Player Name</Label>
              <Input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter player name"
                onKeyPress={(e) => e.key === "Enter" && handleAddPlayer()}
                disabled={isLoading}
              />
            </InputGroup>
            <InputGroup>
              <Label>Team</Label>
              <Select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                disabled={isLoading}
              >
                {(lobbyData?.teams || []).map((team) => (
                  <option key={team.name} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </Select>
            </InputGroup>
            <Button
              variant="primary"
              onClick={handleAddPlayer}
              disabled={!newPlayerName.trim() || isLoading}
            >
              <Plus size={16} />
              Add Player
            </Button>
          </AddPlayerForm>
        </Card>

        {/* Teams Display */}
        <TeamsGrid>
          {(lobbyData?.teams || []).map((team) => (
            <TeamCard key={team.name}>
              <TeamHeader>
                <TeamName teamName={team.name}>{team.name}</TeamName>
                <PlayerCount>
                  {(team.players || []).length} player
                  {(team.players || []).length !== 1 ? "s" : ""}
                </PlayerCount>
              </TeamHeader>

              <PlayersContainer>
                {(team.players || []).length === 0 ? (
                  <EmptyState>No players yet</EmptyState>
                ) : (
                  (team.players || []).map((player) => (
                    <PlayerRow key={player.publicId}>
                      {editingPlayer === player.publicId ? (
                        <EditContainer>
                          <EditInput
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              handleSaveEdit(player.publicId)
                            }
                            autoFocus
                          />
                          <IconButton
                            variant="save"
                            onClick={() => handleSaveEdit(player.publicId)}
                            disabled={isLoading}
                          >
                            <Save size={16} />
                          </IconButton>
                        </EditContainer>
                      ) : (
                        <>
                          <PlayerInfo>
                            <TeamDot teamName={team.name} />
                            <PlayerName>{player.name}</PlayerName>
                          </PlayerInfo>
                          <PlayerActions>
                            <SmallSelect
                              onChange={(e) =>
                                handleMovePlayer(
                                  player.publicId,
                                  e.target.value,
                                )
                              }
                              value={team.name}
                              disabled={isLoading}
                            >
                              {(lobbyData?.teams || []).map((t) => (
                                <option key={t.name} value={t.name}>
                                  {t.name}
                                </option>
                              ))}
                            </SmallSelect>
                            <IconButton
                              variant="edit"
                              onClick={() => handleEditPlayer(player)}
                              disabled={isLoading}
                            >
                              <Edit2 size={12} />
                            </IconButton>
                            <IconButton
                              variant="danger"
                              onClick={() =>
                                handleRemovePlayer(player.publicId)
                              }
                              disabled={isLoading}
                            >
                              <X size={12} />
                            </IconButton>
                          </PlayerActions>
                        </>
                      )}
                    </PlayerRow>
                  ))
                )}
              </PlayersContainer>
            </TeamCard>
          ))}
        </TeamsGrid>

        {/* Game Rules Reminder */}
        <RequirementsCard>
          <SectionTitle>Game Setup Requirements</SectionTitle>
          <RequirementsGrid>
            <RequirementItem>
              <RequirementDot met={totalPlayers >= 4} />
              <RequirementText>Minimum 4 players total</RequirementText>
            </RequirementItem>
            <RequirementItem>
              <RequirementDot met={teamCounts.length >= 2} />
              <RequirementText>At least 2 teams</RequirementText>
            </RequirementItem>
            <RequirementItem>
              <RequirementDot met={minPlayersPerTeam >= 2} />
              <RequirementText>2+ players per team</RequirementText>
            </RequirementItem>
          </RequirementsGrid>
        </RequirementsCard>

        {/* Start Game Button */}
        <StartGameContainer>
          <StartGameButton
            variant={canStartGame ? "success" : ""}
            large
            onClick={handleStartGame}
            disabled={!canStartGame || isLoading}
          >
            <Play size={20} />
            {isLoading ? "Starting..." : "Start Game"}
          </StartGameButton>

          {!canStartGame && (
            <HelpText>
              {totalPlayers < 4
                ? `Add ${4 - totalPlayers} more player${4 - totalPlayers !== 1 ? "s" : ""} to start`
                : minPlayersPerTeam < 2
                  ? "Each team needs at least 2 players"
                  : "Ready to start!"}
            </HelpText>
          )}
        </StartGameContainer>
      </MainContent>
    </Container>
  );
};

export default LobbyInterface;
