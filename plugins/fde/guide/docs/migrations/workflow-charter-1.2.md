# Workflow Charter 1.2 Migration

Workflow-charter Schema `1.2.0` adds expected residual loss to the value contract so planning and service review do not overstate net value. Charters valid only against Schema `1.1.0` fail current repository validation until migrated.

## Required changes

1. Set `schema_version` to `1.2.0`.
2. Add `value_case.annual_expected_residual_loss_usd` as a non-negative number only for loss not already netted from unit value or avoided loss, or `null` when it is not yet measured.
3. Define avoided loss as a measured reduction from the baseline. Record residual loss separately only for harm not already netted from avoided loss or unit value.
4. For one loss class, use either gross exposure minus residual loss or net avoided loss; confirm that avoided loss, residual loss, unit value, recovery cost, and guardrail impact do not count the same event twice.
5. Recalculate steady-state and year-one net value, then obtain the normal workflow decision approvals when the result or risk ceiling changes.

## Migration gate

Run:

```bash
npm run test:contracts
npm run test:value-framework
npm run validate
```

Do not replace an unknown residual-loss estimate with zero. Keep it `null`, lower the confidence rating, and make measurement a pilot gate.

## Rollback

Release tags before this migration retain Schema `1.1.0`. Pin the prior repository release while migrating existing charters; do not weaken Schema `1.2.0` to accept a value model that silently omits residual loss.
