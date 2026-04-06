import React, { createContext, useContext, useState, ReactNode } from "react";
import type { PlayerRole } from "@codenames/shared/types";

/** Types */

export interface ClaimedPhase {
  role: PlayerRole;
  teamName: string;
}

/**
 * Tracks which role+team the current user claimed via the handoff overlay,
 * and whether the device was most recently handed to an AI turn (vs a human).
 *
 * isAiClaimed is set to true when the user clicks PASS on the AI overlay,
 * and cleared back to false when a human handoff is accepted. This lets the
 * dashboard suppress human-only controls (AR toggle etc.) during AI turns
 * even when the backend doesn't populate turn.active on the codemaster phase.
 */
export interface PlayerSessionContextValue {
  claimedPhase: ClaimedPhase | null;
  setClaimedPhase: (phase: ClaimedPhase | null) => void;
  claimedRole: PlayerRole | null; // derived: claimedPhase?.role ?? null
  isAiClaimed: boolean;
  setIsAiClaimed: (v: boolean) => void;
}

/** Context */

const PlayerSessionContext = createContext<PlayerSessionContextValue | undefined>(undefined);

/** Provider */

export const ActiveGameSessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [claimedPhase, setClaimedPhase] = useState<ClaimedPhase | null>(null);
  const [isAiClaimed, setIsAiClaimed] = useState(false);

  return (
    <PlayerSessionContext.Provider
      value={{
        claimedPhase,
        setClaimedPhase,
        claimedRole: claimedPhase?.role ?? null,
        isAiClaimed,
        setIsAiClaimed,
      }}
    >
      {children}
    </PlayerSessionContext.Provider>
  );
};

/** Hook */

export const usePlayerSession = (): PlayerSessionContextValue => {
  const ctx = useContext(PlayerSessionContext);
  if (!ctx) {
    throw new Error("usePlayerSession must be used within ActiveGameSessionProvider");
  }
  return ctx;
};
