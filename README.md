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

Pushes to `main` are built and uploaded to your SFTP server by the
`Build & deploy` GitHub Action. Configure these repo secrets under
**Settings → Secrets and variables → Actions**:

| Secret              | Required          | Notes                                                 |
| ------------------- | ----------------- | ----------------------------------------------------- |
| `SFTP_HOST`         | yes               | Hostname or IP of the SFTP server                     |
| `SFTP_USERNAME`     | yes               | SFTP login                                            |
| `SFTP_PORT`         | no (default `22`) | Override if not standard                              |
| `SFTP_REMOTE_PATH`  | yes               | Absolute path on the server, e.g. `/var/www/proofed/` |
| `SFTP_PRIVATE_KEY`  | one of these two  | Full private key (incl. BEGIN/END lines)              |
| `SFTP_PASSWORD`     | one of these two  | Password for the SFTP user                            |

Use either `SFTP_PRIVATE_KEY` (preferred) or `SFTP_PASSWORD`. If both are set,
the key is used.

The workflow uploads the contents of `dist/` into `SFTP_REMOTE_PATH`. It does
not delete remote files that no longer exist locally; flip
`delete_remote_files: true` in `.github/workflows/deploy.yml` if you want a
clean mirror.
