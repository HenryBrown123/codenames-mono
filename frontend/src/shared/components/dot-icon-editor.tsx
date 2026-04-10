import React, { useCallback, useMemo, useState } from "react";
import { DotIcon } from "./dot-icon";

export interface DotIconEditorProps {
  initialRows?: number;
  initialCols?: number;
  /** Optional starting pattern — takes precedence over initialRows/Cols. */
  initialPattern?: string[];
}

/**
 * Interactive dot-matrix icon designer.
 *
 * Click cells to toggle them on/off. The editor renders a live preview
 * (using `DotIcon`) and a copy-ready string-array representation of the
 * pattern. Drop this on any dev/debug route to author icons by hand.
 *
 * ## Example
 * ```tsx
 * <DotIconEditor initialRows={7} initialCols={9} />
 * ```
 */
export const DotIconEditor: React.FC<DotIconEditorProps> = ({
  initialRows = 7,
  initialCols = 9,
  initialPattern,
}) => {
  const makeEmpty = (rows: number, cols: number): boolean[][] =>
    Array.from({ length: rows }, () => Array(cols).fill(false));

  const fromPattern = (pattern: string[]): boolean[][] => {
    const cols = Math.max(...pattern.map((r) => r.length));
    return pattern.map((row) => {
      const padded = row.padEnd(cols, ".");
      return Array.from(padded).map((ch) => ch !== "." && ch !== " ");
    });
  };

  const [grid, setGrid] = useState<boolean[][]>(() =>
    initialPattern ? fromPattern(initialPattern) : makeEmpty(initialRows, initialCols),
  );

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  const toggle = useCallback((r: number, c: number) => {
    setGrid((g) => g.map((row, ri) => (ri === r ? row.map((v, ci) => (ci === c ? !v : v)) : row)));
  }, []);

  const resize = useCallback((nextRows: number, nextCols: number) => {
    setGrid((g) => {
      const next = makeEmpty(nextRows, nextCols);
      for (let r = 0; r < Math.min(g.length, nextRows); r++) {
        for (let c = 0; c < Math.min(g[r].length, nextCols); c++) {
          next[r][c] = g[r][c];
        }
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => setGrid(makeEmpty(rows, cols)), [rows, cols]);

  const invert = useCallback(() => {
    setGrid((g) => g.map((row) => row.map((v) => !v)));
  }, []);

  const pattern: string[] = useMemo(
    () => grid.map((row) => row.map((v) => (v ? "#" : ".")).join("")),
    [grid],
  );

  const code = useMemo(
    () => `[\n${pattern.map((r) => `  "${r}",`).join("\n")}\n]`,
    [pattern],
  );

  const copy = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {
        /* ignore */
      });
    }
  }, [code]);

  const cellSize = 28;

  return (
    <div style={wrap}>
      <div style={controls}>
        <label style={label}>
          ROWS{" "}
          <input
            type="number"
            min={1}
            max={32}
            value={rows}
            onChange={(e) => resize(Number(e.target.value) || 1, cols)}
            style={numInput}
          />
        </label>
        <label style={label}>
          COLS{" "}
          <input
            type="number"
            min={1}
            max={32}
            value={cols}
            onChange={(e) => resize(rows, Number(e.target.value) || 1)}
            style={numInput}
          />
        </label>
        <button type="button" onClick={clear} style={btn}>
          CLEAR
        </button>
        <button type="button" onClick={invert} style={btn}>
          INVERT
        </button>
        <button type="button" onClick={copy} style={btn}>
          COPY
        </button>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            gap: 2,
            background: "rgba(82, 214, 138, 0.08)",
            padding: 4,
            borderRadius: 4,
          }}
        >
          {grid.map((row, r) =>
            row.map((on, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => toggle(r, c)}
                style={{
                  width: cellSize,
                  height: cellSize,
                  border: "1px solid rgba(82, 214, 138, 0.2)",
                  borderRadius: "50%",
                  background: on ? "#52d68a" : "rgba(10,10,10,0.6)",
                  boxShadow: on ? "0 0 8px rgba(82,214,138,0.7)" : "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                aria-label={`Cell ${r},${c} ${on ? "on" : "off"}`}
              />
            )),
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={previewLabel}>PREVIEW 16px</div>
          <span style={{ fontSize: 16, color: "#52d68a" }}><DotIcon pattern={pattern} glow /></span>
          <div style={previewLabel}>PREVIEW 32px</div>
          <span style={{ fontSize: 32, color: "#52d68a" }}><DotIcon pattern={pattern} glow /></span>
          <div style={previewLabel}>PREVIEW 64px</div>
          <span style={{ fontSize: 64, color: "#52d68a" }}><DotIcon pattern={pattern} glow /></span>
        </div>
      </div>

      <pre style={codeBlock}>{code}</pre>
    </div>
  );
};

const wrap: React.CSSProperties = {
  fontFamily: "'Doto', 'JetBrains Mono', monospace",
  color: "#52d68a",
  background: "rgba(8, 10, 8, 0.98)",
  padding: 20,
  borderRadius: 8,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  width: "fit-content",
};

const controls: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
};

const label: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: "0.75rem",
  letterSpacing: "0.1em",
};

const numInput: React.CSSProperties = {
  width: 48,
  background: "rgba(10,10,10,0.6)",
  border: "1px solid rgba(82, 214, 138, 0.3)",
  color: "#52d68a",
  fontFamily: "inherit",
  padding: "4px 6px",
  borderRadius: 3,
};

const btn: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: "0.75rem",
  letterSpacing: "0.1em",
  padding: "6px 10px",
  background: "transparent",
  color: "#52d68a",
  border: "1px solid rgba(82, 214, 138, 0.4)",
  borderRadius: 3,
  cursor: "pointer",
};

const previewLabel: React.CSSProperties = {
  fontSize: "0.6rem",
  opacity: 0.6,
  letterSpacing: "0.1em",
};

const codeBlock: React.CSSProperties = {
  background: "rgba(10,10,10,0.8)",
  padding: 12,
  borderRadius: 4,
  fontSize: "0.75rem",
  margin: 0,
  color: "#52d68a",
  border: "1px solid rgba(82, 214, 138, 0.15)",
  whiteSpace: "pre",
};
