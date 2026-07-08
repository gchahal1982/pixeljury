import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as claudeCode from "../src/adapters/claude-code.js";
import * as codex from "../src/adapters/codex.js";

const validResult = {
  dimensions: {
    typography: { score: 50, reason: "ok" },
    hierarchy: { score: 50, reason: "ok" },
    color: { score: 50, reason: "ok" },
    spacing: { score: 50, reason: "ok" },
    originality: { score: 50, reason: "ok" },
    polish: { score: 50, reason: "ok" },
  },
  visionTropes: [],
};

test("claude-code adapter stages screenshots into an isolated cwd", async () => {
  const fixture = makeFixture("claude");
  const originalBin = process.env.PIXELJURY_CLAUDE_BIN;
  process.env.PIXELJURY_CLAUDE_BIN = fixture.bin;
  try {
    const raw = await claudeCode.call({
      system: "system",
      user: "user",
      imagePaths: fixture.images,
    });
    const observed = JSON.parse(fs.readFileSync(fixture.inspectFile, "utf8"));
    assert.deepEqual(JSON.parse(raw), validResult);
    assert.match(observed.cwd, /pixeljury-cc-/);
    assert.equal(observed.args.includes(fixture.images[0]), false);
    assert.ok(observed.args.some((arg) => /pixeljury-cc-/.test(arg) && /screenshot-0\.png/.test(arg)));
    assert.ok(observed.args.some((arg) => /pixeljury-cc-/.test(arg) && /screenshot-1\.png/.test(arg)));
    assert.ok(observed.args.includes("--add-dir"));
    assert.equal(
      normalizeTempPath(observed.args[observed.args.indexOf("--add-dir") + 1]),
      normalizeTempPath(observed.cwd)
    );
  } finally {
    restoreEnv("PIXELJURY_CLAUDE_BIN", originalBin);
    fixture.cleanup();
  }
});

test("codex adapter stages screenshots into an isolated cwd", async () => {
  const fixture = makeFixture("codex");
  const originalBin = process.env.PIXELJURY_CODEX_BIN;
  process.env.PIXELJURY_CODEX_BIN = fixture.bin;
  try {
    const raw = await codex.call({
      system: "system",
      user: "user",
      imagePaths: fixture.images,
      schema: { type: "object" },
    });
    const observed = JSON.parse(fs.readFileSync(fixture.inspectFile, "utf8"));
    assert.deepEqual(JSON.parse(raw), validResult);
    assert.match(observed.cwd, /pixeljury-codex-/);
    assert.equal(observed.args.includes(fixture.images[0]), false);
    const imageArgs = observed.args
      .map((arg, index) => (arg === "--image" ? observed.args[index + 1] : null))
      .filter(Boolean);
    assert.equal(imageArgs.length, 2);
    assert.match(imageArgs[0], /pixeljury-codex-/);
    assert.match(imageArgs[0], /screenshot-0\.png/);
    assert.match(imageArgs[1], /pixeljury-codex-/);
    assert.match(imageArgs[1], /screenshot-1\.png/);
  } finally {
    restoreEnv("PIXELJURY_CODEX_BIN", originalBin);
    fixture.cleanup();
  }
});

function makeFixture(kind) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `pixeljury-test-${kind}-`));
  const inspectFile = path.join(tmp, "inspect.json");
  const bin = path.join(tmp, "fake-cli.js");
  const images = [path.join(tmp, "desktop.png"), path.join(tmp, "mobile.png")];
  fs.writeFileSync(images[0], "desktop");
  fs.writeFileSync(images[1], "mobile");
  fs.writeFileSync(
    bin,
    `#!/usr/bin/env node
const fs = require("node:fs");
const inspectFile = ${JSON.stringify(inspectFile)};
const result = ${JSON.stringify(validResult)};
fs.writeFileSync(inspectFile, JSON.stringify({ cwd: process.cwd(), args: process.argv.slice(2) }));
const outIndex = process.argv.indexOf("--output-last-message");
if (outIndex >= 0) {
  fs.writeFileSync(process.argv[outIndex + 1], JSON.stringify(result));
} else {
  process.stdout.write(JSON.stringify({ result: JSON.stringify(result) }));
}
`
  );
  fs.chmodSync(bin, 0o755);
  return {
    bin,
    images,
    inspectFile,
    cleanup() {
      fs.rmSync(tmp, { recursive: true, force: true });
    },
  };
}

function restoreEnv(key, value) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

function normalizeTempPath(value) {
  return value.replace(/^\/private\/var\//, "/var/");
}
