#!/usr/bin/env node
/*
 * Insert a new (empty) folder node into directory/directory.json.
 *
 * Driven by environment variables (set as GitLab CI/CD variables when the
 * pipeline is launched manually from the web UI):
 *
 *   FOLDER_NAME    (required) snake_case display label for the new folder.
 *   FOLDER_PARENT  (optional) Slash-separated path to the parent folder,
 *                             e.g. "web_directory/tools". Empty / unset =>
 *                             create at the top level.
 *   FOLDER_TOOLTIP (optional) Hover description. Defaults to "".
 *
 * Fails loudly (non-zero exit) on any invalid input so a typo can never
 * silently corrupt the tree or nest a folder in the wrong place.
 */

const { die, load, walkTo, save } = require("./tree");

// --- Read & validate inputs -------------------------------------------------

const name = (process.env.FOLDER_NAME || "").trim();
const parentPath = (process.env.FOLDER_PARENT || "").trim();
const tooltip = (process.env.FOLDER_TOOLTIP || "").trim();

if (!name) die("add-folder: FOLDER_NAME is required.");
if (!/^[a-z0-9_]+$/.test(name)) {
  die(`add-folder: FOLDER_NAME must be snake_case ([a-z0-9_]): "${name}"`);
}

// --- Locate parent & guard against duplicates -------------------------------

const { data, root } = load();
const targetNodes = walkTo(root, parentPath);

if (targetNodes.some((n) => n.name === name)) {
  die(`add-folder: a node named "${name}" already exists in ${parentPath || "(top level)"}.`);
}

// --- Insert -----------------------------------------------------------------

const node = { name, tooltip, node_type: "folder", nodes: [] };
targetNodes.push(node);
save(data);

console.log(`\n✓ Added folder "${name}" to ${parentPath || "(top level)"}:`);
console.log(JSON.stringify(node, null, 2) + "\n");
