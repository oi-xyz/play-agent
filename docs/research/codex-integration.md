# Codex Integration

Play Agent integrates with Codex through one stateless MCP tool:

```text
present_work_map
```

Codex should call it only after work whose evidence, alternatives, assumptions, decisions, or follow-up actions benefit from relational inspection. The tool call must provide explicit nodes and edges; Play Agent does not summarize the transcript itself.

Suggested durable instruction:

```text
After substantial work where relationships materially improve review, call the
Play Agent present_work_map tool. Use explicit semantic nodes and directed edges.
Attach precise references to evidence and source-sensitive claims. Use path plus an
optional line for workspace files, uri for links, and locator for non-file sources. Set authorRole
truthfully; use reviewer only for an independently reviewed context. Keep the graph
connected and compact. Give claim, assumption, and lesson nodes qualitative confidence
and a basis; medium or low confidence also requires explicit uncertainty reasons. Do not
call the tool for simple answers.
```

The MCP App reads `structuredContent` from `window.openai.toolOutput`. When the host exposes `window.openai.sendFollowUpMessage`, map-local `Ask why`, `Challenge`, and `Continue` actions post focused messages into the active host conversation.

Play Agent does not open, list, resume, or mirror Codex tasks. It does not parse Codex logs, invoke `codex exec`, or own a chat stream.
