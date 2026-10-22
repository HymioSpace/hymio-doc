import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import assert from "node:assert/strict";
function pages(root, path = root) {
  return readdirSync(path, { withFileTypes: true })
    .flatMap((entry) => {
      if (
        entry.name.startsWith(".") ||
        entry.name === "public" ||
        (path === root && entry.name === "zh")
      )
        return [];
      const file = join(path, entry.name);
      return entry.isDirectory()
        ? pages(root, file)
        : entry.name.endsWith(".md")
          ? [relative(root, file)]
          : [];
    })
    .sort();
}
const english = pages("docs");
assert.deepEqual(
  english,
  pages("docs/zh"),
  "Every English page needs a Chinese counterpart",
);
for (const dir of ["docs", "docs/zh"])
  for (const file of english) {
    const content = readFileSync(join(dir, file), "utf8");
    assert(content.trim().length > 30, `${dir}/${file} is empty`);
    assert(
      !/\/Users\/|(?:\d{1,3}\.){3}\d{1,3}/.test(
        content,
      ),
      `${file} contains a local path or host address`,
    );
  }
console.log(`Content checked: ${english.length} pages in each of 2 languages.`);
