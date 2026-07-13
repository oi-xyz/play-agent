# Use Cases

## Code Review

An independent reviewer presents evidence nodes for files and observed behavior, risk or assumption nodes for weaknesses, decision nodes for accept/reject judgments, and action nodes for fixes. `reviewOf` identifies the implementation checkpoint and implementer-origin nodes remain visibly distinct.

## Product Direction

The map compares option nodes, connects user evidence to claims, makes unverified assumptions explicit, records the selected decision, and shows which validation actions follow.

## Architecture

Claims and decisions describe boundaries; evidence references the codebase; assumptions and risks show scale or security concerns; dependencies and blockers remain visible; actions follow from accepted decisions.

## Research

Evidence nodes carry source URIs or precise locators. Claims may be supported or contradicted. Questions preserve uncertainty, and lessons record what changed in the user's understanding.

## When Not To Use It

Do not present a map for a short answer, a single fact, or work with no meaningful relationships. Structured prose is better when the graph would merely repeat headings.
