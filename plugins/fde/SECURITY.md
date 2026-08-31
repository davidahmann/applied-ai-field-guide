# FDE plugin security notes

Report vulnerabilities through the repository's private process in [`SECURITY.md`](../../SECURITY.md). Do not include customer evidence, credentials, or personal data in an issue.

## Threats covered by tests

- path traversal outside the configured Guide or engagement roots;
- symbolic-link substitution inside an engagement workspace;
- missing, mistyped, or undeclared tool arguments at the server boundary;
- oversized pre-parse STDIO requests;
- concurrent mutation from more than one local MCP process;
- conflicting operation-ID replay;
- cross-scope decision supersession, ambiguous decision heads, and silent scope changes within a decision stream;
- artifact overwrite and self-dependency;
- undeclared, mistyped, unknown, self-referential, or cyclic source and artifact references;
- restricted content, unapproved confidential context, and mixed-classification sources entering the model-visible tool boundary;
- unbounded request, pending-queue, content, result, subprocess, state, status-page, and decision-packet sizes;
- network or HTTP server dependencies in the MCP implementation;
- mutation through read-only tools;
- change-impact claims that exceed declared dependency edges; and
- tool success being presented as customer approval, authority, external effect, or production readiness.

The local process does not create OS-level sandboxing. Filesystem permission, device security, full-disk encryption, backups, retention, malware protection, and OpenAI account or workspace data controls remain host responsibilities.

The event array in `engagement-state.json` is the authoritative local history. `audit.jsonl` is a human-readable diagnostic mirror. A response with `audit_mirror_status: degraded` means the state mutation committed but the mirror must be repaired or regenerated before relying on it for local troubleshooting; neither record is customer or release evidence.

Idempotency receipts retain compact mutation results. A first decision-packet export includes a bounded preview, while an exact replay returns the immutable path and digests with `preview_omitted_from_replay: true`; the preview is not duplicated into long-lived state. Packet sections use byte budgets and report included and omitted counts. Status projections use explicit offsets and byte budgets. The state file has a hard size ceiling and a failed over-limit mutation does not replace the prior valid state.

Status pages are live projections rather than snapshot cursors. Callers must compare `state_digest` between pages and restart pagination if it changes during a read sequence.
