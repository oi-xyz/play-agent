import {z} from 'zod';

export const evaluationTrialSchema = z
  .object({
    participantId: z.string().min(1),
    taskId: z.string().min(1),
    condition: z.enum(['prose', 'map']),
    evidenceLookupMs: z.number().nonnegative(),
    unresolvedLookupMs: z.number().nonnegative(),
    interpretationErrors: z.number().int().nonnegative(),
    referenceErrors: z.number().int().nonnegative(),
    usefulness: z.number().int().min(1).max(5),
    usedNodeAction: z.boolean().optional().default(false),
    lessUsefulThanProse: z.boolean().optional().default(false),
  })
  .strict();

export type EvaluationTrialInput = z.input<typeof evaluationTrialSchema>;
export type EvaluationTrial = z.output<typeof evaluationTrialSchema>;

type MetricGate = {
  label: string;
  actual: number;
  target: number;
  passed: boolean;
  direction: 'at_least' | 'at_most';
};

export type EvaluationScorecard = {
  pairCount: number;
  decision: 'insufficient_data' | 'continue' | 'iterate' | 'stop_or_rethink';
  metrics: {
    medianEvidenceImprovement: number;
    medianUnresolvedImprovement: number;
    proseErrorsPerTrial: number;
    mapErrorsPerTrial: number;
    mapUsefulness: number;
    mapNodeActionRate: number;
    mapLessUsefulRate: number;
  };
  gates: MetricGate[];
};

const MINIMUM_PAIRS = 10;

function median(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[midpoint - 1] + sorted[midpoint]) / 2
    : sorted[midpoint];
}

function mean(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function relativeImprovement(baseline: number, candidate: number) {
  if (baseline === 0) return candidate === 0 ? 0 : -1;
  return (baseline - candidate) / baseline;
}

export function parseEvaluationJsonl(content: string): EvaluationTrial[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      let value: unknown;
      try {
        value = JSON.parse(line);
      } catch {
        throw new Error(`Invalid JSON on line ${index + 1}.`);
      }

      const result = evaluationTrialSchema.safeParse(value);
      if (!result.success) {
        throw new Error(`Invalid evaluation trial on line ${index + 1}: ${result.error.message}`);
      }
      return result.data;
    });
}

export function scoreEvaluation(input: EvaluationTrialInput[]): EvaluationScorecard {
  const trials = input.map((trial) => evaluationTrialSchema.parse(trial));
  const pairs = new Map<string, Partial<Record<'prose' | 'map', EvaluationTrial>>>();

  for (const trial of trials) {
    const key = `${trial.participantId}\u0000${trial.taskId}`;
    const pair = pairs.get(key) ?? {};
    if (pair[trial.condition]) {
      throw new Error(`Duplicate ${trial.condition} trial for ${trial.participantId}/${trial.taskId}.`);
    }
    pair[trial.condition] = trial;
    pairs.set(key, pair);
  }

  const completePairs = [...pairs.entries()].map(([key, pair]) => {
    if (!pair.prose || !pair.map) {
      throw new Error(`Unpaired evaluation trial: ${key.replace('\u0000', '/')}.`);
    }
    return {prose: pair.prose, map: pair.map};
  });

  if (!completePairs.length) {
    throw new Error('At least one paired prose/map trial is required.');
  }

  const mapTrials = completePairs.map((pair) => pair.map);
  const proseTrials = completePairs.map((pair) => pair.prose);
  const metrics = {
    medianEvidenceImprovement: median(
      completePairs.map((pair) => relativeImprovement(pair.prose.evidenceLookupMs, pair.map.evidenceLookupMs)),
    ),
    medianUnresolvedImprovement: median(
      completePairs.map((pair) => relativeImprovement(pair.prose.unresolvedLookupMs, pair.map.unresolvedLookupMs)),
    ),
    proseErrorsPerTrial: mean(
      proseTrials.map((trial) => trial.interpretationErrors + trial.referenceErrors),
    ),
    mapErrorsPerTrial: mean(mapTrials.map((trial) => trial.interpretationErrors + trial.referenceErrors)),
    mapUsefulness: mean(mapTrials.map((trial) => trial.usefulness)),
    mapNodeActionRate: mean(mapTrials.map((trial) => Number(trial.usedNodeAction))),
    mapLessUsefulRate: mean(mapTrials.map((trial) => Number(trial.lessUsefulThanProse))),
  };

  const gates: MetricGate[] = [
    {
      label: 'Evidence lookup improvement',
      actual: metrics.medianEvidenceImprovement,
      target: 0.25,
      direction: 'at_least',
      passed: metrics.medianEvidenceImprovement >= 0.25,
    },
    {
      label: 'Unresolved issue lookup improvement',
      actual: metrics.medianUnresolvedImprovement,
      target: 0.25,
      direction: 'at_least',
      passed: metrics.medianUnresolvedImprovement >= 0.25,
    },
    {
      label: 'Map errors per trial',
      actual: metrics.mapErrorsPerTrial,
      target: metrics.proseErrorsPerTrial,
      direction: 'at_most',
      passed: metrics.mapErrorsPerTrial <= metrics.proseErrorsPerTrial,
    },
    {
      label: 'Map usefulness',
      actual: metrics.mapUsefulness,
      target: 4,
      direction: 'at_least',
      passed: metrics.mapUsefulness >= 4,
    },
    {
      label: 'Node action usage',
      actual: metrics.mapNodeActionRate,
      target: 0.4,
      direction: 'at_least',
      passed: metrics.mapNodeActionRate >= 0.4,
    },
    {
      label: 'Map judged less useful',
      actual: metrics.mapLessUsefulRate,
      target: 0.25,
      direction: 'at_most',
      passed: metrics.mapLessUsefulRate <= 0.25,
    },
  ];

  let decision: EvaluationScorecard['decision'];
  if (completePairs.length < MINIMUM_PAIRS) {
    decision = 'insufficient_data';
  } else if (gates.every((gate) => gate.passed)) {
    decision = 'continue';
  } else if (
    metrics.medianEvidenceImprovement < 0 ||
    metrics.medianUnresolvedImprovement < 0 ||
    metrics.mapErrorsPerTrial > metrics.proseErrorsPerTrial + 0.5 ||
    metrics.mapLessUsefulRate > 0.4
  ) {
    decision = 'stop_or_rethink';
  } else {
    decision = 'iterate';
  }

  return {pairCount: completePairs.length, decision, metrics, gates};
}
