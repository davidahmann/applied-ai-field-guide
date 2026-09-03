# Artifact catalog 1.1 migration

Version 1.1 narrows catalog paths to normalized, repository-relative paths containing only portable path characters. Absolute paths, parent traversal, backslashes, empty segments, and dot segments are rejected.

To migrate, normalize every artifact path from the repository root, remove `.` or `..` segments, use `/` separators, and set `schema_version` to `1.1.0`. Repository validation also resolves symlinks and rejects targets outside the checkout.
