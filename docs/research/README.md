# Research Notes

The current direction is MCP-first and stateless:

```text
Codex does the work.
Play Agent validates and presents an explicit reasoning graph.
The host conversation owns the durable tool result.
```

## Product Wedge

The product is not a prettier transcript. It is useful when relationships materially improve inspection: evidence supporting a claim, assumptions blocking a decision, alternatives, reviewer disagreement, and actions following from a decision.

The Work Map is not a trustworthy execution trace. A map authored by the implementer is still implementer self-report. Qualitative confidence on inferential nodes helps expose uncertainty, but trust improves through inspectable references and independently authored reviewer nodes rather than confidence alone.

## Contract

The agent calls `present_work_map` with:

- `title`;
- `authorRole` and optional `reviewOf`;
- explicit semantic `nodes` with optional provenance overrides and references;
- explicit directed `edges`.

Play Agent validates connectivity and references, computes deterministic Dagre layout, and returns the MCP App resource `ui://play-agent/work-map.html`. It does not persist, infer, repair, or scrape state.

## Design Boundary

Play Agent should not:

- manage Codex sessions;
- run a separate agent;
- persist a mirror of the conversation or a latest-map pointer;
- provide a standalone dashboard;
- ask users to maintain graph fields manually;
- present implementer self-critique as independent verification.

Play Agent should:

- expose claims, evidence, assumptions, options, decisions, risks, questions, actions, and lessons;
- preserve whether a node came from the user, agent, implementer, or reviewer;
- make references inspectable;
- let the user ask, challenge, or continue from a node through host-native follow-up;
- remain useful only where a map outperforms structured prose.
