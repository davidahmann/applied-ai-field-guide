# Repository Maintenance

This document keeps the guide coherent as research, controls, templates, examples, and platform behavior change.

## Content layers

| Layer | Authority | Change obligation |
| --- | --- | --- |
| `guide/` | Five-minute orientation, concise human mental model, and role and practice guidance | Keep the overview short, the core method linear, and the capability roadmap non-normative, evidence-oriented, and free of duplicated contract detail or certification claims |
| `.agents/skills/` | Focused human- and agent-readable task routes | Keep triggers distinct, procedures thin, outputs explicit, metadata valid, and links bound to canonical artifacts |
| `plugins/applied-ai-field-guide/` | Local personal distribution of the complete skill pack and bounded STDIO workspace | Keep generated skill copies in exact sync except for deterministic packaged-link rewriting, tools local and typed, immutable revisions and event history contained, the mutable projection atomic, and model-context and authority limits explicit |
| `research/` | Dated evidence and caveats | Verify source, date, attribution, and claim boundary |
| `controls/` | Normative project requirements | Link evidence and release gates; update affected verification |
| `schemas/` | Machine-readable structural contracts | Update template, examples, validator mapping, positive and negative tests |
| `patterns/` | Evidence-linked decisions and anti-patterns | Add detection, response, verification, and review date |
| `blueprints/` | Reference system designs | Cover components, boundaries, state, failure, telemetry, and release tests |
| `solutions/` | Business-flow patterns, industry profiles, and horizontal delivery accelerators | Keep the layer explicit, maturity honest, the operating decision and boundary narrow, and acceptance, operations, customer-specific work, non-claims, and canonical links complete |
| `playbooks/` | Applied-AI delivery and operating sequence | Keep entry/exit evidence, owners, and decisions explicit for internal teams and customer engagements |
| `templates/` | Reusable working artifacts | Remain valid, scoped, and consistent with controls and playbooks |
| `examples/` | Executable teaching evidence | Keep claims limited to tested behavior; add regressions for fixes |
| `operations/` | Release and service contracts | Update alerts, runbooks, gates, rollback, and review cadence together |
| `library/` | Explanatory synthesis | Cite stable source IDs and avoid duplicating normative contracts |
| `site/` | Generated public discovery layer | Map one canonical source to one intent-led route; keep UI, metadata, crawler files, and search deterministic and free of duplicate prose |

## Claim workflow

1. Record the primary source, publication or review date, evidence tier, finding, portable pattern, anti-pattern, and caveat.
2. Attribute vendor metrics and speaker claims; do not convert them into generic thresholds.
3. Prefer specifications, incident reports, engineering artifacts, and reproducible repositories over commentary.
4. For a normative control, require direct supporting evidence and a concrete release gate.
5. For experimental guidance, label it and state the local evidence required before adoption.
6. Set or preserve a review date for changing platform behavior.

## Consolidation and pruning

Prefer an edit, merge, or clearer route over a new canonical artifact. Add a file only when it answers a distinct user decision, cannot be expressed as a section of an existing authority, and has one obvious owner and retirement path.

For every content-bearing release:

1. Record which artifact was added, merged, superseded, or removed and why the surviving route is clearer.
2. Check whether the change duplicates a lifecycle, framework, template, audience page, worked case, or normative requirement.
3. Keep one canonical lifecycle and one definitive home for each framework; label compressed field and capability views rather than letting them drift into alternatives.
4. Merge partial examples when one coherent case can carry field, value, design, evaluation, adoption, handoff, and operating evidence more honestly.
5. Remove or redirect stale navigation in README, AGENTS, llms, catalog, site configuration, tests, and generated routes in the same release.
6. Preserve historical evidence in Git and the changelog; do not keep a live duplicate merely to preserve history.

Keep one canonical end-to-end worked engagement unless a second case teaches a materially different lifecycle decision that cannot be expressed as a bounded vignette, exercise, or extension of an existing example. An implementation reference does not need a parallel engagement chain merely for symmetry. Deepen the existing chain before adding another.

A growing file count is not evidence of coverage. The acceptance test is whether a first-time user can reach the next decision with fewer unowned choices.

The v1.26.0 inventory is the consolidation ceiling for the densest public layers:

| Layer | Ceiling | Rule |
| --- | ---: | --- |
| `library/*.md` | 18 | Merge or retire a chapter before adding one |
| top-level `templates/*` | 36 | Extend an existing decision artifact before introducing another |
| `blueprints/*.md` | 12 | Add a blueprint only after a distinct boundary cannot fit an existing design |
| `guide/*.md` | 5 | Keep two main front doors; audience pages must answer a distinct decision |

These are maximums, not coverage targets. Raising one requires an explicit maintainer decision in the changelog: what could not be merged, who owns the new artifact, which route it replaces or improves, and what would trigger retirement. Content-bearing releases must report the net file-count change for these layers; growth without a compensating merge or removal is a failed consolidation review.

## Contract change matrix

| Changed artifact | Also inspect |
| --- | --- |
| Workflow charter | Value case and residual-loss definitions, agent system, discovery/value playbook, release gate, examples, and migration note |
| Control | Evidence anchor, schema constraints, blueprint, operations, tests |
| Schema | Canonical template, example documents, validator mapping, contract tests |
| Breaking schema revision | Migration note under [`docs/migrations/`](../migrations/README.md), canonical template, every governed example, validator mapping, and negative tests |
| Tool contract | Authorization, data exposure, egress, threat model, evals, runtime |
| Capability manifest | Source and artifact provenance, attestation and trust root, SBOM, registry decision, runtime authority, disable test |
| Handoff contract | Parent authority, signed payload, expiry, nonce replay, budget/depth attenuation, consumer enforcement |
| Domain model | Context, tool resources, policy, state migration, readback |
| System map or impact assessment | Source revisions, classification, extraction/inference labels, freshness, owner review, validation, rollout, rollback, and authority boundaries |
| Agent system | Charter, tools, eval suite, telemetry, runbook, release manifest |
| Evaluation | Tested claim, environment, trials, contamination, calibration, release threshold |
| Solution release | Bound artifact digests, compatibility, migration, evaluation report, rollout, approvals, and rollback |
| Behavior config | Per-model/route results, canary, rollback, dependency lifecycle |
| Telemetry or receipt | Producer, exporter allowlist, DLP checks, schema, semantic bindings, retention, incident queries |
| Operations contract | SLO, alert, runbook, incident query, game day, example telemetry |
| Repository skill | Trigger neighbors, value-framework and selected-solution routing, linked controls and artifacts, `agents/openai.yaml`, catalog entry, skill tests, README, AGENTS, and llms |
| Local plugin or MCP tool | Canonical skill parity, manifest and MCP metadata, input schema, path and size limits, idempotency, immutable history, model-context disclosure, local install and disable path, negative tests, README, AGENTS, llms, package scripts, and release version |
| Solution artifact | Layer and coverage map, primary operating or technical boundary, referenced controls and templates, acceptance cases, operating measures, customer-specific decisions, catalog entry, navigation, and solution tests |
| Public navigation or site | README hierarchy, five-minute and concise Guides, AGENTS, llms, site route and metadata map, crawler files, Pages workflow, contribution docs, executable examples, and site tests |

## Research refresh

- Review dated platform guidance at least every six months or sooner after a major incident, specification change, deprecation, or model/runtime release.
- Check links, dates, canonical source location, and whether later reporting changed the finding.
- Move superseded guidance to an archive only after dependent controls and patterns are updated.
- Preserve prior claim context in Git history and the changelog; do not silently rewrite an incident or vendor claim.

## Release procedure

1. Inspect branch, remotes, status, and full diff.
2. Run `npm ci --ignore-scripts`, `npm test`, and `git diff --check`; `npm test` includes solution, value-framework, skill-metadata, local-plugin, site-build, link, metadata, and catalog checks.
3. Run spelling, action workflow, dependency, and secret scans used by the current project.
4. Confirm all new governed artifacts are cataloged and every new source ID resolves.
5. Proofread README, five-minute and concise Guides, capability roadmap, AGENTS, llms, generated site routes and descriptions, playbook routes, changelog, package/citation versions, and release links.
6. When skill discovery or packaging changes, verify `npx skills add davidahmann/applied-ai-field-guide --list` from a disposable environment; do not add this network-dependent smoke test to the deterministic CI gate.
7. When the local plugin changes, run its official plugin validator in a disposable Python environment, install it locally from the trusted release tree, start a fresh task, and verify STDIO initialization plus one read and one contained write without customer data. For identity or configuration moves, follow the [2.0 migration](../migrations/applied-ai-field-guide-2.0.md) and verify that existing engagement files are unchanged.
8. Use a scoped commit and draft pull request; do not bypass protected `main`.
9. Require CI and review before merge; tag only after the release tree and metadata agree.

## Public site procedure

- Treat repository Markdown as the only content source. Add a route in `site/site.config.mjs` only when the source answers a distinct reader question.
- Keep page titles and descriptions specific, factual, and unique. Do not add keyword lists, synthetic FAQs, duplicate articles, or claims about search ranking.
- Run `npm run test:site`, then inspect representative desktop and mobile renders before publishing a UI or navigation change.
- For interactive changes, provision Playwright with Chromium, build the site, then run `node scripts/check-site-browser.mjs`. `PLAYWRIGHT_MODULE` can point to a preinstalled module; `SITE_SCREENSHOT_DIRECTORY` optionally retains desktop/mobile captures. This additional browser lane exercises real search/close behavior and the practice review flow; it is separate from the dependency-light deterministic CI gate.
- The Pages workflow builds `site-dist/` in CI and deploys only that artifact. Do not commit generated output.
- Keep `robots.txt`, `sitemap.xml`, structured metadata, the generated web `llms.txt`, and visible source links bound to the same route map.
- After deployment, verify the canonical URL, core assets, sitemap, crawler policy, and a deep route over HTTPS. Use Search Console or equivalent measurement after ownership is configured; do not infer ranking from a successful deployment.

## Social preview procedure

- Keep [`assets/applied-ai-field-guide-social.svg`](../../assets/applied-ai-field-guide-social.svg) as the editable 1280 × 640 source. Exact copy, dimensions, safe margins, and the repository URL remain deterministic.
- Export [`assets/applied-ai-field-guide-social.png`](../../assets/applied-ai-field-guide-social.png) at 1280 × 640, under 1 MB, with no external fonts or network-loaded assets. The public site uses this raster file for Open Graph and X metadata because those consumers do not consistently render SVG previews.
- Inspect the PNG at full size and a small feed-sized preview. Check clipping, contrast, legibility, and whether the four-step path reads in order.
- After merge, upload the PNG under repository **Settings → Social preview → Edit**. GitHub accepts PNG, JPG, or GIF; the SVG remains the maintained source for future revisions.
- Verify the public repository card or `openGraphImageUrl` after propagation. A committed asset alone does not change GitHub's repository social-preview setting.

## Maintainer acceptance questions

- Does the change improve a real user path or contract rather than add parallel prose?
- Can a first-time human understand the essential method in five minutes, then find the right deeper route without scanning the repository?
- Does a solution artifact make the business decision and delivery boundary clearer without becoming a parallel methodology, shallow industry wrapper, or claim of deployable completeness?
- Can a person and a coding agent find the new artifact from the task they are trying to complete?
- Are evidence, recommendation, control, implementation, and verification clearly separated?
- Does a failure have one owning layer and a regression path?
- If a map is added, is it genuinely cheaper than navigating the primary artifacts, and is it clearly prevented from becoming a shadow source of truth or control plane?
- Are customer-specific or confidential details excluded?
- Is the simpler design still available and compared?
- Can the artifact be retired or migrated without breaking navigation or hidden consumers?
