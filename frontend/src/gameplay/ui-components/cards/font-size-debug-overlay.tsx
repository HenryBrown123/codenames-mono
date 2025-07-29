import React, { useState } from "react";
import styles from "./font-size-debug-overlay.module.css";

interface FontSizeDebugOverlayProps {
  onClose: () => void;
}

export const FontSizeDebugOverlay: React.FC<FontSizeDebugOverlayProps> = ({ onClose }) => {
  const [normalSize, setNormalSize] = useState(14);
  const [longSize, setLongSize] = useState(12);
  const [threshold, setThreshold] = useState(11);

  // Test words from your data
  const testWords = [
    { word: "CAT", length: 3 },
    { word: "CASTLE", length: 6 },
    { word: "BEETHOVEN", length: 9 },
    { word: "WASHINGTON", length: 10 },
    { word: "SHAKESPEARE", length: 11 },
    { word: "MICROSCOPE", length: 11 },
    { word: "ARCHAEOLOGICAL", length: 14 },
  ];

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <h2 className={styles.title}>Font Size Tester</h2>
        
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label>Normal Size: {normalSize}px</label>
            <input
              type="range"
              min="10"
              max="24"
              value={normalSize}
              onChange={(e) => setNormalSize(Number(e.target.value))}
            />
          </div>
          
          <div className={styles.controlGroup}>
            <label>Long Word Size: {longSize}px</label>
            <input
              type="range"
              min="8"
              max="20"
              value={longSize}
              onChange={(e) => setLongSize(Number(e.target.value))}
            />
          </div>
          
          <div className={styles.controlGroup}>
            <label>Threshold: &gt;{threshold} chars</label>
            <input
              type="range"
              min="8"
              max="13"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
          </div>
        </div>

        <div className={styles.preview}>
          <h3>Preview</h3>
          <div className={styles.cardGrid}>
            {testWords.map((test) => {
              const isLong = test.length > threshold;
              const fontSize = isLong ? longSize : normalSize;
              
              return (
                <div key={test.word} className={styles.testCard}>
                  <span
                    className={styles.testWord}
                    style={{ fontSize: `${fontSize}px` }}
                    data-long={isLong}
                  >
                    {test.word}
                  </span>
                  <div className={styles.info}>
                    {test.length} chars • {fontSize}px
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.cssOutput}>
          <h3>CSS to Copy</h3>
          <pre>{`/* Normal words (≤${threshold} chars) */
.cardWord {
  font-size: ${normalSize / 16}rem; /* ${normalSize}px */
}

/* Long words (>${threshold} chars) */
.textLong {
  font-size: ${longSize / 16}rem; /* ${longSize}px */
}`}</pre>
        </div>
      </div>
    </div>
  );
};