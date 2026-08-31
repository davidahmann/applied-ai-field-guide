# FDE local plugin

FDE is a personal Codex and ChatGPT desktop copilot for live forward-deployed and internal applied-AI engagements. It packages the repository's focused skills and adds a narrow local STDIO MCP process for continuity between sessions.

The Guide remains canonical. The plugin stores a local working projection; it is not a customer system of record, CRM, document-management system, approval service, authorization boundary, or production release system.

## What it adds

- Sixteen focused Guide skills, including an engagement conductor, decision-scoped data readiness, enterprise integration, material change impact, and approved-slice delivery.
- One local engagement boundary at a time: tenant, workflow, classification, retention summary, sources, artifact revisions, decisions, dependencies, and events.
- Bounded Guide search over the versioned Guide snapshot installed with the plugin.
- Immutable artifact revisions with digests and declared source and artifact dependencies.
- Deterministic next-move routing and dependency traversal.
- A compact Markdown decision packet for human review.

## Security boundary

The MCP server:

- communicates over STDIO only and opens no network listener;
- makes no network, browser, cloud-drive, email, or external API calls;
- does not read a path or URL supplied as source metadata;
- writes only below the configured engagement root;
- rejects path traversal and symbolic links;
- separates read, record, immutable-save, validate, decision-record, and export tools;
- serializes mutations across local processes, binds them to caller-provided operation IDs, and rejects conflicting replays;
- never overwrites an artifact revision;
- treats structured events in `engagement-state.json` as the authoritative local history and writes `audit.jsonl` as a diagnostic mirror whose status is reported to the caller;
- refuses restricted content through its model-visible interface, requires a machine-local opt-in before confidential work can enter model context, and prevents a source from exceeding its engagement classification; and
- never claims that local state proves source authority, human approval, customer acceptance, an external effect, or release readiness.

Any text passed to a plugin tool or returned to Codex can enter the active OpenAI model context. Keep restricted data, secrets, credentials, patient or customer identifiers, and employer-confidential material out of prompts and tool arguments. Register metadata and governed locators instead, then use the customer's approved evidence surface for the source itself.

## Local configuration

The installer writes a machine-local configuration outside the repository:

```json
{
  "guide_root": "/home/user/plugins/fde/guide",
  "validator_root": "/path/to/trusted/fde-guide-checkout",
  "workspace_root": "/path/to/FDE-Engagements",
  "max_read_bytes": 65536,
  "max_write_bytes": 262144,
  "allow_confidential_model_context": false
}
```

The default location is `~/.config/fde/config.json`. Set `FDE_CONFIG_PATH` to use a different file. Guide and workspace roots must be existing, non-symlink directories. The installer binds `guide_root` to the installed snapshot. `validator_root` records the trusted checkout used for canonical JSON validation; other tools remain available if that checkout is later unavailable, while canonical validation fails closed with `VALIDATOR_RUNTIME_UNAVAILABLE`. The validator also compares its executable and schema digests with the installed snapshot before running.

Confidential engagement metadata or content is unavailable unless `allow_confidential_model_context` is changed to `true` in this machine-local file. That is an operator policy choice, not consent inferred from a prompt. Restricted engagements and sources are unsupported at this model-visible boundary.

## Tool boundary

| Tool | Effect | Important limit |
| --- | --- | --- |
| `guide_search` | Read | Cataloged local Guide files only; bounded excerpts |
| `engagement_list` | Read | Bounded metadata only; policy-hidden work stays hidden |
| `engagement_start` | Create | One named local workspace; no external record |
| `engagement_status` | Read | Byte-bounded, offset-pageable projection; reports totals and truncation |
| `artifact_read_revision` | Read | One immutable revision; bounded untrusted content |
| `source_register` | Append | Metadata and caller-supplied excerpt only; no source fetching |
| `artifact_save_revision` | Create immutable revision | No overwrite, acceptance, or release |
| `artifact_validate` | Read and fixed validator process | Structural evidence only; no arbitrary command |
| `decision_record` | Append | Records the supplied human authority basis; non-artifact decisions require a typed stream and explicit same-stream supersession |
| `change_impact_assess` | Read | Declared dependencies only; unknown coverage stays unknown |
| `next_field_move` | Read | Conservative artifact-presence routing only |
| `decision_packet_export` | Create immutable summary | Byte-bounded reference index with omission counts and continuation guidance; not approval or source content |

All tools are local development capabilities. Production or customer use still requires the target organization's capability admission, classification, retention, access, audit, evaluation, and disable evidence under `TOL-006` and its own policy.

`next_field_move` does not assume every engagement needs a reframe. It routes through reframe review only when a current `engagement-reframe` revision has been recorded and not accepted. Artifact presence is not completeness evidence; every routed stage requires a scoped human review of the exact artifact ID, revision, and digest. Rejected proposals preserve the previous accepted revision. Multiple artifact streams for one routed stage are treated as ambiguous rather than silently selected.

Non-artifact decisions require a stable `decision_stream_id`. A later disposition changes that stream only when `supersedes_decision_id` names its current decision and the scope digest is unchanged; a different scope opens a new stream. Artifact reviews derive their stream from the exact artifact ID, revision, and digest, and a repeated review must explicitly supersede the current review for that candidate. Active stop, defer, review-required, pause, rollback, constrain, reject, or revise decisions remain visible across streams instead of being cleared by an unrelated later decision.

Status offsets page the current projection, not a frozen snapshot. Compare `state_digest` across page calls and restart from offset zero when it changes; otherwise a concurrent local write could shift page membership.

Use canonical artifact-type names when saving revisions: `field-observation-log`, `workflow-charter`, `value-case`, `data-context-manifest`, `intelligence-selection-record`, `enterprise-integration-map`, `production-system-design`, `secure-action-boundary-review`, `approved-delivery-slice`, `evaluation-report`, `production-service-readiness`, `customer-enablement-handoff`, and `production-service-review`. A few shorter aliases remain accepted by next-move routing for existing local work. Artifact writes are working states (`draft` or `proposed`); only an exact-revision `artifact_review` records acceptance, rejection, or revision. `source_refs` accept source IDs; `depends_on` accepts artifact IDs and must remain acyclic. Every saved dependency and decision evidence reference is bound to its immutable revision or digest at record time.

## Install from this checkout

From a trusted checkout:

```bash
npm ci --ignore-scripts
npm run plugin:sync
npm run plugin:validate
python3 ~/.codex/skills/.system/plugin-creator/scripts/create_basic_plugin.py fde --with-marketplace
node scripts/install-fde-plugin.mjs --replace
python3 ~/.codex/skills/.system/plugin-creator/scripts/read_marketplace_name.py
codex plugin add fde@personal
```

The scaffold command creates the supported personal marketplace entry. The installation script then replaces only the scaffolded `~/plugins/fde` package, creates `~/FDE-Engagements` when needed, and writes the local configuration. It refuses to replace an existing plugin unless `--replace` is supplied. Replacement first moves the old installation to a timestamped backup beside it. If the marketplace helper prints a name other than `personal`, use that validated name in the final command.

Start a new Codex task after installation so the plugin and its MCP process are loaded. Do not submit this personal package to the public OpenAI plugin directory.

## Disable and recover

Disable or remove the personal marketplace entry to stop new use. Existing engagement folders remain local and readable. Revoke access to any customer-governed sources separately; the plugin holds no customer credentials. If an artifact save is interrupted, immutable files without a matching state record are not current evidence and may be quarantined after manual review. A process crash can leave `engagement-state.json.lock`; inspect the engagement state and active processes before manually removing that exact lock. The plugin never guesses that a lock is stale.

The local state file is intentionally capped. An over-limit mutation fails before replacing the prior valid state. For an unusually long engagement, export and review a packet before the cap is approached, preserve the original folder read-only, and start a clearly linked successor engagement rather than editing or compacting history in place.
