// dottify core — pure functions, no DOM/canvas. Usable from browser or Node.
// Browser: loaded via <script>, attaches to window.Dottify.
// Node:    `const { sampleDots, emitSvg, styleInject } = require('./dottify.js')`
//          You'll need something like `sharp` or `@resvg/resvg-js` to rasterise
//          the SVG to RGBA pixel data first, then pass to sampleDots.

(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  else root.Dottify = mod;
})(typeof self !== 'undefined' ? self : this, function () {

  // Inject a <style> block into an SVG string to force outline or filled rendering.
  // Only overrides colours — respects the source's own stroke-width so chunky
  // artwork (e.g. a wide drawer handle) stays chunky.
  function styleInject(svgText, mode) {
    const style = mode === 'filled'
      ? '<style>svg,svg *{fill:#000;stroke:#000}</style>'
      : '<style>svg,svg *{fill:none;stroke:#000}</style>';
    return svgText.replace(/<svg\b[^>]*>/i, m => m + style);
  }

  // Walk an RGBA pixel buffer on a grid. For each cell, measure what fraction
  // of the dot's area overlaps opaque pixels and scale the radius proportionally.
  // rgba: Uint8ClampedArray, W/H: buffer dimensions
  // returns: Array<[x, y, scale]>  (scale 0–1, 0 = skip)
  function sampleDots(rgba, W, H, grid, dotR, alphaThreshold = 80) {
    const dots = [];
    const half = Math.floor(grid / 2);
    const scanR = Math.max(Math.ceil(dotR), 1);

    for (let gy = half; gy < H; gy += grid) {
      for (let gx = half; gx < W; gx += grid) {
        // Count opaque pixels within the dot radius
        let opaqueCount = 0;
        let totalCount = 0;
        for (let dy = -scanR; dy <= scanR; dy++) {
          for (let dx = -scanR; dx <= scanR; dx++) {
            if (dx * dx + dy * dy > scanR * scanR) continue;
            totalCount++;
            const px = gx + dx, py = gy + dy;
            if (px < 0 || px >= W || py < 0 || py >= H) continue;
            if (rgba[(py * W + px) * 4 + 3] > alphaThreshold) opaqueCount++;
          }
        }
        if (opaqueCount === 0) continue;
        const coverage = opaqueCount / totalCount;
        // Scale radius by sqrt(coverage) so area is proportional
        const scale = Math.sqrt(coverage);
        dots.push([gx, gy, +scale.toFixed(2)]);
      }
    }
    return dots;
  }

  // Build the final dotted <svg> string (sampled dots mode).
  // dots: Array<[x, y, scale]>
  function emitSvg(dots, size, dotR) {
    return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">\n` +
      dots.map(([x, y, s]) => {
        const r = +(dotR * (s || 1)).toFixed(1);
        return `  <circle cx="${x}" cy="${y}" r="${r}" fill="currentColor"/>`;
      }).join('\n') +
      `\n</svg>`;
  }

  /**
   * Build a pattern-filled SVG — keeps the original path(s) but fills them
   * with a repeating dot grid via <pattern>. No rasterisation needed.
   * svgText: the raw source SVG string
   * grid: dot spacing in SVG user units
   * dotR: dot radius
   */
  function emitPatternFilled(svgText, grid, dotR) {
    // Extract viewBox from source (or default)
    const vbMatch = svgText.match(/viewBox="([^"]+)"/i);
    const vb = vbMatch ? vbMatch[1] : '0 0 24 24';
    const vbParts = vb.split(/\s+/).map(Number);
    const vbSize = Math.max(vbParts[2] || 24, vbParts[3] || 24);

    // Scale grid and dot radius relative to viewBox size.
    // The grid slider (4-16) is designed for a ~200px raster canvas.
    // Map it so the same slider gives similar visual density on any viewBox.
    const scale = vbSize / 200;
    const patternSize = +(grid * scale).toFixed(3);
    const patternR = +(dotR * scale).toFixed(3);

    // Extract all shape elements
    const shapeRe = /<(path|circle|rect|polygon|polyline|ellipse|line)\b[^>]*\/?>/gi;
    const shapes = [];
    let m;
    while ((m = shapeRe.exec(svgText)) !== null) {
      let shape = m[0]
        .replace(/\s(fill|stroke|style|class)="[^"]*"/gi, '')
        .replace(/\s(fill|stroke|style|class)='[^']*'/gi, '');
      shape = shape.replace(/\/?>$/, ' fill="url(#dot-grid)" />');
      shapes.push(shape);
    }

    // Preserve even-odd fill rule if present
    const hasEvenOdd = /fill-rule\s*[:=]\s*["']?evenodd/i.test(svgText);
    if (hasEvenOdd) {
      shapes.forEach((s, i) => {
        if (!s.includes('fill-rule')) {
          shapes[i] = s.replace(' fill="url(#dot-grid)"', ' fill="url(#dot-grid)" fill-rule="evenodd"');
        }
      });
    }

    const patternSvg =
`<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="dot-grid" width="${patternSize}" height="${patternSize}" patternUnits="userSpaceOnUse">
      <circle cx="${+(patternSize / 2).toFixed(3)}" cy="${+(patternSize / 2).toFixed(3)}" r="${patternR}" fill="currentColor"/>
    </pattern>
  </defs>
  ${shapes.join('\n  ')}
</svg>`;

    return patternSvg;
  }

  /**
   * Emit a React TSX component string for use in icons.tsx.
   * svgContent: the inner SVG content (circles or pattern+shapes)
   * viewBox: the viewBox string
   * componentName: e.g. "SkullIcon"
   */
  function emitReactComponent(svgContent, viewBox, componentName) {
    // Convert SVG attrs to JSX (fill-rule → fillRule, etc.)
    let jsx = svgContent
      .replace(/fill-rule=/g, 'fillRule=')
      .replace(/clip-rule=/g, 'clipRule=')
      .replace(/stroke-width=/g, 'strokeWidth=')
      .replace(/stroke-linecap=/g, 'strokeLinecap=')
      .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
      .replace(/fill="currentColor"/g, '')
      .replace(/fill="url\(#dot-grid\)"/g, 'fill="url(#dot-grid)"');

    return `export const ${componentName} = ({ className, ...rest }: IconProps) => (
  <svg viewBox="${viewBox}" className={\`\${iconStyles.icon} \${className ?? ""}\`} xmlns="http://www.w3.org/2000/svg" {...rest}>
${jsx}  </svg>
);`;
  }

  // Compute dot radius from grid + ratio% (same formula the UI uses).
  function dotRadius(grid, ratioPct) {
    return Math.round((grid * ratioPct / 100) / 2 * 10) / 10;
  }

  /**
   * Erode a dot grid to 1-dot-wide outlines. Removes any dot whose 4 cardinal
   * neighbours are all present (full coverage). Keeps only boundary dots.
   * dots: Array<[x, y, scale]>, grid: spacing used during sampling
   */
  function erodeToOutline(dots, grid) {
    // Build a set of occupied grid positions for fast lookup
    const key = (x, y) => `${x},${y}`;
    const fullSet = new Set();
    for (const [x, y, s] of dots) {
      if (s >= 0.9) fullSet.add(key(x, y));
    }

    return dots.filter(([x, y, s]) => {
      // Always keep partial (edge) dots
      if (s < 0.9) return true;
      // Remove interior dots — those with all 4 cardinal neighbours full
      const hasTop = fullSet.has(key(x, y - grid));
      const hasBot = fullSet.has(key(x, y + grid));
      const hasLeft = fullSet.has(key(x - grid, y));
      const hasRight = fullSet.has(key(x + grid, y));
      return !(hasTop && hasBot && hasLeft && hasRight);
    });
  }

  return { styleInject, sampleDots, erodeToOutline, emitSvg, emitPatternFilled, emitReactComponent, dotRadius };
});
