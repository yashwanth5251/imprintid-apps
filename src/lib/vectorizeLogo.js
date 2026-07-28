import ImageTracer from "imagetracerjs/imagetracer_v1.2.6.js";
import { extractSvgFills, nearestSpotColor, normalizeHex } from "./pantonePalette";

const MAX_EDGE = 900;

/** Production imprint presets for first-pass vectorization */
export const VECTOR_MODES = {
  full: {
    id: "full",
    label: "Full color (digital / general)",
    description: "Keep richer color for DTG, digital print, or general art cleanup.",
    defaultColors: 8,
    maxColors: 16,
    minColors: 2,
    imprintMethod: "Digital / General",
    defaultVariant: "full",
  },
  embroidery: {
    id: "embroidery",
    label: "Embroidery",
    description: "Simplify to 1–2 stitchable colors for digitizing handoff.",
    defaultColors: 2,
    maxColors: 2,
    minColors: 1,
    imprintMethod: "Embroidery",
    defaultVariant: "embroidery",
  },
  screen: {
    id: "screen",
    label: "Screen printing",
    description: "Spot-color separations (typically 1–6 inks) with Pantone-style matching.",
    defaultColors: 4,
    maxColors: 6,
    minColors: 1,
    imprintMethod: "Screen Print",
    defaultVariant: "screen",
  },
  laser: {
    id: "laser",
    label: "Laser engraving",
    description: "Solid single-fill black artwork for laser engraving / etching.",
    defaultColors: 1,
    maxColors: 1,
    minColors: 1,
    imprintMethod: "Laser Engraving",
    defaultVariant: "laser",
  },
};

function loadImage(fileOrUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image."));
    if (typeof fileOrUrl === "string") {
      img.src = fileOrUrl;
    } else {
      img.src = URL.createObjectURL(fileOrUrl);
    }
  });
}

function drawToCanvas(img) {
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, ctx, width, height };
}

function sampleCornerAverage(data, width, height) {
  const points = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [width - 3, height - 3],
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (const [x, y] of points) {
    const i = (y * width + x) * 4;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    n += 1;
  }
  return { r: r / n, g: g / n, b: b / n };
}

/** Strip near-background / near-white noise before tracing */
export function removeBackground(imageData, threshold = 42) {
  const { data, width, height } = imageData;
  const bg = sampleCornerAverage(data, width, height);
  const out = new ImageData(new Uint8ClampedArray(data), width, height);
  const d = out.data;
  for (let i = 0; i < d.length; i += 4) {
    const dr = d[i] - bg.r;
    const dg = d[i + 1] - bg.g;
    const db = d[i + 2] - bg.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    const nearWhite = d[i] > 245 && d[i + 1] > 245 && d[i + 2] > 245;
    if (dist < threshold || nearWhite) {
      d[i + 3] = 0;
    }
  }
  return out;
}

/** Convert artwork to high-contrast silhouettes (better for laser) */
export function toLaserMask(imageData, cutoff = 200) {
  const { data, width, height } = imageData;
  const out = new ImageData(width, height);
  const d = out.data;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 20) {
      d[i] = 0;
      d[i + 1] = 0;
      d[i + 2] = 0;
      d[i + 3] = 0;
      continue;
    }
    const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    // Dark / colored pixels become solid black; light areas clear
    if (lum < cutoff) {
      d[i] = 0;
      d[i + 1] = 0;
      d[i + 2] = 0;
      d[i + 3] = 255;
    } else {
      d[i] = 0;
      d[i + 1] = 0;
      d[i + 2] = 0;
      d[i + 3] = 0;
    }
  }
  return out;
}

/** Light despeckle: kill isolated low-alpha / solitary pixels */
export function despeckle(imageData) {
  const { data, width, height } = imageData;
  const out = new ImageData(new Uint8ClampedArray(data), width, height);
  const d = out.data;
  const src = data;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = (y * width + x) * 4;
      if (src[i + 3] < 20) continue;
      let opaqueNeighbors = 0;
      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          if (!ox && !oy) continue;
          const ni = ((y + oy) * width + (x + ox)) * 4;
          if (src[ni + 3] > 40) opaqueNeighbors += 1;
        }
      }
      if (opaqueNeighbors <= 1) {
        d[i + 3] = 0;
      }
    }
  }
  return out;
}

function tracerOptions(colorCount, mode) {
  if (mode === "laser") {
    return {
      ltres: 0.6,
      qtres: 0.6,
      pathomit: 4,
      blurradius: 0,
      blurdelta: 20,
      numberofcolors: 2,
      colorquantcycles: 2,
      scale: 1,
      strokewidth: 0,
      linefilter: true,
      roundcoords: 1,
      viewbox: true,
      desc: false,
      rightangleenhance: true,
    };
  }

  if (mode === "embroidery") {
    return {
      ltres: 1.2,
      qtres: 1.2,
      pathomit: 12,
      blurradius: 0,
      blurdelta: 20,
      numberofcolors: colorCount,
      colorquantcycles: 3,
      scale: 1,
      strokewidth: 0,
      linefilter: true,
      roundcoords: 1,
      viewbox: true,
      desc: false,
      rightangleenhance: true,
    };
  }

  if (mode === "screen") {
    return {
      ltres: 0.9,
      qtres: 0.9,
      pathomit: 8,
      blurradius: 0,
      blurdelta: 20,
      numberofcolors: colorCount,
      colorquantcycles: 4,
      scale: 1,
      strokewidth: 0,
      linefilter: true,
      roundcoords: 1,
      viewbox: true,
      desc: false,
      rightangleenhance: true,
    };
  }

  return {
    ltres: 0.8,
    qtres: 0.8,
    pathomit: 6,
    blurradius: 0,
    blurdelta: 20,
    numberofcolors: colorCount,
    colorquantcycles: 3,
    scale: 1,
    strokewidth: 0,
    linefilter: true,
    roundcoords: 1,
    viewbox: true,
    desc: false,
    rightangleenhance: true,
  };
}

function recolorSvg(svg, mapper) {
  return svg.replace(/fill\s*=\s*["']([^"']+)["']/gi, (full, fill) => {
    const next = mapper(fill);
    if (!next) return full;
    return `fill="${next}"`;
  });
}

export function makeKnockoutSvg(svg) {
  return recolorSvg(svg, (fill) => {
    const f = fill.trim().toLowerCase();
    if (!f || f === "none" || f === "transparent") return null;
    return "#FFFFFF";
  });
}

/** Solid black single-fill for laser engraving */
export function makeLaserSvg(svg) {
  return recolorSvg(svg, (fill) => {
    const f = fill.trim().toLowerCase();
    if (!f || f === "none" || f === "transparent") return null;
    return "#000000";
  });
}

function scoreFills(fills) {
  return fills.map((hex) => {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    return { hex, lum, sat };
  });
}

export function makeSimplifiedSvg(svg, maxColors = 2) {
  const fills = extractSvgFills(svg);
  if (fills.length <= maxColors) return svg;

  const scored = scoreFills(fills);
  scored.sort((a, b) => b.sat - a.sat || a.lum - b.lum);
  const keep = new Set(scored.slice(0, maxColors).map((c) => c.hex));
  const fallback = scored[0]?.hex || "#000000";

  return recolorSvg(svg, (fill) => {
    const hex = normalizeHex(fill);
    if (keep.has(hex)) return hex;
    let best = fallback;
    let bestDist = Infinity;
    const h = hex.replace("#", "");
    const tr = parseInt(h.slice(0, 2), 16);
    const tg = parseInt(h.slice(2, 4), 16);
    const tb = parseInt(h.slice(4, 6), 16);
    for (const k of keep) {
      const kh = k.replace("#", "");
      const kr = parseInt(kh.slice(0, 2), 16);
      const kg = parseInt(kh.slice(2, 4), 16);
      const kb = parseInt(kh.slice(4, 6), 16);
      const dist = Math.hypot(tr - kr, tg - kg, tb - kb);
      if (dist < bestDist) {
        bestDist = dist;
        best = k;
      }
    }
    return best;
  });
}

/** Screen-print spot separations: reduce to N colors + optional white underbase knockout */
export function makeScreenSvg(svg, maxSpots = 4) {
  return makeSimplifiedSvg(svg, maxSpots);
}

function resolveColorCount(mode, requested) {
  const preset = VECTOR_MODES[mode] || VECTOR_MODES.full;
  const value = Number(requested ?? preset.defaultColors);
  return Math.max(preset.minColors, Math.min(preset.maxColors, value));
}

export async function vectorizeLogo(file, settings) {
  const {
    removeBg = true,
    cleanNoise = true,
    mode = "full",
  } = settings;

  const colors = resolveColorCount(mode, settings.colorCount);
  const img = await loadImage(file);
  const { ctx, width, height } = drawToCanvas(img);
  let imageData = ctx.getImageData(0, 0, width, height);

  if (removeBg) {
    imageData = removeBackground(imageData, settings.bgThreshold ?? 42);
  }
  if (cleanNoise) {
    imageData = despeckle(imageData);
  }
  if (mode === "laser") {
    imageData = toLaserMask(imageData, settings.laserCutoff ?? 200);
    imageData = despeckle(imageData);
  }

  const previewCanvas = document.createElement("canvas");
  previewCanvas.width = width;
  previewCanvas.height = height;
  const previewCtx = previewCanvas.getContext("2d");
  previewCtx.putImageData(imageData, 0, 0);
  const processedPreviewUrl = previewCanvas.toDataURL("image/png");

  const svg = ImageTracer.imagedataToSVG(imageData, tracerOptions(colors, mode));

  const fills = extractSvgFills(svg);
  const palette = fills.map((hex) => {
    const match = nearestSpotColor(hex);
    return {
      hex,
      spotCode: match.code,
      spotHex: match.hex,
      use: match.use,
      distance: match.distance,
    };
  });

  const embroiderySvg = makeSimplifiedSvg(svg, 2);
  const screenSvg = makeScreenSvg(svg, Math.min(6, Math.max(1, colors)));
  const laserSvg = makeLaserSvg(mode === "laser" ? svg : makeSimplifiedSvg(svg, 1));
  const knockoutSvg = makeKnockoutSvg(svg);

  return {
    width,
    height,
    processedPreviewUrl,
    fullSvg: svg,
    embroiderySvg,
    screenSvg,
    laserSvg,
    knockoutSvg,
    // keep legacy key for older UI references
    simplifiedSvg: embroiderySvg,
    palette,
    mode,
    colorCount: colors,
    imprintMethod: VECTOR_MODES[mode]?.imprintMethod || "Digital / General",
  };
}

export function downloadTextFile(filename, contents, mime = "image/svg+xml") {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function svgToDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function variantSuffix(variant) {
  switch (variant) {
    case "embroidery":
      return "embroidery-2color";
    case "screen":
      return "screen-spot";
    case "laser":
      return "laser-black";
    case "knockout":
      return "knockout-white";
    default:
      return "full-color";
  }
}
