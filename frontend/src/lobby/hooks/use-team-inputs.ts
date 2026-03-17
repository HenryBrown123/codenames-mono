import { useState, useCallback } from "react";

/** Team input state for quick-add player inputs */
export interface TeamInputsState {
  teamRedInput: string;
  teamBlueInput: string;
}

/** Return type of useTeamInputs hook */
export interface UseTeamInputsReturn {
  state: TeamInputsState;
  getValue: (teamName: string) => string;
  setValue: (teamName: string, value: string) => void;
  getInputValue: (teamName: string) => string;
  clearInput: (teamName: string) => void;
  reset: () => void;
}

/**
 * Manages input state for quick-add player inputs per team.
 * Returns state and handlers for team input operations.
 */
export function useTeamInputs(): UseTeamInputsReturn {
  const [teamRedInput, setTeamRedInput] = useState("");
  const [teamBlueInput, setTeamBlueInput] = useState("");

  const getValue = useCallback(
    (teamName: string) => (teamName === "Team Red" ? teamRedInput : teamBlueInput),
    [teamRedInput, teamBlueInput],
  );

  const setValue = useCallback((teamName: string, value: string) => {
    if (teamName === "Team Red") {
      setTeamRedInput(value);
    } else {
      setTeamBlueInput(value);
    }
  }, []);

  const getInputValue = useCallback(
    (teamName: string) => {
      const value = teamName === "Team Red" ? teamRedInput : teamBlueInput;
      return value.trim();
    },
    [teamRedInput, teamBlueInput],
  );

  const clearInput = useCallback((teamName: string) => {
    if (teamName === "Team Red") {
      setTeamRedInput("");
    } else {
      setTeamBlueInput("");
    }
  }, []);

  const reset = useCallback(() => {
    setTeamRedInput("");
    setTeamBlueInput("");
  }, []);

  return {
    state: { teamRedInput, teamBlueInput },
    getValue,
    setValue,
    getInputValue,
    clearInput,
    reset,
  };
}
