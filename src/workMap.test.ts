import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createWorkMapSnapshot, workMapNodeSize} from './workMap';
import {workMapNodeKindDescriptions, workMapNodeKinds, workMapRelations} from './types';
import type {PresentWorkMapInput} from './types';

const input: PresentWorkMapInput = {
  title: 'Review MCP product direction',
  authorRole: 'reviewer',
  reviewOf: 'implementation-checkpoint-7',
  nodes: [
    {
      id: 'evidence-host-ui',
      kind: 'evidence',
      title: 'MCP Apps render inside the host conversation',
      references: [
        {label: 'Apps SDK reference', uri: 'https://developers.openai.com/apps-sdk/reference'},
        {path: 'server/mcpProtocol.ts', line: 157},
      ],
    },
    {
      id: 'decision-mcp-first',
      kind: 'decision',
      title: 'Use MCP as the product surface',
      body: 'Do not recreate a standalone conversation UI.',
      origin: 'implementer',
    },
    {id: 'action-real-task', kind: 'action', title: 'Validate with a real Codex task'},
  ],
  edges: [
    {from: 'evidence-host-ui', to: 'decision-mcp-first', relation: 'supports'},
    {from: 'decision-mcp-first', to: 'action-real-task', relation: 'leads_to'},
  ],
};

test('createWorkMapSnapshot preserves semantics, provenance, and references', () => {
  const snapshot = createWorkMapSnapshot(input);

  assert.equal(snapshot.authorRole, 'reviewer');
  assert.equal(snapshot.reviewOf, 'implementation-checkpoint-7');
  assert.deepEqual(snapshot.nodes.map((node) => node.id), [
    'evidence-host-ui',
    'decision-mcp-first',
    'action-real-task',
  ]);
  assert.equal(snapshot.nodes[0].origin, 'reviewer');
  assert.equal(snapshot.nodes[1].origin, 'implementer');
  assert.equal(snapshot.nodes[0].references[0].label, 'Apps SDK reference');
  assert.deepEqual(snapshot.nodes[0].references[1], {path: 'server/mcpProtocol.ts', line: 157});
  assert.deepEqual(
    snapshot.edges.map(({from, to, relation}) => ({from, to, relation})),
    [
      {from: 'evidence-host-ui', to: 'decision-mcp-first', relation: 'supports'},
      {from: 'decision-mcp-first', to: 'action-real-task', relation: 'leads_to'},
    ],
  );
});

test('createWorkMapSnapshot preserves qualitative confidence and uncertainty reasons', () => {
  const snapshot = createWorkMapSnapshot({
    title: 'Confidence checkpoint',
    authorRole: 'agent',
    nodes: [
      {
        id: 'claim-demand',
        kind: 'claim',
        title: 'The workflow reduces review time',
        confidence: 'medium',
        confidenceBasis: 'The first usability sessions were directionally positive.',
        uncertaintyReasons: ['The sample is small.', 'No longitudinal comparison exists yet.'],
      },
    ],
    edges: [],
  });

  assert.equal(snapshot.nodes[0].confidence, 'medium');
  assert.equal(snapshot.nodes[0].confidenceBasis, 'The first usability sessions were directionally positive.');
  assert.deepEqual(snapshot.nodes[0].uncertaintyReasons, [
    'The sample is small.',
    'No longitudinal comparison exists yet.',
  ]);
});

test('Dagre layout returns bounded node positions and routed edges', () => {
  const snapshot = createWorkMapSnapshot(input);

  assert.ok(snapshot.layout.width > workMapNodeSize.width);
  assert.ok(snapshot.layout.height >= workMapNodeSize.height);
  snapshot.nodes.forEach((node) => {
    assert.ok(node.position.x >= 0);
    assert.ok(node.position.y >= 0);
    assert.ok(node.position.x + workMapNodeSize.width <= snapshot.layout.width);
    assert.ok(node.position.y + workMapNodeSize.height <= snapshot.layout.height);
  });
  assert.equal(
    new Set(snapshot.nodes.map((node) => `${node.position.x}:${node.position.y}`)).size,
    snapshot.nodes.length,
  );
  snapshot.edges.forEach((edge) => {
    assert.ok(edge.points.length >= 2);
    assert.ok(Number.isFinite(edge.labelPosition.x));
    assert.ok(Number.isFinite(edge.labelPosition.y));
  });
});

test('the same semantic graph produces the same snapshot ID and layout', () => {
  const first = createWorkMapSnapshot(input);
  const second = createWorkMapSnapshot(input);

  assert.equal(first.id, second.id);
  assert.deepEqual(first, second);
});

test('taxonomy remains compact and excludes ambiguous aliases', () => {
  assert.deepEqual(workMapNodeKinds, [
    'claim',
    'evidence',
    'option',
    'decision',
    'assumption',
    'risk',
    'question',
    'action',
    'kanban_card',
    'c4_container',
    'lesson',
  ]);
  assert.deepEqual(workMapRelations, [
    'supports',
    'contradicts',
    'informs',
    'depends_on',
    'blocks',
    'mitigates',
    'resolves',
    'leads_to',
    'alternative_to',
  ]);
  assert.deepEqual(Object.keys(workMapNodeKindDescriptions), [...workMapNodeKinds]);
});

test('Dagre lays out a 24-node cyclic graph without node overlap', () => {
  const nodes: PresentWorkMapInput['nodes'] = Array.from({length: 24}, (_, index) => ({
    id: `node-${index + 1}`,
    kind: workMapNodeKinds[index % workMapNodeKinds.length],
    title: `Node ${index + 1}`,
  }));
  const edges: PresentWorkMapInput['edges'] = nodes.slice(1).map((node, index) => ({
    from: nodes[index].id,
    to: node.id,
    relation: 'leads_to',
  }));
  edges.push({from: nodes[23].id, to: nodes[0].id, relation: 'informs'});
  edges.push({from: nodes[0].id, to: nodes[12].id, relation: 'supports'});

  const snapshot = createWorkMapSnapshot({title: 'Dense graph', authorRole: 'agent', nodes, edges});
  assert.equal(snapshot.nodes.length, 24);
  assert.equal(snapshot.edges.length, 25);

  for (let first = 0; first < snapshot.nodes.length; first += 1) {
    for (let second = first + 1; second < snapshot.nodes.length; second += 1) {
      const a = snapshot.nodes[first].position;
      const b = snapshot.nodes[second].position;
      const overlaps =
        a.x < b.x + workMapNodeSize.width &&
        a.x + workMapNodeSize.width > b.x &&
        a.y < b.y + workMapNodeSize.height &&
        a.y + workMapNodeSize.height > b.y;
      assert.equal(overlaps, false, `${snapshot.nodes[first].id} overlaps ${snapshot.nodes[second].id}`);
    }
  }
});
