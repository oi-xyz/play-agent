# Product Evaluation

Play Agent should continue only if the work map improves review behavior over structured prose. Visual preference is not enough.

## Study Design

Run paired trials with pseudonymous participant IDs. Each participant completes the same task family once with structured prose and once with a Play Agent map. Counterbalance condition order and use equivalent, not identical, task content to reduce learning effects.

Start with five representative users and two task pairs per user. Ten complete pairs are the minimum signal for the local scorecard; they are not statistical proof.

Use substantial tasks with real relationships:

- find the evidence behind a decision;
- identify an unresolved assumption or blocker;
- distinguish implementer claims from reviewer findings;
- choose a finding and continue or hand it off.

Do not use short answers or flat checklists, because the product explicitly does not target them.

## Observation Record

Store one JSON object per line in an untracked local file. Do not record names, transcripts, source code, or sensitive task content.

```json
{"participantId":"p01","taskId":"architecture-a","condition":"prose","evidenceLookupMs":42000,"unresolvedLookupMs":51000,"interpretationErrors":1,"referenceErrors":0,"usefulness":3}
{"participantId":"p01","taskId":"architecture-a","condition":"map","evidenceLookupMs":26000,"unresolvedLookupMs":30000,"interpretationErrors":0,"referenceErrors":0,"usefulness":4,"usedNodeAction":true,"lessUsefulThanProse":false}
```

Measure lookup time from the moment the question is asked until the participant points to the answer and its basis. Count an interpretation error when the participant gives the wrong relationship or status, and a reference error when they cite the wrong source.

Run the scorecard:

```bash
npm run evaluate -- /path/to/trials.jsonl
```

The CLI also accepts `-` to read JSONL from stdin.

## Provisional Gates

- median evidence lookup improves by at least 25%;
- median unresolved-issue lookup improves by at least 25%;
- map errors do not exceed prose errors;
- mean map usefulness is at least 4 out of 5;
- at least 40% of map trials use a node action;
- no more than 25% of map trials are judged less useful than prose.

These thresholds are product hypotheses. Change them only before a study round, never after seeing the results.

The scorecard returns:

- `insufficient_data` below ten complete pairs;
- `continue` when all gates pass;
- `iterate` when the result is mixed but not actively worse;
- `stop_or_rethink` when maps slow retrieval, materially increase errors, or are frequently less useful.

## Scope Boundary

Evaluation records belong to local product research, not the Play Agent runtime. Do not add telemetry, accounts, cloud persistence, or transcript capture to obtain these measurements.
