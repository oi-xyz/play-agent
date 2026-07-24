import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createWorkMapSnapshot, workMapNodeSize} from './workMap';
import {workMapNodeKindColors, workMapNodeKindDescriptions, workMapNodeKinds, workMapRelations} from './types';
import type {PresentWorkMapInput} from './types';

const input: PresentWorkMapInput = {
  title: 'Review MCP product direction',
  authorRole: 'reviewer',
  reviewOf: 'implementation-checkpoint-7',
  entryNodeId: 'decision-mcp-first',
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

type Rgb = [number, number, number];

function hexToRgb(value: string): Rgb {
  return [1, 3, 5].map((index) => Number.parseInt(value.slice(index, index + 2), 16) / 255) as Rgb;
}

function linearChannel(channel: number) {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function oklab(rgb: Rgb): Rgb {
  const [red, green, blue] = rgb.map(linearChannel);
  const long = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  return [
    0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short,
    1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short,
    0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short,
  ];
}

function perceptualDistance(first: Rgb, second: Rgb) {
  const firstLab = oklab(first);
  const secondLab = oklab(second);
  return Math.hypot(...firstLab.map((channel, index) => (channel - secondLab[index]) * 100));
}

function mix(first: Rgb, second: Rgb, firstWeight: number): Rgb {
  return first.map((channel, index) => channel * firstWeight + second[index] * (1 - firstWeight)) as Rgb;
}

function relativeLuminance(rgb: Rgb) {
  const [red, green, blue] = rgb.map(linearChannel);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(first: Rgb, second: Rgb) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  return (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05);
}

test('createWorkMapSnapshot preserves semantics, provenance, and references', () => {
  const snapshot = createWorkMapSnapshot(input);

  assert.equal(snapshot.authorRole, 'reviewer');
  assert.equal(snapshot.reviewOf, 'implementation-checkpoint-7');
  assert.equal(snapshot.entryNodeId, 'decision-mcp-first');
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
    entryNodeId: 'claim-demand',
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

test('the explicit reading entry contributes to snapshot identity', () => {
  const first = createWorkMapSnapshot(input);
  const second = createWorkMapSnapshot({...input, entryNodeId: 'evidence-host-ui'});

  assert.notEqual(first.id, second.id);
  assert.equal(second.entryNodeId, 'evidence-host-ui');
  assert.deepEqual(second.nodes, first.nodes);
  assert.deepEqual(second.edges, first.edges);
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
  assert.deepEqual(Object.keys(workMapNodeKindColors.light), [...workMapNodeKinds]);
  assert.deepEqual(Object.keys(workMapNodeKindColors.dark), [...workMapNodeKinds]);
});

test('node kind palettes remain distinguishable and readable in light and dark modes', () => {
  const surfaces = {
    light: {text: '#20201e', muted: '#f0f0ee'},
    dark: {text: '#f0f0eb', muted: '#292925'},
  } as const;

  for (const mode of ['light', 'dark'] as const) {
    const colors = workMapNodeKinds.map((kind) => ({kind, rgb: hexToRgb(workMapNodeKindColors[mode][kind])}));
    const text = hexToRgb(surfaces[mode].text);
    const muted = hexToRgb(surfaces[mode].muted);

    for (let first = 0; first < colors.length; first += 1) {
      const tagText = mix(colors[first].rgb, text, 0.82);
      const tagBackground = mix(colors[first].rgb, muted, 0.1);
      assert.ok(
        contrastRatio(tagText, tagBackground) >= 4.5,
        `${mode} ${colors[first].kind} tag does not meet 4.5:1 contrast`,
      );

      for (let second = first + 1; second < colors.length; second += 1) {
        assert.ok(
          perceptualDistance(colors[first].rgb, colors[second].rgb) >= 14,
          `${mode} ${colors[first].kind} and ${colors[second].kind} node colors are too similar`,
        );
        assert.ok(
          perceptualDistance(tagText, mix(colors[second].rgb, text, 0.82)) >= 11,
          `${mode} ${colors[first].kind} and ${colors[second].kind} tag colors are too similar`,
        );
      }
    }
  }
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

  const snapshot = createWorkMapSnapshot({
    title: 'Dense graph',
    authorRole: 'agent',
    entryNodeId: 'node-1',
    nodes,
    edges,
  });
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
