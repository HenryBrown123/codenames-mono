import React, { useState, useEffect } from "react";
import styles from "./game-instructions.module.css";

interface GameInstructionsProps {
  messageText: string;
}

/**
 * Typewriter-animated instruction line. Resets the reveal whenever
 * `messageText` changes; the blinking cursor only shows while typing.
 */
export const GameInstructions: React.FC<GameInstructionsProps> = ({ messageText }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);

    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < messageText.length) {
        setDisplayedText(messageText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 50); // Typing speed

    return () => clearInterval(typeInterval);
  }, [messageText]);

  return (
    <div className={styles.messageContainer}>
      <p className={styles.message}>
        {displayedText}
        {isTyping && <span className={styles.cursor} />}
      </p>
    </div>
  );
};
