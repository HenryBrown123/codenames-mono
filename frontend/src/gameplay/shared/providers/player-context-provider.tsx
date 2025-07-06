import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlayerContextValue {
  currentPlayerId: string | null;
  setCurrentPlayerId: (playerId: string | null) => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  
  return (
    <PlayerContext.Provider value={{ currentPlayerId, setCurrentPlayerId }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within PlayerProvider');
  }
  return context;
};