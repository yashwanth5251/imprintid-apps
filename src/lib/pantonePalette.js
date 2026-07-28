/** Approximate spot / thread color library for nearest-match suggestions (not official Pantone). */
export const SPOT_COLORS = [
  { code: "Black C", hex: "#2D2926", use: "Screen / Embroidery" },
  { code: "White", hex: "#FFFFFF", use: "Knockout / light ink" },
  { code: "Cool Gray 9 C", hex: "#75787B", use: "Screen / Embroidery" },
  { code: "Cool Gray 4 C", hex: "#BBBCBC", use: "Screen / Embroidery" },
  { code: "Process Blue C", hex: "#0085CA", use: "Screen / Embroidery" },
  { code: "Reflex Blue C", hex: "#001489", use: "Screen / Embroidery" },
  { code: "286 C", hex: "#0033A0", use: "Screen / Embroidery" },
  { code: "2925 C", hex: "#009CDE", use: "Screen / Embroidery" },
  { code: "2995 C", hex: "#00A9E0", use: "Screen / Embroidery" },
  { code: "321 C", hex: "#008C95", use: "Screen / Embroidery" },
  { code: "348 C", hex: "#009A44", use: "Screen / Embroidery" },
  { code: "355 C", hex: "#009639", use: "Screen / Embroidery" },
  { code: "368 C", hex: "#78BE20", use: "Screen / Embroidery" },
  { code: "485 C", hex: "#DA291C", use: "Screen / Embroidery" },
  { code: "186 C", hex: "#C8102E", use: "Screen / Embroidery" },
  { code: "200 C", hex: "#BA0C2F", use: "Screen / Embroidery" },
  { code: "021 C", hex: "#FE5000", use: "Screen / Embroidery" },
  { code: "1235 C", hex: "#FFB81C", use: "Screen / Embroidery" },
  { code: "116 C", hex: "#FFCD00", use: "Screen / Embroidery" },
  { code: "7406 C", hex: "#F1C400", use: "Screen / Embroidery" },
  { code: "1585 C", hex: "#FF6A13", use: "Screen / Embroidery" },
  { code: "172 C", hex: "#FA4616", use: "Screen / Embroidery" },
  { code: "2597 C", hex: "#5C068C", use: "Screen / Embroidery" },
  { code: "2685 C", hex: "#330072", use: "Screen / Embroidery" },
  { code: "3258 C", hex: "#00B5E2", use: "Screen / Embroidery" },
  { code: "871 C", hex: "#89764B", use: "Metallic gold approx." },
  { code: "877 C", hex: "#8A8D8F", use: "Metallic silver approx." },
  { code: "4625 C", hex: "#4F2C1D", use: "Screen / Embroidery" },
  { code: "476 C", hex: "#4E3629", use: "Screen / Embroidery" },
  { code: "447 C", hex: "#373A36", use: "Screen / Embroidery" },
];

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function colorDistance(a, b) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function nearestSpotColor(hex) {
  const target = hexToRgb(normalizeHex(hex));
  let best = SPOT_COLORS[0];
  let bestDist = Infinity;
  for (const spot of SPOT_COLORS) {
    const dist = colorDistance(target, hexToRgb(spot.hex));
    if (dist < bestDist) {
      bestDist = dist;
      best = spot;
    }
  }
  return { ...best, distance: Math.round(bestDist) };
}

export function normalizeHex(value) {
  let v = String(value || "").trim();
  if (v.startsWith("rgb")) {
    const nums = v.match(/\d+/g);
    if (nums && nums.length >= 3) {
      const [r, g, b] = nums.map(Number);
      return (
        "#" +
        [r, g, b]
          .map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0"))
          .join("")
          .toUpperCase()
      );
    }
  }
  if (!v.startsWith("#")) v = `#${v}`;
  if (v.length === 4) {
    v = `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  }
  return v.toUpperCase();
}

export function extractSvgFills(svg) {
  const fills = new Set();
  const re = /fill\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = re.exec(svg))) {
    const fill = match[1].trim().toLowerCase();
    if (!fill || fill === "none" || fill === "transparent") continue;
    fills.add(normalizeHex(fill));
  }
  return [...fills];
}
