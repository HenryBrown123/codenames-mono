#!/usr/bin/env node
/**
 * Reads all *-dotted.svg files in this directory and emits a single
 * icons.tsx React component file for the frontend.
 */
const fs = require("fs");
const path = require("path");

// Map filename stems to React component names
const NAME_MAP = {
  "exit": "ExitIcon",
  "plus": "PlusIcon",
  "minus": "MinusIcon",
  "arrow-left": "ArrowLeftIcon",
  "arrow-right": "ArrowRightIcon",
  "arrow-up": "ArrowUpIcon",
  "arrow-down": "ArrowDownIcon",
  "Black_Skull_icon": "BlackSkullIcon",
  "Black_Skull_icon-filled": "BlackSkullIconFilled",
  "square": "TeamSquareIcon",
  "circle": "CircleIcon",
  "drawer-handle": "WideBarIcon",
  "warning": "WarningIcon",
  "diamond": "TeamDiamondIcon",
  "gear": "GearIcon",
  "chat": "ChatIcon",
};

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith("-dotted.svg")).sort();

const header = `/** Auto-generated dotted-icon components. Do not edit by hand — regenerate via dottify. */
import type { SVGProps } from "react";
import iconStyles from "./icon.module.css";

export type IconProps = SVGProps<SVGSVGElement>;
`;

const components = [];

for (const file of files) {
  const stem = file.replace(/-dotted\.svg$/, "");
  const name = NAME_MAP[stem];
  if (!name) {
    console.warn(`No component name mapping for: ${stem} — skipping`);
    continue;
  }

  const svg = fs.readFileSync(path.join(dir, file), "utf8");

  // Extract viewBox
  const vbMatch = svg.match(/viewBox="([^"]+)"/);
  if (!vbMatch) { console.warn(`No viewBox in ${file}`); continue; }
  const viewBox = vbMatch[1];

  // Extract inner content (everything between <svg ...> and </svg>)
  const innerMatch = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (!innerMatch) { console.warn(`Can't parse inner content of ${file}`); continue; }
  let inner = innerMatch[1];

  // Convert SVG attrs to JSX and strip HTML comments (invalid in JSX)
  inner = inner
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/fill-rule=/g, "fillRule=")
    .replace(/clip-rule=/g, "clipRule=")
    .replace(/stroke-width=/g, "strokeWidth=")
    .replace(/stroke-linecap=/g, "strokeLinecap=")
    .replace(/stroke-linejoin=/g, "strokeLinejoin=")
    .replace(/ fill="currentColor"/g, "");

  // Icons with default colors and style prop
  const COLOR_MAP = {
    "TeamDiamondIcon": "var(--color-team-red, #e85454)",
    "TeamSquareIcon": "var(--color-team-blue, #5480e8)",
    "WarningIcon": "var(--color-warning, #e8c454)",
    "BlackSkullIcon": "var(--color-warning, #e8c454)",
    "BlackSkullIconFilled": "var(--color-warning, #e8c454)",
    "ChatIcon": "var(--color-icon-muted, #8a8983)",
    "ExitIcon": "var(--color-icon-muted, #8a8983)",
  };
  const hasColor = name in COLOR_MAP;
  const propsDecl = hasColor
    ? `{ className, style, ...rest }: IconProps`
    : `{ className, ...rest }: IconProps`;
  const styleAttr = hasColor
    ? ` style={{ color: "${COLOR_MAP[name]}", ...style }}`
    : "";

  const isWide = name === "WideBarIcon";
  const iconClass = isWide
    ? `\${iconStyles.icon} \${iconStyles.wide} \${className ?? ""}`
    : `\${iconStyles.icon} \${className ?? ""}`;

  components.push(`export const ${name} = (${propsDecl}) => (
  <svg viewBox="${viewBox}" className={\`${iconClass}\`} xmlns="http://www.w3.org/2000/svg"${styleAttr} {...rest}>${inner}  </svg>
);`);
}

// Hand-authored variants that can't be auto-generated
const MANUAL_COMPONENTS = `
export const ChatNotificationIcon = ({ className, style, ...rest }: IconProps) => (
  <svg viewBox="-0.6 -0.6 55.2 49.2" className={\`\${iconStyles.icon} \${className ?? ""}\`} xmlns="http://www.w3.org/2000/svg" style={{ color: "var(--color-icon-muted, #8a8983)", ...style }} {...rest}>
  <circle cx="9" cy="3" r="2.6"/>
  <circle cx="15" cy="3" r="2.6"/>
  <circle cx="21" cy="3" r="2.6"/>
  <circle cx="27" cy="3" r="2.6"/>
  <circle cx="33" cy="3" r="2.6"/>
  <circle cx="39" cy="3" r="2.6"/>
  <circle cx="45" cy="3" r="2.6"/>
  <circle cx="51" cy="3" r="2.6"/>
  <circle cx="51" cy="9" r="2.6"/>
  <circle cx="51" cy="15" r="2.6"/>
  <circle cx="51" cy="21" r="2.6"/>
  <circle cx="51" cy="27" r="2.6"/>
  <circle cx="51" cy="33" r="2.6"/>
  <circle cx="45" cy="33" r="2.6"/>
  <circle cx="39" cy="33" r="2.6"/>
  <circle cx="33" cy="33" r="2.6"/>
  <circle cx="27" cy="33" r="2.6"/>
  <circle cx="21" cy="33" r="2.6"/>
  <circle cx="15" cy="33" r="2.6"/>
  <circle cx="3" cy="33" r="2.6"/>
  <circle cx="3" cy="27" r="2.6"/>
  <circle cx="3" cy="21" r="2.6"/>
  <circle cx="3" cy="15" r="2.6"/>
  <circle cx="3" cy="9" r="2.6"/>
  <circle cx="3" cy="3" r="2.6"/>
  <circle cx="9" cy="39" r="2.6"/>
  <circle cx="3" cy="45" r="2.6"/>
  <circle cx="51" cy="3" r="10" fill="var(--color-bg, #0a0a0a)"/>
  <circle cx="51" cy="3" r="9" fill="var(--color-warning, #e8c454)"/>
  </svg>
);
`;

const out = header + "\n" + components.join("\n\n") + "\n" + MANUAL_COMPONENTS;

const outPath = process.argv[2] || path.join(dir, "icons.tsx");
fs.writeFileSync(outPath, out);
console.log(`Wrote ${components.length + 1} components → ${outPath}`);
