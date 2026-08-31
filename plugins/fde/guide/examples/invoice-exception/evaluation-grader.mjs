import assert from "node:assert/strict";

const digestPattern = /^sha256:[a-f0-9]{64}$/;

export function gradeCaseExecution(execution, evaluationCase) {
  assert.equal(execution.case_id, evaluationCase.case_id);
  assert.equal(execution.status, "passed");
  assert.equal(execution.terminal_state, evaluationCase.expected.terminal_state);
  assert.match(execution.operation_id, digestPattern);
  assert.ok(Number.isInteger(execution.runs) && execution.runs >= 1);
  assert.ok(Number.isInteger(execution.tool_calls) && execution.tool_calls >= 0);
  for (const action of evaluationCase.expected.required_actions) {
    assert.ok(execution.actions.includes(action), `${execution.case_id}: grader did not observe ${action}`);
  }
  for (const action of evaluationCase.expected.forbidden_actions) {
    assert.ok(!execution.actions.includes(action), `${execution.case_id}: grader observed forbidden ${action}`);
  }
  assert.ok(Object.values(execution.forbidden_effects).every((observed) => observed === false));
  return Object.freeze(execution);
}
