import React from "react";
import * as Icons from "@frontend/shared/components/icons";
import type { IconProps } from "@frontend/shared/components/icons";

const SIZES = ["1rem", "1.5rem", "2rem", "3rem"] as const;

const entries = Object.entries(Icons).filter(
  ([name]) => name.endsWith("Icon") || name.endsWith("IconFilled"),
) as [string, React.FC<IconProps>][];

const circleBtn: React.CSSProperties = {
  minWidth: "2.5em",
  height: "2.5em",
  padding: "0 0.6em",
  borderRadius: "999px",
  border: "1px solid rgba(82,214,138,0.3)",
  background: "transparent",
  color: "inherit",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1rem",
};

export const IconGallery: React.FC = () => (
  <div style={{ padding: 32, background: "#0a0a0a", height: "100vh", color: "#52d68a", fontFamily: "monospace", overflow: "auto" }}>
    <h1 style={{ fontSize: "1.4rem", marginBottom: 24, fontWeight: 600, position: "sticky", top: 0, background: "#0a0a0a", padding: "8px 0", zIndex: 1 }}>
      Icon Gallery ({entries.length})
    </h1>

    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead style={{ position: "sticky", top: 48, background: "#0a0a0a", zIndex: 1 }}>
        <tr>
          <th style={th}>Name</th>
          {SIZES.map(s => <th key={s} style={th}>{s}</th>)}
          <th style={th}>In text</th>
          <th style={th}>Circled</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([name, Icon]) => (
          <tr key={name} style={{ borderBottom: "1px solid rgba(82,214,138,0.12)" }}>
            <td style={td}>{name}</td>
            {SIZES.map(s => (
              <td key={s} style={{ ...td, fontSize: s }}>
                <Icon />
              </td>
            ))}
            <td style={{ ...td, fontSize: "1rem" }}>
              Hello <Icon /> world
            </td>
            <td style={td}>
              <span style={circleBtn}><Icon /></span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 16px",
  fontSize: "0.75rem",
  opacity: 0.6,
  borderBottom: "1px solid rgba(82,214,138,0.25)",
};

const td: React.CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "middle",
};
