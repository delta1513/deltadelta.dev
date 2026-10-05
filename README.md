# deltadelta.dev

My personal website. The homepage is a deliberately archaic, collapsible web
directory; the rest is blog posts and other writing.

Built with [Eleventy](https://www.11ty.dev/), served as static assets by a
Cloudflare Worker.

## Running it locally

```sh
npm install
npm run dev      # Eleventy dev server with live reload
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run build` | Builds the site into `dist/` |
| `npm run preview` | Builds, then serves `dist/` in the Workers runtime |
| `npm run deploy` | Deploys by hand with Wrangler (not normally needed) |

## Deployment

Cloudflare builds and deploys on every push to `main` via the Cloudflare GitHub
app — no CI workflow in this repo. `wrangler.jsonc` tells it to run
`npm run build` and serve `./dist`.

Build output is **not** committed. `dist/` is git-ignored.

## Editing the directory

The whole tree lives in `directory/directory.json`. Node order in the file is
display order. See `AGENTS.md` for the node schema.

## A note on URLs

Pages used to live under `/writing/...`. They're now at `/blog/<slug>/`,
`/about/`, and `/ai_prompts/<slug>/`, with 301s in `_redirects`. One exception:
the AI-transparency badge stays at `/writing/badges/ai-transparency/` because an
external service pulls it.
