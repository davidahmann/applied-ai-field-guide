# Governance

The FDE Guide is an independent, maintainer-led open-source project.

## Roles

- **Maintainer:** David Ahmann owns releases, repository administration, security response, and final decisions on normative controls.
- **Contributors:** Anyone may propose corrections, patterns, schemas, blueprints, evaluations, or implementation changes through issues and pull requests.

Project participation does not imply endorsement by a contributor's employer. The repository does not represent the policies of David Ahmann's current or former employers.

## Decisions

Technical decisions are made in public issues and pull requests except coordinated vulnerability disclosure. Decisions prioritize, in order:

1. external-effect safety and caller authorization;
2. reproducible evaluation and operational recovery;
3. traceable primary evidence;
4. portability across models, vendors, and frameworks;
5. implementation simplicity.

Normative control changes require linked evidence, a release gate, and regression coverage. Vendor-specific or experimental guidance remains non-normative until the evidence threshold in [`research/README.md`](research/README.md) is met.

## Releases

The maintainer publishes releases from protected `main` after required validation passes. Schema and control compatibility is recorded in the changelog and release notes. Security releases may use a private advisory and coordinated disclosure path.

## Changes to governance

Governance changes use the same public pull-request process. If the project becomes inactive, the Apache-2.0 license preserves the community's right to fork and continue the work.
