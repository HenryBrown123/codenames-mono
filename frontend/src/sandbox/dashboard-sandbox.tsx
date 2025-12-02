import React, { useState, useMemo } from "react";
import { MockProviders, SandboxConfig, DEFAULT_SANDBOX_CONFIG } from "./mock-providers";
import { GameDashboard } from "../gameplay/game-controls/dashboards";
import { SANDBOX_PANELS } from "./sandbox-panel-config";
import styles from "./dashboard-sandbox.module.css";

// ============================================================================
// SCENARIOS - Predefined configs for common game states
// ============================================================================

const SCENARIOS: Record<string, Partial<SandboxConfig>> = {
  "lobby-no-round": {
    role: "CODEMASTER",
    teamName: "Red",
    playerName: "Agent Smith",
    roundStatus: null,
    hasRound: false,
    hasCards: false,
  },
  "lobby-setup-no-cards": {
    role: "CODEMASTER",
    teamName: "Red",
    playerName: "Agent Smith",
    roundStatus: "SETUP",
    hasRound: true,
    hasCards: false,
  },
  "lobby-setup-with-cards": {
    role: "CODEMASTER",
    teamName: "Red",
    playerName: "Agent Smith",
    roundStatus: "SETUP",
    hasRound: true,
    hasCards: true,
  },
  "codemaster-giving-clue": {
    role: "CODEMASTER",
    teamName: "Red",
    playerName: "Agent Smith",
    activeTeamName: "Red",
    hasClue: false,
    guessesRemaining: 0,
    roundStatus: "IN_PROGRESS",
    hasRound: true,
    hasCards: true,
  },
  "codemaster-waiting": {
    role: "CODEMASTER",
    teamName: "Red",
    playerName: "Agent Smith",
    activeTeamName: "Red",
    hasClue: true,
    clueWord: "CYBER",
    clueNumber: 3,
    guessesRemaining: 3,
    roundStatus: "IN_PROGRESS",
    hasRound: true,
    hasCards: true,
  },
  "codemaster-other-team": {
    role: "CODEMASTER",
    teamName: "Red",
    playerName: "Agent Smith",
    activeTeamName: "Blue",
    hasClue: true,
    clueWord: "NETWORK",
    clueNumber: 2,
    guessesRemaining: 2,
    roundStatus: "IN_PROGRESS",
    hasRound: true,
    hasCards: true,
  },
  "codebreaker-guessing": {
    role: "CODEBREAKER",
    teamName: "Blue",
    playerName: "Agent Jones",
    activeTeamName: "Blue",
    hasClue: true,
    clueWord: "CYBER",
    clueNumber: 3,
    guessesRemaining: 3,
    roundStatus: "IN_PROGRESS",
    hasRound: true,
    hasCards: true,
  },
  "codebreaker-waiting-for-clue": {
    role: "CODEBREAKER",
    teamName: "Blue",
    playerName: "Agent Jones",
    activeTeamName: "Blue",
    hasClue: false,
    guessesRemaining: 0,
    roundStatus: "IN_PROGRESS",
    hasRound: true,
    hasCards: true,
  },
  "codebreaker-other-team": {
    role: "CODEBREAKER",
    teamName: "Blue",
    playerName: "Agent Jones",
    activeTeamName: "Red",
    hasClue: true,
    clueWord: "PROTOCOL",
    clueNumber: 2,
    guessesRemaining: 2,
    roundStatus: "IN_PROGRESS",
    hasRound: true,
    hasCards: true,
  },
  spectator: {
    role: "SPECTATOR",
    teamName: undefined,
    playerName: "Observer",
    activeTeamName: "Red",
    hasClue: true,
    clueWord: "MISSION",
    clueNumber: 2,
    guessesRemaining: 2,
    roundStatus: "IN_PROGRESS",
    hasRound: true,
    hasCards: true,
  },
  "game-over": {
    role: "CODEMASTER",
    teamName: "Red",
    playerName: "Agent Smith",
    activeTeamName: undefined,
    hasClue: false,
    guessesRemaining: 0,
    roundStatus: "COMPLETED",
    hasRound: true,
    hasCards: true,
    winningTeam: "Red",
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DashboardSandbox: React.FC = () => {
  const [config, setConfig] = useState<SandboxConfig>(DEFAULT_SANDBOX_CONFIG);
  const [selectedScenario, setSelectedScenario] = useState<string>("codemaster-giving-clue");

  const handleScenarioChange = (scenarioKey: string) => {
    setSelectedScenario(scenarioKey);
    const scenario = SCENARIOS[scenarioKey];
    if (scenario) {
      setConfig((prev) => ({
        ...prev,
        ...scenario,
        isActionLoading: false,
      }));
    }
  };

  const handleConfigChange = (key: keyof SandboxConfig, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSelectedScenario("custom");
  };

  const scenarioGroups = useMemo(
    () => ({
      Lobby: ["lobby-no-round", "lobby-setup-no-cards", "lobby-setup-with-cards"],
      Codemaster: ["codemaster-giving-clue", "codemaster-waiting", "codemaster-other-team"],
      Codebreaker: ["codebreaker-guessing", "codebreaker-waiting-for-clue", "codebreaker-other-team"],
      Other: ["spectator", "game-over"],
    }),
    []
  );

  return (
    <div className={styles.sandbox}>
      {/* Dashboard Preview - Left Side (matches game layout) */}
      <div className={styles.previewArea}>
        <div className={styles.dashboardContainer}>
          <MockProviders config={config}>
            <GameDashboard panels={SANDBOX_PANELS} />
          </MockProviders>
        </div>
      </div>

      {/* Control Panel - Right Side */}
      <div className={styles.controlPanel}>
        <h1 className={styles.title}>Dashboard Sandbox</h1>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Scenarios</h2>
          <div className={styles.scenarioGroups}>
            {Object.entries(scenarioGroups).map(([group, scenarios]) => (
              <div key={group} className={styles.scenarioGroup}>
                <div className={styles.groupLabel}>{group}</div>
                <div className={styles.scenarioButtons}>
                  {scenarios.map((key) => (
                    <button
                      key={key}
                      className={`${styles.scenarioButton} ${selectedScenario === key ? styles.active : ""}`}
                      onClick={() => handleScenarioChange(key)}
                    >
                      {key.replace(/-/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Manual Controls</h2>
          <div className={styles.controlGrid}>
            <label className={styles.control}>
              <span>Role</span>
              <select value={config.role} onChange={(e) => handleConfigChange("role", e.target.value)}>
                <option value="CODEMASTER">CODEMASTER</option>
                <option value="CODEBREAKER">CODEBREAKER</option>
                <option value="SPECTATOR">SPECTATOR</option>
                <option value="NONE">NONE</option>
              </select>
            </label>
            <label className={styles.control}>
              <span>Team</span>
              <select
                value={config.teamName ?? ""}
                onChange={(e) => handleConfigChange("teamName", e.target.value || undefined)}
              >
                <option value="">None</option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
              </select>
            </label>
            <label className={styles.control}>
              <span>Active Team</span>
              <select
                value={config.activeTeamName ?? ""}
                onChange={(e) => handleConfigChange("activeTeamName", e.target.value || undefined)}
              >
                <option value="">None</option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
              </select>
            </label>
            <label className={styles.control}>
              <span>Round Status</span>
              <select
                value={config.roundStatus ?? ""}
                onChange={(e) => handleConfigChange("roundStatus", e.target.value || null)}
              >
                <option value="">None</option>
                <option value="SETUP">SETUP</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </label>
            <label className={styles.control}>
              <span>Has Clue</span>
              <input
                type="checkbox"
                checked={config.hasClue}
                onChange={(e) => handleConfigChange("hasClue", e.target.checked)}
              />
            </label>
            <label className={styles.control}>
              <span>Guesses</span>
              <input
                type="number"
                min="0"
                max="9"
                value={config.guessesRemaining}
                onChange={(e) => handleConfigChange("guessesRemaining", parseInt(e.target.value) || 0)}
              />
            </label>
            <label className={styles.control}>
              <span>Has Round</span>
              <input
                type="checkbox"
                checked={config.hasRound}
                onChange={(e) => handleConfigChange("hasRound", e.target.checked)}
              />
            </label>
            <label className={styles.control}>
              <span>Has Cards</span>
              <input
                type="checkbox"
                checked={config.hasCards}
                onChange={(e) => handleConfigChange("hasCards", e.target.checked)}
              />
            </label>
            <label className={styles.control}>
              <span>Loading</span>
              <input
                type="checkbox"
                checked={config.isActionLoading}
                onChange={(e) => handleConfigChange("isActionLoading", e.target.checked)}
              />
            </label>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Current Config</h2>
          <pre className={styles.contextDisplay}>{JSON.stringify(config, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default DashboardSandbox;
