import React, { useState } from "react";
import { useCreateGuestSession } from "@frontend/game-access/api/query-hooks/use-guest-session";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner, ActionButton } from "@frontend/gameplay/shared/components";
import styles from "./guest-auth-page-content.module.css";

export const GuestAuthPageContent: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { mutate: createGuestSession, isPending: isCreatingSession } =
    useCreateGuestSession();

  const navigate = useNavigate();

  const handleCreateSession = () => {
    createGuestSession(undefined, {
      onSuccess: () => {
        navigate("/create-game");
      },
      onError: () => {
        setError("Failed to create a guest session. Please try again.");
      },
    });
  };

  return (
    <div className={styles.guestAuthLayout}>
      <div className={styles.authContainer}>
        <div className={styles.authContent}>
          <h2>Welcome to Codenames!</h2>
          <p>
            Before starting a new game, let's set up a quick guest session. This
            will ensure a smooth experience and keep your game progress intact.
          </p>
          {isCreatingSession ? (
            <LoadingSpinner displayText={"Creating Session..."} />
          ) : (
            <ActionButton
              onClick={handleCreateSession}
              enabled={!isCreatingSession}
              text={"Create Guest Session"}
            />
          )}
          {error && <p className={styles.errorText}>{error}</p>}
        </div>
      </div>
    </div>
  );
};


export default GuestAuthPageContent;
