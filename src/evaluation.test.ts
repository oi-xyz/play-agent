import assert from 'node:assert/strict';
import {test} from 'node:test';
import {parseEvaluationJsonl, scoreEvaluation} from './evaluation';

function pairedTrials(pairCount: number) {
  return Array.from({length: pairCount}, (_, index) => {
    const common = {participantId: `participant-${index + 1}`, taskId: `task-${index + 1}`};
    return [
      {
        ...common,
        condition: 'prose' as const,
        evidenceLookupMs: 1000,
        unresolvedLookupMs: 1200,
        interpretationErrors: 1,
        referenceErrors: 0,
        usefulness: 3,
      },
      {
        ...common,
        condition: 'map' as const,
        evidenceLookupMs: 600,
        unresolvedLookupMs: 800,
        interpretationErrors: 0,
        referenceErrors: 0,
        usefulness: 4,
        usedNodeAction: index < 5,
        lessUsefulThanProse: false,
      },
    ];
  }).flat();
}

test('evaluation scorecard continues only after enough paired trials pass every gate', () => {
  const scorecard = scoreEvaluation(pairedTrials(10));

  assert.equal(scorecard.pairCount, 10);
  assert.equal(scorecard.decision, 'continue');
  assert.equal(scorecard.metrics.medianEvidenceImprovement, 0.4);
  assert.equal(scorecard.metrics.mapNodeActionRate, 0.5);
  assert.equal(scorecard.gates.every((gate) => gate.passed), true);
});

test('evaluation scorecard reports insufficient data without weakening metric gates', () => {
  const scorecard = scoreEvaluation(pairedTrials(2));
  assert.equal(scorecard.decision, 'insufficient_data');
  assert.equal(scorecard.gates.every((gate) => gate.passed), true);
});

test('evaluation parser rejects malformed and unpaired observations', () => {
  assert.throws(() => parseEvaluationJsonl('{bad json'), /Invalid JSON on line 1/);
  assert.throws(() => scoreEvaluation([pairedTrials(1)[0]]), /Unpaired evaluation trial/);
});
