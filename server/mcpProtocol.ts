import {z} from 'zod';
import {createWorkMapSnapshot} from '../src/workMap';
import {
  confidenceNodeKinds,
  workMapAuthorRoles,
  workMapConfidenceLevels,
  workMapNodeKinds,
  workMapRelations,
} from '../src/types';
import type {PresentWorkMapInput, PresentWorkMapResult, WorkMapSnapshot} from '../src/types';
import {WORK_MAP_APP_MIME_TYPE, WORK_MAP_APP_RESOURCE_URI, workMapAppHtml} from './mcpAppHtml';

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: unknown;
};

type JsonRpcResponse =
  | {jsonrpc: '2.0'; id: string | number | null; result: unknown}
  | {jsonrpc: '2.0'; id: string | number | null; error: {code: number; message: string; data?: unknown}};

const nodeIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, 'Use a short stable ID containing only letters, numbers, underscores, or hyphens.');

const referenceSchema = z
  .object({
    label: z.string().min(1).optional(),
    uri: z.string().min(1).optional(),
    path: z.string().min(1).optional(),
    line: z.number().int().positive().optional(),
    locator: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((reference, context) => {
    const locationCount = [reference.uri, reference.path, reference.locator].filter(Boolean).length;
    if (locationCount !== 1) {
      context.addIssue({
        code: 'custom',
        message: 'A reference must include exactly one of uri, path, or locator.',
      });
    }
    if (reference.line && !reference.path) {
      context.addIssue({code: 'custom', message: 'line is only valid with path.', path: ['line']});
    }
  });

const confidenceKindSet = new Set<string>(confidenceNodeKinds);

const workMapNodeSchema = z
  .object({
    id: nodeIdSchema,
    kind: z.enum(workMapNodeKinds),
    title: z.string().min(1),
    body: z.string().optional(),
    origin: z.enum(workMapAuthorRoles).optional(),
    references: z.array(referenceSchema).max(6).optional(),
    confidence: z.enum(workMapConfidenceLevels).optional(),
    confidenceBasis: z.string().min(1).max(500).optional(),
    uncertaintyReasons: z.array(z.string().min(1).max(300)).min(1).max(3).optional(),
  })
  .strict()
  .superRefine((node, context) => {
    const needsConfidence = confidenceKindSet.has(node.kind);
    if (needsConfidence && !node.confidence) {
      context.addIssue({code: 'custom', message: `${node.kind} nodes require confidence.`, path: ['confidence']});
    }
    if (needsConfidence && !node.confidenceBasis) {
      context.addIssue({code: 'custom', message: `${node.kind} nodes require confidenceBasis.`, path: ['confidenceBasis']});
    }
    if (needsConfidence && node.confidence && node.confidence !== 'high' && !node.uncertaintyReasons?.length) {
      context.addIssue({
        code: 'custom',
        message: `${node.confidence} confidence requires at least one uncertainty reason.`,
        path: ['uncertaintyReasons'],
      });
    }
    if (!needsConfidence && (node.confidence || node.confidenceBasis || node.uncertaintyReasons)) {
      context.addIssue({
        code: 'custom',
        message: `Confidence fields are only valid for ${confidenceNodeKinds.join(', ')} nodes.`,
        path: ['confidence'],
      });
    }
  });

const workMapEdgeSchema = z
  .object({
    from: nodeIdSchema,
    to: nodeIdSchema,
    relation: z.enum(workMapRelations),
  })
  .strict();

export const presentWorkMapInputSchema = z
  .object({
    title: z.string().min(1),
    authorRole: z.enum(workMapAuthorRoles),
    reviewOf: z.string().min(1).optional(),
    nodes: z.array(workMapNodeSchema).min(1).max(24),
    edges: z.array(workMapEdgeSchema).max(48),
  })
  .strict()
  .superRefine((input, context) => {
    const nodeIds = new Set<string>();
    input.nodes.forEach((node, index) => {
      if (nodeIds.has(node.id)) {
        context.addIssue({code: 'custom', message: `Duplicate node ID: ${node.id}`, path: ['nodes', index, 'id']});
      }
      nodeIds.add(node.id);
    });

    const edgeKeys = new Set<string>();
    const adjacency = new Map(input.nodes.map((node) => [node.id, new Set<string>()]));
    input.edges.forEach((edge, index) => {
      if (!nodeIds.has(edge.from)) {
        context.addIssue({code: 'custom', message: `Unknown source node: ${edge.from}`, path: ['edges', index, 'from']});
      }
      if (!nodeIds.has(edge.to)) {
        context.addIssue({code: 'custom', message: `Unknown target node: ${edge.to}`, path: ['edges', index, 'to']});
      }
      if (edge.from === edge.to) {
        context.addIssue({code: 'custom', message: 'Self-referencing edges are not allowed.', path: ['edges', index]});
      }

      const edgeKey = `${edge.from}\u0000${edge.relation}\u0000${edge.to}`;
      if (edgeKeys.has(edgeKey)) {
        context.addIssue({code: 'custom', message: 'Duplicate relationship.', path: ['edges', index]});
      }
      edgeKeys.add(edgeKey);

      if (nodeIds.has(edge.from) && nodeIds.has(edge.to) && edge.from !== edge.to) {
        adjacency.get(edge.from)?.add(edge.to);
        adjacency.get(edge.to)?.add(edge.from);
      }
    });

    if (input.nodes.length <= 1) return;
    if (!input.edges.length) {
      context.addIssue({code: 'custom', message: 'A work map with multiple nodes must include relationships.', path: ['edges']});
      return;
    }

    const visited = new Set<string>();
    const queue = [input.nodes[0].id];
    while (queue.length) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      adjacency.get(nodeId)?.forEach((neighbor) => queue.push(neighbor));
    }

    input.nodes.forEach((node, index) => {
      if (!visited.has(node.id)) {
        context.addIssue({
          code: 'custom',
          message: `Node ${node.id} is disconnected from the work map.`,
          path: ['nodes', index, 'id'],
        });
      }
    });
  });

const referenceJsonSchema = {
  type: 'object',
  additionalProperties: false,
  description:
    'An inspectable source location. Use {path, line?} for workspace files, {uri, label?} for links, or {locator, label?} for a precise non-file location. Include exactly one of path, uri, or locator.',
  oneOf: [{required: ['path']}, {required: ['uri']}, {required: ['locator']}],
  properties: {
    label: {type: 'string', description: 'Optional short user-facing source name.'},
    uri: {type: 'string', description: 'Source URL or URI when one exists.'},
    path: {type: 'string', description: 'Workspace-relative or absolute file path. Use this instead of locator for code.'},
    line: {type: 'integer', minimum: 1, description: 'Optional 1-based line number; valid only with path.'},
    locator: {type: 'string', description: 'Precise section, quote, transcript turn, or other non-file location.'},
  },
} as const;

const toolInputSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'authorRole', 'nodes', 'edges'],
  properties: {
    title: {type: 'string', description: 'Short title for this reviewable work map.'},
    authorRole: {
      type: 'string',
      enum: workMapAuthorRoles,
      description: 'Who authored the map. Use reviewer only for an independently reviewed context.',
    },
    reviewOf: {
      type: 'string',
      description: 'Optional checkpoint, task, answer, or artifact identifier that this reviewer map evaluates.',
    },
    nodes: {
      type: 'array',
      minItems: 1,
      maxItems: 24,
      description:
        'The smallest useful set of semantic nodes. Give each node a short stable ID; do not create nodes merely to restate headings.',
      items: {
        type: 'object',
        required: ['id', 'kind', 'title'],
        additionalProperties: false,
        properties: {
          id: {
            type: 'string',
            pattern: '^[A-Za-z0-9][A-Za-z0-9_-]*$',
            maxLength: 64,
            description: 'Unique ID within this tool call, such as evidence-runtime or decision-mcp-only.',
          },
          kind: {
            type: 'string',
            enum: workMapNodeKinds,
            description: 'Claims, assumptions, and lessons also require confidence and confidenceBasis.',
          },
          title: {type: 'string', description: 'A concise statement, not a category label.'},
          body: {type: 'string', description: 'Optional context that materially improves review.'},
          origin: {
            type: 'string',
            enum: workMapAuthorRoles,
            description: 'Override authorRole only when this node originated from a different role.',
          },
          references: {
            type: 'array',
            maxItems: 6,
            description:
              'Inspectable sources. File example: {"path":"src/workMap.ts","line":42}. Link example: {"label":"Apps SDK","uri":"https://..."}.',
            items: referenceJsonSchema,
          },
          confidence: {
            type: 'string',
            enum: workMapConfidenceLevels,
            description:
              'Required only for claim, assumption, and lesson. Use qualitative levels; this is an inspectable judgment, not verification.',
          },
          confidenceBasis: {
            type: 'string',
            description: 'Required with confidence. Concisely state what supports the level selected.',
          },
          uncertaintyReasons: {
            type: 'array',
            minItems: 1,
            maxItems: 3,
            description: 'Required for medium or low confidence. State the concrete missing evidence, ambiguity, or dependency.',
            items: {type: 'string'},
          },
        },
      },
    },
    edges: {
      type: 'array',
      maxItems: 48,
      description:
        'Directed semantic relationships. Connect every node and express the actual reasoning chain rather than grouping by type.',
      items: {
        type: 'object',
        required: ['from', 'to', 'relation'],
        additionalProperties: false,
        properties: {
          from: {type: 'string', description: 'Source node ID.'},
          to: {type: 'string', description: 'Target node ID.'},
          relation: {
            type: 'string',
            enum: workMapRelations,
            description:
              'Read from source to target: evidence supports a claim, an assumption blocks a decision, or a decision leads_to an action.',
          },
        },
      },
    },
  },
} as const;

const pointJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['x', 'y'],
  properties: {x: {type: 'number'}, y: {type: 'number'}},
} as const;

const workMapOutputSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['snapshot', 'renderHint'],
  properties: {
    snapshot: {
      type: 'object',
      additionalProperties: false,
      required: ['id', 'title', 'authorRole', 'nodes', 'edges', 'layout'],
      properties: {
        id: {type: 'string'},
        title: {type: 'string'},
        authorRole: {type: 'string', enum: workMapAuthorRoles},
        reviewOf: {type: 'string'},
        nodes: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'kind', 'title', 'body', 'origin', 'references', 'uncertaintyReasons', 'position'],
            properties: {
              id: {type: 'string'},
              kind: {type: 'string', enum: workMapNodeKinds},
              title: {type: 'string'},
              body: {type: 'string'},
              origin: {type: 'string', enum: workMapAuthorRoles},
              references: {type: 'array', items: referenceJsonSchema},
              confidence: {type: 'string', enum: workMapConfidenceLevels},
              confidenceBasis: {type: 'string'},
              uncertaintyReasons: {type: 'array', items: {type: 'string'}},
              position: pointJsonSchema,
            },
          },
        },
        edges: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'from', 'to', 'relation', 'points', 'labelPosition'],
            properties: {
              id: {type: 'string'},
              from: {type: 'string'},
              to: {type: 'string'},
              relation: {type: 'string', enum: workMapRelations},
              points: {type: 'array', items: pointJsonSchema},
              labelPosition: pointJsonSchema,
            },
          },
        },
        layout: {
          type: 'object',
          additionalProperties: false,
          required: ['width', 'height'],
          properties: {width: {type: 'number'}, height: {type: 'number'}},
        },
      },
    },
    renderHint: {
      type: 'object',
      additionalProperties: false,
      required: ['appResourceUri', 'preferredView'],
      properties: {
        appResourceUri: {type: 'string'},
        preferredView: {type: 'string', enum: ['work-map']},
      },
    },
  },
} as const;

function toolResult(snapshot: WorkMapSnapshot): PresentWorkMapResult {
  return {
    snapshot,
    renderHint: {appResourceUri: WORK_MAP_APP_RESOURCE_URI, preferredView: 'work-map'},
  };
}

export function presentWorkMap(input: PresentWorkMapInput): PresentWorkMapResult {
  return toolResult(createWorkMapSnapshot(input));
}

export function listToolsResult() {
  return {
    tools: [
      {
        name: 'present_work_map',
        title: 'Present Work Map',
        description:
          'Present a compact, connected semantic graph for a substantial answer or independent review. Supply explicit nodes, provenance, references, and directed relationships; Play Agent validates and renders the graph without storing or inferring state.',
        inputSchema: toolInputSchema,
        outputSchema: workMapOutputSchema,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
        _meta: {
          ui: {resourceUri: WORK_MAP_APP_RESOURCE_URI, visibility: ['model', 'app']},
          'openai/outputTemplate': WORK_MAP_APP_RESOURCE_URI,
          'openai/toolInvocation/invoking': 'Preparing work map',
          'openai/toolInvocation/invoked': 'Work map ready',
        },
      },
    ],
  };
}

export function listResourcesResult() {
  return {
    resources: [
      {
        uri: WORK_MAP_APP_RESOURCE_URI,
        name: 'Play Agent Work Map',
        title: 'Play Agent Work Map',
        description: 'Interactive MCP App for reviewing a connected reasoning map.',
        mimeType: WORK_MAP_APP_MIME_TYPE,
        _meta: {
          ui: {csp: {}, prefersBorder: true},
          'openai/widgetDescription':
            'A focused work map showing claims, evidence, options, decisions, assumptions, risks, questions, actions, and lessons with provenance and references.',
          'openai/widgetPrefersBorder': true,
        },
      },
    ],
  };
}

export function readResourceResult(uri: string) {
  if (uri !== WORK_MAP_APP_RESOURCE_URI) throw new McpError(-32004, `Unknown resource: ${uri}`);
  return {
    contents: [
      {
        uri: WORK_MAP_APP_RESOURCE_URI,
        mimeType: WORK_MAP_APP_MIME_TYPE,
        text: workMapAppHtml(),
        _meta: {
          ui: {csp: {}, prefersBorder: true},
          'openai/widgetDescription':
            'A focused work map showing claims, evidence, options, decisions, assumptions, risks, questions, actions, and lessons with provenance and references.',
          'openai/widgetPrefersBorder': true,
        },
      },
    ],
  };
}

class McpError extends Error {
  constructor(
    readonly code: number,
    message: string,
    readonly data?: unknown,
  ) {
    super(message);
  }
}

function callToolResult(name: string, args: unknown) {
  if (name !== 'present_work_map') throw new McpError(-32601, `Unknown tool: ${name}`);
  const parsed = presentWorkMapInputSchema.safeParse(args);
  if (!parsed.success) {
    throw new McpError(-32602, 'Invalid present_work_map arguments.', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        code: issue.code,
        message: issue.message,
      })),
    });
  }

  const result = presentWorkMap(parsed.data);
  return {
    content: [
      {
        type: 'text',
        text: `Presented work map "${result.snapshot.title}" with ${result.snapshot.nodes.length} nodes and ${result.snapshot.edges.length} relationships.`,
      },
    ],
    structuredContent: result,
    _meta: {ui: {resourceUri: WORK_MAP_APP_RESOURCE_URI, visibility: ['model', 'app']}},
  };
}

function success(id: JsonRpcRequest['id'], result: unknown): JsonRpcResponse {
  return {jsonrpc: '2.0', id: id ?? null, result};
}

function failure(id: JsonRpcRequest['id'], error: unknown): JsonRpcResponse {
  if (error instanceof McpError) {
    return {jsonrpc: '2.0', id: id ?? null, error: {code: error.code, message: error.message, data: error.data}};
  }
  return {
    jsonrpc: '2.0',
    id: id ?? null,
    error: {code: -32603, message: error instanceof Error ? error.message : 'Internal MCP server error.'},
  };
}

export async function handleMcpRequest(request: JsonRpcRequest): Promise<JsonRpcResponse | null> {
  if (!request.id && request.method?.startsWith('notifications/')) return null;
  try {
    switch (request.method) {
      case 'initialize':
        return success(request.id, {
          protocolVersion: '2025-06-18',
          capabilities: {tools: {}, resources: {}},
          serverInfo: {name: 'play-agent', version: '0.1.3'},
        });
      case 'ping':
        return success(request.id, {});
      case 'tools/list':
        return success(request.id, listToolsResult());
      case 'tools/call': {
        const params = z.object({name: z.string(), arguments: z.unknown().optional()}).safeParse(request.params);
        if (!params.success) throw new McpError(-32602, 'Invalid tools/call params.', params.error.flatten());
        return success(request.id, callToolResult(params.data.name, params.data.arguments ?? {}));
      }
      case 'resources/list':
        return success(request.id, listResourcesResult());
      case 'resources/read': {
        const params = z.object({uri: z.string()}).safeParse(request.params);
        if (!params.success) throw new McpError(-32602, 'Invalid resources/read params.', params.error.flatten());
        return success(request.id, readResourceResult(params.data.uri));
      }
      default:
        throw new McpError(-32601, `Unsupported method: ${request.method ?? '(missing)'}`);
    }
  } catch (error) {
    return failure(request.id, error);
  }
}
