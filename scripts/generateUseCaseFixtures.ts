import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {workMapAppHtml} from '../server/mcpAppHtml';
import {handleMcpRequest} from '../server/mcpProtocol';
import type {PresentWorkMapInput, PresentWorkMapResult} from '../src/types';

const {values} = parseArgs({
  options: {
    output: {type: 'string', short: 'o'},
  },
});

const outputDirectory = path.resolve(values.output ?? 'dist/pages');
const useCaseDirectory = path.join(outputDirectory, 'use-cases');

const useCases: Array<{slug: string; prompt: string; description: string; input: PresentWorkMapInput}> = [
  {
    slug: 'independent-review-map',
    prompt:
      'Independently review Play Agent 0.1.5. Map the evidence, decisions, unresolved risks, open questions, and next validation work.',
    description: 'Separate verified findings, residual uncertainty, and reviewer-to-implementer follow-up.',
    input: {
      title: 'Independent review of Play Agent 0.1.5',
      authorRole: 'reviewer',
      reviewOf: 'Play Agent v0.1.5 release',
      entryNodeId: 'claim-ready',
      nodes: [
        {
          id: 'evidence-tests',
          kind: 'evidence',
          title: 'All automated checks pass',
          body: 'The release passes protocol, graph, evaluation, palette, and build checks.',
          references: [{path: 'src/workMap.test.ts', line: 188}],
        },
        {
          id: 'evidence-boundary',
          kind: 'evidence',
          title: 'The MCP server remains stateless',
          body: 'The server validates and renders explicit graphs without session storage.',
          references: [{path: 'AGENTS.md', line: 8}],
        },
        {
          id: 'claim-ready',
          kind: 'claim',
          title: 'The release is internally coherent',
          body: 'Its implementation, contract, and documented product boundary agree.',
          confidence: 'high',
          confidenceBasis: 'The implementation and automated checks match the stated MCP-only architecture.',
        },
        {
          id: 'decision-native',
          kind: 'decision',
          title: 'Use only host-native fullscreen',
          body: 'Fullscreen remains capability-gated instead of being simulated.',
          origin: 'implementer',
        },
        {
          id: 'risk-host',
          kind: 'risk',
          title: 'Host behavior can still vary',
          body: 'A compliant MCP App may render differently across Codex host versions.',
        },
        {
          id: 'question-fullscreen',
          kind: 'question',
          title: 'Does fullscreen preserve context in every target host?',
          body: 'This requires host-level interaction testing beyond protocol tests.',
        },
        {
          id: 'work-validate',
          kind: 'kanban_card',
          title: 'Validate fullscreen in the current Codex host',
          body: 'Exercise inline, fullscreen, and return transitions as a tracked release check.',
        },
        {
          id: 'lesson-review',
          kind: 'lesson',
          title: 'Independent review should expose residual uncertainty',
          body: 'Passing tests should not hide behavior that only the host can verify.',
          confidence: 'high',
          confidenceBasis: 'The remaining uncertainty is isolated to an explicit host-level check.',
        },
      ],
      edges: [
        {from: 'evidence-tests', to: 'claim-ready', relation: 'supports'},
        {from: 'evidence-boundary', to: 'claim-ready', relation: 'supports'},
        {from: 'decision-native', to: 'claim-ready', relation: 'informs'},
        {from: 'risk-host', to: 'claim-ready', relation: 'contradicts'},
        {from: 'question-fullscreen', to: 'risk-host', relation: 'informs'},
        {from: 'work-validate', to: 'question-fullscreen', relation: 'resolves'},
        {from: 'claim-ready', to: 'lesson-review', relation: 'leads_to'},
      ],
    },
  },
  {
    slug: 'delivery-dependency-map',
    prompt:
      'Turn the Portfolio API beta plan into a work map. Show the committed delivery cards, dependencies, blocking risks, evidence, and unresolved questions.',
    description: 'Inspect a delivery plan without flattening tracked work, recommendations, and blockers into one list.',
    input: {
      title: 'Portfolio API beta delivery plan',
      authorRole: 'agent',
      entryNodeId: 'decision-scope',
      nodes: [
        {
          id: 'decision-scope',
          kind: 'decision',
          title: 'Ship read-only portfolio aggregation first',
          body: 'Trading and order execution remain outside the beta scope.',
        },
        {
          id: 'evidence-demand',
          kind: 'evidence',
          title: 'Partners need one normalized portfolio response',
          body: 'Current integrations assemble balances and prices independently.',
          references: [{locator: 'Partner discovery notes, portfolio API section'}],
        },
        {
          id: 'card-contract',
          kind: 'kanban_card',
          title: 'Freeze the portfolio response contract',
          body: 'Define assets, balances, valuation timestamps, sources, and error semantics.',
        },
        {
          id: 'card-reconcile',
          kind: 'kanban_card',
          title: 'Implement multi-source reconciliation',
          body: 'Normalize provider results and expose explicit disagreement.',
        },
        {
          id: 'card-cache',
          kind: 'kanban_card',
          title: 'Add bounded caching and freshness metadata',
          body: 'Keep latency predictable without hiding source age.',
        },
        {
          id: 'card-beta',
          kind: 'kanban_card',
          title: 'Release the partner beta',
          body: 'Publish documentation, credentials, limits, and observability.',
        },
        {
          id: 'risk-stale',
          kind: 'risk',
          title: 'Cached valuations may appear current',
          body: 'Consumers may confuse response time with market-data freshness.',
        },
        {
          id: 'question-sla',
          kind: 'question',
          title: 'What freshness SLA should the beta promise?',
          body: 'The answer changes cache policy and partner expectations.',
        },
        {
          id: 'action-interview',
          kind: 'action',
          title: 'Confirm acceptable freshness with two partners',
          body: 'This recommendation is not yet a committed delivery card.',
        },
      ],
      edges: [
        {from: 'evidence-demand', to: 'decision-scope', relation: 'supports'},
        {from: 'decision-scope', to: 'card-contract', relation: 'leads_to'},
        {from: 'decision-scope', to: 'card-reconcile', relation: 'leads_to'},
        {from: 'decision-scope', to: 'card-cache', relation: 'leads_to'},
        {from: 'card-beta', to: 'card-contract', relation: 'depends_on'},
        {from: 'card-beta', to: 'card-reconcile', relation: 'depends_on'},
        {from: 'card-beta', to: 'card-cache', relation: 'depends_on'},
        {from: 'risk-stale', to: 'card-beta', relation: 'blocks'},
        {from: 'question-sla', to: 'risk-stale', relation: 'informs'},
        {from: 'action-interview', to: 'question-sla', relation: 'resolves'},
      ],
    },
  },
  {
    slug: 'container-architecture-review',
    prompt:
      'Review the Portfolio platform at C4 container level. Map the containers, dependencies, architectural decision, supporting evidence, risks, and open questions.',
    description: 'Keep architecture elements connected to the decisions and risks that explain them.',
    input: {
      title: 'Portfolio platform container-level architecture review',
      authorRole: 'agent',
      entryNodeId: 'decision-separate',
      nodes: [
        {
          id: 'container-web',
          kind: 'c4_container',
          title: 'Partner Console',
          body: 'Browser application used to inspect portfolios and integration health.',
        },
        {
          id: 'container-api',
          kind: 'c4_container',
          title: 'Portfolio API',
          body: 'Public HTTPS service that authenticates requests and returns normalized portfolios.',
        },
        {
          id: 'container-worker',
          kind: 'c4_container',
          title: 'Reconciliation Worker',
          body: 'Background service that compares provider responses and records disagreements.',
        },
        {
          id: 'container-db',
          kind: 'c4_container',
          title: 'Portfolio Database',
          body: 'PostgreSQL store for normalized snapshots, provenance, and reconciliation results.',
        },
        {
          id: 'container-cache',
          kind: 'c4_container',
          title: 'Market Data Cache',
          body: 'Redis store for bounded-lifetime prices and token metadata.',
        },
        {
          id: 'decision-separate',
          kind: 'decision',
          title: 'Separate request serving from reconciliation',
          body: 'Slow provider comparison should not sit on the synchronous API path.',
        },
        {
          id: 'evidence-latency',
          kind: 'evidence',
          title: 'Partner traffic requires predictable API latency',
          body: 'The current service target is a median response time below 87 ms.',
          references: [{locator: 'Dataline Data product benchmark'}],
        },
        {
          id: 'risk-cache',
          kind: 'risk',
          title: 'Cache freshness can diverge from portfolio snapshots',
          body: 'The API needs timestamps for both valuation inputs and persisted balances.',
        },
        {
          id: 'question-events',
          kind: 'question',
          title: 'How are snapshot invalidations delivered?',
          body: 'The container boundary needs an explicit event or polling contract.',
        },
      ],
      edges: [
        {from: 'container-web', to: 'container-api', relation: 'depends_on'},
        {from: 'container-api', to: 'container-db', relation: 'depends_on'},
        {from: 'container-api', to: 'container-cache', relation: 'depends_on'},
        {from: 'container-worker', to: 'container-db', relation: 'depends_on'},
        {from: 'container-worker', to: 'container-cache', relation: 'depends_on'},
        {from: 'evidence-latency', to: 'decision-separate', relation: 'supports'},
        {from: 'decision-separate', to: 'container-worker', relation: 'leads_to'},
        {from: 'risk-cache', to: 'container-api', relation: 'blocks'},
        {from: 'question-events', to: 'risk-cache', relation: 'informs'},
      ],
    },
  },
];

function fixtureHtml(snapshot: PresentWorkMapResult['snapshot']) {
  const bridge = `<script>
    window.openai = {
      displayMode: 'fullscreen',
      toolOutput: ${JSON.stringify({snapshot})},
      notifyIntrinsicHeight: function () {},
    };
  </script>`;
  return workMapAppHtml().replace('<body>', `<body>${bridge}`);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function indexHtml() {
  const cases = useCases
    .map(
      (useCase) => `
        <article>
          <p class="eyebrow">Interactive Work Map</p>
          <h2>${escapeHtml(useCase.input.title)}</h2>
          <p>${escapeHtml(useCase.description)}</p>
          <pre>${escapeHtml(useCase.prompt)}</pre>
          <a href="./use-cases/${encodeURIComponent(useCase.slug)}.html">Open map <span aria-hidden="true">&rarr;</span></a>
        </article>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Interactive examples of Play Agent Work Maps rendered with the production MCP App UI.">
    <title>Play Agent Use Cases</title>
    <style>
      :root { color-scheme: light dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      * { box-sizing: border-box; }
      body { margin: 0; background: Canvas; color: CanvasText; }
      main { width: min(70rem, calc(100% - 2rem)); margin: 0 auto; padding: clamp(3rem, 8vw, 7rem) 0; }
      header { max-width: 46rem; margin-bottom: 3rem; }
      h1 { margin: 0 0 0.75rem; font-size: clamp(2.25rem, 7vw, 4.75rem); line-height: 1; letter-spacing: 0; }
      header p { color: GrayText; font-size: 1.125rem; line-height: 1.6; }
      section { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr)); gap: 1rem; }
      article { border: 1px solid color-mix(in srgb, CanvasText 18%, transparent); border-radius: 8px; padding: 1.25rem; }
      .eyebrow { margin: 0 0 0.75rem; color: GrayText; font-size: 0.75rem; text-transform: uppercase; }
      h2 { margin: 0; font-size: 1.125rem; }
      article > p:not(.eyebrow) { min-height: 4.5rem; color: GrayText; line-height: 1.5; }
      pre { min-height: 8rem; margin: 1rem 0; padding: 0.875rem; overflow: auto; border-radius: 6px; background: color-mix(in srgb, CanvasText 6%, Canvas); white-space: pre-wrap; font: 0.8125rem/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
      a { color: CanvasText; font-weight: 600; text-underline-offset: 0.2em; }
      footer { margin-top: 2.5rem; color: GrayText; font-size: 0.875rem; }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>Play Agent Use Cases</h1>
        <p>Representative Work Maps rendered with the same UI as the Play Agent MCP App. These static examples support map inspection; Codex actions and host display modes require the installed plugin.</p>
      </header>
      <section>${cases}</section>
      <footer><a href="https://github.com/oi-xyz/play-agent">View Play Agent on GitHub</a></footer>
    </main>
  </body>
</html>`;
}

await mkdir(useCaseDirectory, {recursive: true});
await writeFile(path.join(outputDirectory, 'index.html'), indexHtml());
await writeFile(path.join(outputDirectory, '.nojekyll'), '');

for (const [index, useCase] of useCases.entries()) {
  const response = await handleMcpRequest({
    jsonrpc: '2.0',
    id: index + 1,
    method: 'tools/call',
    params: {name: 'present_work_map', arguments: useCase.input},
  });
  if (!response || !('result' in response)) {
    throw new Error(`Failed to render ${useCase.slug}`);
  }
  const result = response.result as {structuredContent: PresentWorkMapResult};
  await writeFile(path.join(useCaseDirectory, `${useCase.slug}.html`), fixtureHtml(result.structuredContent.snapshot));
}

console.log(`Generated ${useCases.length} use cases in ${outputDirectory}`);
