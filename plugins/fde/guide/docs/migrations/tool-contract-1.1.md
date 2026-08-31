# Tool Contract 1.1 Migration

Tool-contract Schema `1.1.0` makes data disclosure and network capability explicit. Contracts valid only against Schema `1.0.0` fail current repository validation until migrated.

## Required changes

1. Set `schema_version` to `1.1.0`.
2. Add `data_access`:
   - Set `reads_data` explicitly.
   - For a read-capable tool, declare sensitivity classifications, the highest response sensitivity, required input scope fields, maximum records and response bytes, whether the source is open-world, and the approval policy.
   - For a tool that does not retrieve business data, use empty classifications and scope, `maximum_sensitivity: none`, zero response limits, `open_world: false`, and `approval_policy: none`.
   - Declare every model-controlled outbound field in `request_fields`, including its sensitivity, source, permitted sink service IDs, and purpose. The gateway must reject outbound fields or sinks absent from this policy.
3. Replace network destination strings with exact destination objects containing `service_id`, `scheme`, `authority`, `port`, and `path_prefix`. Wildcards, URI templates, user information, query strings, fragments, parent or percent-encoded traversal, root-wide prefixes, and dynamic authorities are invalid.
4. Expand `network` with allowed operations and methods, redirect, address-resolution, private-address, and server-fetch policy, target-account and tenant binding, request/response limits, credential broker, and `public_gateway_capability`.
   - Query tools may use only `GET` or `POST`; safety still comes from a server-side operation contract, not the method name.
   - Internal, confidential, or restricted reads require caller and tenant binding, target-account binding, a credential broker, and `policy` or `per_request` approval.
   - Public open-world reads must call one exact gateway destination, name its exact service and operation in `public_gateway_capability`, send only fields classified `public`, use no ambient credential broker, deny private addresses and redirects, and delegate remote fetching to the separate gateway capability.
5. Add `retry_safety` to every failure mode. Use `never` when `retry` is false and `idempotent_replay` only when the backing service safely deduplicates replay.
   - `execution.retryable_errors` must exactly equal the failure codes whose `retry` value is true.
   - Duplicate failure codes and automatic retries for authorization, validation, terminal, or escalation failures are invalid.
   - A side-effecting tool may retry only with enforced idempotency.
6. Ensure every idempotency key field exists in `input_schema.properties` and is required. A `commit_write` contract must include `idempotency_key` in both the input and `execution.idempotency.key_fields`.
7. Ensure every declared data-access scope field exists in `input_schema.properties` and is required.
8. Ensure an allowlisted network policy includes the contract's `tool_id` in `allowed_operations` and preserves authorization tenant binding.
9. Add `TOL-005` to read-capable tools and `SEC-006` where the capability-aware egress control applies.

## Migration gate

Run:

```bash
npm run test:contracts
node --test tests/tool-security.test.mjs
npm run validate
```

Do not copy the example limits mechanically. Set classifications, field-level source-to-sink rules, cardinality, payload limits, approval, exact destinations, operations, account binding, tenant binding, and retry semantics from the target service's real disclosure and capability boundary. Enforce the contract at the tool gateway; a valid JSON document is not the enforcement mechanism.

## Rollback

Release tags before this migration retain Schema `1.0.0`. Do not weaken the current schema to accommodate an unmigrated production tool; pin the prior repository release while updating the contract and gateway implementation together.
