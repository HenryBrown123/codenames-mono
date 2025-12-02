import React, { useState, useMemo } from "react";
import { VisibilityContext } from "../gameplay/game-controls/dashboards/config/context";
import styles from "./dashboard-sandbox.module.css";

// ============================================================================
// SANDBOX PANELS - Simplified versions that use props instead of hooks
// ============================================================================

const SandboxTeamHeader: React.FC<{ context: VisibilityContext }> = ({ context }) => {
  const teamLower = (context.teamName || "").toLowerCase();
  const isRed = teamLower === "red";
  const isBlue = teamLower === "blue";
  const symbol = isRed ? "◇" : isBlue ? "□" : "○";
  const color = isRed ? "#ff3333" : isBlue ? "#00ddff" : "#aaaaaa";

  return (
    <div className={styles.mockPanel}>
      <div className={styles.teamHeader}>
        <span style={{ color, fontSize: "2rem", textShadow: `0 0 8px ${color}` }}>{symbol}</span>
        <div>
          <div style={{ color: "#00ff88", fontWeight: 900, fontSize: "1.2rem" }}>
            {(context.teamName || "SPECTATOR").toUpperCase()}
          </div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>{context.role}</div>
          {context.playerName && (
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", marginTop: "0.25rem" }}>
              {context.playerName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SandboxARToggle: React.FC = () => {
  const [active, setActive] = useState(false);
  return (
    <div className={styles.mockPanel}>
      <div className={styles.panelTitle}>SPY GOGGLES</div>
      <div className={styles.toggleRow}>
        <span className={active ? styles.dotActive : styles.dotInactive} />
        <button className={styles.toggle} onClick={() => setActive(!active)}>
          <span className={active ? styles.thumbActive : styles.thumbInactive} />
        </button>
        <span style={{ color: active ? "#00ff88" : "#555" }}>{active ? "ON" : "OFF"}</span>
      </div>
    </div>
  );
};

const SandboxIntel: React.FC<{ context: VisibilityContext }> = ({ context }) => (
  <div className={styles.mockPanel}>
    <div className={styles.panelTitle}>
      ACTIVE INTEL <span className={styles.pingDot} />
    </div>
    <div className={styles.intelDisplay}>
      <span className={styles.intelHighlight}>"CYBER"</span>
      <span style={{ color: "rgba(255,255,255,0.5)" }}>for</span>
      <span className={styles.intelHighlight}>3</span>
    </div>
    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
      {context.guessesRemaining} {context.guessesRemaining === 1 ? "attempt" : "attempts"} left
    </div>
  </div>
);

const SandboxObserver: React.FC = () => (
  <div className={styles.mockPanel}>
    <div className={styles.panelTitle}>STANDBY MODE</div>
    <div style={{ color: "rgba(255,255,255,0.7)" }}>Monitoring field operations...</div>
  </div>
);

const SandboxAIStatus: React.FC = () => (
  <div className={styles.mockPanel}>
    <div className={styles.panelTitle}>AI ASSISTANT</div>
    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
      <span style={{ color: "#00ff88" }}>●</span> AI Ready
    </div>
  </div>
);

const SandboxGameover: React.FC = () => (
  <div className={styles.mockPanel}>
    <div className={styles.panelTitle}>MISSION COMPLETE</div>
    <div className={styles.scoreDisplay}>
      <div className={styles.teamScore}>
        <div>RED</div>
        <div className={styles.winnerScore}>8</div>
      </div>
      <div>—</div>
      <div className={styles.teamScore}>
        <div>BLUE</div>
        <div className={styles.loserScore}>5</div>
      </div>
    </div>
    <button className={styles.actionButton}>NEW MISSION</button>
  </div>
);

const SandboxCodemasterActions: React.FC<{ loading?: boolean }> = ({ loading }) => (
  <div className={styles.mockPanel}>
    <div className={styles.panelTitle}>ACTION</div>
    <div className={styles.clueInput}>
      <input type="text" placeholder="CODEWORD" className={styles.codewordInput} />
      <div className={styles.numberRow}>
        <span>for</span>
        <button className={styles.numButton}>-</button>
        <span className={styles.numDisplay}>3</span>
        <button className={styles.numButton}>+</button>
        <span>cards</span>
      </div>
    </div>
    <button className={styles.actionButton} disabled={loading}>
      {loading ? "TRANSMITTING..." : "SUBMIT CLUE"}
    </button>
  </div>
);

const SandboxCodebreakerActions: React.FC<{ loading?: boolean }> = ({ loading }) => (
  <div className={styles.mockPanel}>
    <button className={styles.actionButton} disabled={loading}>
      {loading ? "PROCESSING..." : "END TRANSMISSION"}
    </button>
  </div>
);

const SandboxLobbyActions: React.FC<{ context: VisibilityContext; loading?: boolean }> = ({
  context,
  loading,
}) => {
  const buttonText = !context.hasRound
    ? "Deal Cards"
    : context.roundStatus === "SETUP" && !context.hasCards
      ? "Deal Cards"
      : context.roundStatus === "SETUP" && context.hasCards
        ? "Start Round"
        : "Continue Game";

  return (
    <div className={styles.mockPanel}>
      <button className={styles.actionButton} disabled={loading}>
        {buttonText}
      </button>
      {context.roundStatus === "SETUP" && context.hasCards && (
        <button className={styles.actionButton} disabled={loading} style={{ marginTop: "0.5rem" }}>
          REDEAL CARDS
        </button>
      )}
    </div>
  );
};

// ============================================================================
// VISIBILITY RULES (copied from config/rules.ts to avoid import issues)
// ============================================================================

const isCodemaster = (ctx: VisibilityContext) => ctx.role === "CODEMASTER";
const isSpectator = (ctx: VisibilityContext) => ctx.role === "SPECTATOR" || ctx.role === "NONE";
const hasRole = (ctx: VisibilityContext) => ctx.role !== "NONE" && ctx.teamName !== undefined;
const isCodemasterGivingClue = (ctx: VisibilityContext) =>
  ctx.role === "CODEMASTER" && ctx.isActiveTeam && !ctx.hasClue;
const isCodemasterObserving = (ctx: VisibilityContext) =>
  ctx.role === "CODEMASTER" && (!ctx.isActiveTeam || ctx.hasClue);
const isCodebreakerGuessing = (ctx: VisibilityContext) =>
  ctx.role === "CODEBREAKER" && ctx.isActiveTeam && ctx.hasClue && ctx.guessesRemaining > 0;
const isCodebreakerObserving = (ctx: VisibilityContext) =>
  ctx.role === "CODEBREAKER" && (!ctx.isActiveTeam || !ctx.hasClue || ctx.guessesRemaining === 0);
const isObserving = (ctx: VisibilityContext) =>
  isSpectator(ctx) || isCodemasterObserving(ctx) || isCodebreakerObserving(ctx);
const isInLobby = (ctx: VisibilityContext) => !ctx.hasRound || ctx.roundStatus === "SETUP";
const isRoundComplete = (ctx: VisibilityContext) => ctx.roundStatus === "COMPLETED";
const isRoundInProgress = (ctx: VisibilityContext) => ctx.roundStatus === "IN_PROGRESS";

// ============================================================================
// SANDBOX PANEL RENDERER
// ============================================================================

const SandboxPanels: React.FC<{ context: VisibilityContext }> = ({ context }) => {
  const panels: React.ReactNode[] = [];

  // Header
  if (hasRole(context)) {
    panels.push(<SandboxTeamHeader key="header" context={context} />);
  }

  // Middle
  if (isCodemaster(context)) {
    panels.push(<SandboxARToggle key="ar" />);
  }
  if (isCodebreakerGuessing(context)) {
    panels.push(<SandboxIntel key="intel" context={context} />);
  }
  if (isObserving(context)) {
    panels.push(<SandboxObserver key="observer" />);
  }
  if (isRoundInProgress(context)) {
    panels.push(<SandboxAIStatus key="ai" />);
  }
  if (isRoundComplete(context)) {
    panels.push(<SandboxGameover key="gameover" />);
  }

  // Bottom
  if (isInLobby(context)) {
    panels.push(
      <SandboxLobbyActions key="lobby" context={context} loading={context.isActionLoading} />
    );
  }
  if (isCodemasterGivingClue(context)) {
    panels.push(<SandboxCodemasterActions key="codemaster" loading={context.isActionLoading} />);
  }
  if (isCodebreakerGuessing(context)) {
    panels.push(<SandboxCodebreakerActions key="codebreaker" loading={context.isActionLoading} />);
  }

  return <>{panels}</>;
};

// ============================================================================
// SCENARIOS
// ============================================================================

const SCENARIOS: Record<string, Partial<VisibilityContext>> = {
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
    isActiveTeam: true,
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
    isActiveTeam: true,
    hasClue: true,
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
    isActiveTeam: false,
    hasClue: true,
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
    isActiveTeam: true,
    hasClue: true,
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
    isActiveTeam: true,
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
    isActiveTeam: false,
    hasClue: true,
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
    isActiveTeam: false,
    hasClue: true,
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
    isActiveTeam: false,
    hasClue: false,
    guessesRemaining: 0,
    roundStatus: "COMPLETED",
    hasRound: true,
    hasCards: true,
  },
};

const DEFAULT_CONTEXT: VisibilityContext = {
  role: "CODEMASTER",
  teamName: "Red",
  playerName: "Agent Smith",
  activeTeamName: "Red",
  isActiveTeam: true,
  hasClue: false,
  guessesRemaining: 0,
  roundStatus: "IN_PROGRESS",
  hasRound: true,
  hasCards: true,
  isActionLoading: false,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DashboardSandbox: React.FC = () => {
  const [context, setContext] = useState<VisibilityContext>(DEFAULT_CONTEXT);
  const [selectedScenario, setSelectedScenario] = useState<string>("codemaster-giving-clue");

  const handleScenarioChange = (scenarioKey: string) => {
    setSelectedScenario(scenarioKey);
    const scenario = SCENARIOS[scenarioKey];
    if (scenario) {
      setContext((prev) => ({
        ...prev,
        ...scenario,
        isActionLoading: false,
      }));
    }
  };

  const handleContextChange = (key: keyof VisibilityContext, value: unknown) => {
    setContext((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "teamName" || key === "activeTeamName") {
        updated.isActiveTeam =
          updated.teamName !== undefined && updated.teamName === updated.activeTeamName;
      }
      return updated;
    });
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
      {/* Control Panel */}
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
              <select value={context.role} onChange={(e) => handleContextChange("role", e.target.value)}>
                <option value="CODEMASTER">CODEMASTER</option>
                <option value="CODEBREAKER">CODEBREAKER</option>
                <option value="SPECTATOR">SPECTATOR</option>
                <option value="NONE">NONE</option>
              </select>
            </label>
            <label className={styles.control}>
              <span>Team</span>
              <select
                value={context.teamName ?? ""}
                onChange={(e) => handleContextChange("teamName", e.target.value || undefined)}
              >
                <option value="">None</option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
              </select>
            </label>
            <label className={styles.control}>
              <span>Active Team</span>
              <select
                value={context.activeTeamName ?? ""}
                onChange={(e) => handleContextChange("activeTeamName", e.target.value || undefined)}
              >
                <option value="">None</option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
              </select>
            </label>
            <label className={styles.control}>
              <span>Round Status</span>
              <select
                value={context.roundStatus ?? ""}
                onChange={(e) => handleContextChange("roundStatus", e.target.value || null)}
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
                checked={context.hasClue}
                onChange={(e) => handleContextChange("hasClue", e.target.checked)}
              />
            </label>
            <label className={styles.control}>
              <span>Guesses</span>
              <input
                type="number"
                min="0"
                max="9"
                value={context.guessesRemaining}
                onChange={(e) => handleContextChange("guessesRemaining", parseInt(e.target.value) || 0)}
              />
            </label>
            <label className={styles.control}>
              <span>Has Round</span>
              <input
                type="checkbox"
                checked={context.hasRound}
                onChange={(e) => handleContextChange("hasRound", e.target.checked)}
              />
            </label>
            <label className={styles.control}>
              <span>Has Cards</span>
              <input
                type="checkbox"
                checked={context.hasCards}
                onChange={(e) => handleContextChange("hasCards", e.target.checked)}
              />
            </label>
            <label className={styles.control}>
              <span>Loading</span>
              <input
                type="checkbox"
                checked={context.isActionLoading}
                onChange={(e) => handleContextChange("isActionLoading", e.target.checked)}
              />
            </label>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Current Context</h2>
          <pre className={styles.contextDisplay}>{JSON.stringify(context, null, 2)}</pre>
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className={styles.previewArea}>
        <div className={styles.previewLabel}>Dashboard Preview</div>
        <div className={styles.dashboardContainer}>
          <SandboxPanels context={context} />
        </div>
      </div>
    </div>
  );
};

export default DashboardSandbox;
