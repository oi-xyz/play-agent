export const WORK_MAP_APP_RESOURCE_URI = 'ui://play-agent/work-map.html';
export const WORK_MAP_APP_MIME_TYPE = 'text/html;profile=mcp-app';

export function workMapAppHtml() {
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
      --claim: #5c55c7;
      --evidence: #c87517;
      --option: #4a728f;
      --decision: #13877b;
      --assumption: #8d5e2f;
      --risk: #c64343;
      --question: #984d90;
      --action: #2673c9;
      --lesson: #66717a;
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

    .toolbar {
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
      width: 13rem;
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
      align-items: center;
      gap: .5rem;
      min-height: 2.25rem;
      padding: .375rem .5rem;
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

    .type-filter-option i {
      width: .5rem;
      height: .5rem;
      border-radius: 50%;
      background: var(--kind-color);
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

    .edge-path {
      fill: none;
      stroke: var(--edge);
      stroke-width: 1.5;
      marker-end: url(#arrow);
      transition: opacity .15s ease, stroke .15s ease, stroke-width .15s ease;
    }

    .edge-label-bg {
      fill: color-mix(in srgb, var(--surface) 92%, transparent);
      stroke: none;
    }

    .edge-label {
      fill: var(--text-secondary);
      font-size: 11px;
      font-weight: 600;
      text-anchor: middle;
    }

    .edge-group.is-muted { opacity: .12; }

    .edge-group.is-type-context { opacity: .2; }

    .edge-group.is-related { opacity: 1; }

    .edge-group.is-related .edge-path {
      stroke: var(--accent);
      stroke-width: 2.25;
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
      transition: border-color .15s ease, box-shadow .15s ease, opacity .15s ease, transform .15s ease;
    }

    .node:hover {
      border-color: var(--border-strong);
      box-shadow: var(--shadow-med);
      transform: translateY(-1px);
    }

    .node.is-selected {
      border-color: var(--border-strong);
      border-left-color: var(--kind-color);
      box-shadow: 0 0 0 2px var(--accent), var(--shadow-med);
      opacity: 1;
    }

    .node.is-related {
      border-color: color-mix(in srgb, var(--accent) 44%, var(--border));
      background: color-mix(in srgb, var(--accent) 3%, var(--surface));
      box-shadow: var(--shadow-med);
      opacity: 1;
    }

    .node.is-muted {
      opacity: .32;
      filter: saturate(.58);
    }

    .node.is-muted:hover {
      opacity: .72;
      filter: saturate(.86);
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
      position: absolute;
      inset: 0;
      z-index: 10;
      display: grid;
      place-items: center;
      padding: 1.25rem;
      background: color-mix(in srgb, var(--background) 58%, transparent);
      backdrop-filter: blur(2px);
      cursor: default;
      user-select: text;
    }

    .focus-layer[hidden] { display: none; }

    .focus-card {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      width: min(38rem, 100%);
      max-height: min(32rem, calc(100% - 1rem));
      overflow: hidden;
      border: 1px solid var(--border-strong);
      border-top: 4px solid var(--kind-color);
      border-radius: .625rem;
      background: var(--surface);
      box-shadow: var(--shadow-med);
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

    .focus-header h2 {
      margin: 0;
      color: var(--text);
      font-size: 1.0625rem;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .focus-body {
      display: grid;
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

    .relationship-list li,
    .reference-row {
      display: flex;
      align-items: baseline;
      gap: .5rem;
      min-width: 0;
      padding: .5rem .625rem;
      border-radius: .375rem;
      background: var(--surface-muted);
      color: var(--text-secondary);
      font-size: .75rem;
      line-height: 1.4;
    }

    .relationship-list li {
      display: grid;
      grid-template-columns: auto auto minmax(0, 1fr);
      overflow-wrap: anywhere;
    }

    .relationship-list strong { color: var(--text); font-weight: 600; }

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
      font-size: .75rem;
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

    @media (max-width: 46rem) {
      html, body { min-height: 34rem; }
      .work-map { height: clamp(34rem, 100vh, 44rem); min-height: 34rem; }
      .toolbar { grid-template-columns: minmax(0, 1fr) auto; gap: .625rem; }
      .filters { grid-column: 1 / -1; grid-row: 2; }
      .toolbar-actions { grid-column: 2; grid-row: 1; }
      .node { width: 17.75rem; }
      .focus-layer { padding: .625rem; }
      .focus-card { max-height: calc(100% - .25rem); }
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
        <button id="reset-view" class="icon-button" type="button" title="Reset view" aria-label="Reset map view">
          <svg viewBox="0 0 24 24"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/><path d="M10 7h4M7 10v4M17 10v4M10 17h4"/></svg>
        </button>
        <button id="fit-view" class="icon-button" type="button" title="Fit all nodes" aria-label="Fit all nodes">
          <svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
        </button>
      </div>
    </header>

    <section id="canvas" class="canvas" aria-label="Interactive node map">
      <div id="world" class="world">
        <svg id="edges" class="edges" aria-hidden="true"></svg>
        <div id="nodes" class="nodes"></div>
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

      <div id="focus-layer" class="focus-layer" hidden>
        <article id="focus-card" class="focus-card claim" role="dialog" aria-modal="true" aria-labelledby="focus-title">
          <header class="focus-header">
            <div>
              <div class="focus-eyebrow">
                <span id="focus-kind" class="kind-label">Claim</span>
                <span id="focus-origin" class="origin-label">Agent</span>
              </div>
              <h2 id="focus-title"></h2>
            </div>
            <button id="close-focus" class="icon-button" type="button" title="Close" aria-label="Close node details">
              <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
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
    const initId = 'play-agent-init-' + Math.random().toString(36).slice(2);

    let snapshot = null;
    let renderedSnapshotId = null;
    let transform = {x: 0, y: 0, scale: 1};
    let selectedNodeId = null;
    let detailNodeId = null;
    let dragState = null;
    let nodePositions = new Map();
    let highlightedKinds = new Set();
    let minimapViewBox = {x: 0, y: 0, width: 1, height: 1};
    let minimapDragging = false;

    function sendHostMessage(message) {
      if (window.parent && window.parent !== window) window.parent.postMessage(message, '*');
    }

    sendHostMessage({
      jsonrpc: '2.0',
      id: initId,
      method: 'ui/initialize',
      params: {appCapabilities: {availableDisplayModes: ['inline', 'fullscreen']}},
    });

    function escapeHtml(value) {
      return String(value ?? '').replace(/[&<>"']/g, function (char) {
        return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'}[char];
      });
    }

    function displayLabel(value) {
      return String(value || '').replaceAll('_', ' ').replace(/\\b\\w/g, function (letter) { return letter.toUpperCase(); });
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
          return [reference.label, reference.uri, reference.locator].filter(Boolean).join(' ');
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

    function renderEdges(graph) {
      const svgParts = [
        '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M 0 0 L 8 4 L 0 8 z" fill="var(--edge)"></path></marker></defs>',
      ];
      graph.edges.forEach(function (edge) {
        const related = selectedNodeId && (edge.from === selectedNodeId || edge.to === selectedNodeId);
        const muted = selectedNodeId && !related;
        const from = nodeById(edge.from);
        const to = nodeById(edge.to);
        const typeContext = highlightedKinds.size > 0 &&
          !highlightedKinds.has(from?.kind) && !highlightedKinds.has(to?.kind);
        const label = displayLabel(edge.relation);
        const labelWidth = Math.max(54, label.length * 7 + 16);
        const geometry = edgeGeometry(edge);
        svgParts.push(
          '<g class="edge-group' + (related ? ' is-related' : '') + (muted ? ' is-muted' : '') + (typeContext ? ' is-type-context' : '') + '">' +
            '<path class="edge-path" d="' + geometry.path + '"></path>' +
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

      nodesElement.innerHTML = graph.nodes.map(function (node) {
        const position = nodePosition(node);
        const selected = selectedNodeId === node.id ? ' is-selected' : '';
        const relationshipState = !selectedNodeId || selected
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
        return '<article class="node ' + escapeHtml(node.kind) + selected + relationshipState + typeState + uncertaintyClass + '" tabindex="0" data-node-id="' + escapeHtml(node.id) + '" data-origin="' + escapeHtml(node.origin) + '" aria-label="Select node: ' + escapeHtml(node.title) + '" style="left:' + position.x + 'px;top:' + position.y + 'px">' +
          '<div class="node-header"><span class="kind-label">' + escapeHtml(displayLabel(node.kind)) + '</span>' + confidenceBadge(node) + '<span class="origin-label origin-' + escapeHtml(node.origin) + '">' + escapeHtml(displayLabel(node.origin)) + '</span></div>' +
          '<div class="node-copy"><h2>' + escapeHtml(node.title) + '</h2><p>' + escapeHtml(node.body) + '</p>' + firstUncertainty + '</div>' +
          '<div class="node-footer">' + references + '<button class="node-details-button" type="button" data-details-id="' + escapeHtml(node.id) + '">Details<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button></div>' +
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
      const scale = Math.min(1, (rect.width - 32) / bounds.width, (rect.height - 32) / bounds.height);
      transform.scale = Math.max(MIN_ZOOM, scale);
      transform.x = (rect.width - bounds.width * transform.scale) / 2 - bounds.x * transform.scale;
      transform.y = (rect.height - bounds.height * transform.scale) / 2 - bounds.y * transform.scale;
      applyTransform();
    }

    function fittedScale(nodes) {
      const bounds = graphBounds(nodes);
      const rect = canvas.getBoundingClientRect();
      return Math.min(1, (rect.width - 32) / bounds.width, (rect.height - 32) / bounds.height);
    }

    function overviewAnchor(nodes) {
      const ids = new Set(nodes.map(function (node) { return node.id; }));
      const incoming = new Map(nodes.map(function (node) { return [node.id, 0]; }));
      const degree = new Map(nodes.map(function (node) { return [node.id, 0]; }));
      (snapshot?.edges || []).forEach(function (edge) {
        if (!ids.has(edge.from) || !ids.has(edge.to)) return;
        incoming.set(edge.to, (incoming.get(edge.to) || 0) + 1);
        degree.set(edge.from, (degree.get(edge.from) || 0) + 1);
        degree.set(edge.to, (degree.get(edge.to) || 0) + 1);
      });
      return [...nodes].sort(function (left, right) {
        const leftScore = (degree.get(left.id) || 0) * 10 + (incoming.get(left.id) === 0 ? 2 : 0);
        const rightScore = (degree.get(right.id) || 0) * 10 + (incoming.get(right.id) === 0 ? 2 : 0);
        return rightScore - leftScore;
      })[0] || nodes[0];
    }

    function centerReadable(node, scale) {
      const rect = canvas.getBoundingClientRect();
      const position = nodePosition(node);
      transform.scale = scale;
      transform.x = rect.width * (rect.width <= VERTICAL_GRAPH_BREAKPOINT ? .5 : .34) - (position.x + NODE_WIDTH / 2) * scale;
      transform.y = rect.height * .48 - (position.y + NODE_HEIGHT / 2) * scale;
      applyTransform();
    }

    function readableOverview(nodes) {
      const rect = canvas.getBoundingClientRect();
      const scale = rect.width <= VERTICAL_GRAPH_BREAKPOINT ? MIN_READABLE_ZOOM : .74;
      centerReadable(overviewAnchor(nodes), scale);
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

    function resetView() {
      if (!snapshot) return;
      focusLayer.hidden = true;
      detailNodeId = null;
      selectedNodeId = null;
      nodePositions = globalPositions();
      updateMeta();
      renderGraph();
      requestAnimationFrame(initialView);
    }

    function setZoom(nextScale, anchorX, anchorY) {
      const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextScale));
      const ratio = scale / transform.scale;
      transform.x = anchorX - (anchorX - transform.x) * ratio;
      transform.y = anchorY - (anchorY - transform.y) * ratio;
      transform.scale = scale;
      applyTransform();
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

    function renderFocus(node) {
      detailNodeId = node.id;
      focusCard.className = 'focus-card ' + node.kind;
      document.getElementById('focus-kind').textContent = displayLabel(node.kind);
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
        return '<li><span>' + (outgoing ? 'Outgoing' : 'Incoming') + '</span><strong>' + escapeHtml(displayLabel(edge.relation)) + '</strong><span>' + escapeHtml(neighbor?.title || (outgoing ? edge.to : edge.from)) + '</span></li>';
      }).join('');

      const references = node.references || [];
      const referenceSection = document.getElementById('reference-section');
      referenceSection.hidden = references.length === 0;
      document.getElementById('reference-list').innerHTML = references.map(function (reference, index) {
        const open = reference.uri && typeof window.openai?.openExternal === 'function'
          ? '<button class="reference-link" type="button" data-reference-index="' + index + '">Open</button>'
          : '';
        return '<div class="reference-row"><span><strong>' + escapeHtml(reference.label) + '</strong>' +
          (reference.locator ? '<code>' + escapeHtml(reference.locator) + '</code>' : '') + '</span>' + open + '</div>';
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
      focusLayer.hidden = false;
      document.getElementById('close-focus').focus();
    }

    function closeFocus() {
      focusLayer.hidden = true;
      detailNodeId = null;
    }

    function selectNode(node) {
      focusLayer.hidden = true;
      detailNodeId = null;
      selectedNodeId = selectedNodeId === node.id ? null : node.id;
      updateMeta();
      renderGraph();
    }

    function followUpPrompt(action, node) {
      const references = (node.references || []).map(function (reference) {
        const location = reference.uri || reference.locator || 'No location provided';
        return '- ' + reference.label + ': ' + location;
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
          '<i></i><span>' + escapeHtml(displayLabel(kind)) + '</span><small>' + counts.get(kind) + '</small>' +
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
      detailNodeId = null;
      highlightedKinds = new Set();
      nodePositions = globalPositions();
      titleElement.textContent = nextSnapshot.title || 'Work Map';
      roleElement.textContent = displayLabel(nextSnapshot.authorRole || 'agent');
      roleElement.className = 'role-badge origin-' + (nextSnapshot.authorRole || 'agent');
      updateMeta();
      renderFilters();
      renderGraph();
      requestAnimationFrame(initialView);
      window.openai?.notifyIntrinsicHeight?.();
    }

    function refreshGraph() {
      focusLayer.hidden = true;
      detailNodeId = null;
      selectedNodeId = null;
      nodePositions = globalPositions();
      updateMeta();
      renderGraph();
      requestAnimationFrame(fitView);
    }

    nodesElement.addEventListener('click', function (event) {
      const detailsButton = event.target.closest('[data-details-id]');
      if (detailsButton) {
        const detailNode = nodeById(detailsButton.getAttribute('data-details-id'));
        if (detailNode) renderFocus(detailNode);
        return;
      }
      const element = event.target.closest('[data-node-id]');
      if (!element) return;
      const node = nodeById(element.getAttribute('data-node-id'));
      if (node) selectNode(node);
    });

    nodesElement.addEventListener('keydown', function (event) {
      if (event.target.closest('[data-details-id]')) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const element = event.target.closest('[data-node-id]');
      if (!element) return;
      event.preventDefault();
      const node = nodeById(element.getAttribute('data-node-id'));
      if (node) selectNode(node);
    });

    focusLayer.addEventListener('click', function (event) {
      if (event.target === focusLayer) closeFocus();
      const referenceButton = event.target.closest('[data-reference-index]');
      if (referenceButton && detailNodeId) {
        const reference = nodeById(detailNodeId)?.references?.[Number(referenceButton.getAttribute('data-reference-index'))];
        if (reference?.uri && typeof window.openai?.openExternal === 'function') {
          window.openai.openExternal({href: reference.uri, redirectUrl: false});
        }
      }
      const actionButton = event.target.closest('[data-action]');
      if (actionButton && detailNodeId && typeof window.openai?.sendFollowUpMessage === 'function') {
        const node = nodeById(detailNodeId);
        if (node) window.openai.sendFollowUpMessage({prompt: followUpPrompt(actionButton.getAttribute('data-action'), node), scrollToBottom: true});
      }
    });

    document.getElementById('close-focus').addEventListener('click', closeFocus);
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (!typeFilterMenu.hidden) {
        setTypeMenuOpen(false);
        typeFilterTrigger.focus();
        return;
      }
      if (!focusLayer.hidden) closeFocus();
      else if (selectedNodeId) {
        selectedNodeId = null;
        updateMeta();
        renderGraph();
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
    document.getElementById('reset-view').addEventListener('click', resetView);
    document.getElementById('zoom-in').addEventListener('click', function () {
      const rect = canvas.getBoundingClientRect();
      setZoom(transform.scale * 1.18, rect.width / 2, rect.height / 2);
    });
    document.getElementById('zoom-out').addEventListener('click', function () {
      const rect = canvas.getBoundingClientRect();
      setZoom(transform.scale / 1.18, rect.width / 2, rect.height / 2);
    });

    canvas.addEventListener('wheel', function (event) {
      if (!focusLayer.hidden || event.target.closest('.minimap')) return;
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      setZoom(transform.scale * (event.deltaY < 0 ? 1.08 : .92), event.clientX - rect.left, event.clientY - rect.top);
    }, {passive: false});

    canvas.addEventListener('pointerdown', function (event) {
      if (!focusLayer.hidden || event.target.closest('.node, .viewport-actions, .minimap')) return;
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

    window.addEventListener('resize', initialView);

    function renderFromOpenAiBridge() {
      const bridge = window.openai;
      if (!bridge) return;
      const found = findSnapshot(bridge.toolOutput) || findSnapshot(bridge.toolResponseMetadata) || findSnapshot(bridge);
      if (found) render(found);
    }

    window.addEventListener('message', function (event) {
      if (event.data?.id === initId && event.data?.result) {
        sendHostMessage({jsonrpc: '2.0', method: 'ui/notifications/initialized', params: {}});
      }
      const found = findSnapshot(event.data);
      if (found) render(found);
    });
    window.addEventListener('openai:set_globals', function (event) {
      const found = findSnapshot(event.detail);
      if (found) render(found);
      renderFromOpenAiBridge();
    });
    if (window.__PLAY_AGENT_WORK_MAP__) render(window.__PLAY_AGENT_WORK_MAP__);
    renderFromOpenAiBridge();
  </script>
</body>
</html>`;
}
