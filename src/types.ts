export const workMapNodeKinds = [
  'claim',
  'evidence',
  'option',
  'decision',
  'assumption',
  'risk',
  'question',
  'action',
  'lesson',
] as const;

export type WorkMapNodeKind = (typeof workMapNodeKinds)[number];

export const workMapRelations = [
  'supports',
  'contradicts',
  'informs',
  'depends_on',
  'blocks',
  'mitigates',
  'resolves',
  'leads_to',
  'alternative_to',
] as const;

export type WorkMapRelation = (typeof workMapRelations)[number];

export const workMapAuthorRoles = ['user', 'agent', 'implementer', 'reviewer'] as const;

export type WorkMapAuthorRole = (typeof workMapAuthorRoles)[number];

export const workMapConfidenceLevels = ['high', 'medium', 'low'] as const;

export type WorkMapConfidence = (typeof workMapConfidenceLevels)[number];

export const confidenceNodeKinds = ['claim', 'assumption', 'lesson'] as const;

export type WorkMapReference = {
  label: string;
  uri?: string;
  locator?: string;
};

export type WorkMapNodeInput = {
  id: string;
  kind: WorkMapNodeKind;
  title: string;
  body?: string;
  origin?: WorkMapAuthorRole;
  references?: WorkMapReference[];
  confidence?: WorkMapConfidence;
  confidenceBasis?: string;
  uncertaintyReasons?: string[];
};

export type WorkMapEdgeInput = {
  from: string;
  to: string;
  relation: WorkMapRelation;
};

export type WorkMapPoint = {
  x: number;
  y: number;
};

export type WorkMapNode = {
  id: string;
  kind: WorkMapNodeKind;
  title: string;
  body: string;
  origin: WorkMapAuthorRole;
  references: WorkMapReference[];
  confidence?: WorkMapConfidence;
  confidenceBasis?: string;
  uncertaintyReasons: string[];
  position: WorkMapPoint;
};

export type WorkMapEdge = WorkMapEdgeInput & {
  id: string;
  points: WorkMapPoint[];
  labelPosition: WorkMapPoint;
};

export type WorkMapSnapshot = {
  id: string;
  title: string;
  authorRole: WorkMapAuthorRole;
  reviewOf?: string;
  nodes: WorkMapNode[];
  edges: WorkMapEdge[];
  layout: {
    width: number;
    height: number;
  };
};

export type PresentWorkMapInput = {
  title: string;
  authorRole: WorkMapAuthorRole;
  reviewOf?: string;
  nodes: WorkMapNodeInput[];
  edges: WorkMapEdgeInput[];
};

export type PresentWorkMapResult = {
  snapshot: WorkMapSnapshot;
  renderHint: {
    appResourceUri: string;
    preferredView: 'work-map';
  };
};
