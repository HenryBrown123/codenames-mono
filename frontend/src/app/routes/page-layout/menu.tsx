import React, { useState, useEffect, useRef } from "react";
import { PlayerRole, PLAYER_ROLE } from "@codenames/shared/types";
import styles from "./menu.module.css";

/** Props for {@link MenuView}. */
export interface MenuViewProps {
  isOpen: boolean;
  /** When false, the role-switch list is replaced with a "not in a game" notice. */
  hasGameContext: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  onChangeStage: (stage: PlayerRole) => void;
}

/**
 * Burger-menu sidebar dev panel. Stateless — exposes refs so the
 * container can detect outside-clicks and close it.
 */
export const MenuView: React.FC<MenuViewProps> = ({
  isOpen,
  hasGameContext,
  menuRef,
  sidebarRef,
  onToggle,
  onChangeStage,
}) => (
  <>
    <div
      ref={menuRef}
      className={styles.burgerMenu}
      data-open={isOpen}
      onClick={onToggle}
    >
      <div className={styles.burgerLine} />
      <div className={styles.burgerLine} />
      <div className={styles.burgerLine} />
    </div>
    <div className={styles.overlay} data-open={isOpen} onClick={onToggle} />
    <div ref={sidebarRef} className={styles.sidebar} data-open={isOpen}>
      <h2 className={styles.sidebarTitle}>Dev Panel</h2>
      {hasGameContext ? (
        <ul className={styles.menuList}>
          <li className={styles.menuItem} onClick={() => onChangeStage(PLAYER_ROLE.NONE)}>
            Lobby
          </li>
          <li className={styles.menuItem} onClick={() => onChangeStage(PLAYER_ROLE.CODEMASTER)}>
            Codemaster
          </li>
          <li className={styles.menuItem} onClick={() => onChangeStage(PLAYER_ROLE.CODEBREAKER)}>
            Codebreaker
          </li>
          <li className={styles.menuItem} onClick={() => onChangeStage(PLAYER_ROLE.SPECTATOR)}>
            Spectator
          </li>
        </ul>
      ) : (
        <div className={styles.notInGame}>Not in a game</div>
      )}
    </div>
  </>
);

/**
 * Stateful burger menu. Tracks open/closed state, wires up the
 * outside-click handler that closes it, and renders {@link MenuView}.
 */
export const Menu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChangeStage = (_newStage: PlayerRole) => {
    // Dev tool — stage changing not implemented.
  };

  return (
    <MenuView
      isOpen={isOpen}
      hasGameContext={false}
      menuRef={menuRef}
      sidebarRef={sidebarRef}
      onToggle={() => setIsOpen(!isOpen)}
      onChangeStage={handleChangeStage}
    />
  );
};
