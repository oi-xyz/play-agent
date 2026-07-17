import assert from 'node:assert/strict';
import {test} from 'node:test';
import {WORK_MAP_APP_RESOURCE_URI} from './mcpAppHtml';
import {handleMcpRequest, presentWorkMapInputSchema} from './mcpProtocol';

const validArguments = {
  title: 'MCP App direction',
  authorRole: 'reviewer',
  reviewOf: 'implementation-checkpoint-7',
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
  assert.deepEqual(tool?.inputSchema.required, ['title', 'authorRole', 'nodes', 'edges']);
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
    ? (response.result as {structuredContent: {snapshot: {nodes: Array<{origin: string; references: unknown[]}>; layout: {width: number}}; renderHint: {appResourceUri: string}}})
    : null;
  assert.equal(result?.structuredContent.renderHint.appResourceUri, WORK_MAP_APP_RESOURCE_URI);
  assert.equal(result?.structuredContent.snapshot.nodes.length, 3);
  assert.equal(result?.structuredContent.snapshot.nodes[0].origin, 'reviewer');
  assert.equal(result?.structuredContent.snapshot.nodes[1].origin, 'implementer');
  assert.equal(result?.structuredContent.snapshot.nodes[0].references.length, 1);
  assert.ok((result?.structuredContent.snapshot.layout.width ?? 0) > 0);
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
    presentWorkMapInputSchema.safeParse({title: 'Too large', authorRole: 'agent', nodes, edges}).success,
    false,
  );
});

test('confidence is required only for inferential nodes and uncertainty is explicit below high confidence', () => {
  const missingConfidence = presentWorkMapInputSchema.safeParse({
    title: 'Missing confidence',
    authorRole: 'agent',
    nodes: [{id: 'claim-1', kind: 'claim', title: 'A claim'}],
    edges: [],
  });
  assert.equal(missingConfidence.success, false);

  const missingUncertainty = presentWorkMapInputSchema.safeParse({
    title: 'Missing uncertainty reason',
    authorRole: 'agent',
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
  assert.match(html, /Ask why/);
  assert.match(html, /Challenge/);
  assert.match(html, /Continue/);
  assert.match(html, /Accept &amp; handoff/);
  assert.match(html, /Supporting references:/);
  assert.match(html, /Confidence basis:/);
  assert.match(html, /Uncertainty reasons:/);
  assert.match(html, /reference\.uri \|\| reference\.locator/);
  assert.match(html, /I reject this reviewer finding/);
  assert.match(html, /References/);
  assert.match(html, /Reset view/);
  assert.match(html, /function resetView/);
  assert.match(html, /data-details-id/);
  assert.match(html, /let detailNodeId = null/);
  assert.match(html, /function renderFocus\(node\) \{\s+detailNodeId = node\.id/);
  assert.match(html, /function visibleNodes\(\) \{\s+return filteredNodes\(\)/);
  assert.match(html, /relatedIds\.has\(node\.id\) \? ' is-related' : ' is-muted'/);
  assert.match(html, /function initialView/);
  assert.match(html, /function readableOverview/);
  assert.match(html, /MIN_READABLE_ZOOM = \.64/);
  assert.match(html, /VERTICAL_GRAPH_BREAKPOINT = 520/);
  assert.match(html, /id="minimap"/);
  assert.match(html, /function renderMinimap/);
  assert.match(html, /function navigateFromMinimap/);
  assert.match(html, /Why confidence is not high/);
  assert.match(html, /confidenceBasis/);
  assert.match(html, /Highlight node types/);
  assert.match(html, /Clear highlights/);
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
