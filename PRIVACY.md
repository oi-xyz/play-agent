# Privacy

Last updated: July 21, 2026

Play Agent is a local, stateless Codex Plugin. It does not operate a Play Agent account system, hosted API, analytics service, telemetry pipeline, or persistent data store.

## Data Play Agent Receives

Play Agent receives only the arguments that the Codex host sends to the `present_work_map` MCP tool. Those arguments may contain map titles, semantic nodes, relationships, provenance, and references selected by the calling agent.

The bundled MCP server validates that payload, computes a deterministic layout, and returns an MCP App representation to the host. It does not query or copy the surrounding Codex conversation, and it does not write map contents to disk or send them to a Play Agent service.

## Host And Provider Processing

Codex, OpenAI, and any model or integration providers used by the host process data under their own terms and privacy policies. Installing Play Agent does not change those host-level practices. Users should avoid placing secrets or regulated data in a work map unless their Codex environment is approved to process that data.

When a user opens a reference or sends a follow-up action from the MCP App, the request is handled by host-provided APIs. Play Agent does not add a separate network destination.

## Static Examples

The GitHub Pages use-case examples are pre-generated static pages. They do not connect to Codex, call the Play Agent MCP server, or collect map input.

## Changes And Questions

Material changes to this boundary will be documented in this file and the project changelog. Questions and reports can be submitted through [GitHub Issues](https://github.com/oi-xyz/play-agent/issues).
