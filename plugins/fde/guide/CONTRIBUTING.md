# Contributing

Contributions that improve the technical accuracy, executable examples, controls, schemas, evaluations, or source quality are welcome.

## Before opening a change

1. Read [`AGENTS.md`](AGENTS.md) and follow the route for your change.
2. Search existing [issues](https://github.com/davidahmann/fde-guide/issues) and pull requests.
3. For a new control, schema, or blueprint, open a design proposal before a large implementation.
4. For a security issue, follow [`SECURITY.md`](SECURITY.md) instead of opening a public issue.

## Local verification

Requires Node.js 22 or later.

Review repository code before execution. For an untrusted contribution, rely on CI or use a disposable environment with no credentials or sensitive data; `npm test` executes repository-controlled code.

```bash
npm ci --ignore-scripts
npm test
git diff --check
```

Pull requests must keep the repository validator green and include regression coverage for corrected failures.

## Contribution contract

- New or changed normative production requirements use `MUST`, `SHOULD`, or `MAY` and cite control IDs.
- Runtime contracts use JSON Schema 2020-12; new or changed safety constraints include positive and negative tests.
- Blueprints define components, trust boundaries, state transitions, failure behavior, telemetry, and release tests.
- Solution artifacts compose existing methods around one recurring business flow, industry specialization, or horizontal delivery boundary. They declare maturity and include a smallest useful slice, acceptance and operating contracts, customer-specific work, and explicit non-claims.
- Examples include a design record, ontology, tool contracts, eval cases, threat model, and executable verification when feasible.
- Changeable platform claims cite a dated primary source in `research/`.
- Vendor metrics remain attributed; experimental findings remain labeled.
- Model output never authorizes effects, exposes secrets, changes its evaluator, or proves task completion.
- Public site pages are generated from canonical Markdown through `site/site.config.mjs`; improve the source guide instead of creating duplicate web-only prose.

## Evidence changes

Source corrections should identify the affected claim, stable source URL, publication date, source type, and proposed impact on controls or patterns. Prefer specifications, release notes, incident reports, reproducible research, and first-party engineering reports over summaries.

## Agent-assisted changes

Agent-assisted contributions are welcome. The human submitter remains responsible for scope, provenance, licensing, secret removal, test evidence, and the final diff. Include the commands and material evidence used to validate the change; do not submit hidden reasoning or credentials.

## Skill changes

Repository skills live under [`.agents/skills/`](.agents/skills/) and remain thin task interfaces over the guide's canonical controls and artifacts. A new or changed skill must:

- define a distinct trigger in `SKILL.md` frontmatter using only `name` and `description`;
- route to existing controls, playbooks, templates, and examples instead of copying a second methodology;
- load only the selected business-flow or vertical context and state that solution accelerators are hypotheses, not customer observations, policy, or release evidence;
- name its output, stop conditions, and safety boundary without claiming tool or approval authority;
- keep `agents/openai.yaml` consistent with the skill name and trigger;
- be registered in [`catalog.json`](catalog.json) and covered by `npm run test:skills`;
- update `README.md`, `guide/README.md`, `AGENTS.md`, and `llms.txt` when public navigation or the shared method changes.

## Suggest a field signal or learning resource

Use the focused [field-signal form](https://github.com/davidahmann/fde-guide/issues/new?template=field-signal.yml) for one anonymized delivery lesson, failure pattern, useful practitioner resource, or missing capability topic. This is the lowest-friction contribution path; you do not need to propose a control, schema, or implementation.

Explain why the signal matters to FDE or applied-AI work, state whether it comes from direct experience or a source, and keep the claim no broader than the evidence. Do not include customer names, employer-confidential material, private data, credentials, or a disguised vendor pitch. A submitted signal is a research lead, not authority, target evidence, or an automatic roadmap addition.

## Pull requests

Keep each pull request reviewable and scoped to one outcome. Explain:

- the production problem or evidence correction;
- the controls and artifacts affected;
- the tests or replay cases added;
- the operational or compatibility risk;
- the rollback path when behavior changes.

By contributing, you agree that your contribution is licensed under the repository's [Apache License 2.0](LICENSE). Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).
