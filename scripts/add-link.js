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
 * silently corrupt the tree or create a stray entry.
 */

const { die, load, walkTo, save } = require("./tree");

// --- Read & validate inputs -------------------------------------------------

const url = (process.env.LINK_URL || "").trim();
const folderPath = (process.env.LINK_FOLDER || "").trim();
const tooltip = (process.env.LINK_TOOLTIP || "").trim();
let name = (process.env.LINK_NAME || "").trim();

if (!url) die("add-link: LINK_URL is required.");

let parsed;
try {
  parsed = new URL(url);
} catch {
  die(`add-link: LINK_URL is not a valid URL: "${url}"`);
}
if (!/^https?:$/.test(parsed.protocol)) {
  die(`add-link: LINK_URL must be http(s): "${url}"`);
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
  die(`add-link: LINK_NAME must be snake_case ([a-z0-9_]): "${name}"`);
}

// --- Locate target & guard against duplicates -------------------------------

const { data, root } = load();
const targetNodes = walkTo(root, folderPath);

if (targetNodes.some((n) => n.href === url)) {
  die(`add-link: a node with href "${url}" already exists in ${folderPath || "(top level)"}.`);
}
if (targetNodes.some((n) => n.name === name)) {
  die(`add-link: a node named "${name}" already exists in ${folderPath || "(top level)"}.`);
}

// --- Insert -----------------------------------------------------------------

const node = { name, tooltip, node_type: "hyperlink", href: url };
targetNodes.push(node);
save(data);

console.log(`\n✓ Added link "${name}" to ${folderPath || "(top level)"}:`);
console.log(JSON.stringify(node, null, 2) + "\n");
