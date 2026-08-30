'use client';

import { useEffect, useMemo, useState } from 'react';

/**
 * Theme editor — a floating panel for trying palettes, fonts and shape
 * tokens on the live site.
 *
 * It edits the custom properties declared on `:root` in styles/globals.css
 * by writing inline overrides on <html>; the stylesheet itself is never
 * touched. Choices persist in this browser (localStorage) so they survive
 * navigation between the static pages — the button shows how many tokens
 * differ from the stylesheet, and "Reset all" clears them. "Export" copies a
 * `:root { … }` block to paste into globals.css once a look is settled.
 *
 * To remove: delete this file and the two ThemeEditor lines in app/layout.tsx.
 */

type Kind = 'color' | 'font' | 'px';

interface Token {
  name: string;
  label: string;
  kind: Kind;
  group: string;
  min?: number;
  max?: number;
  step?: number;
}

const TOKENS: Token[] = [
  { name: '--primary', label: 'Primary', kind: 'color', group: 'Brand' },
  { name: '--primary-2', label: 'Primary hover', kind: 'color', group: 'Brand' },
  { name: '--primary-3', label: 'Primary deep', kind: 'color', group: 'Brand' },
  { name: '--primary-tint', label: 'Primary tint', kind: 'color', group: 'Brand' },
  { name: '--primary-line', label: 'Primary line', kind: 'color', group: 'Brand' },
  { name: '--primary-soft', label: 'Primary on dark', kind: 'color', group: 'Brand' },
  { name: '--saffron', label: 'Accent (checks)', kind: 'color', group: 'Brand' },
  { name: '--peach', label: 'Peach tint', kind: 'color', group: 'Brand' },
  { name: '--peach-2', label: 'Peach deep', kind: 'color', group: 'Brand' },

  { name: '--ink', label: 'Text', kind: 'color', group: 'Text & surfaces' },
  { name: '--ink-2', label: 'Text 2', kind: 'color', group: 'Text & surfaces' },
  { name: '--ink-3', label: 'Text muted', kind: 'color', group: 'Text & surfaces' },
  { name: '--ink-4', label: 'Text faint', kind: 'color', group: 'Text & surfaces' },
  { name: '--ground', label: 'Background', kind: 'color', group: 'Text & surfaces' },
  { name: '--ground-2', label: 'Background 2', kind: 'color', group: 'Text & surfaces' },
  { name: '--ground-3', label: 'Background 3', kind: 'color', group: 'Text & surfaces' },
  { name: '--line', label: 'Line', kind: 'color', group: 'Text & surfaces' },
  { name: '--line-2', label: 'Line 2', kind: 'color', group: 'Text & surfaces' },
  { name: '--navy', label: 'Navy (dark bands, footer)', kind: 'color', group: 'Text & surfaces' },
  { name: '--navy-2', label: 'Navy deep', kind: 'color', group: 'Text & surfaces' },
  { name: '--navy-3', label: 'Navy (tool mocks)', kind: 'color', group: 'Text & surfaces' },

  { name: '--green', label: 'Success', kind: 'color', group: 'Status' },
  { name: '--green-tint', label: 'Success tint', kind: 'color', group: 'Status' },
  { name: '--amber', label: 'Warning', kind: 'color', group: 'Status' },
  { name: '--amber-tint', label: 'Warning tint', kind: 'color', group: 'Status' },
  { name: '--red', label: 'Error', kind: 'color', group: 'Status' },
  { name: '--red-tint', label: 'Error tint', kind: 'color', group: 'Status' },

  { name: '--sans', label: 'Body font', kind: 'font', group: 'Type & shape' },
  { name: '--mono', label: 'Label / code font', kind: 'font', group: 'Type & shape' },
  { name: '--radius', label: 'Corner radius', kind: 'px', group: 'Type & shape', min: 0, max: 24, step: 1 },
  { name: '--radius-lg', label: 'Card radius (large)', kind: 'px', group: 'Type & shape', min: 0, max: 32, step: 1 },
  { name: '--nav-h', label: 'Nav height', kind: 'px', group: 'Type & shape', min: 48, max: 80, step: 2 },
  { name: '--container', label: 'Container width', kind: 'px', group: 'Type & shape', min: 960, max: 1440, step: 20 },
];

/** Google Fonts candidates; the stylesheet link is injected on first use. */
const SANS: Array<{ label: string; family: string; stack: string }> = [
  { label: 'Inter (default)', family: 'Inter', stack: "'Inter', 'Helvetica Neue', Helvetica, system-ui, -apple-system, sans-serif" },
  { label: 'Public Sans', family: 'Public Sans', stack: "'Public Sans', 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif" },
  { label: 'IBM Plex Sans', family: 'IBM Plex Sans', stack: "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif" },
  { label: 'Source Sans 3', family: 'Source Sans 3', stack: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif" },
  { label: 'Noto Sans', family: 'Noto Sans', stack: "'Noto Sans', 'Segoe UI', system-ui, sans-serif" },
  { label: 'Work Sans', family: 'Work Sans', stack: "'Work Sans', 'Segoe UI', system-ui, sans-serif" },
  { label: 'DM Sans', family: 'DM Sans', stack: "'DM Sans', 'Segoe UI', system-ui, sans-serif" },
  { label: 'Manrope', family: 'Manrope', stack: "'Manrope', 'Segoe UI', system-ui, sans-serif" },
  { label: 'Figtree', family: 'Figtree', stack: "'Figtree', 'Segoe UI', system-ui, sans-serif" },
  { label: 'System UI', family: '', stack: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" },
];
const MONO: Array<{ label: string; family: string; stack: string }> = [
  { label: 'IBM Plex Mono (default)', family: 'IBM Plex Mono', stack: "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace" },
  { label: 'JetBrains Mono', family: 'JetBrains Mono', stack: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace" },
  { label: 'Source Code Pro', family: 'Source Code Pro', stack: "'Source Code Pro', ui-monospace, Menlo, Consolas, monospace" },
  { label: 'Fira Code', family: 'Fira Code', stack: "'Fira Code', ui-monospace, Menlo, Consolas, monospace" },
  { label: 'Roboto Mono', family: 'Roboto Mono', stack: "'Roboto Mono', ui-monospace, Menlo, Consolas, monospace" },
  { label: 'System mono', family: '', stack: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace" },
];
const FONTS = [...SANS, ...MONO];

/** Colour presets; each replaces the colour tokens it names and resets the rest to the stylesheet. */
const PRESETS: Record<string, Record<string, string>> = {
  'Electric blue (current)': {},
  'Navy classic': {
    '--primary': '#1b3a6b', '--primary-2': '#15305a', '--primary-3': '#0f2445', '--primary-tint': '#edf1f8', '--primary-line': '#b9c6dc', '--primary-soft': '#9db8ea',
    '--saffron': '#e07b00', '--peach': '#fdf1e6', '--peach-2': '#f6cfa0',
  },
  Teal: {
    '--primary': '#0f7c78', '--primary-2': '#13938e', '--primary-3': '#0a5754', '--primary-tint': '#e6f5f4', '--primary-line': '#a9dad7', '--primary-soft': '#7fd6d0',
    '--navy': '#0b2e2f', '--navy-2': '#072223', '--navy-3': '#0d2a2b', '--saffron': '#f2a541', '--peach': '#fff4e3', '--peach-2': '#ffd59a',
  },
  Maroon: {
    '--primary': '#8a1f33', '--primary-2': '#a3283f', '--primary-3': '#611425', '--primary-tint': '#fbeef0', '--primary-line': '#e3b7bf', '--primary-soft': '#f0a3b0',
    '--navy': '#2e1017', '--navy-2': '#220b10', '--navy-3': '#2a0f15', '--saffron': '#d9a441', '--peach': '#fdf3e2', '--peach-2': '#f3d49a',
  },
  Forest: {
    '--primary': '#1f6b44', '--primary-2': '#278452', '--primary-3': '#154b30', '--primary-tint': '#e9f4ee', '--primary-line': '#b3d6c2', '--primary-soft': '#8fd4ae',
    '--navy': '#0f2a1d', '--navy-2': '#0a1f15', '--navy-3': '#0e261a', '--saffron': '#e0913a', '--peach': '#fff2e4', '--peach-2': '#ffcf9c',
  },
  Indigo: {
    '--primary': '#4338ca', '--primary-2': '#5b50e0', '--primary-3': '#312a94', '--primary-tint': '#eeedfb', '--primary-line': '#c4bff0', '--primary-soft': '#a5a0f0',
    '--navy': '#1c1a45', '--navy-2': '#141236', '--navy-3': '#1a1840',
  },
  Slate: {
    '--primary': '#334155', '--primary-2': '#475569', '--primary-3': '#1f2937', '--primary-tint': '#eef2f6', '--primary-line': '#bfc9d6', '--primary-soft': '#a7b6cc',
    '--navy': '#0f172a', '--navy-2': '#0b1120', '--navy-3': '#111a2e', '--ground-2': '#f8fafc', '--line': '#e2e8f0', '--line-2': '#eef2f7', '--saffron': '#d97706',
  },
};

const KEY = 'nhcx-theme-editor-v2';
const FONT_LINK_ID = 'nhcx-theme-editor-font';

type Values = Record<string, string>;

function readDefaults(): Values {
  const style = getComputedStyle(document.documentElement);
  const out: Values = {};
  for (const t of TOKENS) out[t.name] = style.getPropertyValue(t.name).trim();
  return out;
}

function apply(values: Values) {
  const root = document.documentElement;
  for (const t of TOKENS) {
    if (values[t.name] != null) root.style.setProperty(t.name, values[t.name]);
    else root.style.removeProperty(t.name);
  }
}

function loadFont(family: string) {
  if (!family) return;
  const id = `${FONT_LINK_ID}-${family.replace(/\s+/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

/** `#rgb`/`#rrggbb` pass through; `rgb(…)` from computed style becomes hex. */
function toHex(value: string): string {
  const v = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(v)) return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`.toLowerCase();
  const m = v.match(/rgba?\(\s*(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)/);
  if (m) return `#${[m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
  return '#000000';
}

export default function ThemeEditor() {
  const [open, setOpen] = useState(false);
  const [defaults, setDefaults] = useState<Values | null>(null);
  const [overrides, setOverrides] = useState<Values>({});
  const [copied, setCopied] = useState(false);

  // Defaults come from the stylesheet itself; stored overrides are re-applied on every page.
  useEffect(() => {
    for (const t of TOKENS) document.documentElement.style.removeProperty(t.name);
    setDefaults(readDefaults());
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Values;
        setOverrides(stored);
        apply(stored);
        for (const name of ['--sans', '--mono']) {
          const font = FONTS.find((f) => f.stack === stored[name]);
          if (font) loadFont(font.family);
        }
      }
    } catch {
      /* storage unavailable: run without persistence */
    }
  }, []);

  useEffect(() => {
    if (!defaults) return;
    apply(overrides);
    try {
      if (Object.keys(overrides).length) window.localStorage.setItem(KEY, JSON.stringify(overrides));
      else window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, [overrides, defaults]);

  const values = useMemo(() => ({ ...(defaults ?? {}), ...overrides }), [defaults, overrides]);

  const set = (name: string, value: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (defaults && value === defaults[name]) delete next[name];
      else next[name] = value;
      return next;
    });
  };

  const applyPreset = (name: string) => {
    const preset = PRESETS[name] ?? {};
    setOverrides((prev) => {
      const next: Values = {};
      for (const t of TOKENS) if (t.kind !== 'color' && prev[t.name]) next[t.name] = prev[t.name];
      return { ...next, ...preset };
    });
  };

  const exportCss = () => {
    const lines = TOKENS.filter((t) => overrides[t.name]).map((t) => `  ${t.name}: ${overrides[t.name]};`);
    const css = lines.length ? `:root {\n${lines.join('\n')}\n}` : '/* no changes from the stylesheet defaults */';
    navigator.clipboard?.writeText(css).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      },
      () => window.prompt('Copy the CSS below', css),
    );
  };

  const groups = useMemo(() => {
    const map = new Map<string, Token[]>();
    for (const t of TOKENS) map.set(t.group, [...(map.get(t.group) ?? []), t]);
    return [...map.entries()];
  }, []);

  const changed = Object.keys(overrides).length;

  return (
    <>
      <style>{CSS}</style>
      <button type="button" className="te-fab" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="te-panel">
        <span aria-hidden="true">◐</span> Theme{changed ? ` · ${changed}` : ''}
      </button>
      {open && defaults && (
        <aside id="te-panel" className="te-panel" aria-label="Theme editor">
          <header className="te-head">
            <b>Theme editor</b>
            <span>{changed ? `${changed} token${changed === 1 ? '' : 's'} changed · saved in this browser` : 'stylesheet defaults'}</span>
            <button type="button" className="te-x" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </header>

          <div className="te-body">
            <section className="te-group">
              <h3>Presets</h3>
              <div className="te-presets">
                {Object.entries(PRESETS).map(([name, preset]) => (
                  <button
                    type="button"
                    key={name}
                    className="te-preset"
                    onClick={() => applyPreset(name)}
                    style={{ '--te-swatch': preset['--primary'] ?? defaults['--primary'] } as React.CSSProperties}
                  >
                    <i aria-hidden="true" />
                    {name}
                  </button>
                ))}
              </div>
            </section>

            {groups.map(([group, tokens]) => (
              <section className="te-group" key={group}>
                <h3>{group}</h3>
                {tokens.map((t) => (
                  <label className="te-row" key={t.name}>
                    <span className="te-label">
                      {t.label}
                      <code>{t.name}</code>
                    </span>
                    {t.kind === 'color' && (
                      <span className="te-color">
                        <input type="color" value={toHex(values[t.name])} onChange={(e) => set(t.name, e.target.value)} />
                        <input type="text" value={values[t.name]} onChange={(e) => set(t.name, e.target.value)} spellCheck={false} aria-label={`${t.label} value`} />
                      </span>
                    )}
                    {t.kind === 'font' && (
                      <select
                        value={(t.name === '--mono' ? MONO : SANS).find((f) => f.stack === values[t.name])?.stack ?? (t.name === '--mono' ? MONO : SANS)[0].stack}
                        onChange={(e) => {
                          const font = FONTS.find((f) => f.stack === e.target.value);
                          if (!font) return;
                          loadFont(font.family);
                          set(t.name, font.stack);
                        }}
                      >
                        {(t.name === '--mono' ? MONO : SANS).map((f) => (
                          <option key={f.label} value={f.stack}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    )}
                    {t.kind === 'px' && (
                      <span className="te-range">
                        <input type="range" min={t.min} max={t.max} step={t.step} value={parseInt(values[t.name], 10) || 0} onChange={(e) => set(t.name, `${e.target.value}px`)} />
                        <output>{values[t.name]}</output>
                      </span>
                    )}
                    {overrides[t.name] != null && (
                      <button type="button" className="te-undo" onClick={() => set(t.name, defaults[t.name])} title="Reset to default">
                        ↺
                      </button>
                    )}
                  </label>
                ))}
              </section>
            ))}
          </div>

          <footer className="te-foot">
            <button type="button" className="te-btn" onClick={() => setOverrides({})} disabled={!changed}>
              Reset all
            </button>
            <button type="button" className="te-btn te-btn-primary" onClick={exportCss}>
              {copied ? 'Copied ✓' : 'Export :root CSS'}
            </button>
          </footer>
        </aside>
      )}
    </>
  );
}

const CSS = `
.te-fab { position: fixed; right: 16px; bottom: 16px; z-index: 1000; display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--ground); color: var(--ink); font: 600 13px var(--sans); box-shadow: 0 6px 24px rgba(10, 37, 64, 0.18); cursor: pointer; }
.te-fab:hover { border-color: var(--primary-line); color: var(--primary); }
.te-panel { position: fixed; right: 16px; bottom: 64px; z-index: 1000; display: flex; flex-direction: column; width: min(400px, calc(100vw - 32px)); max-height: min(80vh, 800px); border-radius: 10px; border: 1px solid var(--line); background: var(--ground); color: var(--ink); font: 13px/1.45 var(--sans); box-shadow: 0 16px 48px rgba(10, 37, 64, 0.22); overflow: hidden; }
.te-head { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 0 8px; padding: 12px 14px; border-bottom: 1px solid var(--line); background: var(--ground-2); }
.te-head b { font-size: 14px; }
.te-head span { grid-column: 1; font-size: 11px; color: var(--ink-3); }
.te-x { grid-column: 2; grid-row: 1 / 3; width: 28px; height: 28px; border-radius: 6px; border: 1px solid transparent; background: transparent; font-size: 18px; line-height: 1; color: var(--ink-3); cursor: pointer; }
.te-x:hover { border-color: var(--line); color: var(--ink); }
.te-body { overflow-y: auto; padding: 6px 14px 10px; }
.te-group { padding: 8px 0; border-bottom: 1px solid var(--line-2); }
.te-group:last-child { border-bottom: none; }
.te-group h3 { margin: 0 0 6px; font: 500 10.5px var(--mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.te-presets { display: flex; flex-wrap: wrap; gap: 6px; }
.te-preset { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: 999px; border: 1px solid var(--line); background: var(--ground); font: 500 12px var(--sans); color: var(--ink-2); cursor: pointer; }
.te-preset:hover { border-color: var(--primary-line); color: var(--primary); }
.te-preset i { width: 12px; height: 12px; border-radius: 50%; background: var(--te-swatch); border: 1px solid rgba(0,0,0,0.12); }
.te-row { display: grid; grid-template-columns: 128px 1fr 22px; align-items: center; gap: 8px; padding: 4px 0; }
.te-label { display: flex; flex-direction: column; min-width: 0; }
.te-label code { font: 10px var(--mono); color: var(--ink-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.te-color { display: flex; align-items: center; gap: 6px; min-width: 0; }
.te-color input[type='color'] { width: 30px; height: 26px; padding: 0; border: 1px solid var(--line); border-radius: 6px; background: none; cursor: pointer; }
.te-color input[type='text'], .te-row select { flex: 1; min-width: 0; height: 26px; padding: 0 6px; border-radius: 6px; border: 1px solid var(--line); background: var(--ground); font: 12px var(--mono); color: var(--ink); }
.te-row select { width: 100%; font-family: var(--sans); }
.te-range { display: flex; align-items: center; gap: 8px; }
.te-range input { flex: 1; min-width: 0; accent-color: var(--primary); }
.te-range output { width: 52px; text-align: right; font: 12px var(--mono); color: var(--ink-2); }
.te-undo { width: 22px; height: 22px; padding: 0; border-radius: 6px; border: 1px solid var(--line); background: var(--ground); font-size: 13px; color: var(--ink-3); cursor: pointer; }
.te-undo:hover { color: var(--primary); border-color: var(--primary-line); }
.te-foot { display: flex; justify-content: space-between; gap: 8px; padding: 10px 14px; border-top: 1px solid var(--line); background: var(--ground-2); }
.te-btn { height: 32px; padding: 0 12px; border-radius: 6px; border: 1px solid var(--line); background: var(--ground); font: 600 12px var(--sans); color: var(--ink-2); cursor: pointer; }
.te-btn:hover:not(:disabled) { border-color: var(--primary-line); color: var(--primary); }
.te-btn:disabled { opacity: 0.5; cursor: default; }
.te-btn-primary { background: var(--primary); border-color: var(--primary); color: #fff; }
.te-btn-primary:hover:not(:disabled) { background: var(--primary-2); color: #fff; }
@media print { .te-fab, .te-panel { display: none; } }
`;
