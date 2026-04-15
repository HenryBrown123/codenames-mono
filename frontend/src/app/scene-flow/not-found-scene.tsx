import React from "react";
import { useNavigate } from "react-router-dom";
import { SceneCard } from "./scene-card";
import { ActionButton } from "@frontend/game/gameplay/shared/components";
import styles from "./not-found-scene.module.css";

interface NotFoundSceneProps {
  title?: string;
}

export const NotFoundScene: React.FC<NotFoundSceneProps> = ({
  title = "GAME NOT FOUND",
}) => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <SceneCard maxWidth={480}>
        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
        </div>
        <div className={styles.body}>
          <div className={styles.controlRow}>
            <ActionButton
              text="NEW GAME"
              onClick={() => navigate("/")}
              enabled={true}
              className={styles.fullWidthBtn}
            />
          </div>
        </div>
      </SceneCard>
    </div>
  );
};
