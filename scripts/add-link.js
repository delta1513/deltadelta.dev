#!/usr/bin/env node
/*
 * Insert a hyperlink node into directory/directory.json.
 *
 * Driven by environment variables (set as GitLab CI/CD variables when the
 * pipeline is launched manually from the web UI):
 *
 *   LINK_URL      (required) Absolute URL to add, e.g. https://example.com/
 *   LINK_FOLDER   (optional) Slash-separated folder path into the tree,
 *                            e.g. "web_directory/tools/toolkits".
 *                            Empty / unset => insert at the top level.
 *   LINK_TOOLTIP  (optional) Hover description. Defaults to "".
 *   LINK_NAME     (optional) snake_case display label. Defaults to a name
 *                            derived from the URL's hostname.
 *
 * Fails loudly (non-zero exit) on any invalid input so a typo can never
 * silently corrupt the tree or create a stray folder.
 */

const fs = require("fs");
const path = require("path");

const JSON_PATH = path.join(__dirname, "..", "directory", "directory.json");

function die(msg) {
  console.error(`\n✗ add-link: ${msg}\n`);
  process.exit(1);
}

// --- Read & validate inputs -------------------------------------------------

const url = (process.env.LINK_URL || "").trim();
const folderPath = (process.env.LINK_FOLDER || "").trim();
const tooltip = (process.env.LINK_TOOLTIP || "").trim();
let name = (process.env.LINK_NAME || "").trim();

if (!url) die("LINK_URL is required.");

let parsed;
try {
  parsed = new URL(url);
} catch {
  die(`LINK_URL is not a valid URL: "${url}"`);
}
if (!/^https?:$/.test(parsed.protocol)) {
  die(`LINK_URL must be http(s): "${url}"`);
}

// Derive a snake_case name from the hostname if none was supplied.
function deriveName(u) {
  const host = u.hostname.replace(/^www\./, "");
  return host
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
if (!name) name = deriveName(parsed);
if (!/^[a-z0-9_]+$/.test(name)) {
  die(`LINK_NAME must be snake_case ([a-z0-9_]): "${name}"`);
}

// --- Load tree --------------------------------------------------------------

let data;
try {
  data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
} catch (e) {
  die(`could not read/parse ${JSON_PATH}: ${e.message}`);
}

const root = data && data.webdirectory && data.webdirectory.nodes;
if (!Array.isArray(root)) die("directory.json has no webdirectory.nodes array.");

// --- Walk to the target folder ----------------------------------------------

function childFolders(nodes) {
  return nodes.filter((n) => n.node_type === "folder").map((n) => n.name);
}

let targetNodes = root;
const segments = folderPath ? folderPath.split("/").map((s) => s.trim()).filter(Boolean) : [];

const walked = [];
for (const seg of segments) {
  const match = targetNodes.find((n) => n.name === seg && n.node_type === "folder");
  if (!match) {
    const trail = walked.length ? `"${walked.join("/")}"` : "(top level)";
    die(
      `folder "${seg}" not found under ${trail}.\n` +
        `  Valid folders here: ${childFolders(targetNodes).join(", ") || "(none)"}`
    );
  }
  walked.push(seg);
  targetNodes = match.nodes;
}

// --- Guard against duplicates ----------------------------------------------

if (targetNodes.some((n) => n.href === url)) {
  die(`a node with href "${url}" already exists in ${folderPath || "(top level)"}.`);
}
if (targetNodes.some((n) => n.name === name)) {
  die(`a node named "${name}" already exists in ${folderPath || "(top level)"}.`);
}

// --- Insert -----------------------------------------------------------------

const node = { name, tooltip, node_type: "hyperlink", href: url };
targetNodes.push(node);

// Serialize matching the file's house style: folders/containers are expanded,
// but leaf nodes (no child `nodes` array) stay on a single line. This keeps the
// committed diff to just the inserted line instead of reformatting the whole file.
function isLeaf(v) {
  // Leaf = a hyperlink/file node. Containers (the root, `webdirectory`, and
  // folders) are expanded; everything else stays on a single line.
  return (
    v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    typeof v.node_type === "string" &&
    v.node_type !== "folder"
  );
}
function inlineObject(obj) {
  const parts = Object.entries(obj).map(
    ([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`
  );
  return `{ ${parts.join(", ")} }`;
}
function serialize(value, depth) {
  const pad = "  ".repeat(depth);
  const padIn = "  ".repeat(depth + 1);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return "[\n" + value.map((v) => padIn + serialize(v, depth + 1)).join(",\n") + "\n" + pad + "]";
  }
  if (value && typeof value === "object") {
    if (isLeaf(value)) return inlineObject(value);
    const entries = Object.entries(value).map(
      ([k, v]) => padIn + JSON.stringify(k) + ": " + serialize(v, depth + 1)
    );
    return "{\n" + entries.join(",\n") + "\n" + pad + "}";
  }
  return JSON.stringify(value);
}

fs.writeFileSync(JSON_PATH, serialize(data, 0) + "\n", "utf8");

console.log(`\n✓ Added "${name}" to ${folderPath || "(top level)"}:`);
console.log(JSON.stringify(node, null, 2) + "\n");
