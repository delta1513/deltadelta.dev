# AGENTS.md

## What this is

`deltadelta.dev` — a personal website built with [Eleventy (11ty)](https://www.11ty.dev/)
and deployed old-school: nginx serves the **repository root** directly, and the server
redeploys by running `git pull` + `npm run build` (see `update_all.sh`).

The homepage is an intentionally archaic, hierarchical, collapsible **directory-tree**
interface, generated from a JSON definition. Theme everywhere: near-white background
(`#fbfbf9`), de-saturated grey monospace text, traditional hyperlink-blue links, and a
bordered "window".

## Build

`npm run build` runs three steps:
1. Tailwind compiles `styles.css` → `dist/output.css` (legacy CSS; the directory theme is self-contained inline CSS).
2. Eleventy builds with `input: "."`, `output: "writing/"`, `includes: "_includes"`.
3. `cp writing/directory/index.html index.html` — copies the rendered tree to the repo-root `index.html`, which nginx serves as `/`.

Because Eleventy outputs to `writing/`, all generated pages live under **`/writing/...`**
(the homepage is the one exception — it's copied to the root). `.eleventyignore` excludes `.claude`.

## Pages

| Source | Output URL | Purpose |
|---|---|---|
| `directory/index.njk` + `directory/directory.json` | `/` (and `/writing/directory/`) | The directory-tree homepage. Recursive Nunjucks macro renders the JSON; icons in `directory/icons/` (Windows XP set). |
| `blog/*.md` | `/writing/blog/<slug>/` | Blog posts. Use the `_includes/markdown.njk` layout (a minimal themed markdown renderer). |
| `about/index.html` | `/writing/about/` | Custom themed about page (with a live traffic chart). |
| `ai_prompts/*.md` | `/writing/ai_prompts/<slug>/` | Prompt pages (not linked from the tree). |
| `badges/ai-transparency.njk` | `/writing/badges/ai-transparency/` | Badge embedded externally — keep this path stable. |
| `media/` | `/media/...` | Static images (tracked via Git LFS). |

`_includes/base.njk` and `_includes/blog-base.njk` are legacy layouts, no longer used.
`writing/` is committed build output (regenerated on deploy).

## The directory JSON definition

`directory/directory.json` is an Eleventy **directory data file**, so its keys are
available to templates in `directory/`. It exposes:

- `title` — the page `<title>`.
- `webdirectory.nodes` — the ordered top-level list of tree nodes.

Each **node** is one of three `node_type`s:

| `node_type` | Meaning | Required fields | Icon |
|---|---|---|---|
| `folder` | Collapsible accordion (`<details>`). | `nodes` (array of children); **no** `href` | folder |
| `file` | A page hosted on this site. | `href` (site-relative); **no** `nodes` | file |
| `hyperlink` | An external link (opens in a new tab). | `href` (absolute URL); **no** `nodes` | web-link |

Common fields on every node: `name` (display label, snake_case by convention) and
`tooltip` (hover text; rendered as the `title` attribute; may be `""`).

Folders nest arbitrarily deep — the template renders them recursively.

```json
{
  "title": "deltadelta.dev",
  "webdirectory": {
    "nodes": [
      {
        "name": "my_stuff",
        "tooltip": "Apps I've built and my profiles",
        "node_type": "folder",
        "nodes": [
          { "name": "wastebin", "tooltip": "Self-hosted pastebin", "node_type": "hyperlink", "href": "https://wastebin.deltadelta.dev/" }
        ]
      },
      { "name": "about", "tooltip": "Who I am and what this site is", "node_type": "file", "href": "/writing/about/" }
    ]
  }
}
```

**To change the tree, edit `directory/directory.json`** — node order in the file is the
display order. No template changes are needed to add/move/remove entries.


## Rules for pushing changes

- This is a one-man repo, so pushing to main is fine
- When pushing changes, only git-add the changes that are relevant to what you have done

## Preferences

- Do not use sub-agents unless directly asked. This repo is small, and you can perform pretty much all tasks without sub-agents.