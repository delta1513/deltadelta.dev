/*
 * Shared helpers for editing directory/directory.json.
 *
 * Used by add-link.js and add-folder.js. Keeps tree loading, folder-path
 * walking, and house-style serialization in one place.
 */

const fs = require("fs");
const path = require("path");

const JSON_PATH = path.join(__dirname, "..", "directory", "directory.json");

function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

function load() {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  } catch (e) {
    die(`could not read/parse ${JSON_PATH}: ${e.message}`);
  }
  const root = data && data.webdirectory && data.webdirectory.nodes;
  if (!Array.isArray(root)) die("directory.json has no webdirectory.nodes array.");
  return { data, root };
}

function childFolders(nodes) {
  return nodes.filter((n) => n.node_type === "folder").map((n) => n.name);
}

// Walk a slash-separated folder path from `root`, validating each segment is
// an existing folder. Returns the `nodes` array of the target folder (or
// `root` for an empty path). Fails loudly on any missing/non-folder segment.
function walkTo(root, folderPath) {
  const segments = folderPath
    ? folderPath.split("/").map((s) => s.trim()).filter(Boolean)
    : [];
  let nodes = root;
  const walked = [];
  for (const seg of segments) {
    const match = nodes.find((n) => n.name === seg && n.node_type === "folder");
    if (!match) {
      const trail = walked.length ? `"${walked.join("/")}"` : "(top level)";
      die(
        `folder "${seg}" not found under ${trail}.\n` +
          `  Valid folders here: ${childFolders(nodes).join(", ") || "(none)"}`
      );
    }
    walked.push(seg);
    nodes = match.nodes;
  }
  return nodes;
}

// Serialize matching the file's house style: containers (root, webdirectory,
// folders) are expanded, but leaf nodes (hyperlink/file) stay on a single line.
// This keeps the committed diff to just the changed lines.
function isLeaf(v) {
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

function serialize(value, depth = 0) {
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

function save(data) {
  fs.writeFileSync(JSON_PATH, serialize(data, 0) + "\n", "utf8");
}

module.exports = { JSON_PATH, die, load, childFolders, walkTo, save };
