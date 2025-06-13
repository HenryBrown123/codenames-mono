import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useGameContext } from "@frontend/game/state";
import { PlayerRole, PLAYER_ROLE } from "@codenames/shared/types";

interface OverlayProps {
  isOpen: boolean;
}

const BurgerMenu = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 30px;
  height: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  cursor: pointer;
  z-index: 10;

  div {
    width: 30px;
    height: 3px;
    background-color: #2f2e2e; /* White color for contrast */
    transition: all 0.3s ease;
  }

  &.open div:nth-child(1) {
    transform: rotate(45deg);
    transform-origin: 5% 50%;
    background-color: #dbd2d2; /* White color for contrast */
  }

  &.open div:nth-child(2) {
    opacity: 0;
  }

  &.open div:nth-child(3) {
    transform: rotate(-45deg);
    transform-origin: 5% 50%;
    background-color: #dbd2d2; /* White color for contrast */
  }
`;

const Sidebar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  min-height: 100%;
  background-color: #1d2023; /* Dark background */
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 20px;
  z-index: 5;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.5);

  &.open {
    transform: translateX(0);
  }

  h2 {
    margin: 40px 0 20px 0;
    font-size: 24px;
    font-weight: bold;
    text-align: left;
    color: #ffffff; /* White text */
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin: 10px 0;
    cursor: pointer;
    padding: 12px;
    font-size: 18px;
    color: #e0e0e0; /* Light text */
    border-radius: 8px;
    transition:
      background-color 0.2s ease-in-out,
      color 0.2s ease-in-out;
  }

  li:hover {
    background-color: #333; /* Darker hover background */
    color: #fff; /* White text on hover */
  }

  @media (max-width: 768px) {
    width: 200px;
    padding: 15px;

    h2 {
      font-size: 20px;
    }

    li {
      font-size: 16px;
    }
  }

  @media (max-width: 512px) {
    width: 180px;
  }
`;

const Overlay = styled.div<OverlayProps>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Dark overlay */
  z-index: 4;
  opacity: ${({ isOpen }) => (isOpen ? "1" : "0")};
  pointer-events: ${({ isOpen }) => (isOpen ? "all" : "none")};
  transition: opacity 0.3s ease;
`;

export const Menu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Only access game context if it exists (when in a game)
  const gameContext = useGameContext();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  const changeGameStage = (newStage: PlayerRole) => {
    console.log("Changing to stage: " + newStage);
    // This is a dev tool - in real app you wouldn't manually change stages
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <BurgerMenu
        ref={menuRef}
        className={isOpen ? "open" : ""}
        onClick={toggleMenu}
      >
        <div />
        <div />
        <div />
      </BurgerMenu>
      <Overlay isOpen={isOpen} onClick={toggleMenu} />
      <Sidebar ref={sidebarRef} className={isOpen ? "open" : ""}>
        <h2>Dev Panel</h2>
        {gameContext ? (
          <ul>
            <li onClick={() => changeGameStage(PLAYER_ROLE.NONE)}>Lobby</li>
            <li onClick={() => changeGameStage(PLAYER_ROLE.CODEMASTER)}>
              Codemaster
            </li>
            <li onClick={() => changeGameStage(PLAYER_ROLE.CODEBREAKER)}>
              Codebreaker
            </li>
            <li onClick={() => changeGameStage(PLAYER_ROLE.SPECTATOR)}>
              Spectator
            </li>
          </ul>
        ) : (
          <div>Not in a game</div>
        )}
      </Sidebar>
    </>
  );
};
