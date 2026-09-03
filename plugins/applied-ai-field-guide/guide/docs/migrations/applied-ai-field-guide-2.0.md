# Applied AI Field Guide 2.0 Migration

Version 2.0 changes the project's public identity and distribution paths. It does not create a new lifecycle, weaken a control, or turn local practice artifacts into production evidence. The project is now **The Applied AI Field Guide**, with explicit routes for internal delivery and operations as well as forward-deployed work.

## Repository and web links

The repository moves from `davidahmann/fde-guide` to `davidahmann/applied-ai-field-guide`. Update clone remotes, scripts, bookmarks, installed-skill sources, and documentation links to the new repository. [GitHub redirects repository and Git URLs, but not a GitHub Pages project site's old base URL](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository). Do not reuse the old repository name: that can remove the repository redirect.

The public site is now <https://davidahmann.github.io/applied-ai-field-guide/>. Update links that begin with the old `/fde-guide/` Pages base. Compatibility pages for the former deep routes exist **under the new base**; they cannot rescue a request made to the retired base URL.

| Previous route | Current route under the new base |
| --- | --- |
| `/forward-deployed-engineering/` | `/applied-ai-delivery/` |
| `/forward-deployed-engineer-roadmap/` | `/applied-ai-capability-roadmap/` |
| `/fde-operating-model/` | `/applied-ai-operating-model/` |

## Source paths and identifiers

| Previous source path | Current source path |
| --- | --- |
| `guide/fde-guide-in-five-minutes.md` | `guide/field-guide-in-five-minutes.md` |
| `templates/fde-discovery-pack.md` | `templates/discovery-pack.md` |
| `templates/fde-portfolio-review.md` | `templates/workflow-portfolio-review.md` |
| `library/10-fde-and-production-agent-synthesis.md` | `library/10-applied-ai-delivery-and-operating-model.md` |
| `.agents/skills/run-fde-engagement/` | `.agents/skills/run-ai-engagement/` |
| `plugins/fde/` | `plugins/applied-ai-field-guide/` |
| `scripts/sync-fde-plugin.mjs` | `scripts/sync-guide-plugin.mjs` |
| `scripts/install-fde-plugin.mjs` | `scripts/install-guide-plugin.mjs` |

Use `catalog.json` to resolve current paths. Existing controls such as `FDE-001`, artifact IDs such as `template.fde-discovery`, and persisted engagement formats retain their identifiers; these are compatibility contracts, not the public brand. The conductor skill ID changes to `skill.run-ai-engagement`. Other skill names remain unchanged.

Schema `$id` URLs now use the new repository slug, and the workflow charter's display title uses the broader name. Schema validation rules and their independent `schema_version` values are unchanged by this rename. Consumers that pin URI registries must register the new IDs or keep using their pinned old schemas. Update current relative file references, but do not rewrite immutable past customer records, approvals, evaluation reports, or published releases merely to match the new branding.

Changing artifact bytes changes their digests. The repository's synthetic release fixtures are rebound and tested as part of this release. A target deployment must follow its ordinary change-impact, validation, and release process; a renamed file or green repository test does not refresh its production evidence.

## Personal plugin migration

The plugin is now `applied-ai-field-guide`, with display name **The Applied AI Field Guide**. Start engagement work with `$run-ai-engagement` instead of `$run-fde-engagement`. This is an explicit skill-name change, not an additional competing conductor.

Run the installer described in the [plugin README](../../plugins/applied-ai-field-guide/README.md) from the trusted release tree. It uses the new configuration location, adopts a valid legacy configuration when needed, and retains the existing engagement workspace. It must not relocate, clear, import into a second workspace, or rewrite your source materials and immutable engagement history. Existing configuration and plugin backups remain available for rollback.

Install and enable the new marketplace identity, then disable the old plugin so one task cannot load two versions of the same skills. Restart in a new task to load the updated skill pack. Do not manually rewrite the marketplace or cached plugin directories.

## Verification and rollback

1. Record the existing configuration and a file-hash inventory of the engagement workspace before installation; keep these private and outside this repository.
2. Run the repository gate: `npm ci --ignore-scripts`, `npm test`, and `git diff --check`. Validate plugin metadata and all packaged skills as well as generated snapshot parity.
3. Exercise a fresh installation and a legacy-configuration migration in disposable directories. Confirm the same workspace, unchanged existing files, path-containment checks, and preserved history.
4. After local installation, verify STDIO initialization, guide search, and a bounded synthetic engagement in a disposable workspace. Compare the real workspace inventory without writing into customer engagements.
5. Confirm the new Pages home, deep routes, route aliases, metadata, assets, search, and sitemap after deployment. Existing GitHub social previews require a separate image upload; committing the PNG is not sufficient.

To roll back local tooling, disable the new plugin and restore the prior trusted plugin/configuration pair without changing engagement data. Do not enable both simultaneously. Repository history and old release tags remain intact; a web cutover rollback also needs the corresponding Pages base URL and repository settings, not just a content revert.
