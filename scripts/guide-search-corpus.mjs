import { lstat, readdir } from "node:fs/promises";
import path from "node:path";

// Discovery is not governance registration. Excludes generated snapshots, historical
// migrations, maintainer files, hidden files, dependencies, and symbolic links.
export async function guidancePaths(root) {
  const paths = ["README.md"];
  async function walk(directory) {
    if (!(await lstat(path.join(root, directory))).isDirectory()) return;
    for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "archive") continue;
      const relative = path.posix.join(directory, entry.name);
      if (entry.isDirectory()) await walk(relative);
      else if (entry.isFile() && entry.name.endsWith(".md")) paths.push(relative);
    }
  }
  for (const directory of ["guide", "library", "playbooks", "operations", "blueprints", "solutions", "templates", "examples", "research"]) await walk(directory);
  return paths.sort();
}
