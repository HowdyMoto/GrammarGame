# Professor Proof

A grammar-error spotting game for middle schoolers. Tap each word with a mistake;
tap *between* words to insert a missing comma or period. String perfect pages
together for an escalating streak bonus. Three difficulty modes — Easy shows
counts per error type, Hard shows only the total, Master shows neither.

Built with Vite + React + TypeScript. The build emits relative-path assets so
`dist/` can be uploaded to any folder on a web server.

## Local development

```sh
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

## Deployment

Build locally and upload `dist/` to whichever folder on your web server you
want — the build emits all assets with relative paths so it works in any
subdirectory.

```sh
npm run build
# then upload everything inside ./dist/ to your server, e.g.:
rsync -av --delete dist/ user@host:/path/on/server/
```
