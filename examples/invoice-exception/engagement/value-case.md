# Worked Value Case

This is a falsifiable forecast for the bounded recommendation-and-staging slice. Every number is illustrative. None is a measured customer result.

## Decision event

Decide after a time-bounded shadow pilot whether to stop, reshape, or propose a named canary segment. The accounts-payable service owner owns the decision; the finance controls manager verifies acceptance and control compliance.

## Forecast

| Assumption | Illustrative value | How a target engagement would verify it |
| --- | ---: | --- |
| Eligible exceptions per month | 500 | Queue query with exclusions and deduplication |
| Eligible cases that reach the surface | 60% | Predeclared exposure event |
| Reached cases independently accepted | 80% | Approved proposal plus ledger readback |
| Reviewer time saved per accepted case | 6 minutes | Matched time study against the current workflow |
| Loaded reviewer cost | $55/hour | Finance-approved labor basis |
| Fixed delivery, assurance, support, and operating allocation | $850/month | Actual cost ledger |
| Variable model, tool, and compute cost | $0.50/reached case | Metered route and tool costs |

The forecast produces:

```text
reached cases = 500 × 60% = 300
accepted outcomes = 300 × 80% = 240
gross time value = 240 × 6/60 × $55 = $1,320/month
full monthly cost = $850 + (300 × $0.50) = $1,000/month
forecast net value = $1,320 - $1,000 = $320/month
forecast cost per accepted outcome = $1,000 / 240 = $4.17
```

The margin is deliberately narrow. A small miss in adoption, acceptance, reviewer effort, or support cost can erase it.

## Graduation thresholds

Propose a canary only if the named segment produces at least 200 independently accepted outcomes in the agreed monthly equivalent, reviewer time falls by at least 5 minutes per accepted case, P95 full cost per accepted outcome is no more than $6, reviewer correction or rejection stays below 20%, and prohibited or unverified effects remain at zero. Production readiness and receiving-team capability must pass separately.

Stop or reshape if the authority boundary changes, representative cases show material uncovered exceptions, the eligible population is below 350 per month, reviewer time does not improve, the cost ceiling is breached, or any unauthorized, duplicate, or unverified effect occurs.

## What is measured separately

- Forecast value versus demonstrated pilot evidence versus realized production value.
- Technical case pass rate versus operator acceptance and adoption.
- Runtime cost versus reviewer, support, incident, recovery, and allocated lifecycle cost.
- Time saved versus downstream rework or residual loss.

The current repository has only deterministic fixture evidence. Until live sources, eligible users, accepted outcomes, time study, and full costs are observed, the value decision remains `unverified`.
