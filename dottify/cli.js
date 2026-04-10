#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");
const { styleInject, sampleDots, emitSvg, emitPatternFilled, dotRadius } = require("./dottify.js");

const args = process.argv.slice(2);
const flags = {};
const positional = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--mode" || args[i] === "-m") flags.mode = args[++i];
  else if (args[i] === "--grid" || args[i] === "-g") flags.grid = parseInt(args[++i]);
  else if (args[i] === "--ratio" || args[i] === "-r") flags.ratio = parseInt(args[++i]);
  else if (args[i] === "--out" || args[i] === "-o") flags.out = args[++i];
  else if (args[i] === "--size" || args[i] === "-s") flags.size = args[++i];
  else if (args[i] === "--help" || args[i] === "-h") { usage(); process.exit(0); }
  else positional.push(args[i]);
}

function usage() {
  console.log(`
  dottify — SVG to dot-matrix icon converter

  Usage: node cli.js [options] <input.svg>

  Options:
    -m, --mode <outline|stroke|filled>
        outline  — rasterise as filled, erode to boundary dots (default)
                   Best for complex filled shapes (skull, gear, etc.)
        stroke   — rasterise with original strokes, sample dots, no erosion
                   Best for simple line/stroke icons (<, >, —, ×, +)
        filled   — pattern-fill mode, no rasterisation
    -g, --grid <4-16>             Grid spacing (default: 6)
    -r, --ratio <50-100>          Dot size ratio % (default: 85)
    -s, --size <100-400>          Raster size in px (default: 200)
    -o, --out <file.svg>          Output file (default: <name>-dotted.svg)
    -h, --help                    Show this help
  `);
}

const inputFile = positional[0];
if (!inputFile) { usage(); process.exit(1); }

const mode = flags.mode || "outline";
const grid = flags.grid || 6;
const ratio = flags.ratio || 85;
const dotR = dotRadius(grid, ratio);

const svgText = fs.readFileSync(inputFile, "utf8");
const baseName = path.basename(inputFile, ".svg").replace(/-dotted$/, "");
const outFile = flags.out || `${baseName}-dotted.svg`;

if (mode === "filled") {
  const result = emitPatternFilled(svgText, grid, dotR);
  fs.writeFileSync(outFile, result);
  console.log(`filled → ${outFile}`);
  process.exit(0);
}

// ── Rasterise ──
const SIZE = flags.size ? parseInt(flags.size) : 200;

// stroke mode: rasterise with original strokes intact (no fill injection)
// outline mode: rasterise as filled, then erode to boundary
const styled = mode === "stroke" ? svgText : styleInject(svgText, "filled");

const resvg = new Resvg(styled, {
  fitTo: { mode: "width", value: SIZE },
  background: "rgba(0,0,0,0)",
});
const rendered = resvg.render();
const W = rendered.width;
const H = rendered.height;
const rgba = rendered.pixels;

const allDots = sampleDots(rgba, W, H, grid, dotR);

let dots;
if (mode === "stroke") {
  // Stroke mode: keep all sampled dots (strokes are already thin)
  dots = allDots;
} else {
  // Outline mode: erode to boundary — keep dots missing at least one cardinal neighbour
  const solidSet = new Set();
  for (const [x, y, s] of allDots) {
    if (s > 0.5) solidSet.add(`${x},${y}`);
  }
  dots = allDots.filter(([x, y, s]) => {
    if (s <= 0.5) return true;
    return !solidSet.has(`${x},${y - grid}`) ||
           !solidSet.has(`${x},${y + grid}`) ||
           !solidSet.has(`${x - grid},${y}`) ||
           !solidSet.has(`${x + grid},${y}`);
  });
}

// Tight-crop viewBox
let vbX = 0, vbY = 0, vbW = W, vbH = H;
if (dots.length) {
  const xs = dots.map(d => d[0]);
  const ys = dots.map(d => d[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pad = dotR + 1;
  vbX = +(minX - pad).toFixed(1);
  vbY = +(minY - pad).toFixed(1);
  vbW = +(maxX - minX + pad * 2).toFixed(1);
  vbH = +(maxY - minY + pad * 2).toFixed(1);
}

const svgOut = `<svg viewBox="${vbX} ${vbY} ${vbW} ${vbH}" xmlns="http://www.w3.org/2000/svg">\n` +
  dots.map(([x, y, s]) => {
    const r = +(dotR * (s || 1)).toFixed(1);
    return `  <circle cx="${x}" cy="${y}" r="${r}" fill="currentColor"/>`;
  }).join("\n") +
  "\n</svg>";

fs.writeFileSync(outFile, svgOut);
console.log(`${mode} → ${outFile} (${dots.length} dots)`);
