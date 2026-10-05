# AGENTS.md

## What this is

`deltadelta.dev` — a personal website built with [Eleventy (11ty)](https://www.11ty.dev/)
and served as static assets by a **Cloudflare Worker**. Cloudflare builds and deploys
on every push to `main`; there is no GitHub workflow and none should be added.

The homepage is an intentionally archaic, hierarchical, collapsible **directory-tree**
interface, generated from a JSON definition. Theme everywhere: near-white background
(`#fbfbf9`), de-saturated grey monospace text, traditional hyperlink-blue links, and a
bordered "window".

## Build

`npm run build` runs `eleventy`, which writes everything to `dist/`. That's the whole
build — there is no CSS step and no post-processing.

`dist/` is **git-ignored**. Never commit build output; Cloudflare produces it.


## Pages

| Source | Output URL | Purpose |
|---|---|---|
| `directory/index.njk` + `directory/directory.json` | `/` | The directory-tree homepage. Recursive Nunjucks macro renders the JSON; icons in `directory/icons/` (Windows XP set). Uses an explicit `permalink: /index.html`. |
| `blog/*.md` | `/blog/<slug>/` | Blog posts. Use the `_includes/markdown.njk` layout (a minimal themed markdown renderer). |
| `about.md` | `/about/` | The about page. |
| `badges/ai-transparency.njk` | `/writing/badges/ai-transparency/` | Badge embedded by an external service. **This URL must never change** — it is pinned with an explicit `permalink` and is the reason there is no blanket `/writing/*` redirect. |
| `404.md` | `/404.html` | Served for unknown URLs via `not_found_handling` in `wrangler.jsonc`. |
| `media/` | `/media/...` | Static images and video, plain git blobs (no LFS). |

### Legacy URLs

Content used to live under `/writing/...` because Eleventy built into a `writing/`
folder that nginx served. `_redirects` 301s the old paths. If you add a page, you do
not need to touch `_redirects`.

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
      { "name": "about", "tooltip": "Who I am and what this site is", "node_type": "file", "href": "/about/" }
    ]
  }
}
```

**To change the tree, edit `directory/directory.json`** — node order in the file is the
display order. No template changes are needed to add/move/remove entries.

Node ordering within a folder: All folders should be at the top and all other sibling nodes should be below all folders (like how a modern file explorer works)

## Cloudflare

`wrangler.jsonc` is the deploy config. Things that must not drift:

- `name` must equal the Worker name in the Cloudflare dashboard, or the build fails.
- `assets.directory` must stay `./dist`.
- `build.command` must stay `npm run build`.

Cloudflare build logs live under the Worker's Deployments → build history. You cannot
see them from here; ask the user to check if a deploy misbehaves.

Cloudflare docs are available as markdown — append `index.md` to any docs URL, e.g.
`https://developers.cloudflare.com/workers/static-assets/index.md`. Cheaper than HTML.

## Rules for pushing changes

- This is a one-man repo, so pushing to main is fine.
- When pushing changes, only git-add the changes that are relevant to what you have done.
- Never commit `dist/` or `node_modules/`.
- Never rewrite published history.

## Preferences

- Do not use sub-agents unless directly asked. This repo is small, and you can perform
  pretty much all tasks without sub-agents.
