# Add Link to Directory

The user wants to add a URL to `directory/directory.json`. They will provide some or all of:
- The URL to add
- A tooltip/description
- Where in the directory tree it should be placed

## Steps

1. Read `directory/directory.json` so you have the current tree in context.

2. If the user hasn't provided the URL, ask for it. If they haven't specified a folder, ask where they'd like to place it — show the available top-level folders and subfolders to help them choose. If they haven't provided a tooltip, ask for one (or offer to write one).

3. Derive a snake_case `name` from the URL's hostname/path (e.g. `amazon_science` from `amazon.science`).

4. Insert the new node into the correct `nodes` array in `directory/directory.json` as:
   `{ "name": "<name>", "tooltip": "<tooltip>", "node_type": "hyperlink", "href": "<url>" }`

5. Before committing, show the user:
   - The exact JSON object that will be inserted
   - Which folder it will be placed in
   - That you will `git commit` and `git push` after confirmation

   Then ask: **"Does this look correct? I'll commit and push once you confirm."**

6. Only after the user confirms: commit the change with a short message (e.g. `Add <name> to <folder>`) and then push to origin.
