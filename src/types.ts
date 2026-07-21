export const workMapNodeKinds = [
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
] as const;

export type WorkMapNodeKind = (typeof workMapNodeKinds)[number];

export const workMapNodeKindDescriptions = {
  claim: 'A conclusion, finding, or recommendation.',
  evidence: 'An observation or source that supports or contradicts a claim.',
  option: 'A candidate path that has not been selected.',
  decision: 'A selected or committed direction.',
  assumption: 'An unverified premise the work relies on.',
  risk: 'A possible failure mode or material concern.',
  question: 'An unresolved inquiry.',
  action: 'A recommended next step that is not formally tracked.',
  kanban_card: 'A formally tracked, independently actionable work item.',
  c4_container: 'A C4 application or data store, such as a service or database.',
  lesson: 'A durable insight worth carrying forward.',
} as const satisfies Record<WorkMapNodeKind, string>;

export const workMapNodeKindColors = {
  light: {
    claim: '#6100bb',
    evidence: '#8c6100',
    option: '#895284',
    decision: '#3c4900',
    assumption: '#800c00',
    risk: '#dc002f',
    question: '#cf00c9',
    action: '#0055ff',
    kanban_card: '#008700',
    c4_container: '#007e9b',
    lesson: '#232323',
  },
  dark: {
    claim: '#a77bff',
    evidence: '#eba941',
    option: '#f0bfea',
    decision: '#00f8ff',
    assumption: '#8d894e',
    risk: '#ff5c75',
    question: '#ff68ff',
    action: '#008dff',
    kanban_card: '#00ac00',
    c4_container: '#00b8b9',
    lesson: '#fafafa',
  },
} as const satisfies Record<'light' | 'dark', Record<WorkMapNodeKind, `#${string}`>>;

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
  label?: string;
  uri?: string;
  path?: string;
  line?: number;
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
