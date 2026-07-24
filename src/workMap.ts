import {createHash} from 'node:crypto';
import dagre from '@dagrejs/dagre';
import type {
  PresentWorkMapInput,
  WorkMapEdge,
  WorkMapNode,
  WorkMapPoint,
  WorkMapSnapshot,
} from './types';

export const workMapNodeSize = {width: 284, height: 168} as const;

function normalizeInlineText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeBody(value: string | undefined) {
  return value?.trim() ?? '';
}

function normalizeNode(node: PresentWorkMapInput['nodes'][number], authorRole: PresentWorkMapInput['authorRole']) {
  const uncertaintyReasons = (node.uncertaintyReasons ?? []).map(normalizeInlineText);
  return {
    id: node.id,
    kind: node.kind,
    title: normalizeInlineText(node.title),
    body: normalizeBody(node.body),
    origin: node.origin ?? authorRole,
    references: (node.references ?? []).map((reference) => ({
      ...(reference.label ? {label: normalizeInlineText(reference.label)} : {}),
      ...(reference.uri ? {uri: reference.uri.trim()} : {}),
      ...(reference.path ? {path: reference.path.trim()} : {}),
      ...(reference.line ? {line: reference.line} : {}),
      ...(reference.locator ? {locator: normalizeInlineText(reference.locator)} : {}),
    })),
    ...(node.confidence ? {confidence: node.confidence} : {}),
    ...(node.confidenceBasis ? {confidenceBasis: normalizeInlineText(node.confidenceBasis)} : {}),
    uncertaintyReasons,
  };
}

function edgeId(edge: PresentWorkMapInput['edges'][number], index: number) {
  return `edge-${index + 1}-${edge.from}-${edge.relation}-${edge.to}`.slice(0, 160);
}

function roundedPoint(point: WorkMapPoint): WorkMapPoint {
  return {x: Math.round(point.x * 10) / 10, y: Math.round(point.y * 10) / 10};
}

function midpointAlongPolyline(points: WorkMapPoint[]): WorkMapPoint {
  const segments = points.slice(1).map((point, index) => {
    const start = points[index];
    return {start, end: point, length: Math.hypot(point.x - start.x, point.y - start.y)};
  });
  const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
  let remaining = totalLength / 2;

  for (const segment of segments) {
    if (remaining <= segment.length) {
      const ratio = segment.length ? remaining / segment.length : 0;
      return roundedPoint({
        x: segment.start.x + (segment.end.x - segment.start.x) * ratio,
        y: segment.start.y + (segment.end.y - segment.start.y) * ratio,
      });
    }
    remaining -= segment.length;
  }

  return roundedPoint(points[0]);
}

function layoutGraph(
  nodes: Array<Omit<WorkMapNode, 'position'>>,
  edges: PresentWorkMapInput['edges'],
): Pick<WorkMapSnapshot, 'nodes' | 'edges' | 'layout'> {
  const graph = new dagre.graphlib.Graph({multigraph: true});
  graph.setGraph({rankdir: 'LR', ranksep: 104, nodesep: 40, edgesep: 24, marginx: 48, marginy: 48});
  graph.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => graph.setNode(node.id, {...workMapNodeSize}));
  edges.forEach((edge, index) => graph.setEdge(edge.from, edge.to, {relation: edge.relation}, `edge-${index}`));
  dagre.layout(graph);

  const positionedNodes: WorkMapNode[] = nodes.map((node) => {
    const position = graph.node(node.id);
    return {
      ...node,
      position: roundedPoint({
        x: position.x - workMapNodeSize.width / 2,
        y: position.y - workMapNodeSize.height / 2,
      }),
    };
  });

  const positionedEdges: WorkMapEdge[] = edges.map((edge, index) => {
    const layout = graph.edge({v: edge.from, w: edge.to, name: `edge-${index}`});
    const points = layout.points.map(roundedPoint);
    return {
      id: edgeId(edge, index),
      from: edge.from,
      to: edge.to,
      relation: edge.relation,
      points,
      labelPosition: midpointAlongPolyline(points),
    };
  });

  const dimensions = graph.graph();
  return {
    nodes: positionedNodes,
    edges: positionedEdges,
    layout: {width: Math.ceil(dimensions.width), height: Math.ceil(dimensions.height)},
  };
}

function snapshotId(input: PresentWorkMapInput) {
  const canonical = JSON.stringify(input);
  return `work-map-${createHash('sha256').update(canonical).digest('hex').slice(0, 16)}`;
}

export function createWorkMapSnapshot(input: PresentWorkMapInput): WorkMapSnapshot {
  const normalizedNodes = input.nodes.map((node) => normalizeNode(node, input.authorRole));
  const graph = layoutGraph(normalizedNodes, input.edges);

  return {
    id: snapshotId(input),
    title: normalizeInlineText(input.title),
    authorRole: input.authorRole,
    ...(input.reviewOf ? {reviewOf: normalizeInlineText(input.reviewOf)} : {}),
    entryNodeId: input.entryNodeId,
    ...graph,
  };
}
