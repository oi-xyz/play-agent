import assert from 'node:assert/strict';
import {test} from 'node:test';
import {WORK_MAP_APP_RESOURCE_URI} from './mcpAppHtml';
import {handleMcpRequest, presentWorkMapInputSchema} from './mcpProtocol';

const validArguments = {
  title: 'MCP App direction',
  authorRole: 'reviewer',
  reviewOf: 'implementation-checkpoint-7',
  entryNodeId: 'decision-inline-map',
  nodes: [
    {
      id: 'evidence-mcp-ui',
      kind: 'evidence',
      title: 'MCP Apps preload UI resources',
      references: [{label: 'Apps SDK reference', uri: 'https://developers.openai.com/apps-sdk/reference'}],
    },
    {id: 'decision-inline-map', kind: 'decision', title: 'Render the Work Map inline', origin: 'implementer'},
    {id: 'action-connect-codex', kind: 'action', title: 'Connect Codex to present_work_map'},
  ],
  edges: [
    {from: 'evidence-mcp-ui', to: 'decision-inline-map', relation: 'supports'},
    {from: 'decision-inline-map', to: 'action-connect-codex', relation: 'leads_to'},
  ],
};

test('tools/list exposes only the stateless present_work_map tool', async () => {
  const response = await handleMcpRequest({jsonrpc: '2.0', id: 1, method: 'tools/list'});
  assert.ok(response && 'result' in response);
  const result = response && 'result' in response
    ? (response.result as {tools: Array<{name: string; annotations: unknown; inputSchema: {required: string[]}; _meta: Record<string, unknown>}>})
    : null;

  assert.deepEqual(result?.tools.map((tool) => tool.name), ['present_work_map']);
  const tool = result?.tools[0];
  assert.deepEqual(tool?.annotations, {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  });
  assert.deepEqual(tool?.inputSchema.required, ['title', 'authorRole', 'entryNodeId', 'nodes', 'edges']);
  assert.deepEqual(tool?._meta.ui, {resourceUri: WORK_MAP_APP_RESOURCE_URI, visibility: ['model', 'app']});
  assert.equal(tool?._meta['openai/outputTemplate'], WORK_MAP_APP_RESOURCE_URI);
});

test('present_work_map returns provenance, references, layout, and render metadata', async () => {
  const response = await handleMcpRequest({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {name: 'present_work_map', arguments: validArguments},
  });

  assert.ok(response && 'result' in response);
  const result = response && 'result' in response
    ? (response.result as {structuredContent: {snapshot: {entryNodeId: string; nodes: Array<{origin: string; references: unknown[]}>; layout: {width: number}}; renderHint: {appResourceUri: string}}})
    : null;
  assert.equal(result?.structuredContent.renderHint.appResourceUri, WORK_MAP_APP_RESOURCE_URI);
  assert.equal(result?.structuredContent.snapshot.entryNodeId, 'decision-inline-map');
  assert.equal(result?.structuredContent.snapshot.nodes.length, 3);
  assert.equal(result?.structuredContent.snapshot.nodes[0].origin, 'reviewer');
  assert.equal(result?.structuredContent.snapshot.nodes[1].origin, 'implementer');
  assert.equal(result?.structuredContent.snapshot.nodes[0].references.length, 1);
  assert.ok((result?.structuredContent.snapshot.layout.width ?? 0) > 0);
});

test('present_work_map accepts structured workspace file references without a display label', async () => {
  const response = await handleMcpRequest({
    jsonrpc: '2.0',
    id: 20,
    method: 'tools/call',
    params: {
      name: 'present_work_map',
      arguments: {
        title: 'Reference contract',
        authorRole: 'agent',
        entryNodeId: 'evidence-schema',
        nodes: [
          {
            id: 'evidence-schema',
            kind: 'evidence',
            title: 'The schema defines file references',
            references: [{path: 'server/mcpProtocol.ts', line: 30}],
          },
        ],
        edges: [],
      },
    },
  });

  assert.ok(response && 'result' in response);
  const result = response && 'result' in response
    ? (response.result as {structuredContent: {snapshot: {nodes: Array<{references: unknown[]}>}}})
    : null;
  assert.deepEqual(result?.structuredContent.snapshot.nodes[0].references, [
    {path: 'server/mcpProtocol.ts', line: 30},
  ]);
});

test('present_work_map rejects legacy, dangling, and disconnected graphs', async () => {
  const legacyResponse = await handleMcpRequest({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'present_work_map',
      arguments: {title: 'Legacy', summary: 'Old shape', nodes: [], edges: []},
    },
  });
  assert.equal(legacyResponse && 'error' in legacyResponse ? legacyResponse.error.code : null, -32602);

  const invalidResponse = await handleMcpRequest({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'present_work_map',
      arguments: {
        title: 'Invalid graph',
        authorRole: 'agent',
        entryNodeId: 'decision-1',
        nodes: [
          {id: 'decision-1', kind: 'decision', title: 'Decision'},
          {id: 'action-1', kind: 'action', title: 'Action'},
        ],
        edges: [{from: 'decision-1', to: 'missing-node', relation: 'leads_to'}],
      },
    },
  });
  assert.equal(invalidResponse && 'error' in invalidResponse ? invalidResponse.error.code : null, -32602);
});

test('graph validation rejects duplicate nodes, duplicate edges, self-links, and unverifiable references', () => {
  const result = presentWorkMapInputSchema.safeParse({
    title: 'Invalid relationships',
    authorRole: 'agent',
    entryNodeId: 'same-id',
    nodes: [
      {id: 'same-id', kind: 'evidence', title: 'First', references: [{label: 'Missing location'}]},
      {id: 'same-id', kind: 'decision', title: 'Duplicate'},
    ],
    edges: [
      {from: 'same-id', to: 'same-id', relation: 'supports'},
      {from: 'same-id', to: 'same-id', relation: 'supports'},
    ],
  });

  assert.equal(result.success, false);
  if (!result.success) {
    const messages = result.error.issues.map((issue) => issue.message);
    assert.equal(messages.some((message) => message.includes('reference must include')), true);
    assert.equal(messages.some((message) => message.includes('Duplicate node ID')), true);
    assert.equal(messages.some((message) => message.includes('Self-referencing')), true);
    assert.equal(messages.some((message) => message.includes('Duplicate relationship')), true);
  }
});

test('graph validation rejects an entry node that is not in the map', () => {
  const result = presentWorkMapInputSchema.safeParse({
    title: 'Missing reading entry',
    authorRole: 'agent',
    entryNodeId: 'missing-node',
    nodes: [{id: 'decision-1', kind: 'decision', title: 'Use an explicit entry'}],
    edges: [],
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error.issues.some((issue) => issue.path.join('.') === 'entryNodeId'), true);
    assert.equal(result.error.issues.some((issue) => issue.message === 'Unknown entry node: missing-node'), true);
  }
});

test('reference validation requires exactly one location form and binds line to path', () => {
  const multipleLocations = presentWorkMapInputSchema.safeParse({
    title: 'Ambiguous reference',
    authorRole: 'agent',
    entryNodeId: 'evidence-1',
    nodes: [
      {
        id: 'evidence-1',
        kind: 'evidence',
        title: 'Ambiguous source',
        references: [{path: 'src/workMap.ts', uri: 'https://example.com'}],
      },
    ],
    edges: [],
  });
  assert.equal(multipleLocations.success, false);

  const detachedLine = presentWorkMapInputSchema.safeParse({
    title: 'Detached line',
    authorRole: 'agent',
    entryNodeId: 'evidence-1',
    nodes: [
      {
        id: 'evidence-1',
        kind: 'evidence',
        title: 'Invalid line',
        references: [{locator: 'section 2', line: 42}],
      },
    ],
    edges: [],
  });
  assert.equal(detachedLine.success, false);
  if (!detachedLine.success) {
    assert.equal(detachedLine.error.issues.some((issue) => issue.path.at(-1) === 'line'), true);
  }
});

test('invalid tool calls return indexed validation issues', async () => {
  const response = await handleMcpRequest({
    jsonrpc: '2.0',
    id: 21,
    method: 'tools/call',
    params: {
      name: 'present_work_map',
      arguments: {
        title: 'Invalid reference',
        authorRole: 'agent',
        entryNodeId: 'evidence-1',
        nodes: [{id: 'evidence-1', kind: 'evidence', title: 'Missing source', references: [{line: 12}]}],
        edges: [],
      },
    },
  });

  assert.ok(response && 'error' in response);
  const issues = response && 'error' in response
    ? (response.error.data as {issues: Array<{path: string; message: string}>}).issues
    : [];
  assert.equal(issues.some((issue) => issue.path === 'nodes.0.references.0'), true);
  assert.equal(issues.some((issue) => issue.path === 'nodes.0.references.0.line'), true);
});

test('graph validation caps inline maps at 24 nodes and 48 relationships', () => {
  const nodes = Array.from({length: 25}, (_, index) => ({
    id: `node-${index + 1}`,
    kind: 'claim',
    title: `Node ${index + 1}`,
  }));
  const edges = nodes.slice(1).map((node, index) => ({
    from: nodes[index].id,
    to: node.id,
    relation: 'leads_to',
  }));
  assert.equal(
    presentWorkMapInputSchema.safeParse({title: 'Too large', authorRole: 'agent', entryNodeId: 'node-1', nodes, edges}).success,
    false,
  );
});

test('confidence is required only for inferential nodes and uncertainty is explicit below high confidence', () => {
  const missingConfidence = presentWorkMapInputSchema.safeParse({
    title: 'Missing confidence',
    authorRole: 'agent',
    entryNodeId: 'claim-1',
    nodes: [{id: 'claim-1', kind: 'claim', title: 'A claim'}],
    edges: [],
  });
  assert.equal(missingConfidence.success, false);

  const missingUncertainty = presentWorkMapInputSchema.safeParse({
    title: 'Missing uncertainty reason',
    authorRole: 'agent',
    entryNodeId: 'assumption-1',
    nodes: [
      {
        id: 'assumption-1',
        kind: 'assumption',
        title: 'Users understand the graph',
        confidence: 'medium',
        confidenceBasis: 'Only internal testing exists.',
      },
    ],
    edges: [],
  });
  assert.equal(missingUncertainty.success, false);

  const misplacedConfidence = presentWorkMapInputSchema.safeParse({
    title: 'Misplaced confidence',
    authorRole: 'agent',
    entryNodeId: 'decision-1',
    nodes: [
      {
        id: 'decision-1',
        kind: 'decision',
        title: 'Ship the study',
        confidence: 'high',
        confidenceBasis: 'Approved by the user.',
      },
    ],
    edges: [],
  });
  assert.equal(misplacedConfidence.success, false);

  const valid = presentWorkMapInputSchema.safeParse({
    title: 'Explicit uncertainty',
    authorRole: 'agent',
    entryNodeId: 'lesson-1',
    nodes: [
      {
        id: 'lesson-1',
        kind: 'lesson',
        title: 'Readable defaults matter more than fit-all',
        confidence: 'low',
        confidenceBasis: 'One screenshot exposed the issue.',
        uncertaintyReasons: ['The redesigned viewport has not been tested with users.'],
      },
    ],
    edges: [],
  });
  assert.equal(valid.success, true);
});

test('specialized Kanban and C4 nodes are accepted without confidence metadata', () => {
  const result = presentWorkMapInputSchema.safeParse({
    title: 'Delivery architecture',
    authorRole: 'agent',
    entryNodeId: 'work-release-api',
    nodes: [
      {
        id: 'work-release-api',
        kind: 'kanban_card',
        title: 'Release the portfolio API',
        body: 'A tracked, independently actionable delivery item.',
      },
      {
        id: 'container-portfolio-api',
        kind: 'c4_container',
        title: 'Portfolio API',
        body: 'A deployable service in the C4 container view.',
      },
    ],
    edges: [{from: 'work-release-api', to: 'container-portfolio-api', relation: 'depends_on'}],
  });

  assert.equal(result.success, true);
});

test('resources/read returns the focused Work Map app HTML', async () => {
  const response = await handleMcpRequest({
    jsonrpc: '2.0',
    id: 5,
    method: 'resources/read',
    params: {uri: WORK_MAP_APP_RESOURCE_URI},
  });
  assert.ok(response && 'result' in response);
  const result = response && 'result' in response
    ? (response.result as {contents: Array<{text: string; mimeType: string}>})
    : null;
  const html = result?.contents[0]?.text ?? '';

  assert.equal(result?.contents[0]?.mimeType, 'text/html;profile=mcp-app');
  assert.match(html, /Play Agent Work Map/);
  assert.match(html, /window\.openai/);
  assert.match(html, /openai:set_globals/);
  assert.match(html, /sendFollowUpMessage/);
  assert.match(html, /protocolVersion: '2026-01-26'/);
  assert.match(html, /appInfo: \{name: 'play-agent-work-map'/);
  assert.match(html, /availableDisplayModes: \['inline', 'fullscreen'\]/);
  assert.doesNotMatch(html, /id="pip-mode"/);
  assert.doesNotMatch(html, /data-display-mode="pip"/);
  assert.doesNotMatch(html, /picture-in-picture/i);
  assert.match(html, /id="fullscreen-mode"/);
  assert.match(html, /requestDisplayMode\(\{mode: nextMode\}\)/);
  assert.match(html, /typeof bridge\?\.requestDisplayMode === 'function'/);
  assert.match(html, /hostContext\.availableDisplayModes\.includes\(mode\)/);
  assert.match(html, /mergeHostContext\(event\.data\.result\.hostContext\)/);
  assert.match(html, /ui\/notifications\/host-context-changed/);
  assert.match(html, /mergeHostContext\(\{displayMode: grantedMode\}\)/);
  assert.match(html, /id="display-mode-status"/);
  assert.match(html, /data-display-mode="fullscreen"/);
  assert.match(html, /\.icon-button\[hidden\][\s\S]*?display: none/);
  assert.match(html, /currentDisplayMode === 'inline'\) initialView\(\)/);
  assert.match(html, /currentDisplayMode === 'fullscreen' \? 'inline' : 'fullscreen'/);
  assert.match(html, /data-fullscreen-icon="exit"[\s\S]*?M14 10h7V3/);
  assert.match(html, /html\[data-display-mode="fullscreen"\] \.work-map \{[\s\S]*?height: 100vh/);
  assert.doesNotMatch(html, /host-container-height/);
  assert.doesNotMatch(html, /syncHostContainerHeight/);
  assert.doesNotMatch(html, /containerDimensions/);
  assert.doesNotMatch(html, /visualViewport/);
  assert.match(html, /function notifyInlineHeight\(\) \{[\s\S]*?currentDisplayMode !== 'inline'[\s\S]*?notifyIntrinsicHeight/);
  assert.match(html, /requestAnimationFrame\(initialView\);\s+notifyInlineHeight\(\)/);
  assert.match(html, /const canvasResizeObserver = new ResizeObserver\(scheduleViewForCanvasSize\)/);
  assert.match(html, /canvasResizeObserver\.observe\(canvas\)/);
  assert.match(html, /if \(!snapshot \|\| width < 1 \|\| height < 1\) return/);
  assert.match(html, /function scheduleViewForDisplayMode\(\) \{[\s\S]*?observedCanvasSize = \{width: 0, height: 0\};[\s\S]*?scheduleViewForCanvasSize\(\)/);
  assert.match(html, /function fitView\(\) \{[\s\S]*?if \(rect\.width < 1 \|\| rect\.height < 1\) return/);
  assert.match(html, /Ask why/);
  assert.match(html, /Challenge/);
  assert.match(html, /Continue/);
  assert.match(html, /Accept &amp; handoff/);
  assert.match(html, /Supporting references:/);
  assert.match(html, /Confidence basis:/);
  assert.match(html, /Uncertainty reasons:/);
  assert.match(html, /if \(reference\.path\) return reference\.path/);
  assert.match(html, /reference\.uri \|\| reference\.locator/);
  assert.match(html, /I reject this reviewer finding/);
  assert.match(html, /References/);
  assert.match(html, /Go to start/);
  assert.match(html, /function goToStart/);
  assert.match(html, /data-details-id/);
  assert.match(html, />Peek<svg/);
  assert.match(html, /let detailNodeId = null/);
  assert.match(html, /let detailBackHistory = \[\]/);
  assert.match(html, /let detailForwardHistory = \[\]/);
  assert.match(html, /function renderFocus\(node, options\)/);
  assert.match(html, /detailBackHistory\.push\(detailNodeId\);[\s\S]*?detailForwardHistory = \[\]/);
  assert.match(html, /id="peek-forward"[\s\S]*?aria-label="Forward to next node"/);
  assert.match(html, /detailForwardHistory\.push\(detailNodeId\);[\s\S]*?renderFocus\(previous\)/);
  assert.match(html, /detailBackHistory\.push\(detailNodeId\);[\s\S]*?renderFocus\(next\)/);
  assert.match(html, /function showNodePeek\(node, returnFocus\)[\s\S]*?pushHistory: !focusLayer\.hidden/);
  assert.match(html, /function activateNode\(node, returnFocus\)[\s\S]*?if \(!focusLayer\.hidden\)[\s\S]*?showNodePeek\(node, returnFocus\)/);
  assert.match(html, /if \(node\) activateNode\(node, element\)/);
  assert.match(html, /mapSurface\.classList\.add\('has-peek'\)/);
  assert.match(html, /data-related-node-id/);
  assert.match(html, /data-reference-action="inspect"/);
  assert.match(html, /Inspect source/);
  assert.match(html, /function inspectReferencePrompt/);
  assert.match(html, /data-edge-id/);
  assert.match(html, /function edgePhrase/);
  assert.match(html, /selectedEdgeId/);
  assert.doesNotMatch(html, /id="relationship-summary"/);
  assert.doesNotMatch(html, /class="relationship-summary"/);
  assert.match(html, /focusDirectionalNode/);
  assert.match(html, /aria-modal="false"/);
  assert.doesNotMatch(html, /nodeKindVisuals/);
  assert.doesNotMatch(html, /semantic-visual/);
  assert.match(html, /id="focus-card"[\s\S]*?tabindex="-1"/);
  assert.match(html, /\.focus-body \{[\s\S]*?grid-auto-rows: max-content;[\s\S]*?align-content: start;/);
  assert.match(html, /focusCard\.focus\(\{preventScroll: true\}\)/);
  assert.match(html, /is-peek-source/);
  assert.match(html, /\.node\.is-peek-source \{[\s\S]*?0 0 0 3px color-mix\(in srgb, var\(--accent\) 14%, transparent\)/);
  assert.doesNotMatch(html, /\.node\.is-peek-source \{[\s\S]*?0 0 0 1px var\(--accent\)/);
  assert.doesNotMatch(html, /\.node\.is-peek-source \{[\s\S]*?0 0 0 7px/);
  assert.match(html, /is-peek-related/);
  assert.match(html, /\.map-surface\.has-peek \.node:not\(\.is-peek-source\)[\s\S]*?opacity: \.14/);
  assert.match(html, /let previewNodeId = null/);
  assert.match(html, /marker id="arrow-accent"/);
  assert.match(html, /function setNodePreview/);
  assert.match(html, /prefers-reduced-motion: reduce/);
  assert.match(html, /function visibleNodes\(\) \{\s+return filteredNodes\(\)/);
  assert.match(html, /relatedIds\.has\(node\.id\) \? ' is-related' : ' is-muted'/);
  assert.match(html, /function initialView/);
  assert.match(html, /function readableOverview/);
  assert.doesNotMatch(html, /Start here/);
  assert.doesNotMatch(html, /entry-label/);
  assert.match(html, /function entryNode\(nodes\)/);
  assert.match(html, /node\.id === snapshot\.entryNodeId/);
  assert.doesNotMatch(html, /function overviewAnchor/);
  assert.match(html, /MIN_READABLE_ZOOM = \.64/);
  assert.match(html, /VERTICAL_GRAPH_BREAKPOINT = 520/);
  assert.match(html, /id="minimap"/);
  assert.match(html, /function renderMinimap/);
  assert.match(html, /function navigateFromMinimap/);
  assert.match(html, /Why confidence is not high/);
  assert.match(html, /confidenceBasis/);
  assert.match(html, /Highlight node types/);
  assert.match(html, /Clear highlights/);
  assert.match(html, /A conclusion, finding, or recommendation\./);
  assert.match(html, /class="type-filter-description"/);
  assert.match(html, /id="kind-tooltip"/);
  assert.match(html, /function showKindTooltip/);
  assert.match(html, /id="focus-kind-description"/);
  assert.match(html, /Type: ' \+ displayLabel\(node\.kind\)/);
  assert.match(html, /\.kanban_card \{ --kind-color: var\(--kanban-card\); \}/);
  assert.match(html, /\.c4_container \{ --kind-color: var\(--c4-container\); \}/);
  assert.match(html, /const nodeKindIcons =/);
  assert.match(html, /function kindIcon\(kind\)/);
  assert.match(html, /class="kind-icon"/);
  assert.match(html, /class="type-filter-icon"/);
  assert.match(html, /\.node\.evidence \.node-footer/);
  assert.match(html, /\.node\.decision::before/);
  assert.match(html, /\.node\.risk \{ border-left-width: 5px; \}/);
  assert.match(html, /\.node\.kanban_card \.node-header/);
  assert.doesNotMatch(html, /\.node\.c4_container::after/);
  assert.doesNotMatch(html, /\.node:hover,\s+\.node:focus-visible \{[^}]*transform:/);
  assert.match(html, /\.edge-path \{[^}]*stroke-width: 1\.25;/);
  assert.match(html, /markerWidth="6\.5" markerHeight="6\.5"[^>]*markerUnits="userSpaceOnUse"/);
  assert.match(html, /canvas\.scrollLeft = 0/);
  assert.match(html, /function isZoomGesture\(event\) \{\s+return event\.ctrlKey/);
  assert.match(html, /if \(!isZoomGesture\(event\)\) return;\s+event\.preventDefault\(\)/);
  assert.match(html, /Math\.exp\(-delta \* \.012\)/);
  assert.doesNotMatch(html, /event\.deltaY < 0 \? 1\.08 : \.92/);
  assert.match(html, /\.focus-footer\[hidden\]/);
  assert.doesNotMatch(html, /nodeDragState/);
  assert.doesNotMatch(html, /function applyFocusedLayout/);
  assert.doesNotMatch(html, /function focusedView/);
  assert.doesNotMatch(html, /kindFilterElement/);
  assert.doesNotMatch(html, /id="legend"/);
  assert.match(html, /grid-template-rows: auto minmax\(0, 1fr\) auto/);
  assert.doesNotMatch(html, /Selected Node/);
  assert.doesNotMatch(html, /get_latest_work_map/);
});
