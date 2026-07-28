import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canAccessCategory } from "../data/users";
import { saveArtwork } from "../data/artworkLibrary";
import {
  VECTOR_MODES,
  downloadTextFile,
  svgToDataUrl,
  variantSuffix,
  vectorizeLogo,
} from "../lib/vectorizeLogo";
import "./Pages.css";
import "./LogoVectorizer.css";

const DEFAULT_SETTINGS = {
  colorCount: 8,
  removeBg: true,
  cleanNoise: true,
  mode: "full",
  bgThreshold: 42,
  laserCutoff: 200,
};

function getActiveSvg(result, variant) {
  if (!result) return "";
  switch (variant) {
    case "embroidery":
      return result.embroiderySvg || result.simplifiedSvg;
    case "screen":
      return result.screenSvg;
    case "laser":
      return result.laserSvg;
    case "knockout":
      return result.knockoutSvg;
    default:
      return result.fullSvg;
  }
}

export default function LogoVectorizerPage() {
  const { user } = useAuth();
  const canAccess = canAccessCategory(user.role, "artwork");

  const [file, setFile] = useState(null);
  const [sourcePreview, setSourcePreview] = useState("");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [result, setResult] = useState(null);
  const [activeVariant, setActiveVariant] = useState("full");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [qcNotes, setQcNotes] = useState("");
  const [qcChecks, setQcChecks] = useState({
    edges: false,
    text: false,
    colors: false,
    production: false,
  });
  const [toast, setToast] = useState("");

  const modePreset = VECTOR_MODES[settings.mode] || VECTOR_MODES.full;
  const activeSvg = useMemo(
    () => getActiveSvg(result, activeVariant),
    [result, activeVariant]
  );

  if (!canAccess) {
    return <Navigate to="/" replace />;
  }

  function onModeChange(mode) {
    const preset = VECTOR_MODES[mode] || VECTOR_MODES.full;
    setSettings((s) => ({
      ...s,
      mode,
      colorCount: preset.defaultColors,
    }));
    setResult(null);
  }

  function onFileChange(e) {
    const next = e.target.files?.[0];
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      setError("Please upload a PNG, JPG, WEBP, or GIF logo.");
      return;
    }
    setFile(next);
    setResult(null);
    setError("");
    setToast("");
    setSourcePreview(URL.createObjectURL(next));
  }

  async function handleVectorize(e) {
    e.preventDefault();
    if (!file) {
      setError("Upload a logo image first.");
      return;
    }
    setBusy(true);
    setError("");
    setToast("");
    try {
      const output = await vectorizeLogo(file, settings);
      setResult(output);
      setActiveVariant(
        VECTOR_MODES[settings.mode]?.defaultVariant || "full"
      );
      setToast(
        `${VECTOR_MODES[settings.mode]?.label || "Vector"} first pass ready. Review before production.`
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Vectorization failed.");
    } finally {
      setBusy(false);
    }
  }

  function downloadActive() {
    if (!activeSvg) return;
    const base = (file?.name || "logo").replace(/\.[^.]+$/, "");
    downloadTextFile(`${base}-${variantSuffix(activeVariant)}.svg`, activeSvg);
  }

  function saveToLibrary() {
    if (!result) return;
    const base = (file?.name || "logo").replace(/\.[^.]+$/, "");
    const exportSvg = getActiveSvg(result, activeVariant) || result.fullSvg;
    saveArtwork({
      title: `${base} — ${result.imprintMethod} vector`,
      customer: "Pending customer",
      sku: "",
      imprintMethod: result.imprintMethod,
      imprintLocation: "",
      fileName: `${base}-${variantSuffix(activeVariant)}.svg`,
      fileUrl: svgToDataUrl(exportSvg),
      originalOrderId: "",
      notes: [
        `AI vectorization (${result.mode}) with ${result.palette.length} detected colors.`,
        `Active export: ${activeVariant}.`,
        qcNotes.trim() ? `QC notes: ${qcNotes.trim()}` : "",
        `Checks — edges:${qcChecks.edges} text:${qcChecks.text} colors:${qcChecks.colors} production:${qcChecks.production}`,
      ]
        .filter(Boolean)
        .join(" "),
    });
    setToast("Saved to Production Artwork Library with frequency starting at 1.");
  }

  const colorLabel =
    settings.mode === "laser"
      ? "Laser uses solid black (1 fill)"
      : settings.mode === "embroidery"
        ? `Thread colors (${settings.colorCount})`
        : settings.mode === "screen"
          ? `Spot ink colors (${settings.colorCount})`
          : `Max colors (${settings.colorCount})`;

  return (
    <div className="page logo-vectorizer">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Tools</Link>
        <span>/</span>
        <span>Artwork</span>
        <span>/</span>
        <span>Logo Vectorizer</span>
      </nav>

      <header className="page-intro">
        <p className="eyebrow">Artwork · AI-assisted first pass</p>
        <h1>Logo Vectorizer</h1>
        <p>
          Convert messy raster logos into clean SVG for{" "}
          <strong>embroidery</strong>, <strong>screen printing</strong>,{" "}
          <strong>laser engraving</strong>, or full-color digital — with cleanup,
          color reduction, and human QC before production.
        </p>
      </header>

      {toast && <p className="vector-toast">{toast}</p>}
      {error && <p className="vector-error">{error}</p>}

      <div className="vector-layout">
        <section className="vector-panel">
          <h2>1. Upload &amp; imprint mode</h2>
          <form className="vector-form" onSubmit={handleVectorize}>
            <label className="file-drop">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={onFileChange}
              />
              <span>
                {file ? file.name : "Drop or choose a logo (PNG / JPG / WEBP)"}
              </span>
            </label>

            <label>
              Production mode
              <select
                value={settings.mode}
                onChange={(e) => onModeChange(e.target.value)}
              >
                {Object.values(VECTOR_MODES).map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="mode-hint">{modePreset.description}</p>

            {settings.mode !== "laser" && (
              <label>
                {colorLabel}
                <input
                  type="range"
                  min={modePreset.minColors}
                  max={modePreset.maxColors}
                  value={settings.colorCount}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      colorCount: Number(e.target.value),
                    }))
                  }
                />
              </label>
            )}

            {settings.mode === "laser" && (
              <label>
                Laser threshold ({settings.laserCutoff})
                <input
                  type="range"
                  min={120}
                  max={240}
                  value={settings.laserCutoff}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      laserCutoff: Number(e.target.value),
                    }))
                  }
                />
              </label>
            )}

            <label className="check-row">
              <input
                type="checkbox"
                checked={settings.removeBg}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, removeBg: e.target.checked }))
                }
              />
              Auto background / noise removal
            </label>

            <label className="check-row">
              <input
                type="checkbox"
                checked={settings.cleanNoise}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, cleanNoise: e.target.checked }))
                }
              />
              Despeckle isolated pixels
            </label>

            <label>
              Background sensitivity ({settings.bgThreshold})
              <input
                type="range"
                min={20}
                max={80}
                value={settings.bgThreshold}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    bgThreshold: Number(e.target.value),
                  }))
                }
              />
            </label>

            <button type="submit" className="btn-primary" disabled={busy || !file}>
              {busy ? "Vectorizing…" : `Vectorize for ${modePreset.imprintMethod}`}
            </button>
          </form>

          <div className="vector-limits">
            <h3>Mode tips</h3>
            <ul>
              <li>
                <strong>Screen:</strong> aim for solid spot inks (1–6). Soft gradients
                won’t screen cleanly.
              </li>
              <li>
                <strong>Laser:</strong> solid black silhouette works best on wood,
                metal, acrylic, and drinkware.
              </li>
              <li>
                <strong>Embroidery:</strong> keep 1–2 thread colors; tiny text often
                needs redraw.
              </li>
            </ul>
          </div>
        </section>

        <section className="vector-panel">
          <h2>2. Preview</h2>
          <div className="preview-grid">
            <figure>
              <figcaption>Source raster</figcaption>
              <div className="preview-stage checker">
                {sourcePreview ? (
                  <img src={sourcePreview} alt="Uploaded logo" />
                ) : (
                  <span className="preview-empty">Upload a logo to begin</span>
                )}
              </div>
            </figure>
            <figure>
              <figcaption>
                {settings.mode === "laser" ? "Laser mask" : "Cleaned raster"}
              </figcaption>
              <div className="preview-stage checker">
                {result?.processedPreviewUrl ? (
                  <img src={result.processedPreviewUrl} alt="Processed logo" />
                ) : (
                  <span className="preview-empty">Processed preview</span>
                )}
              </div>
            </figure>
            <figure className="preview-wide">
              <figcaption>Vector result ({activeVariant})</figcaption>
              <div
                className={`preview-stage checker${activeVariant === "laser" ? " laser-stage" : ""}`}
              >
                {activeSvg ? (
                  <img src={svgToDataUrl(activeSvg)} alt="Vectorized logo SVG" />
                ) : (
                  <span className="preview-empty">SVG output appears here</span>
                )}
              </div>
            </figure>
          </div>

          {result && (
            <div className="variant-row">
              <button
                type="button"
                className={`chip${activeVariant === "full" ? " is-active" : ""}`}
                onClick={() => setActiveVariant("full")}
              >
                Full color
              </button>
              <button
                type="button"
                className={`chip${activeVariant === "screen" ? " is-active" : ""}`}
                onClick={() => setActiveVariant("screen")}
              >
                Screen spot colors
              </button>
              <button
                type="button"
                className={`chip${activeVariant === "embroidery" ? " is-active" : ""}`}
                onClick={() => setActiveVariant("embroidery")}
              >
                Embroidery 1–2 color
              </button>
              <button
                type="button"
                className={`chip${activeVariant === "laser" ? " is-active" : ""}`}
                onClick={() => setActiveVariant("laser")}
              >
                Laser black
              </button>
              <button
                type="button"
                className={`chip${activeVariant === "knockout" ? " is-active" : ""}`}
                onClick={() => setActiveVariant("knockout")}
              >
                Knockout white
              </button>
              <button type="button" className="btn-primary" onClick={downloadActive}>
                Download SVG
              </button>
              <button type="button" className="btn-ghost" onClick={saveToLibrary}>
                Save to Artwork Library
              </button>
            </div>
          )}
        </section>
      </div>

      {result && (
        <>
          <section className="vector-panel">
            <h2>3. Color / ink planning</h2>
            <p className="panel-note">
              {result.mode === "laser"
                ? "Laser output is solid black. Use this for engraving paths — verify thin strokes won’t burn out."
                : result.mode === "screen"
                  ? "Spot ink suggestions for screen separations. Confirm against your Pantone book and mesh count."
                  : "Approximate nearest matches for production planning — verify before print or stitch."}
            </p>
            {result.mode === "laser" ? (
              <div className="palette-grid">
                <article className="swatch">
                  <div className="swatch__pair">
                    <span style={{ background: "#000000" }} />
                    <span style={{ background: "#2D2926" }} />
                  </div>
                  <strong>#000000</strong>
                  <p>
                    Laser fill
                    <br />
                    <small>Single solid engraving color</small>
                  </p>
                </article>
              </div>
            ) : (
              <div className="palette-grid">
                {result.palette.map((swatch) => (
                  <article key={swatch.hex} className="swatch">
                    <div className="swatch__pair">
                      <span style={{ background: swatch.hex }} title={swatch.hex} />
                      <span
                        style={{ background: swatch.spotHex }}
                        title={swatch.spotHex}
                      />
                    </div>
                    <strong>{swatch.hex}</strong>
                    <p>
                      ≈ {swatch.spotCode}
                      <br />
                      <small>{swatch.use}</small>
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="vector-panel">
            <h2>4. Human QC (required)</h2>
            <div className="qc-grid">
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={qcChecks.edges}
                  onChange={(e) =>
                    setQcChecks((c) => ({ ...c, edges: e.target.checked }))
                  }
                />
                Edges / paths look clean (no jagged artifacts)
              </label>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={qcChecks.text}
                  onChange={(e) =>
                    setQcChecks((c) => ({ ...c, text: e.target.checked }))
                  }
                />
                Small text / fine detail reviewed or redrawn
              </label>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={qcChecks.colors}
                  onChange={(e) =>
                    setQcChecks((c) => ({ ...c, colors: e.target.checked }))
                  }
                />
                {result.mode === "laser"
                  ? "Laser fill density / stroke weight checked for material"
                  : result.mode === "screen"
                    ? "Spot inks / underbase confirmed for garment color"
                    : "Spot / thread colors confirmed for imprint method"}
              </label>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={qcChecks.production}
                  onChange={(e) =>
                    setQcChecks((c) => ({ ...c, production: e.target.checked }))
                  }
                />
                Safe for production / client proof handoff
              </label>
            </div>
            <label className="qc-notes">
              QC notes
              <textarea
                rows={3}
                value={qcNotes}
                onChange={(e) => setQcNotes(e.target.value)}
                placeholder="Cleanup needed on letterforms, merge screens, thicken laser strokes, etc."
              />
            </label>
            <p className="panel-note">
              {Object.values(qcChecks).every(Boolean)
                ? "All QC checks marked — ready to export or save to the library."
                : "Complete QC checks before sending this file to production."}
            </p>
          </section>
        </>
      )}
    </div>
  );
}
