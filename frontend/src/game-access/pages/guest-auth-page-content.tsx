import React from "react";
import { ActionButton, AwaitingLabel, ErrorBox } from "@frontend/gameplay/shared/components";
import styles from "./guest-auth-page-content.module.css";

export interface GuestAuthViewProps {
  onConnect: () => void;
  error: string | null;
}

export const GuestAuthView: React.FC<GuestAuthViewProps> = ({
  onConnect,
  error,
}) => (
  <>
    <div className={styles.header}>
      <h1 className={styles.title}>SYSTEM ACCESS</h1>
    </div>

    <div className={styles.body}>
      <div className={styles.controlRow}>
        <AwaitingLabel>SECURE CONNECTION REQUIRED</AwaitingLabel>
      </div>

      <div className={styles.controlRow}>
        <ActionButton
          text="CONNECT"
          onClick={onConnect}
          className={styles.fullWidthBtn}
        />
      </div>

      {error && <ErrorBox message={error} />}
    </div>
  </>
);
