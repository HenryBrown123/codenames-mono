import React, { useState, useEffect, useRef } from "react";
import { PlayerRole, PLAYER_ROLE } from "@codenames/shared/types";
import styles from "./menu.module.css";


// Create a safe hook that doesn't throw when outside the provider
const useSafeGameContext = () => {
  // For now, return null as the game context hook doesn't exist
  // This is a dev tool that's not actively being used
  return null;
};

export const Menu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Game context is not currently implemented
  const gameContext = null;

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
    // You could implement actual stage changing logic here if needed
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        ref={menuRef}
        className={styles.burgerMenu}
        data-open={isOpen}
        onClick={toggleMenu}
      >
        <div className={styles.burgerLine} />
        <div className={styles.burgerLine} />
        <div className={styles.burgerLine} />
      </div>
      <div
        className={styles.overlay}
        data-open={isOpen}
        onClick={toggleMenu}
      />
      <div
        ref={sidebarRef}
        className={styles.sidebar}
        data-open={isOpen}
      >
        <h2 className={styles.sidebarTitle}>Dev Panel</h2>
        {gameContext ? (
          <ul className={styles.menuList}>
            <li
              className={styles.menuItem}
              onClick={() => changeGameStage(PLAYER_ROLE.NONE)}
            >
              Lobby
            </li>
            <li
              className={styles.menuItem}
              onClick={() => changeGameStage(PLAYER_ROLE.CODEMASTER)}
            >
              Codemaster
            </li>
            <li
              className={styles.menuItem}
              onClick={() => changeGameStage(PLAYER_ROLE.CODEBREAKER)}
            >
              Codebreaker
            </li>
            <li
              className={styles.menuItem}
              onClick={() => changeGameStage(PLAYER_ROLE.SPECTATOR)}
            >
              Spectator
            </li>
          </ul>
        ) : (
          <div className={styles.notInGame}>Not in a game</div>
        )}
      </div>
    </>
  );
};
