# Reference-Solution Standards Note

## Scope

This note records primary implementation anchors reviewed for the reference-solution accelerators on 2026-08-09. It does not define a universal provider profile or make a compliance claim.

## Sources

### RS-01: OpenID Foundation specifications

- **Source:** [OpenID Foundation specification index](https://openid.net/developers/specs/)
- **Source type:** official standards index
- **Reviewed:** 2026-08-09
- **Portable finding:** authentication and authorization profiles have explicit protocol, claim, endpoint, and conformance boundaries. A delivery must select the applicable final specification or named profile rather than treating “OAuth” or “SSO” as one interchangeable behavior.
- **Limit:** conformance to a specification does not prove the application's tenant mapping, session handling, entitlement policy, or request-time authorization.

### RS-02: SCIM protocol

- **Source:** [RFC 7644: System for Cross-domain Identity Management Protocol](https://datatracker.ietf.org/doc/html/rfc7644)
- **Published:** 2015-09
- **Source type:** IETF standards-track RFC
- **Reviewed:** 2026-08-09
- **Portable finding:** SCIM defines resource-management endpoints and methods for cross-domain identity provisioning, with provider schema and processing differences that clients must handle explicitly.
- **Limit:** provisioning state is not a substitute for authorization at the application action boundary.

### RS-03: Stripe usage meters

- **Source:** [Create and configure a meter](https://docs.stripe.com/billing/subscriptions/usage-based/meters/configure)
- **Source type:** current first-party platform documentation
- **Reviewed:** 2026-08-09
- **Portable finding:** a usage-billing integration must make event name, customer mapping, value mapping, ingestion mode, and aggregation formula explicit. Corrections and finalized billing periods have provider-specific constraints.
- **Limit:** this is a changing Stripe contract, not a general billing standard. Verify the current API, event-adjustment window, and invoice behavior before each implementation and keep an internal source ledger for reconciliation.

### RS-04: OpenTelemetry semantic conventions

- **Source:** [OpenTelemetry semantic conventions 1.44.0](https://opentelemetry.io/docs/specs/semconv/)
- **Source type:** official project specification
- **Reviewed:** 2026-08-09
- **Portable finding:** shared telemetry names and signal conventions can improve cross-service operability when their version and stability are explicit.
- **Limit:** generic semantic conventions do not supply workflow outcome, authorization, external-effect, readback, customer-health, or value semantics for a specific system.

## Implementation impact

- The [enterprise foundation accelerator](../solutions/enterprise-foundation.md) keeps authentication, provisioning, request authorization, tenant identity, metering, and reconciliation as distinct owned controls.
- The [deployment and operations accelerator](../solutions/deployment-and-operations.md) treats generic telemetry conventions as implementation anchors under a workflow-specific operating contract.
- Provider documentation and standards links are starting evidence only. Target deployments still require pinned profiles, contract tests, failure cases, compatibility evidence, and named owners.
