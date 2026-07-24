import {workMapNodeKindColors, workMapNodeKindDescriptions} from '../src/types';
import type {WorkMapNodeKind} from '../src/types';

const workMapNodeKindIcons = {
  claim: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M7 8h10M7 12h7"/>',
  evidence: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/>',
  option: '<circle cx="6" cy="4" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="20" r="2"/><path d="M6 6v12M8 5h6a4 4 0 0 1 4 4v7"/>',
  decision: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  assumption: '<path d="M10 2v7.3L4.25 19A2 2 0 0 0 6 22h12a2 2 0 0 0 1.75-3L14 9.3V2"/><path d="M8.5 2h7M6.5 17h11"/>',
  risk: '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  question: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.83 1c0 2-3 2-3 4M12 18h.01"/>',
  action: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  kanban_card: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18M15 3v18"/>',
  c4_container: '<path d="m21 8-9 5-9-5"/><path d="m3 8 9-5 9 5v8l-9 5-9-5Z"/><path d="M12 13v8"/>',
  lesson: '<path d="M6 3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v19l-6-4-6 4Z"/>',
} as const satisfies Record<WorkMapNodeKind, string>;

export const WORK_MAP_APP_RESOURCE_URI = 'ui://play-agent/work-map.html';
export const WORK_MAP_APP_MIME_TYPE = 'text/html;profile=mcp-app';

export function workMapAppHtml() {
  const nodeKindDescriptions = JSON.stringify(workMapNodeKindDescriptions).replace(/</g, '\\u003c');
  const nodeKindIcons = JSON.stringify(workMapNodeKindIcons).replace(/</g, '\\u003c');
  const nodeKindCssVariables = (mode: keyof typeof workMapNodeKindColors) =>
    Object.entries(workMapNodeKindColors[mode])
      .map(([kind, color]) => `--${kind.replaceAll('_', '-')}: ${color};`)
      .join('\n      ');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Play Agent Work Map</title>
  <style>
    :root {
      color-scheme: light dark;
      --background: #f7f7f6;
      --surface: #ffffff;
      --surface-muted: #f0f0ee;
      --text: #20201e;
      --text-secondary: #73736e;
      --border: #deded9;
      --border-strong: #c7c7c0;
      --accent: #1769e0;
      --accent-muted: #e8f1ff;
      --edge: #9c9c95;
      --grid-dot: #d4d4ce;
      ${nodeKindCssVariables('light')}
      --reviewer: #a44288;
      --implementer: #2673c9;
      --agent: #5c55c7;
      --user: #575753;
      --confidence-high: #13877b;
      --confidence-medium: #b26b12;
      --confidence-low: #c64343;
      --shadow-low: 0 1px 2px rgba(20, 20, 18, .07), 0 3px 9px rgba(20, 20, 18, .035);
      --shadow-med: 0 12px 32px rgba(20, 20, 18, .14);
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --background: #141412;
        --surface: #1d1d1a;
        --surface-muted: #292925;
        --text: #f0f0eb;
        --text-secondary: #aaa9a1;
        --border: #393934;
        --border-strong: #4b4b45;
        --accent: #69a7ff;
        --accent-muted: #1d3553;
        --edge: #73736c;
        --grid-dot: #34342f;
        ${nodeKindCssVariables('dark')}
        --shadow-low: 0 1px 2px rgba(0, 0, 0, .3), 0 4px 12px rgba(0, 0, 0, .18);
        --shadow-med: 0 12px 38px rgba(0, 0, 0, .5);
      }
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      width: 100%;
      min-width: 20rem;
      min-height: 34rem;
      overflow: hidden;
      background: var(--background);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    button, input, select { font: inherit; }

    button:focus-visible,
    input:focus-visible,
    select:focus-visible,
    .node:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    .work-map {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      width: 100%;
      height: clamp(38rem, 100vh, 52rem);
      min-height: 38rem;
      overflow: hidden;
      background: var(--background);
    }

    html[data-display-mode="fullscreen"],
    html[data-display-mode="fullscreen"] body {
      height: 100%;
      min-height: 0;
    }

    html[data-display-mode="fullscreen"] .work-map {
      height: 100vh;
      min-height: 0;
    }

    .toolbar {
      position: relative;
      display: grid;
      grid-template-columns: minmax(11rem, auto) minmax(12rem, 1fr) auto;
      align-items: center;
      gap: .75rem;
      min-width: 0;
      padding: .75rem 1rem;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      z-index: 8;
    }

    .title-block { min-width: 0; }

    .title-row {
      display: flex;
      align-items: center;
      gap: .5rem;
      min-width: 0;
    }

    .title-block h1 {
      margin: 0;
      overflow: hidden;
      color: var(--text);
      font-size: .9375rem;
      font-weight: 650;
      line-height: 1.3;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .title-block p {
      margin: .125rem 0 0;
      overflow: hidden;
      color: var(--text-secondary);
      font-size: .75rem;
      line-height: 1.25;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .role-badge,
    .kind-label,
    .origin-label,
    .confidence-badge,
    .reference-count {
      display: inline-flex;
      align-items: center;
      gap: .25rem;
      min-height: 1.25rem;
      padding: .125rem .4rem;
      border-radius: 999px;
      background: var(--surface-muted);
      color: var(--text-secondary);
      font-size: .6875rem;
      line-height: 1.2;
      text-transform: capitalize;
      white-space: nowrap;
    }

    .role-badge::before,
    .origin-label::before {
      width: .4rem;
      height: .4rem;
      border-radius: 50%;
      background: var(--origin-color, var(--agent));
      content: '';
    }

    .kind-icon {
      flex: 0 0 auto;
      width: .75rem;
      height: .75rem;
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.8;
    }

    .filters {
      display: grid;
      grid-template-columns: minmax(9rem, 1fr) auto;
      gap: .5rem;
      min-width: 0;
    }

    .search-field {
      position: relative;
      min-width: 0;
    }

    .search-field svg {
      position: absolute;
      top: 50%;
      left: .625rem;
      width: .875rem;
      height: .875rem;
      fill: none;
      stroke: var(--text-secondary);
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 2;
      pointer-events: none;
      transform: translateY(-50%);
    }

    .search-field .control { padding-left: 2rem; }

    .control {
      width: 100%;
      height: 2rem;
      min-width: 0;
      padding: 0 .65rem;
      border: 1px solid var(--border);
      border-radius: .375rem;
      background: var(--surface);
      color: var(--text);
      font-size: .8125rem;
    }

    .control::placeholder { color: var(--text-secondary); }

    .type-filter {
      position: relative;
    }

    .type-filter-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: .5rem;
      min-width: 7.5rem;
      cursor: pointer;
    }

    .type-filter-trigger svg {
      width: .875rem;
      height: .875rem;
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 2;
    }

    .type-filter-count {
      display: inline-grid;
      min-width: 1.25rem;
      height: 1.25rem;
      place-items: center;
      border-radius: 999px;
      background: var(--accent-muted);
      color: var(--accent);
      font-size: .6875rem;
      font-variant-numeric: tabular-nums;
    }

    .type-filter-count[hidden] { display: none; }

    .type-filter-menu {
      position: absolute;
      top: calc(100% + .375rem);
      right: 0;
      z-index: 20;
      display: grid;
      width: min(20rem, calc(100vw - 1rem));
      max-height: min(23rem, calc(100vh - 6rem));
      overflow-y: auto;
      padding: .375rem;
      border: 1px solid var(--border-strong);
      border-radius: .5rem;
      background: var(--surface);
      box-shadow: var(--shadow-med);
    }

    .type-filter-menu[hidden] { display: none; }

    .type-filter-option {
      display: grid;
      grid-template-columns: auto auto minmax(0, 1fr) auto;
      align-items: start;
      gap: .5rem;
      min-height: 3.25rem;
      padding: .5rem;
      border-radius: .375rem;
      color: var(--text);
      font-size: .8125rem;
      cursor: pointer;
    }

    .type-filter-option:hover { background: var(--surface-muted); }

    .type-filter-option input {
      display: grid;
      width: .875rem;
      height: .875rem;
      margin: 0;
      appearance: none;
      place-content: center;
      border: 1px solid var(--border-strong);
      border-radius: .2rem;
      background: var(--surface);
      transform: translateY(.125rem);
    }

    .type-filter-option input::after {
      width: .45rem;
      height: .25rem;
      border-bottom: 1.5px solid white;
      border-left: 1.5px solid white;
      content: '';
      opacity: 0;
      transform: translateY(-.05rem) rotate(-45deg);
    }

    .type-filter-option input:checked {
      border-color: var(--accent);
      background: var(--accent);
    }

    .type-filter-option input:checked::after { opacity: 1; }

    .type-filter-icon {
      display: grid;
      width: 1rem;
      height: 1rem;
      place-items: center;
      color: var(--kind-color);
      transform: translateY(.3125rem);
    }

    .type-filter-icon .kind-icon {
      width: .875rem;
      height: .875rem;
    }

    .type-filter-label { font-weight: 600; }

    .type-filter-description {
      grid-column: 3 / 5;
      color: var(--text-secondary);
      font-size: .6875rem;
      line-height: 1.35;
    }

    .type-filter-option small {
      color: var(--text-secondary);
      font-size: .6875rem;
      font-variant-numeric: tabular-nums;
    }

    .clear-types {
      min-height: 2rem;
      margin-top: .25rem;
      border: 0;
      border-top: 1px solid var(--border);
      background: transparent;
      color: var(--text-secondary);
      font-size: .75rem;
      cursor: pointer;
    }

    .clear-types:hover { color: var(--text); }
    .clear-types[hidden] { display: none; }

    .toolbar-actions,
    .viewport-actions,
    .focus-actions {
      display: flex;
      align-items: center;
      gap: .375rem;
    }

    .icon-button,
    .action-button,
    .reference-link,
    .node-details-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border);
      border-radius: .375rem;
      background: var(--surface);
      color: var(--text-secondary);
      cursor: pointer;
    }

    .icon-button {
      width: 2rem;
      height: 2rem;
      padding: 0;
    }

    .icon-button:hover,
    .action-button:hover,
    .reference-link:hover,
    .node-details-button:hover {
      border-color: var(--border-strong);
      background: var(--surface-muted);
      color: var(--text);
    }

    .toolbar-actions .icon-button {
      border-color: transparent;
      background: transparent;
    }

    .display-mode-status {
      position: absolute;
      top: calc(100% + .5rem);
      right: 1rem;
      max-width: min(22rem, calc(100vw - 2rem));
      margin: 0;
      padding: .5rem .625rem;
      border: 1px solid var(--border-strong);
      border-radius: .375rem;
      background: var(--surface);
      box-shadow: var(--shadow-med);
      color: var(--text-secondary);
      font-size: .75rem;
      line-height: 1.35;
    }

    .display-mode-status[data-tone="error"] {
      border-color: var(--risk);
      color: var(--risk);
    }

    .display-mode-status[hidden] { display: none; }

    .icon-button:disabled {
      cursor: default;
      opacity: .5;
    }

    .icon-button[hidden],
    .icon-button svg[hidden] {
      display: none;
    }

    .icon-button svg,
    .action-button svg {
      width: 1rem;
      height: 1rem;
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 2;
    }

    .map-surface {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      background: var(--background);
      transition: grid-template-columns .24s ease;
    }

    .map-surface.has-peek {
      grid-template-columns: minmax(18rem, 1fr) minmax(22rem, 28rem);
    }

    .canvas {
      position: relative;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      cursor: grab;
      background-color: var(--background);
      background-image: radial-gradient(circle, var(--grid-dot) .8px, transparent .8px);
      background-size: 20px 20px;
      user-select: none;
    }

    .canvas.is-dragging { cursor: grabbing; }

    .world {
      position: absolute;
      top: 0;
      left: 0;
      width: 1px;
      height: 1px;
      transform-origin: 0 0;
      will-change: transform;
    }

    .edges,
    .nodes {
      position: absolute;
      top: 0;
      left: 0;
      overflow: visible;
    }

    .edges { z-index: 0; pointer-events: auto; }
    .nodes { z-index: 1; pointer-events: none; }

    .edge-path {
      fill: none;
      stroke: var(--edge);
      stroke-width: 1.25;
      marker-end: url(#arrow);
      transition: opacity .18s ease, stroke .18s ease, stroke-width .18s ease;
    }

    .edge-hit {
      fill: none;
      stroke: transparent;
      stroke-width: 18;
      cursor: pointer;
      pointer-events: stroke;
    }

    .edge-label-bg {
      fill: color-mix(in srgb, var(--surface) 92%, transparent);
      stroke: var(--border);
      stroke-width: .75;
    }

    .edge-label {
      fill: var(--text-secondary);
      font-size: 11px;
      font-weight: 600;
      text-anchor: middle;
    }

    .edge-group {
      transition: opacity .18s ease;
    }

    .edge-group.is-muted { opacity: .12; }

    .edge-group.is-type-context { opacity: .2; }

    .edge-group.is-related { opacity: 1; }

    .edge-group.is-related .edge-path {
      stroke: var(--accent);
      stroke-width: 2;
      marker-end: url(#arrow-accent);
      animation: edge-flow .58s ease-out 1;
    }

    .edge-group.is-selected .edge-path {
      stroke: var(--accent);
      stroke-width: 2.5;
      marker-end: url(#arrow-accent);
      animation: edge-select .38s ease-out 1;
    }

    .edge-group:focus-visible {
      outline: none;
    }

    .edge-group:focus-visible .edge-path {
      stroke: var(--accent);
      stroke-width: 2.5;
      marker-end: url(#arrow-accent);
    }

    .edge-group.is-preview:not(.is-related):not(.is-selected) .edge-path,
    .edge-group:hover:not(.is-muted) .edge-path {
      stroke: color-mix(in srgb, var(--accent) 78%, var(--edge));
      stroke-width: 1.75;
      marker-end: url(#arrow-accent);
      animation: edge-flow .58s ease-out 1;
    }

    .edge-group.is-preview:not(.is-related):not(.is-selected) .edge-label,
    .edge-group:hover:not(.is-muted) .edge-label {
      fill: var(--text);
    }

    .edge-group.is-preview:not(.is-related):not(.is-selected) .edge-label-bg,
    .edge-group:hover:not(.is-muted) .edge-label-bg {
      fill: var(--surface);
      stroke: color-mix(in srgb, var(--accent) 58%, var(--border));
    }

    .edge-group.is-related .edge-label,
    .edge-group.is-selected .edge-label {
      fill: var(--text);
      font-weight: 650;
    }

    .edge-group.is-related .edge-label-bg,
    .edge-group.is-selected .edge-label-bg,
    .edge-group:focus-visible .edge-label-bg {
      fill: var(--surface);
      stroke: var(--accent);
    }

    .node {
      position: absolute;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      width: 17.75rem;
      height: 10.5rem;
      padding: .75rem;
      overflow: hidden;
      border: 1px solid var(--border);
      border-left: 3px solid var(--kind-color);
      border-radius: .5rem;
      background: var(--surface);
      box-shadow: var(--shadow-low);
      color: var(--text);
      text-align: left;
      cursor: pointer;
      pointer-events: auto;
      transform-origin: center;
      transition: border-color .18s ease, background .18s ease, box-shadow .18s ease, filter .18s ease, opacity .18s ease, transform .18s ease;
    }

    .node:hover,
    .node:focus-visible {
      z-index: 3;
      border-color: var(--border-strong);
      box-shadow: var(--shadow-med);
    }

    .node.is-selected {
      z-index: 5;
      border-color: var(--border-strong);
      border-left-color: var(--kind-color);
      background: color-mix(in srgb, var(--kind-color) 3%, var(--surface));
      box-shadow: 0 0 0 2px var(--accent), 0 16px 36px color-mix(in srgb, var(--kind-color) 18%, transparent), var(--shadow-med);
      opacity: 1;
      transform: translateY(-3px) scale(1.024);
    }

    .node.is-related {
      z-index: 2;
      border-color: color-mix(in srgb, var(--accent) 44%, var(--border));
      background: color-mix(in srgb, var(--accent) 3%, var(--surface));
      box-shadow: var(--shadow-med);
      opacity: 1;
    }

    .node.is-muted {
      opacity: .18;
      filter: saturate(.35);
    }

    .node.is-muted:hover {
      opacity: .66;
      filter: saturate(.8);
    }

    .node.is-peek-source {
      z-index: 6;
      border-color: var(--accent);
      background: color-mix(in srgb, var(--kind-color) 5%, var(--surface));
      box-shadow:
        0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent),
        0 18px 42px color-mix(in srgb, var(--kind-color) 22%, transparent),
        var(--shadow-med);
      opacity: 1;
      filter: none;
      transform: translateY(-3px) scale(1.026);
      animation: peek-source-pulse .42s ease-out 1;
    }

    .map-surface.has-peek .node:not(.is-peek-source) {
      opacity: .14;
      filter: saturate(.28);
    }

    .map-surface.has-peek .edge-group:not(.is-peek-related) {
      opacity: .08;
    }

    .map-surface.has-peek .edge-group.is-peek-related {
      opacity: .82;
    }

    .node.is-type-match {
      border-color: color-mix(in srgb, var(--kind-color) 48%, var(--border));
      border-left-color: var(--kind-color);
      background: color-mix(in srgb, var(--kind-color) 4%, var(--surface));
    }

    .node.is-type-context {
      opacity: .6;
      filter: saturate(.72);
    }

    .node.is-selected.is-type-context {
      opacity: 1;
      filter: none;
    }

    .node.is-related.is-type-context {
      opacity: 1;
      filter: none;
    }

    .node-header,
    .node-footer {
      display: flex;
      align-items: center;
      gap: .375rem;
      min-width: 0;
    }

    .node-header { margin-bottom: .625rem; }
    .node-footer { justify-content: space-between; margin-top: .625rem; }

    .confidence-badge {
      --confidence-color: var(--confidence-high);
      border: 1px solid color-mix(in srgb, var(--confidence-color) 24%, transparent);
      background: color-mix(in srgb, var(--confidence-color) 9%, var(--surface));
      color: color-mix(in srgb, var(--confidence-color) 86%, var(--text));
      font-weight: 600;
    }

    .confidence-badge::before {
      width: .4rem;
      height: .4rem;
      border-radius: 50%;
      background: var(--confidence-color);
      content: '';
    }

    .confidence-medium { --confidence-color: var(--confidence-medium); }
    .confidence-low { --confidence-color: var(--confidence-low); }

    .node .kind-label,
    .focus-card .kind-label {
      background: color-mix(in srgb, var(--kind-color) 10%, var(--surface-muted));
      color: color-mix(in srgb, var(--kind-color) 82%, var(--text));
      font-weight: 600;
    }

    .kind-tooltip {
      position: fixed;
      z-index: 30;
      width: max-content;
      max-width: min(18rem, calc(100vw - 1rem));
      padding: .5rem .625rem;
      border: 1px solid var(--border-strong);
      border-radius: .375rem;
      background: var(--surface);
      box-shadow: var(--shadow-med);
      color: var(--text);
      font-size: .75rem;
      line-height: 1.4;
      pointer-events: none;
    }

    .kind-tooltip[hidden] { display: none; }

    .origin-label { margin-left: auto; --origin-color: var(--agent); }
    .origin-reviewer { --origin-color: var(--reviewer); }
    .origin-implementer { --origin-color: var(--implementer); }
    .origin-user { --origin-color: var(--user); }

    .node h2 {
      display: -webkit-box;
      margin: 0 0 .375rem;
      overflow: hidden;
      color: var(--text);
      font-size: .875rem;
      font-weight: 650;
      line-height: 1.35;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    .node-copy {
      min-height: 0;
      overflow: hidden;
    }

    .node p {
      display: -webkit-box;
      margin: 0;
      overflow: hidden;
      color: var(--text-secondary);
      font-size: .75rem;
      line-height: 1.45;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    .confidence-note {
      display: flex;
      align-items: center;
      gap: .3rem;
      min-width: 0;
      margin-top: .375rem;
      color: var(--confidence-medium);
      font-size: .6875rem;
      line-height: 1.3;
    }

    .confidence-note::before {
      flex: 0 0 auto;
      width: .35rem;
      height: .35rem;
      border-radius: 50%;
      background: currentColor;
      content: '';
    }

    .confidence-note.low { color: var(--confidence-low); }

    .confidence-note span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .node.has-uncertainty p { -webkit-line-clamp: 1; }

    .node-footer {
      color: var(--text-secondary);
      font-size: .6875rem;
    }

    .node.evidence .node-footer {
      margin-top: .375rem;
      padding-top: .375rem;
      border-top: 1px dotted color-mix(in srgb, var(--kind-color) 34%, var(--border));
    }

    .node.evidence .reference-count {
      background: color-mix(in srgb, var(--kind-color) 9%, var(--surface-muted));
      color: color-mix(in srgb, var(--kind-color) 82%, var(--text));
      font-weight: 600;
    }

    .node.decision::before {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      height: 2px;
      background: var(--kind-color);
      content: '';
      pointer-events: none;
    }

    .node.risk { border-left-width: 5px; }

    .node.kanban_card .node-header {
      margin-bottom: .5rem;
      padding-bottom: .5rem;
      border-bottom: 1px solid color-mix(in srgb, var(--kind-color) 28%, var(--border));
    }

    .node-details-button {
      min-height: 1.5rem;
      gap: .125rem;
      padding: 0 .125rem 0 .375rem;
      border-color: transparent;
      background: transparent;
      color: var(--text-secondary);
      font-size: .6875rem;
    }

    .node-details-button svg {
      width: .75rem;
      height: .75rem;
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 2;
    }

    .claim { --kind-color: var(--claim); }
    .evidence { --kind-color: var(--evidence); }
    .option { --kind-color: var(--option); }
    .decision { --kind-color: var(--decision); }
    .assumption { --kind-color: var(--assumption); }
    .risk { --kind-color: var(--risk); }
    .question { --kind-color: var(--question); }
    .action { --kind-color: var(--action); }
    .kanban_card { --kind-color: var(--kanban-card); }
    .c4_container { --kind-color: var(--c4-container); }
    .lesson { --kind-color: var(--lesson); }

    .viewport-actions {
      position: absolute;
      bottom: .75rem;
      left: .75rem;
      z-index: 4;
      padding: .25rem;
      border: 1px solid var(--border);
      border-radius: .5rem;
      background: color-mix(in srgb, var(--surface) 94%, transparent);
      box-shadow: var(--shadow-low);
    }

    .zoom-value {
      width: 3rem;
      color: var(--text-secondary);
      font-size: .6875rem;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }

    .minimap {
      position: absolute;
      right: .75rem;
      bottom: .75rem;
      z-index: 4;
      width: 11.5rem;
      height: 7.5rem;
      overflow: hidden;
      border: 1px solid var(--border-strong);
      border-radius: .5rem;
      background: color-mix(in srgb, var(--surface) 94%, transparent);
      box-shadow: var(--shadow-low);
      cursor: crosshair;
      touch-action: none;
    }

    .minimap[hidden] { display: none; }

    .minimap svg { display: block; width: 100%; height: 100%; }

    .mini-edge { stroke: var(--edge); stroke-width: 7; opacity: .28; }
    .mini-node { fill: var(--kind-color); opacity: .88; }

    .mini-viewport {
      fill: color-mix(in srgb, var(--accent) 4%, transparent);
      stroke: var(--accent);
      stroke-width: 1.5;
      vector-effect: non-scaling-stroke;
    }

    .focus-layer {
      position: relative;
      z-index: 10;
      display: block;
      min-width: 0;
      min-height: 0;
      padding: .75rem .75rem .75rem 0;
      background: linear-gradient(90deg, color-mix(in srgb, var(--kind-color, var(--accent)) 5%, var(--background)), var(--background) 2rem);
      cursor: default;
      user-select: text;
    }

    .focus-layer[hidden] { display: none; }

    .focus-card {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border: 1px solid var(--border-strong);
      border-top: 4px solid var(--kind-color);
      border-radius: .5rem;
      background: var(--surface);
      box-shadow: var(--shadow-med);
    }

    .focus-card.is-entering {
      animation: peek-enter .26s cubic-bezier(.22, .8, .28, 1) 1;
    }

    .focus-card.is-navigating {
      animation: peek-navigate .2s ease-out 1;
    }

    .focus-header,
    .focus-body,
    .focus-footer { padding: 1rem 1.125rem; }

    .focus-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: .75rem;
      border-bottom: 1px solid var(--border);
    }

    .focus-eyebrow {
      display: flex;
      align-items: center;
      gap: .375rem;
      margin-bottom: .5rem;
    }

    .focus-title-row { min-width: 0; }

    .focus-header h2 {
      margin: 0;
      color: var(--text);
      font-size: 1.0625rem;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .focus-header-actions {
      display: flex;
      align-items: flex-start;
      gap: .375rem;
    }

    .peek-navigation[hidden] { display: none; }

    .focus-kind-description {
      max-width: 32rem;
      margin: .25rem 0 0;
      color: var(--text-secondary);
      font-size: .75rem;
      line-height: 1.4;
    }

    .focus-body {
      display: grid;
      grid-auto-rows: max-content;
      align-content: start;
      gap: 1rem;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    .focus-copy {
      margin: 0;
      color: var(--text);
      font-size: .875rem;
      line-height: 1.55;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }

    .focus-section { display: grid; gap: .5rem; }

    .focus-section[hidden],
    .focus-actions[hidden],
    .action-button[hidden],
    .focus-footer[hidden] { display: none; }

    .focus-section h3 {
      margin: 0;
      color: var(--text-secondary);
      font-size: .6875rem;
      font-weight: 650;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .confidence-panel {
      display: grid;
      gap: .625rem;
      padding: .75rem;
      border: 1px solid var(--border);
      border-radius: .5rem;
      background: var(--surface-muted);
    }

    .confidence-summary {
      display: flex;
      align-items: flex-start;
      gap: .625rem;
    }

    .confidence-summary p {
      margin: 0;
      color: var(--text-secondary);
      font-size: .75rem;
      line-height: 1.45;
    }

    .uncertainty-block {
      display: grid;
      gap: .375rem;
      padding-top: .625rem;
      border-top: 1px solid var(--border);
    }

    .uncertainty-block[hidden] { display: none; }

    .uncertainty-block strong {
      color: var(--text);
      font-size: .75rem;
      font-weight: 650;
    }

    .uncertainty-list {
      display: grid;
      gap: .25rem;
      margin: 0;
      padding-left: 1.1rem;
      color: var(--text-secondary);
      font-size: .75rem;
      line-height: 1.45;
    }

    .relationship-list,
    .reference-list {
      display: grid;
      gap: .375rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .relationship-link,
    .reference-row {
      display: flex;
      align-items: center;
      gap: .5rem;
      min-width: 0;
      padding: .5rem .625rem;
      border: 1px solid transparent;
      border-radius: .375rem;
      background: var(--surface-muted);
      color: var(--text-secondary);
      font-size: .75rem;
      line-height: 1.4;
    }

    .relationship-link {
      width: 100%;
      justify-content: space-between;
      color: var(--text);
      text-align: left;
      overflow-wrap: anywhere;
      cursor: pointer;
    }

    .relationship-link:hover,
    .relationship-link:focus-visible,
    .reference-link:hover,
    .reference-link:focus-visible {
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 5%, var(--surface));
    }

    .relationship-path {
      min-width: 0;
      font-weight: 600;
      line-height: 1.45;
    }

    .relationship-direction {
      flex: 0 0 auto;
      color: var(--text-secondary);
      font-size: .6875rem;
    }

    .reference-row {
      align-items: center;
      justify-content: space-between;
    }

    .reference-row > span {
      display: grid;
      gap: .125rem;
      min-width: 0;
    }

    .reference-row strong {
      overflow: hidden;
      color: var(--text);
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .reference-row code {
      overflow: hidden;
      color: var(--text-secondary);
      font-size: .6875rem;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .reference-link {
      flex: 0 0 auto;
      min-height: 1.75rem;
      padding: 0 .5rem;
      border: 1px solid var(--border);
      border-radius: .375rem;
      background: var(--surface);
      color: var(--text);
      font-size: .75rem;
      cursor: pointer;
    }

    .peek-status {
      margin: 0;
      color: var(--text-secondary);
      font-size: .75rem;
      line-height: 1.4;
    }

    .peek-status:empty { display: none; }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .focus-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .75rem;
      border-top: 1px solid var(--border);
      background: var(--surface-muted);
    }

    .focus-actions { flex-wrap: wrap; }

    .action-button {
      min-height: 2rem;
      gap: .375rem;
      padding: 0 .625rem;
      color: var(--text);
      font-size: .8125rem;
    }

    .empty {
      position: absolute;
      top: 50%;
      left: 50%;
      width: min(30rem, calc(100% - 3rem));
      padding: 1.25rem;
      border: 1px dashed var(--border-strong);
      border-radius: .625rem;
      background: var(--surface);
      color: var(--text-secondary);
      font-size: .875rem;
      line-height: 1.5;
      text-align: center;
      transform: translate(-50%, -50%);
    }

    @keyframes edge-flow {
      0% { stroke-dasharray: 3 13; stroke-dashoffset: 18; }
      70% { stroke-dasharray: 8 6; }
      100% { stroke-dasharray: none; stroke-dashoffset: 0; }
    }

    @keyframes edge-select {
      0% { stroke-width: 1.5; opacity: .45; }
      100% { stroke-width: 2.5; opacity: 1; }
    }

    @keyframes peek-source-pulse {
      0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--kind-color) 42%, transparent), var(--shadow-low); }
      100% { box-shadow: 0 0 0 1px color-mix(in srgb, var(--kind-color) 68%, transparent), var(--shadow-med); }
    }

    @keyframes peek-enter {
      0% { opacity: .45; transform: translateX(-1.5rem) scale(.985); }
      100% { opacity: 1; transform: translateX(0) scale(1); }
    }

    @keyframes peek-navigate {
      0% { opacity: .55; transform: translateX(.625rem); }
      100% { opacity: 1; transform: translateX(0); }
    }

    @keyframes peek-enter-mobile {
      0% { opacity: .5; transform: translateY(1.25rem); }
      100% { opacity: 1; transform: translateY(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      .map-surface,
      .node,
      .edge-path {
        transition-duration: 0s;
      }

      .edge-path,
      .node.is-peek-source,
      .focus-card {
        animation: none !important;
      }

      .node:hover,
      .node:focus-visible,
      .node.is-selected {
        transform: none;
      }
    }

    @media (max-width: 46rem) {
      html, body { min-height: 34rem; }
      .work-map { height: clamp(34rem, 100vh, 44rem); min-height: 34rem; }
      .toolbar { grid-template-columns: minmax(0, 1fr) auto; gap: .625rem; }
      .filters { grid-column: 1 / -1; grid-row: 2; }
      .toolbar-actions { grid-column: 2; grid-row: 1; }
      .node { width: 17.75rem; }
      .map-surface.has-peek { grid-template-columns: minmax(0, 1fr); }
      .focus-layer {
        position: absolute;
        inset: auto 0 0;
        height: min(82%, 34rem);
        padding: .5rem;
        background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--background) 92%, transparent) 2.5rem);
      }
      .focus-card { height: 100%; }
      .focus-card.is-entering { animation-name: peek-enter-mobile; }
      .focus-footer { align-items: stretch; flex-direction: column; }
      .focus-actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .action-button { padding-inline: .375rem; }
      .reviewer-action[data-action="handoff"] { grid-column: 1 / -1; }
      .minimap { width: 8.75rem; height: 5.75rem; }
    }
  </style>
</head>
<body>
  <main class="work-map" aria-label="Play Agent Work Map">
    <header class="toolbar">
      <div class="title-block">
        <div class="title-row">
          <h1 id="title">Work Map</h1>
          <span id="map-role" class="role-badge">Agent</span>
        </div>
        <p id="map-meta">Waiting for a work map</p>
      </div>
      <div class="filters">
        <div class="search-field">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input id="search" class="control" type="search" aria-label="Search nodes" placeholder="Search nodes" />
        </div>
        <div id="type-filter" class="type-filter">
          <button id="type-filter-trigger" class="control type-filter-trigger" type="button" aria-haspopup="true" aria-expanded="false">
            <span>Types</span>
            <span id="type-filter-count" class="type-filter-count" hidden>0</span>
            <svg viewBox="0 0 24 24"><path d="m7 10 5 5 5-5"/></svg>
          </button>
          <div id="type-filter-menu" class="type-filter-menu" role="group" aria-label="Highlight node types" hidden></div>
        </div>
      </div>
      <div class="toolbar-actions" aria-label="Map actions">
        <button id="go-to-start" class="icon-button" type="button" title="Go to start" aria-label="Go to start">
          <svg viewBox="0 0 24 24"><path d="M5 3v18M5 5h11l3 4-3 4H5"/><circle cx="5" cy="21" r="1"/></svg>
        </button>
        <button id="fit-view" class="icon-button" type="button" title="Fit all nodes" aria-label="Fit all nodes">
          <svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
        </button>
        <button id="fullscreen-mode" class="icon-button" type="button" title="Open fullscreen" aria-label="Open fullscreen" aria-pressed="false" hidden>
          <svg data-fullscreen-icon="enter" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          <svg data-fullscreen-icon="exit" viewBox="0 0 24 24" hidden><path d="M14 10h7V3M10 14H3v7M21 3l-7 7M3 21l7-7"/></svg>
        </button>
        <p id="display-mode-status" class="display-mode-status" role="status" aria-live="polite" hidden></p>
      </div>
    </header>

    <section id="map-surface" class="map-surface" aria-label="Interactive work map">
      <div id="canvas" class="canvas" aria-label="Node map. Use Tab to reach nodes and relationships, arrow keys to move between nodes, Enter to select, and D to peek.">
        <div id="world" class="world">
          <div id="nodes" class="nodes"></div>
          <svg id="edges" class="edges" role="group" aria-label="Map relationships"></svg>
        </div>

        <div class="viewport-actions" aria-label="Viewport controls">
          <button id="zoom-out" class="icon-button" type="button" title="Zoom out" aria-label="Zoom out">
            <svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>
          </button>
          <span id="zoom-value" class="zoom-value">100%</span>
          <button id="zoom-in" class="icon-button" type="button" title="Zoom in" aria-label="Zoom in">
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
        <div id="minimap" class="minimap" role="application" aria-label="Map overview. Click or drag to navigate." hidden>
          <svg id="minimap-svg" preserveAspectRatio="none" aria-hidden="true">
            <g id="minimap-content"></g>
            <rect id="minimap-viewport" class="mini-viewport" rx="18"></rect>
          </svg>
        </div>
        <div id="empty" class="empty">Ask the agent to present a work map. Claims, evidence, decisions, risks, actions, and their relationships will appear here.</div>
        <p id="map-live" class="sr-only" role="status" aria-live="polite"></p>
        <div id="kind-tooltip" class="kind-tooltip" role="tooltip" hidden></div>
      </div>

      <div id="focus-layer" class="focus-layer" hidden>
        <article id="focus-card" class="focus-card claim" role="dialog" aria-modal="false" aria-labelledby="focus-title" tabindex="-1">
          <header class="focus-header">
            <div>
              <div class="focus-eyebrow">
                <span id="focus-kind" class="kind-label">Claim</span>
                <span id="focus-origin" class="origin-label">Agent</span>
              </div>
              <div class="focus-title-row">
                <h2 id="focus-title"></h2>
                <p id="focus-kind-description" class="focus-kind-description"></p>
              </div>
            </div>
            <div class="focus-header-actions">
              <button id="peek-back" class="icon-button peek-navigation" type="button" title="Back" aria-label="Back to previous node" hidden>
                <svg viewBox="0 0 24 24"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
              </button>
              <button id="peek-forward" class="icon-button peek-navigation" type="button" title="Forward" aria-label="Forward to next node" hidden>
                <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
              <button id="close-focus" class="icon-button" type="button" title="Close peek" aria-label="Close node peek">
                <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </header>
          <div id="focus-body" class="focus-body">
            <p id="focus-copy" class="focus-copy"></p>
            <section id="confidence-section" class="focus-section" hidden>
              <h3>Confidence</h3>
              <div class="confidence-panel">
                <div class="confidence-summary">
                  <span id="focus-confidence" class="confidence-badge">High</span>
                  <p id="confidence-basis"></p>
                </div>
                <div id="uncertainty-block" class="uncertainty-block" hidden>
                  <strong>Why confidence is not high</strong>
                  <ul id="uncertainty-list" class="uncertainty-list"></ul>
                </div>
              </div>
            </section>
            <section id="relationship-section" class="focus-section">
              <h3>Relationships</h3>
              <ul id="relationship-list" class="relationship-list"></ul>
            </section>
            <section id="reference-section" class="focus-section">
              <h3>References</h3>
              <div id="reference-list" class="reference-list"></div>
            </section>
          </div>
          <footer id="focus-footer" class="focus-footer">
            <div id="focus-actions" class="focus-actions">
              <button class="action-button" type="button" data-action="ask">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4M12 18h.01"/></svg>
                Ask why
              </button>
              <button class="action-button standard-action" type="button" data-action="challenge">
                <svg viewBox="0 0 24 24"><path d="M12 3 2 9l10 6 10-6-10-6Z"/><path d="m2 15 10 6 10-6"/></svg>
                Challenge
              </button>
              <button class="action-button standard-action" type="button" data-action="continue">
                <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                Continue
              </button>
              <button class="action-button reviewer-action" type="button" data-action="accept" hidden>
                <svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>
                Accept
              </button>
              <button class="action-button reviewer-action" type="button" data-action="reject" hidden>
                <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                Reject
              </button>
              <button class="action-button reviewer-action" type="button" data-action="handoff" hidden>
                <svg viewBox="0 0 24 24"><path d="M4 12h12M12 6l6 6-6 6"/><path d="M18 5h2v14h-2"/></svg>
                Accept &amp; handoff
              </button>
            </div>
            <p id="peek-status" class="peek-status" role="status" aria-live="polite"></p>
          </footer>
        </article>
      </div>
    </section>
  </main>

  <script>
    const NODE_WIDTH = 284;
    const NODE_HEIGHT = 168;
    const VERTICAL_GRAPH_BREAKPOINT = 520;
    const MIN_ZOOM = .16;
    const MAX_ZOOM = 1.6;
    const MIN_READABLE_ZOOM = .64;
    const nodeKindDescriptions = ${nodeKindDescriptions};
    const nodeKindIcons = ${nodeKindIcons};
    const mapSurface = document.getElementById('map-surface');
    const canvas = document.getElementById('canvas');
    const world = document.getElementById('world');
    const edgesElement = document.getElementById('edges');
    const nodesElement = document.getElementById('nodes');
    const titleElement = document.getElementById('title');
    const roleElement = document.getElementById('map-role');
    const metaElement = document.getElementById('map-meta');
    const searchElement = document.getElementById('search');
    const typeFilter = document.getElementById('type-filter');
    const typeFilterTrigger = document.getElementById('type-filter-trigger');
    const typeFilterMenu = document.getElementById('type-filter-menu');
    const typeFilterCount = document.getElementById('type-filter-count');
    const emptyElement = document.getElementById('empty');
    const zoomValueElement = document.getElementById('zoom-value');
    const minimapElement = document.getElementById('minimap');
    const minimapSvg = document.getElementById('minimap-svg');
    const minimapContent = document.getElementById('minimap-content');
    const minimapViewport = document.getElementById('minimap-viewport');
    const focusLayer = document.getElementById('focus-layer');
    const focusCard = document.getElementById('focus-card');
    const fullscreenModeButton = document.getElementById('fullscreen-mode');
    const displayModeStatus = document.getElementById('display-mode-status');
    const kindTooltip = document.getElementById('kind-tooltip');
    const mapLive = document.getElementById('map-live');
    const peekStatus = document.getElementById('peek-status');
    const initId = 'play-agent-init-' + Math.random().toString(36).slice(2);

    let snapshot = null;
    let renderedSnapshotId = null;
    let transform = {x: 0, y: 0, scale: 1};
    let selectedNodeId = null;
    let selectedEdgeId = null;
    let previewNodeId = null;
    let detailNodeId = null;
    let detailBackHistory = [];
    let detailForwardHistory = [];
    let detailReturnFocus = null;
    let dragState = null;
    let nodePositions = new Map();
    let highlightedKinds = new Set();
    let minimapViewBox = {x: 0, y: 0, width: 1, height: 1};
    let minimapDragging = false;
    let currentDisplayMode = null;
    let hostContext = null;
    let displayModeRequestPending = false;
    let displayModeStatusTimer = null;
    let viewportResizeFrame = null;
    let observedCanvasSize = {width: 0, height: 0};

    function sendHostMessage(message) {
      if (window.parent && window.parent !== window) window.parent.postMessage(message, '*');
    }

    sendHostMessage({
      jsonrpc: '2.0',
      id: initId,
      method: 'ui/initialize',
      params: {
        protocolVersion: '2026-01-26',
        appInfo: {name: 'play-agent-work-map', title: 'Play Agent Work Map', version: '0.1.6'},
        appCapabilities: {availableDisplayModes: ['inline', 'fullscreen']},
      },
    });

    function escapeHtml(value) {
      return String(value ?? '').replace(/[&<>"']/g, function (char) {
        return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'}[char];
      });
    }

    function displayLabel(value) {
      return String(value || '').replaceAll('_', ' ').replace(/\\b\\w/g, function (letter) { return letter.toUpperCase(); });
    }

    function kindDescription(kind) {
      return nodeKindDescriptions[kind] || 'A semantic element in this work map.';
    }

    function kindIcon(kind) {
      const icon = nodeKindIcons[kind] || '';
      return '<svg class="kind-icon" viewBox="0 0 24 24" aria-hidden="true">' + icon + '</svg>';
    }

    function showKindTooltip(badge) {
      const kind = badge?.dataset.kind;
      if (!kind) return;
      kindTooltip.textContent = kindDescription(kind);
      kindTooltip.hidden = false;
      const badgeRect = badge.getBoundingClientRect();
      const tooltipRect = kindTooltip.getBoundingClientRect();
      const left = Math.min(
        Math.max(.5 * 16, badgeRect.left),
        window.innerWidth - tooltipRect.width - .5 * 16,
      );
      const preferredTop = badgeRect.bottom + .375 * 16;
      const top = preferredTop + tooltipRect.height <= window.innerHeight - .5 * 16
        ? preferredTop
        : badgeRect.top - tooltipRect.height - .375 * 16;
      kindTooltip.style.left = left + 'px';
      kindTooltip.style.top = Math.max(.5 * 16, top) + 'px';
    }

    function hideKindTooltip() {
      kindTooltip.hidden = true;
    }

    function referenceLocation(reference) {
      if (reference.path) return reference.path + (reference.line ? ':' + reference.line : '');
      return reference.uri || reference.locator || '';
    }

    function referenceLabel(reference) {
      return reference.label || referenceLocation(reference);
    }

    function referenceDetail(reference) {
      const location = referenceLocation(reference);
      return reference.label && location !== reference.label ? location : '';
    }

    function announce(message) {
      mapLive.textContent = '';
      requestAnimationFrame(function () { mapLive.textContent = message; });
    }

    function isModalPeek() {
      return window.matchMedia('(max-width: 46rem)').matches;
    }

    function updatePeekMode() {
      focusCard.setAttribute('aria-modal', String(isModalPeek()));
    }

    function focusableElements(container) {
      return Array.from(container.querySelectorAll('button:not([hidden]):not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter(function (element) { return element.getClientRects().length > 0; });
    }

    function scheduleViewForDisplayMode() {
      if (!snapshot) return;
      observedCanvasSize = {width: 0, height: 0};
      scheduleViewForCanvasSize();
    }

    function refreshViewForCanvasSize() {
      viewportResizeFrame = null;
      const rect = canvas.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (!snapshot || width < 1 || height < 1) return;
      if (observedCanvasSize.width === width && observedCanvasSize.height === height) return;
      observedCanvasSize = {width: width, height: height};
      updatePeekMode();
      if (detailNodeId) {
        const detailNode = nodeById(detailNodeId);
        if (detailNode) ensureNodeVisible(detailNode);
        return;
      }
      if (currentDisplayMode === 'inline') initialView();
      else fitView();
    }

    function scheduleViewForCanvasSize() {
      if (viewportResizeFrame !== null) cancelAnimationFrame(viewportResizeFrame);
      viewportResizeFrame = requestAnimationFrame(refreshViewForCanvasSize);
    }

    const canvasResizeObserver = new ResizeObserver(scheduleViewForCanvasSize);
    canvasResizeObserver.observe(canvas);

    function isDisplayMode(value) {
      return value === 'inline' || value === 'fullscreen';
    }

    function mergeHostContext(nextContext) {
      if (!nextContext || typeof nextContext !== 'object') return;
      hostContext = {...(hostContext || {}), ...nextContext};
      updateDisplayModeControl();
    }

    function supportsDisplayMode(mode) {
      return Array.isArray(hostContext?.availableDisplayModes)
        && hostContext.availableDisplayModes.includes(mode);
    }

    function showDisplayModeStatus(message, tone) {
      if (displayModeStatusTimer) clearTimeout(displayModeStatusTimer);
      displayModeStatus.textContent = message;
      displayModeStatus.dataset.tone = tone || 'neutral';
      displayModeStatus.hidden = false;
      displayModeStatusTimer = setTimeout(function () {
        displayModeStatus.hidden = true;
        displayModeStatusTimer = null;
      }, 5000);
    }

    function updateDisplayModeControl() {
      const bridge = window.openai;
      const nextMode = isDisplayMode(hostContext?.displayMode) ? hostContext.displayMode : 'inline';
      const modeChanged = currentDisplayMode !== nextMode;
      currentDisplayMode = nextMode;
      document.documentElement.dataset.displayMode = nextMode;

      const hasRequestApi = typeof bridge?.requestDisplayMode === 'function';
      const fullscreenSupported = hasRequestApi && supportsDisplayMode('fullscreen');
      fullscreenModeButton.hidden = !fullscreenSupported;
      const fullscreen = nextMode === 'fullscreen';
      if (hasRequestApi) {
        const fullscreenLabel = fullscreen ? 'Exit fullscreen' : 'Open fullscreen';
        fullscreenModeButton.title = fullscreenLabel;
        fullscreenModeButton.setAttribute('aria-label', fullscreenLabel);
        fullscreenModeButton.setAttribute('aria-pressed', String(fullscreen));
        fullscreenModeButton.querySelector('[data-fullscreen-icon="enter"]').hidden = fullscreen;
        fullscreenModeButton.querySelector('[data-fullscreen-icon="exit"]').hidden = !fullscreen;
        fullscreenModeButton.disabled = displayModeRequestPending;
      }
      if (modeChanged) scheduleViewForDisplayMode();
    }

    function notifyInlineHeight() {
      if (currentDisplayMode !== 'inline') return;
      window.openai?.notifyIntrinsicHeight?.();
    }

    async function requestDisplayMode(nextMode) {
      const bridge = window.openai;
      if (displayModeRequestPending || typeof bridge?.requestDisplayMode !== 'function') return;
      if (!supportsDisplayMode(nextMode)) {
        showDisplayModeStatus('This display mode is not available in the current host.', 'error');
        return;
      }
      displayModeRequestPending = true;
      updateDisplayModeControl();
      try {
        const result = await bridge.requestDisplayMode({mode: nextMode});
        const grantedMode = isDisplayMode(result?.mode) ? result.mode : null;
        if (!grantedMode) throw new Error('The host did not return a display mode.');
        mergeHostContext({displayMode: grantedMode});
        if (grantedMode !== nextMode) {
          showDisplayModeStatus('The host kept the map in ' + grantedMode + ' mode.', 'error');
        }
      } catch (error) {
        console.warn('The host declined the display mode request.', error);
        showDisplayModeStatus(error instanceof Error ? error.message : 'The host declined the display mode request.', 'error');
      } finally {
        displayModeRequestPending = false;
        updateDisplayModeControl();
      }
    }

    function toggleFullscreenMode() {
      return requestDisplayMode(currentDisplayMode === 'fullscreen' ? 'inline' : 'fullscreen');
    }

    function findSnapshot(value) {
      if (!value || typeof value !== 'object') return null;
      if (value.snapshot && Array.isArray(value.snapshot.nodes)) return value.snapshot;
      if (value.structuredContent?.snapshot && Array.isArray(value.structuredContent.snapshot.nodes)) return value.structuredContent.snapshot;
      if (value.toolOutput?.snapshot && Array.isArray(value.toolOutput.snapshot.nodes)) return value.toolOutput.snapshot;
      if (value.call_tool_result) return findSnapshot(value.call_tool_result);
      if (value.mcp_tool_result) return findSnapshot(value.mcp_tool_result);
      if (value.result) return findSnapshot(value.result);
      if (value.params) return findSnapshot(value.params);
      if (value.globals) return findSnapshot(value.globals);
      if (value.toolResult) return findSnapshot(value.toolResult);
      return null;
    }

    function filteredNodes() {
      if (!snapshot) return [];
      const query = searchElement.value.trim().toLowerCase();
      return snapshot.nodes.filter(function (node) {
        const references = (node.references || []).map(function (reference) {
          return [reference.label, reference.uri, reference.path, reference.line, reference.locator].filter(Boolean).join(' ');
        }).join(' ');
        const haystack = [
          node.title,
          node.body,
          node.origin,
          node.confidence,
          node.confidenceBasis,
          (node.uncertaintyReasons || []).join(' '),
          references,
        ].join(' ').toLowerCase();
        return !query || haystack.includes(query);
      });
    }

    function visibleNodes() {
      return filteredNodes();
    }

    function relatedNodeIds(nodeId) {
      if (!nodeId) return new Set();
      const relatedIds = new Set([nodeId]);
      (snapshot?.edges || []).forEach(function (edge) {
        if (edge.from === nodeId) relatedIds.add(edge.to);
        if (edge.to === nodeId) relatedIds.add(edge.from);
      });
      return relatedIds;
    }

    function visibleGraph() {
      const nodes = visibleNodes();
      const ids = new Set(nodes.map(function (node) { return node.id; }));
      return {
        nodes: nodes,
        edges: (snapshot?.edges || []).filter(function (edge) { return ids.has(edge.from) && ids.has(edge.to); }),
      };
    }

    function nodePosition(node) {
      return nodePositions.get(node.id) || node.position;
    }

    function graphBounds(nodes) {
      if (!nodes.length) return {x: 0, y: 0, width: 1, height: 1};
      const minX = Math.min.apply(null, nodes.map(function (node) { return nodePosition(node).x; }));
      const minY = Math.min.apply(null, nodes.map(function (node) { return nodePosition(node).y; }));
      const maxX = Math.max.apply(null, nodes.map(function (node) { return nodePosition(node).x + NODE_WIDTH; }));
      const maxY = Math.max.apply(null, nodes.map(function (node) { return nodePosition(node).y + NODE_HEIGHT; }));
      return {x: minX, y: minY, width: maxX - minX, height: maxY - minY};
    }

    function globalPositions() {
      return new Map((snapshot?.nodes || []).map(function (node) {
        return [node.id, {x: node.position.x, y: node.position.y}];
      }));
    }

    function edgeGeometry(edge) {
      const from = nodeById(edge.from);
      const to = nodeById(edge.to);
      if (!from || !to) return {path: '', labelPosition: {x: 0, y: 0}};
      const fromPosition = nodePosition(from);
      const toPosition = nodePosition(to);
      const fromCenter = {x: fromPosition.x + NODE_WIDTH / 2, y: fromPosition.y + NODE_HEIGHT / 2};
      const toCenter = {x: toPosition.x + NODE_WIDTH / 2, y: toPosition.y + NODE_HEIGHT / 2};
      const horizontal = Math.abs(toCenter.x - fromCenter.x) >= Math.abs(toCenter.y - fromCenter.y);
      let start;
      let end;
      let path;
      if (horizontal) {
        const direction = toCenter.x >= fromCenter.x ? 1 : -1;
        start = {x: fromCenter.x + direction * NODE_WIDTH / 2, y: fromCenter.y};
        end = {x: toCenter.x - direction * NODE_WIDTH / 2, y: toCenter.y};
        const curve = Math.max(64, Math.abs(end.x - start.x) * .48);
        path = 'M ' + start.x + ' ' + start.y + ' C ' + (start.x + direction * curve) + ' ' + start.y + ', ' + (end.x - direction * curve) + ' ' + end.y + ', ' + end.x + ' ' + end.y;
      } else {
        const direction = toCenter.y >= fromCenter.y ? 1 : -1;
        start = {x: fromCenter.x, y: fromCenter.y + direction * NODE_HEIGHT / 2};
        end = {x: toCenter.x, y: toCenter.y - direction * NODE_HEIGHT / 2};
        const curve = Math.max(64, Math.abs(end.y - start.y) * .48);
        path = 'M ' + start.x + ' ' + start.y + ' C ' + start.x + ' ' + (start.y + direction * curve) + ', ' + end.x + ' ' + (end.y - direction * curve) + ', ' + end.x + ' ' + end.y;
      }
      return {path: path, labelPosition: {x: (start.x + end.x) / 2, y: (start.y + end.y) / 2}};
    }

    function edgeId(edge) {
      return edge.from + '::' + edge.relation + '::' + edge.to;
    }

    function edgePhrase(edge) {
      const from = nodeById(edge.from);
      const to = nodeById(edge.to);
      return (from?.title || edge.from) + ' → ' + displayLabel(edge.relation) + ' → ' + (to?.title || edge.to);
    }

    function renderEdges(graph) {
      const svgParts = [
        '<defs>' +
          '<marker id="arrow" markerWidth="6.5" markerHeight="6.5" refX="6" refY="3.25" orient="auto" markerUnits="userSpaceOnUse"><path d="M 0 0 L 6.5 3.25 L 0 6.5 z" fill="var(--edge)"></path></marker>' +
          '<marker id="arrow-accent" markerWidth="6.5" markerHeight="6.5" refX="6" refY="3.25" orient="auto" markerUnits="userSpaceOnUse"><path d="M 0 0 L 6.5 3.25 L 0 6.5 z" fill="var(--accent)"></path></marker>' +
        '</defs>',
      ];
      graph.edges.slice().sort(function (a, b) {
        return Number(edgeId(a) === selectedEdgeId) - Number(edgeId(b) === selectedEdgeId);
      }).forEach(function (edge) {
        const id = edgeId(edge);
        const selected = selectedEdgeId === id;
        const related = selected || Boolean(selectedNodeId && (edge.from === selectedNodeId || edge.to === selectedNodeId));
        const preview = Boolean(previewNodeId && (edge.from === previewNodeId || edge.to === previewNodeId));
        const muted = selectedEdgeId ? !selected : Boolean(selectedNodeId && !related);
        const from = nodeById(edge.from);
        const to = nodeById(edge.to);
        const typeContext = highlightedKinds.size > 0 &&
          !highlightedKinds.has(from?.kind) && !highlightedKinds.has(to?.kind);
        const phrase = edgePhrase(edge);
        const label = displayLabel(edge.relation);
        const labelWidth = Math.max(54, label.length * 7 + 18);
        const geometry = edgeGeometry(edge);
        svgParts.push(
          '<g class="edge-group' + (selected ? ' is-selected' : '') + (related ? ' is-related' : '') + (preview ? ' is-preview' : '') + (muted ? ' is-muted' : '') + (typeContext ? ' is-type-context' : '') + '" tabindex="0" role="button" data-edge-id="' + escapeHtml(id) + '" data-from="' + escapeHtml(edge.from) + '" data-to="' + escapeHtml(edge.to) + '" aria-label="' + escapeHtml('Relationship: ' + phrase) + '">' +
            '<path class="edge-path" d="' + geometry.path + '"></path>' +
            '<path class="edge-hit" d="' + geometry.path + '"></path>' +
            '<rect class="edge-label-bg" x="' + (geometry.labelPosition.x - labelWidth / 2) + '" y="' + (geometry.labelPosition.y - 10) + '" width="' + labelWidth + '" height="20" rx="10"></rect>' +
            '<text class="edge-label" x="' + geometry.labelPosition.x + '" y="' + (geometry.labelPosition.y + 4) + '">' + escapeHtml(label) + '</text>' +
          '</g>',
        );
      });
      edgesElement.innerHTML = svgParts.join('');
    }

    function confidenceBadge(node) {
      if (!node.confidence) return '';
      const level = escapeHtml(node.confidence);
      return '<span class="confidence-badge confidence-' + level + '">' + escapeHtml(displayLabel(node.confidence)) + '</span>';
    }

    function renderMinimap(graph, bounds) {
      if (graph.nodes.length < 2) {
        minimapElement.hidden = true;
        return;
      }

      const padding = 48;
      minimapViewBox = {
        x: bounds.x - padding,
        y: bounds.y - padding,
        width: bounds.width + padding * 2,
        height: bounds.height + padding * 2,
      };
      minimapSvg.setAttribute('viewBox', [minimapViewBox.x, minimapViewBox.y, minimapViewBox.width, minimapViewBox.height].join(' '));

      const edgeMarkup = graph.edges.map(function (edge) {
        const from = nodeById(edge.from);
        const to = nodeById(edge.to);
        if (!from || !to) return '';
        const start = nodePosition(from);
        const end = nodePosition(to);
        return '<line class="mini-edge" x1="' + (start.x + NODE_WIDTH / 2) + '" y1="' + (start.y + NODE_HEIGHT / 2) + '" x2="' + (end.x + NODE_WIDTH / 2) + '" y2="' + (end.y + NODE_HEIGHT / 2) + '"></line>';
      }).join('');
      const nodeMarkup = graph.nodes.map(function (node) {
        const position = nodePosition(node);
        return '<rect class="mini-node ' + escapeHtml(node.kind) + '" x="' + position.x + '" y="' + position.y + '" width="' + NODE_WIDTH + '" height="' + NODE_HEIGHT + '" rx="22"></rect>';
      }).join('');
      minimapContent.innerHTML = edgeMarkup + nodeMarkup;
      minimapElement.hidden = false;
      updateMinimapViewport();
    }

    function updateMinimapViewport() {
      if (minimapElement.hidden || !transform.scale) return;
      const rect = canvas.getBoundingClientRect();
      minimapViewport.setAttribute('x', String(-transform.x / transform.scale));
      minimapViewport.setAttribute('y', String(-transform.y / transform.scale));
      minimapViewport.setAttribute('width', String(rect.width / transform.scale));
      minimapViewport.setAttribute('height', String(rect.height / transform.scale));
    }

    function renderGraph() {
      if (!snapshot) return;
      const graph = visibleGraph();
      const relatedIds = relatedNodeIds(selectedNodeId);
      const selectedEdge = graph.edges.find(function (edge) { return edgeId(edge) === selectedEdgeId; });
      const edgeNodeIds = selectedEdge ? new Set([selectedEdge.from, selectedEdge.to]) : new Set();
      nodesElement.innerHTML = graph.nodes.map(function (node) {
        const position = nodePosition(node);
        const selected = selectedNodeId === node.id ? ' is-selected' : '';
        const peekSource = detailNodeId === node.id ? ' is-peek-source' : '';
        const entry = snapshot.entryNodeId === node.id;
        const relationshipState = selectedEdgeId
          ? edgeNodeIds.has(node.id) ? ' is-related' : ' is-muted'
          : !selectedNodeId || selected
            ? ''
            : relatedIds.has(node.id) ? ' is-related' : ' is-muted';
        const typeState = highlightedKinds.size === 0
          ? ''
          : highlightedKinds.has(node.kind) ? ' is-type-match' : ' is-type-context';
        const references = node.references?.length
          ? '<span class="reference-count">' + node.references.length + ' source' + (node.references.length === 1 ? '' : 's') + '</span>'
          : '<span></span>';
        const firstUncertainty = node.confidence !== 'high' && node.uncertaintyReasons?.[0]
          ? '<div class="confidence-note ' + (node.confidence === 'low' ? 'low' : '') + '"><span>' + escapeHtml(node.uncertaintyReasons[0]) + '</span></div>'
          : '';
        const uncertaintyClass = firstUncertainty ? ' has-uncertainty' : '';
        const accessibleLabel = (entry ? 'Recommended starting point. ' : '') + 'Select node: ' + node.title + '. Type: ' + displayLabel(node.kind) + '. ' + kindDescription(node.kind);
        return '<article class="node ' + escapeHtml(node.kind) + selected + peekSource + relationshipState + typeState + uncertaintyClass + '" tabindex="0" data-node-id="' + escapeHtml(node.id) + '" data-kind="' + escapeHtml(node.kind) + '" data-origin="' + escapeHtml(node.origin) + '" aria-label="' + escapeHtml(accessibleLabel) + '" style="left:' + position.x + 'px;top:' + position.y + 'px">' +
          '<div class="node-header"><span class="kind-label" data-kind="' + escapeHtml(node.kind) + '">' + kindIcon(node.kind) + '<span>' + escapeHtml(displayLabel(node.kind)) + '</span></span>' + confidenceBadge(node) + '<span class="origin-label origin-' + escapeHtml(node.origin) + '">' + escapeHtml(displayLabel(node.origin)) + '</span></div>' +
          '<div class="node-copy"><h2>' + escapeHtml(node.title) + '</h2><p>' + escapeHtml(node.body) + '</p>' + firstUncertainty + '</div>' +
          '<div class="node-footer">' + references + '<button class="node-details-button" type="button" data-details-id="' + escapeHtml(node.id) + '" aria-label="Peek at ' + escapeHtml(node.title) + '">Peek<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button></div>' +
        '</article>';
      }).join('');

      const bounds = graphBounds(graph.nodes);
      const layoutWidth = Math.max(snapshot.layout.width, Math.ceil(bounds.x + bounds.width + 56));
      const layoutHeight = Math.max(snapshot.layout.height, Math.ceil(bounds.y + bounds.height + 56));
      edgesElement.setAttribute('width', String(layoutWidth));
      edgesElement.setAttribute('height', String(layoutHeight));
      edgesElement.setAttribute('viewBox', '0 0 ' + layoutWidth + ' ' + layoutHeight);
      renderEdges(graph);
      nodesElement.style.width = layoutWidth + 'px';
      nodesElement.style.height = layoutHeight + 'px';
      renderMinimap(graph, bounds);
      emptyElement.hidden = graph.nodes.length > 0;
      emptyElement.textContent = snapshot && graph.nodes.length === 0
        ? 'No nodes match your search.'
        : 'Waiting for a work map.';
      applyTransform();
    }

    function applyTransform() {
      canvas.scrollLeft = 0;
      canvas.scrollTop = 0;
      world.style.transform = 'translate(' + transform.x + 'px,' + transform.y + 'px) scale(' + transform.scale + ')';
      zoomValueElement.textContent = Math.round(transform.scale * 100) + '%';
      updateMinimapViewport();
    }

    function fitView() {
      const nodes = visibleNodes();
      if (!nodes.length) return;
      const bounds = graphBounds(nodes);
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const scale = Math.min(1, (rect.width - 32) / bounds.width, (rect.height - 32) / bounds.height);
      transform.scale = Math.max(MIN_ZOOM, scale);
      transform.x = (rect.width - bounds.width * transform.scale) / 2 - bounds.x * transform.scale;
      transform.y = (rect.height - bounds.height * transform.scale) / 2 - bounds.y * transform.scale;
      applyTransform();
    }

    function fittedScale(nodes) {
      const bounds = graphBounds(nodes);
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return 0;
      return Math.min(1, (rect.width - 32) / bounds.width, (rect.height - 32) / bounds.height);
    }

    function entryNode(nodes) {
      return nodes.find(function (node) { return node.id === snapshot.entryNodeId; });
    }

    function centerReadable(node, scale) {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const position = nodePosition(node);
      transform.scale = scale;
      transform.x = rect.width * (rect.width <= VERTICAL_GRAPH_BREAKPOINT ? .5 : .34) - (position.x + NODE_WIDTH / 2) * scale;
      transform.y = rect.height * .48 - (position.y + NODE_HEIGHT / 2) * scale;
      applyTransform();
    }

    function ensureNodeVisible(node) {
      const rect = canvas.getBoundingClientRect();
      const position = nodePosition(node);
      const margin = 28;
      const left = position.x * transform.scale + transform.x;
      const top = position.y * transform.scale + transform.y;
      const right = left + NODE_WIDTH * transform.scale;
      const bottom = top + NODE_HEIGHT * transform.scale;
      if (left < margin) transform.x += margin - left;
      else if (right > rect.width - margin) transform.x -= right - (rect.width - margin);
      if (top < margin) transform.y += margin - top;
      else if (bottom > rect.height - margin) transform.y -= bottom - (rect.height - margin);
      applyTransform();
    }

    function ensureEdgeVisible(edge) {
      const rect = canvas.getBoundingClientRect();
      const point = edgeGeometry(edge).labelPosition;
      const screenX = point.x * transform.scale + transform.x;
      const screenY = point.y * transform.scale + transform.y;
      const margin = 64;
      if (screenX < margin) transform.x += margin - screenX;
      else if (screenX > rect.width - margin) transform.x -= screenX - (rect.width - margin);
      if (screenY < margin) transform.y += margin - screenY;
      else if (screenY > rect.height - margin) transform.y -= screenY - (rect.height - margin);
      applyTransform();
    }

    function readableOverview(nodes) {
      const rect = canvas.getBoundingClientRect();
      const scale = rect.width <= VERTICAL_GRAPH_BREAKPOINT ? MIN_READABLE_ZOOM : .74;
      const entry = entryNode(nodes);
      if (!entry) {
        fitView();
        return;
      }
      centerReadable(entry, scale);
    }

    function initialView() {
      const nodes = visibleNodes();
      if (!nodes.length) return;
      if (nodes.length <= 4 || fittedScale(nodes) >= MIN_READABLE_ZOOM) {
        fitView();
        return;
      }
      readableOverview(nodes);
    }

    function goToStart() {
      if (!snapshot) return;
      closeFocus(false);
      selectedNodeId = null;
      selectedEdgeId = null;
      previewNodeId = null;
      searchElement.value = '';
      nodePositions = globalPositions();
      updateMeta();
      renderGraph();
      requestAnimationFrame(function () {
        const start = entryNode(snapshot.nodes);
        if (!start) return;
        centerReadable(start, canvas.getBoundingClientRect().width <= VERTICAL_GRAPH_BREAKPOINT ? MIN_READABLE_ZOOM : .74);
        requestAnimationFrame(function () {
          nodesElement.querySelector('[data-node-id="' + CSS.escape(start.id) + '"]')?.focus();
          announce('Moved to start: ' + start.title);
        });
      });
    }

    function setZoom(nextScale, anchorX, anchorY) {
      const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextScale));
      const ratio = scale / transform.scale;
      transform.x = anchorX - (anchorX - transform.x) * ratio;
      transform.y = anchorY - (anchorY - transform.y) * ratio;
      transform.scale = scale;
      applyTransform();
    }

    function isZoomGesture(event) {
      return event.ctrlKey;
    }

    function navigateFromMinimap(event) {
      const rect = minimapSvg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const worldX = minimapViewBox.x + (event.clientX - rect.left) / rect.width * minimapViewBox.width;
      const worldY = minimapViewBox.y + (event.clientY - rect.top) / rect.height * minimapViewBox.height;
      const canvasRect = canvas.getBoundingClientRect();
      transform.x = canvasRect.width / 2 - worldX * transform.scale;
      transform.y = canvasRect.height / 2 - worldY * transform.scale;
      applyTransform();
    }

    function nodeById(id) {
      return snapshot?.nodes.find(function (node) { return node.id === id; });
    }

    function markPeekSource(nodeId) {
      nodesElement.querySelectorAll('.node.is-peek-source').forEach(function (element) {
        element.classList.remove('is-peek-source');
      });
      edgesElement.querySelectorAll('.edge-group').forEach(function (element) {
        const connected = Boolean(nodeId && (
          element.getAttribute('data-from') === nodeId ||
          element.getAttribute('data-to') === nodeId
        ));
        element.classList.toggle('is-peek-related', connected);
      });
      if (!nodeId) return;
      nodesElement.querySelector('[data-node-id="' + CSS.escape(nodeId) + '"]')?.classList.add('is-peek-source');
    }

    function renderFocus(node, options) {
      const settings = options || {};
      const wasOpen = !focusLayer.hidden;
      if (settings.pushHistory && detailNodeId && detailNodeId !== node.id) {
        detailBackHistory.push(detailNodeId);
        detailForwardHistory = [];
      }
      if (!wasOpen) {
        detailBackHistory = [];
        detailForwardHistory = [];
        detailReturnFocus = settings.returnFocus || document.activeElement;
      }
      detailNodeId = node.id;
      focusCard.className = 'focus-card ' + node.kind;
      void focusCard.offsetWidth;
      focusCard.classList.add(wasOpen ? 'is-navigating' : 'is-entering');
      focusLayer.className = 'focus-layer ' + node.kind;
      markPeekSource(node.id);
      document.getElementById('focus-kind').innerHTML = kindIcon(node.kind) + '<span>' + escapeHtml(displayLabel(node.kind)) + '</span>';
      document.getElementById('focus-kind-description').textContent = kindDescription(node.kind);
      const origin = document.getElementById('focus-origin');
      origin.className = 'origin-label origin-' + node.origin;
      origin.textContent = displayLabel(node.origin);
      document.getElementById('focus-title').textContent = node.title;
      const copy = document.getElementById('focus-copy');
      copy.textContent = node.body || 'No additional context was provided.';
      document.getElementById('focus-body').scrollTop = 0;

      const confidenceSection = document.getElementById('confidence-section');
      confidenceSection.hidden = !node.confidence;
      if (node.confidence) {
        const confidence = document.getElementById('focus-confidence');
        confidence.className = 'confidence-badge confidence-' + node.confidence;
        confidence.textContent = displayLabel(node.confidence);
        document.getElementById('confidence-basis').textContent = node.confidenceBasis || '';
        const uncertaintyReasons = node.uncertaintyReasons || [];
        const uncertaintyBlock = document.getElementById('uncertainty-block');
        uncertaintyBlock.hidden = node.confidence === 'high' || uncertaintyReasons.length === 0;
        document.getElementById('uncertainty-list').innerHTML = uncertaintyReasons.map(function (reason) {
          return '<li>' + escapeHtml(reason) + '</li>';
        }).join('');
      }

      const relationships = (snapshot.edges || []).filter(function (edge) {
        return edge.from === node.id || edge.to === node.id;
      });
      const relationshipSection = document.getElementById('relationship-section');
      relationshipSection.hidden = relationships.length === 0;
      document.getElementById('relationship-list').innerHTML = relationships.map(function (edge) {
        const outgoing = edge.from === node.id;
        const neighbor = nodeById(outgoing ? edge.to : edge.from);
        const phrase = edgePhrase(edge);
        return '<li><button class="relationship-link" type="button" data-related-node-id="' + escapeHtml(neighbor?.id || (outgoing ? edge.to : edge.from)) + '">' +
          '<span class="relationship-path">' + escapeHtml(phrase) + '</span>' +
          '<span class="relationship-direction">' + (outgoing ? 'Outgoing' : 'Incoming') + ' ›</span>' +
        '</button></li>';
      }).join('');

      const references = node.references || [];
      const referenceSection = document.getElementById('reference-section');
      referenceSection.hidden = references.length === 0;
      document.getElementById('reference-list').innerHTML = references.map(function (reference, index) {
        let action = '';
        if (reference.uri && typeof window.openai?.openExternal === 'function') {
          action = '<button class="reference-link" type="button" data-reference-index="' + index + '" data-reference-action="open">Open source</button>';
        } else if ((reference.path || reference.locator) && typeof window.openai?.sendFollowUpMessage === 'function') {
          action = '<button class="reference-link" type="button" data-reference-index="' + index + '" data-reference-action="inspect">Inspect source</button>';
        }
        const detail = referenceDetail(reference);
        return '<div class="reference-row"><span><strong>' + escapeHtml(referenceLabel(reference)) + '</strong>' +
          (detail ? '<code>' + escapeHtml(detail) + '</code>' : '') + '</span>' + action + '</div>';
      }).join('');

      const actionsAvailable = typeof window.openai?.sendFollowUpMessage === 'function';
      document.getElementById('focus-actions').hidden = !actionsAvailable;
      document.getElementById('focus-footer').hidden = !actionsAvailable;
      document.querySelectorAll('.reviewer-action').forEach(function (button) {
        button.hidden = node.origin !== 'reviewer';
      });
      document.querySelectorAll('.standard-action').forEach(function (button) {
        button.hidden = node.origin === 'reviewer';
      });
      peekStatus.textContent = '';
      document.getElementById('peek-back').hidden = detailBackHistory.length === 0;
      document.getElementById('peek-forward').hidden = detailForwardHistory.length === 0;
      updatePeekMode();
      mapSurface.classList.add('has-peek');
      focusLayer.hidden = false;
      requestAnimationFrame(function () {
        ensureNodeVisible(node);
        focusCard.focus({preventScroll: true});
      });
    }

    function closeFocus(restoreFocus = true) {
      if (focusLayer.hidden) return;
      focusLayer.hidden = true;
      mapSurface.classList.remove('has-peek');
      detailNodeId = null;
      markPeekSource(null);
      detailBackHistory = [];
      detailForwardHistory = [];
      const returnFocus = detailReturnFocus;
      detailReturnFocus = null;
      if (restoreFocus) {
        requestAnimationFrame(function () {
          if (returnFocus instanceof HTMLElement && returnFocus.isConnected) {
            returnFocus.focus();
            return;
          }
          const selected = selectedNodeId && nodesElement.querySelector('[data-node-id="' + CSS.escape(selectedNodeId) + '"]');
          if (selected instanceof HTMLElement) selected.focus();
        });
      }
    }

    function selectNode(node) {
      selectedNodeId = selectedNodeId === node.id ? null : node.id;
      selectedEdgeId = null;
      previewNodeId = null;
      updateMeta();
      renderGraph();
      requestAnimationFrame(function () {
        nodesElement.querySelector('[data-node-id="' + CSS.escape(node.id) + '"]')?.focus();
      });
      announce(selectedNodeId
        ? 'Selected ' + node.title + '. ' + Math.max(0, relatedNodeIds(node.id).size - 1) + ' related nodes highlighted.'
        : 'Node selection cleared.');
    }

    function showNodePeek(node, returnFocus) {
      renderFocus(node, {
        pushHistory: !focusLayer.hidden,
        returnFocus: returnFocus,
      });
    }

    function activateNode(node, returnFocus) {
      if (!focusLayer.hidden) {
        showNodePeek(node, returnFocus);
        announce('Peek showing ' + node.title);
        return;
      }
      selectNode(node);
    }

    function selectEdge(edge) {
      const id = edgeId(edge);
      selectedEdgeId = selectedEdgeId === id ? null : id;
      selectedNodeId = null;
      previewNodeId = null;
      updateMeta();
      renderGraph();
      if (selectedEdgeId) {
        requestAnimationFrame(function () {
          ensureEdgeVisible(edge);
          edgesElement.querySelector('[data-edge-id="' + CSS.escape(id) + '"]')?.focus();
        });
        announce('Selected relationship: ' + edgePhrase(edge));
      } else {
        announce('Relationship selection cleared.');
      }
    }

    function inspectReferencePrompt(reference, node) {
      const location = referenceLocation(reference);
      const locationKind = reference.path ? 'workspace path' : 'locator';
      return 'Work map: ' + snapshot.title +
        '\\nNode [' + displayLabel(node.kind) + ']: ' + node.title +
        '\\nReference (' + locationKind + '): ' + location +
        '\\n\\nOpen and inspect this exact reference. Verify whether it supports the node as written, quote or summarize the relevant material, and report any mismatch, stale location, or missing context. Do not treat the work-map claim itself as verification.';
    }

    function followUpPrompt(action, node) {
      const references = (node.references || []).map(function (reference) {
        const location = referenceLocation(reference);
        return reference.label ? '- ' + reference.label + ': ' + location : '- ' + location;
      });
      const referenceContext = references.length ? '\\nSupporting references:\\n' + references.join('\\n') : '\\nSupporting references: none attached.';
      const uncertaintyReasons = (node.uncertaintyReasons || []).map(function (reason) { return '- ' + reason; });
      const confidenceContext = node.confidence
        ? '\\nConfidence: ' + displayLabel(node.confidence) + '\\nConfidence basis: ' + (node.confidenceBasis || 'Not provided.') + (uncertaintyReasons.length ? '\\nUncertainty reasons:\\n' + uncertaintyReasons.join('\\n') : '')
        : '';
      const context = 'Work map: ' + snapshot.title + '\\nNode [' + displayLabel(node.kind) + ']: ' + node.title + (node.body ? '\\nContext: ' + node.body : '') + confidenceContext + referenceContext;
      if (action === 'ask') return context + '\\n\\nExplain why this node belongs in the reasoning map and how its incoming and outgoing relationships are justified.';
      if (action === 'challenge') return context + '\\n\\nIndependently challenge this node. Identify unsupported assumptions, contrary evidence, and relationships that should be changed. Do not rely on the original agent self-assessment as verification.';
      if (action === 'accept') return context + '\\n\\nI accept this reviewer finding. Record that decision explicitly and identify the concrete action it should create.';
      if (action === 'reject') return context + '\\n\\nI reject this reviewer finding. Record that decision explicitly, explain what should remain unchanged, and do not include this finding in any implementer handoff.';
      if (action === 'handoff') return context + '\\n\\nI accept this reviewer finding. Prepare a concise handoff addressed to the implementer containing only this accepted finding, its supporting references, and the concrete requested change. Do not include other reviewer findings.';
      return context + '\\n\\nContinue the work from this node. Use its connected nodes as context and present a new work map if the reasoning materially changes.';
    }

    function renderFilters() {
      const kinds = Array.from(new Set((snapshot?.nodes || []).map(function (node) { return node.kind; })));
      const counts = new Map(kinds.map(function (kind) {
        return [kind, snapshot.nodes.filter(function (node) { return node.kind === kind; }).length];
      }));
      typeFilterMenu.innerHTML = kinds.map(function (kind) {
        return '<label class="type-filter-option ' + escapeHtml(kind) + '">' +
          '<input type="checkbox" value="' + escapeHtml(kind) + '"' + (highlightedKinds.has(kind) ? ' checked' : '') + ' />' +
          '<span class="type-filter-icon">' + kindIcon(kind) + '</span><span class="type-filter-label">' + escapeHtml(displayLabel(kind)) + '</span><small>' + counts.get(kind) + '</small>' +
          '<span class="type-filter-description">' + escapeHtml(kindDescription(kind)) + '</span>' +
        '</label>';
      }).join('') + '<button id="clear-types" class="clear-types" type="button">Clear highlights</button>';
      updateTypeFilterTrigger();
    }

    function updateTypeFilterTrigger() {
      const count = highlightedKinds.size;
      typeFilterCount.hidden = count === 0;
      typeFilterCount.textContent = String(count);
      typeFilterTrigger.setAttribute('aria-label', count ? 'Highlight node types, ' + count + ' selected' : 'Highlight node types');
      const clearButton = typeFilterMenu.querySelector('#clear-types');
      if (clearButton) clearButton.hidden = count === 0;
    }

    function setTypeMenuOpen(open) {
      typeFilterMenu.hidden = !open;
      typeFilterTrigger.setAttribute('aria-expanded', String(open));
    }

    function updateMeta() {
      if (!snapshot) return;
      if (selectedNodeId) {
        const selected = nodeById(selectedNodeId);
        const relatedCount = Math.max(0, relatedNodeIds(selectedNodeId).size - 1);
        metaElement.textContent = 'Highlighting ' + (selected?.title || 'node') + ' · ' + relatedCount + ' related';
        return;
      }
      const countText = snapshot.nodes.length + ' nodes · ' + snapshot.edges.length + ' relationships';
      metaElement.textContent = snapshot.reviewOf ? countText + ' · review of ' + snapshot.reviewOf : countText;
    }

    function render(nextSnapshot) {
      if (nextSnapshot.id && renderedSnapshotId === nextSnapshot.id) return;
      snapshot = nextSnapshot;
      renderedSnapshotId = nextSnapshot.id || null;
      selectedNodeId = null;
      selectedEdgeId = null;
      previewNodeId = null;
      detailNodeId = null;
      detailBackHistory = [];
      detailForwardHistory = [];
      detailReturnFocus = null;
      mapSurface.classList.remove('has-peek');
      focusLayer.hidden = true;
      highlightedKinds = new Set();
      nodePositions = globalPositions();
      titleElement.textContent = nextSnapshot.title || 'Work Map';
      roleElement.textContent = displayLabel(nextSnapshot.authorRole || 'agent');
      roleElement.className = 'role-badge origin-' + (nextSnapshot.authorRole || 'agent');
      updateMeta();
      renderFilters();
      renderGraph();
      requestAnimationFrame(initialView);
      notifyInlineHeight();
    }

    function refreshGraph() {
      closeFocus(false);
      selectedNodeId = null;
      selectedEdgeId = null;
      previewNodeId = null;
      nodePositions = globalPositions();
      updateMeta();
      renderGraph();
      requestAnimationFrame(fitView);
    }

    function focusDirectionalNode(currentNode, key) {
      const currentPosition = nodePosition(currentNode);
      const currentCenter = {
        x: currentPosition.x + NODE_WIDTH / 2,
        y: currentPosition.y + NODE_HEIGHT / 2,
      };
      const candidates = visibleNodes().filter(function (candidate) {
        if (candidate.id === currentNode.id) return false;
        const position = nodePosition(candidate);
        const dx = position.x + NODE_WIDTH / 2 - currentCenter.x;
        const dy = position.y + NODE_HEIGHT / 2 - currentCenter.y;
        if (key === 'ArrowRight') return dx > 0 && Math.abs(dy) <= Math.abs(dx) * 1.75;
        if (key === 'ArrowLeft') return dx < 0 && Math.abs(dy) <= Math.abs(dx) * 1.75;
        if (key === 'ArrowDown') return dy > 0 && Math.abs(dx) <= Math.abs(dy) * 1.75;
        return dy < 0 && Math.abs(dx) <= Math.abs(dy) * 1.75;
      });
      candidates.sort(function (a, b) {
        const aPosition = nodePosition(a);
        const bPosition = nodePosition(b);
        const aDistance = Math.hypot(aPosition.x - currentPosition.x, aPosition.y - currentPosition.y);
        const bDistance = Math.hypot(bPosition.x - currentPosition.x, bPosition.y - currentPosition.y);
        return aDistance - bDistance;
      });
      const next = candidates[0];
      if (!next) return;
      const element = nodesElement.querySelector('[data-node-id="' + CSS.escape(next.id) + '"]');
      if (!(element instanceof HTMLElement)) return;
      ensureNodeVisible(next);
      element.focus();
      announce('Focused ' + next.title);
    }

    function setNodePreview(nodeId) {
      const nextId = selectedNodeId || selectedEdgeId ? null : nodeId;
      if (previewNodeId === nextId) return;
      previewNodeId = nextId;
      edgesElement.querySelectorAll('.edge-group').forEach(function (edgeElement) {
        const preview = Boolean(nextId && (
          edgeElement.getAttribute('data-from') === nextId ||
          edgeElement.getAttribute('data-to') === nextId
        ));
        edgeElement.classList.toggle('is-preview', preview);
      });
    }

    nodesElement.addEventListener('click', function (event) {
      const detailsButton = event.target.closest('[data-details-id]');
      if (detailsButton) {
        const detailNode = nodeById(detailsButton.getAttribute('data-details-id'));
        if (detailNode) showNodePeek(detailNode, detailsButton);
        return;
      }
      const element = event.target.closest('[data-node-id]');
      if (!element) return;
      const node = nodeById(element.getAttribute('data-node-id'));
      if (node) activateNode(node, element);
    });
    nodesElement.addEventListener('pointerover', function (event) {
      const node = event.target.closest('.node');
      if (node && !node.contains(event.relatedTarget)) {
        setNodePreview(node.getAttribute('data-node-id'));
      }
      const badge = event.target.closest('.kind-label[data-kind]');
      if (badge) showKindTooltip(badge);
    });
    nodesElement.addEventListener('pointerout', function (event) {
      const node = event.target.closest('.node');
      if (node && !node.contains(event.relatedTarget)) {
        setNodePreview(null);
      }
      if (event.target.closest('.kind-label[data-kind]')) hideKindTooltip();
    });
    nodesElement.addEventListener('focusin', function (event) {
      const node = event.target.closest('.node');
      const focusedNode = node && nodeById(node.getAttribute('data-node-id'));
      if (focusedNode) {
        ensureNodeVisible(focusedNode);
        setNodePreview(focusedNode.id);
      }
    });
    nodesElement.addEventListener('focusout', function (event) {
      const node = event.target.closest('.node');
      if (node && !node.contains(event.relatedTarget)) setNodePreview(null);
      hideKindTooltip();
    });

    nodesElement.addEventListener('keydown', function (event) {
      if (event.target.closest('[data-details-id]')) return;
      const element = event.target.closest('[data-node-id]');
      if (!element) return;
      const node = nodeById(element.getAttribute('data-node-id'));
      if (!node) return;
      if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        focusDirectionalNode(node, event.key);
        return;
      }
      if (event.key.toLowerCase() === 'd') {
        event.preventDefault();
        renderFocus(node, {returnFocus: element});
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateNode(node, element);
      }
    });

    edgesElement.addEventListener('click', function (event) {
      const element = event.target.closest('[data-edge-id]');
      if (!element) return;
      const edge = snapshot?.edges.find(function (candidate) {
        return edgeId(candidate) === element.getAttribute('data-edge-id');
      });
      if (edge) selectEdge(edge);
    });
    edgesElement.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const element = event.target.closest('[data-edge-id]');
      if (!element) return;
      event.preventDefault();
      const edge = snapshot?.edges.find(function (candidate) {
        return edgeId(candidate) === element.getAttribute('data-edge-id');
      });
      if (edge) selectEdge(edge);
    });

    focusLayer.addEventListener('click', function (event) {
      if (event.target === focusLayer) closeFocus();
      const relationshipButton = event.target.closest('[data-related-node-id]');
      if (relationshipButton) {
        const relatedNode = nodeById(relationshipButton.getAttribute('data-related-node-id'));
        if (relatedNode) renderFocus(relatedNode, {pushHistory: true});
        return;
      }
      const referenceButton = event.target.closest('[data-reference-index]');
      if (referenceButton && detailNodeId) {
        const reference = nodeById(detailNodeId)?.references?.[Number(referenceButton.getAttribute('data-reference-index'))];
        const action = referenceButton.getAttribute('data-reference-action');
        if (action === 'open' && reference?.uri && typeof window.openai?.openExternal === 'function') {
          window.openai.openExternal({href: reference.uri, redirectUrl: false});
          announce('Opened source: ' + referenceLabel(reference));
        }
        if (action === 'inspect' && reference && typeof window.openai?.sendFollowUpMessage === 'function') {
          const node = nodeById(detailNodeId);
          if (node) {
            window.openai.sendFollowUpMessage({prompt: inspectReferencePrompt(reference, node), scrollToBottom: true});
            peekStatus.textContent = 'Sent source inspection to Codex.';
          }
        }
        return;
      }
      const actionButton = event.target.closest('[data-action]');
      if (actionButton && detailNodeId && typeof window.openai?.sendFollowUpMessage === 'function') {
        const node = nodeById(detailNodeId);
        if (node) {
          window.openai.sendFollowUpMessage({prompt: followUpPrompt(actionButton.getAttribute('data-action'), node), scrollToBottom: true});
          peekStatus.textContent = 'Sent follow-up to Codex.';
        }
      }
    });

    document.getElementById('close-focus').addEventListener('click', closeFocus);
    document.getElementById('peek-back').addEventListener('click', function () {
      const previousId = detailBackHistory.pop();
      const previous = previousId && nodeById(previousId);
      if (previous && detailNodeId) {
        detailForwardHistory.push(detailNodeId);
        renderFocus(previous);
      }
    });
    document.getElementById('peek-forward').addEventListener('click', function () {
      const nextId = detailForwardHistory.pop();
      const next = nextId && nodeById(nextId);
      if (next && detailNodeId) {
        detailBackHistory.push(detailNodeId);
        renderFocus(next);
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Tab' && !focusLayer.hidden && isModalPeek()) {
        const focusables = focusableElements(focusCard);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === focusCard)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }
      if (event.key !== 'Escape') return;
      if (!typeFilterMenu.hidden) {
        setTypeMenuOpen(false);
        typeFilterTrigger.focus();
        return;
      }
      if (!focusLayer.hidden) closeFocus();
      else if (selectedNodeId || selectedEdgeId) {
        selectedNodeId = null;
        selectedEdgeId = null;
        previewNodeId = null;
        updateMeta();
        renderGraph();
        announce('Map selection cleared.');
      }
    });
    searchElement.addEventListener('input', refreshGraph);
    typeFilterTrigger.addEventListener('click', function () {
      setTypeMenuOpen(typeFilterMenu.hidden);
    });
    typeFilterMenu.addEventListener('change', function (event) {
      const input = event.target.closest('input[type="checkbox"]');
      if (!input) return;
      if (input.checked) highlightedKinds.add(input.value);
      else highlightedKinds.delete(input.value);
      updateTypeFilterTrigger();
      renderGraph();
    });
    typeFilterMenu.addEventListener('click', function (event) {
      if (!event.target.closest('#clear-types')) return;
      highlightedKinds = new Set();
      typeFilterMenu.querySelectorAll('input[type="checkbox"]').forEach(function (input) { input.checked = false; });
      updateTypeFilterTrigger();
      renderGraph();
    });
    document.addEventListener('click', function (event) {
      if (!typeFilter.contains(event.target)) setTypeMenuOpen(false);
    });
    document.getElementById('fit-view').addEventListener('click', fitView);
    document.getElementById('go-to-start').addEventListener('click', goToStart);
    fullscreenModeButton.addEventListener('click', toggleFullscreenMode);
    document.getElementById('zoom-in').addEventListener('click', function () {
      const rect = canvas.getBoundingClientRect();
      setZoom(transform.scale * 1.18, rect.width / 2, rect.height / 2);
    });
    document.getElementById('zoom-out').addEventListener('click', function () {
      const rect = canvas.getBoundingClientRect();
      setZoom(transform.scale / 1.18, rect.width / 2, rect.height / 2);
    });

    canvas.addEventListener('wheel', function (event) {
      if (event.target.closest('.minimap')) return;
      if (!isZoomGesture(event)) return;
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const delta = Math.max(-32, Math.min(32, event.deltaY));
      setZoom(transform.scale * Math.exp(-delta * .012), event.clientX - rect.left, event.clientY - rect.top);
    }, {passive: false});

    canvas.addEventListener('pointerdown', function (event) {
      if (event.target.closest('.node, .edge-group, .viewport-actions, .minimap')) return;
      dragState = {pointerId: event.pointerId, x: event.clientX, y: event.clientY, originX: transform.x, originY: transform.y};
      canvas.setPointerCapture(event.pointerId);
      canvas.classList.add('is-dragging');
    });
    canvas.addEventListener('pointermove', function (event) {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      transform.x = dragState.originX + event.clientX - dragState.x;
      transform.y = dragState.originY + event.clientY - dragState.y;
      applyTransform();
    });
    function endDrag(event) {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      dragState = null;
      canvas.classList.remove('is-dragging');
    }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    minimapElement.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      event.stopPropagation();
      minimapDragging = true;
      minimapElement.setPointerCapture(event.pointerId);
      navigateFromMinimap(event);
    });
    minimapElement.addEventListener('pointermove', function (event) {
      if (!minimapDragging) return;
      navigateFromMinimap(event);
    });
    minimapElement.addEventListener('pointerup', function (event) {
      if (!minimapDragging) return;
      navigateFromMinimap(event);
      minimapDragging = false;
    });
    minimapElement.addEventListener('pointercancel', function () {
      minimapDragging = false;
    });

    function renderFromOpenAiBridge() {
      const bridge = window.openai;
      if (!bridge) return;
      if (isDisplayMode(bridge.displayMode)) mergeHostContext({displayMode: bridge.displayMode});
      const found = findSnapshot(bridge.toolOutput) || findSnapshot(bridge.toolResponseMetadata) || findSnapshot(bridge);
      if (found) render(found);
    }

    window.addEventListener('message', function (event) {
      if (event.source !== window.parent) return;
      if (event.data?.id === initId && event.data?.result) {
        mergeHostContext(event.data.result.hostContext);
        sendHostMessage({jsonrpc: '2.0', method: 'ui/notifications/initialized', params: {}});
      }
      if (event.data?.id === initId && event.data?.error) {
        showDisplayModeStatus('The host did not complete MCP App initialization.', 'error');
      }
      if (event.data?.method === 'ui/notifications/host-context-changed') {
        mergeHostContext(event.data.params);
      }
      const found = findSnapshot(event.data);
      if (found) render(found);
    });
    window.addEventListener('openai:set_globals', function (event) {
      const globals = event.detail?.globals;
      if (isDisplayMode(globals?.displayMode)) mergeHostContext({displayMode: globals.displayMode});
      const found = findSnapshot(event.detail);
      if (found) render(found);
      renderFromOpenAiBridge();
    });
    updateDisplayModeControl();
    if (window.__PLAY_AGENT_WORK_MAP__) render(window.__PLAY_AGENT_WORK_MAP__);
    renderFromOpenAiBridge();
  </script>
</body>
</html>`;
}
