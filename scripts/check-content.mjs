import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";

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

function headingShape(content) {
  return content
    .replace(/```[\s\S]*?```/g, "")
    .split("\n")
    .map((line) => line.match(/^(#{1,6})\s+/)?.[1].length)
    .filter(Boolean);
}

function headingSlugs(content) {
  const seen = new Map();
  return content
    .replace(/```[\s\S]*?```/g, "")
    .split("\n")
    .flatMap((line) => {
      const text = line.match(/^#{1,6}\s+(.+)$/)?.[1];
      if (!text) return [];
      const base = text
        .replace(/<[^>]+>/g, "")
        .replace(/[`*_~]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}_]+/gu, "-")
        .replace(/^-+|-+$/g, "");
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return [count ? `${base}-${count}` : base];
    });
}

function localCandidates(sourcePath, pathPart) {
  if (pathPart.startsWith("/")) {
    return pathPart.startsWith("/zh/")
      ? [join("docs", pathPart.slice(1))]
      : [join("docs", pathPart.slice(1)), join("docs/public", pathPart.slice(1))];
  }
  return [resolve(dirname(sourcePath), pathPart)];
}

function resolveLocal(sourcePath, pathPart) {
  for (const candidate of localCandidates(sourcePath, pathPart)) {
    const base = normalize(candidate);
    if (existsSync(base) && extname(base)) return base;
    if (existsSync(`${base}.md`)) return `${base}.md`;
    if (existsSync(join(base, "index.md"))) return join(base, "index.md");
    if (existsSync(join(base, "index.html"))) return join(base, "index.html");
  }
  return null;
}

const english = pages("docs");
assert.deepEqual(
  english,
  pages("docs/zh"),
  "Every English page needs a Chinese counterpart",
);

let linkCount = 0;
for (const file of english) {
  assert.deepEqual(
    headingShape(readFileSync(join("docs", file), "utf8")),
    headingShape(readFileSync(join("docs/zh", file), "utf8")),
    `${file} has different English/Chinese heading structure`,
  );
  for (const dir of ["docs", "docs/zh"]) {
    const sourcePath = join(dir, file);
    const content = readFileSync(sourcePath, "utf8");
    assert(content.trim().length > 30, `${dir}/${file} is empty`);
    assert(
      !/\/Users\/|(?:\d{1,3}\.){3}\d{1,3}/.test(content),
      `${file} contains a local path or host address`,
    );
    assert(
      !/Every TaskRun has one TaskAgent|每个 TaskRun 只有一个 TaskAgent/.test(content),
      `${file} gives program Runs a TaskAgent`,
    );
    assert(
      !/Nostalgia[^\n]{0,120}(planned|draft only|not integrated|no service implementation)/i.test(
        content,
      ) &&
        !/Nostalgia[^\n]{0,80}(规划|草案|未接入|未实现)/.test(content),
      `${file} still describes Nostalgia as unimplemented`,
    );
    assert(
      !/Kits?[^\n]{0,80}(planned|not integrated)|Kit[^\n]{0,40}(规划|未接入)/i.test(content),
      `${file} still presents retired Kits as future work`,
    );

    const withoutCode = content.replace(/```[\s\S]*?```/g, "");
    for (const match of withoutCode.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].trim();
      if (
        !target ||
        target.startsWith("#") ||
        /^[a-z][a-z0-9+.-]*:/i.test(target) ||
        target.startsWith("//")
      )
        continue;
      const [rawPath, anchor = ""] = target.split("#", 2);
      const pathPart = decodeURIComponent(rawPath.split("?", 1)[0]);
      if (!pathPart) continue;
      linkCount += 1;

      const resolved = resolveLocal(sourcePath, pathPart);
      assert(resolved, `${dir}/${file} has a broken local link: ${target}`);
      if (anchor && resolved.endsWith(".md")) {
        assert(
          headingSlugs(readFileSync(resolved, "utf8")).includes(decodeURIComponent(anchor)),
          `${dir}/${file} has a missing heading anchor: ${target}`,
        );
      }
    }

    for (const match of withoutCode.matchAll(
      /["'(](\/(?:screenshots|brand|examples)\/[A-Za-z0-9._/-]+\.(?:png|svg|txt))/g,
    )) {
      assert(
        existsSync(join("docs/public", match[1].slice(1))),
        `${dir}/${file} references a missing public asset: ${match[1]}`,
      );
    }
  }
}

console.log(
  `Content checked: ${english.length} pages in each of 2 languages; ${linkCount} local links resolved.`,
);
