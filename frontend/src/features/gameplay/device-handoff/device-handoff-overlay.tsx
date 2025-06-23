import React from "react";
import styled from "styled-components";
import { useGameData } from "../state";
import { PLAYER_ROLE } from "@codenames/shared/types";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const HandoffCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  width: 90%;
`;

const Title = styled.h2`
  margin: 0 0 1rem 0;
  color: #333;
`;

const Message = styled.p`
  margin: 0 0 2rem 0;
  color: #666;
  line-height: 1.5;
`;

const ServerRoleInfo = styled.div`
  margin: 0 0 2rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
`;

const ContinueButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1rem;
  border: 2px solid #007bff;
  border-radius: 8px;
  background: #007bff;
  color: white;
  cursor: pointer;

  &:hover {
    background: #0056b3;
    border-color: #0056b3;
  }
`;

interface DeviceHandoffOverlayProps {
  onHandoffComplete: () => void;
}

export const DeviceHandoffOverlay: React.FC<DeviceHandoffOverlayProps> = ({
  onHandoffComplete,
}) => {
  const { gameData } = useGameData();
  const serverRole = gameData.playerContext?.role || PLAYER_ROLE.SPECTATOR;

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case PLAYER_ROLE.CODEMASTER:
        return "Codemaster";
      case PLAYER_ROLE.CODEBREAKER:
        return "Codebreaker";
      case PLAYER_ROLE.SPECTATOR:
        return "Spectator";
      default:
        return "Unknown";
    }
  };

  return (
    <Overlay>
      <HandoffCard>
        <Title>Device Handoff</Title>
        <Message>Pass the device to the next player.</Message>

        <ServerRoleInfo>
          <strong>Next Role: {getRoleDisplayName(serverRole)}</strong>
        </ServerRoleInfo>

        <ContinueButton onClick={onHandoffComplete}>
          Continue as {getRoleDisplayName(serverRole)}
        </ContinueButton>
      </HandoffCard>
    </Overlay>
  );
};
