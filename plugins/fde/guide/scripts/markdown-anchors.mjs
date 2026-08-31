export function stripHtmlTags(value) {
  let output = "";
  let insideTag = false;

  for (const character of value) {
    if (character === "<") {
      insideTag = true;
      continue;
    }
    if (character === ">") {
      insideTag = false;
      continue;
    }
    if (!insideTag) output += character;
  }

  return output;
}

export function githubSlug(value) {
  return stripHtmlTags(value)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function markdownAnchors(content) {
  const anchors = new Set();
  for (const match of content.matchAll(/<a\s+(?:name|id)=["']([^"']+)["'][^>]*>/gi)) anchors.add(match[1]);
  for (const line of content.split("\n")) {
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const base = githubSlug(match[2]);
    if (!base) continue;
    let candidate = base;
    let suffix = 1;
    while (anchors.has(candidate)) candidate = `${base}-${suffix++}`;
    anchors.add(candidate);
  }
  return anchors;
}
