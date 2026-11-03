# CI/CD Setup (GitHub Actions + Docker)

Pipeline: `.github/workflows/ci-cd.yml`

- **Continuous Integration** — GitHub-hosted `windows-latest`: `npm ci` → `npm test -- --configuration ci` → `npm run build`.
- **Continuous Deployment** — self-hosted Windows runner: `docker build` → replace the `ionic-crud` container → verify `http://localhost:8100/`. Runs on pushes to `main` only.

## One-time setup

### 1. Repository

Push this project to GitHub and make the default branch `main`
(this repo is currently on `master` with no remote):

```powershell
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git branch -M main
git add Dockerfile nginx.conf .dockerignore .github/workflows/ci-cd.yml
git commit -m "Add CI/CD workflow"
git push -u origin main
```

### 2. Self-hosted runner

GitHub → repository → **Settings → Actions → Runners → New self-hosted runner → Windows / x64**, then:

```powershell
cd C:\actions-runner
.\config.cmd --url https://github.com/YOUR-USERNAME/YOUR-REPOSITORY
```

`config.cmd` prompts for the registration token — paste it there instead of on the command line, so it stays out of your PowerShell history. Then start the runner:

```powershell
.\run.cmd
```

Wait for `Connected to GitHub` / `Listening for Jobs`, and confirm the runner shows **Idle** in Settings → Actions → Runners. Keep that window open while the workflow runs.

Labels used by the deploy job: `self-hosted`, `Windows`, `X64` (default labels, no extra config).

## Verifying

1. **Actions** tab → latest `CI-CD Pipeline` run → `Continuous Integration` finishes green.
2. `Continuous Deployment` starts only after CI, on the runner.
3. Open <http://localhost:8100/> — the app loads.
4. Change something visible, `git commit` + `git push origin main`, watch both jobs rerun, refresh the browser.

## Local equivalents

```powershell
docker build -t ionic-crud:latest .
docker rm -f ionic-crud
docker run -d --name ionic-crud --restart unless-stopped -p 8100:8100 ionic-crud:latest
docker logs ionic-crud
```

## Notes

- **Keep this repository private (or fork-free).** On a `pull_request` from a fork, GitHub runs the *fork's* copy of the workflow file. The `if: github.event_name != 'pull_request'` guard on the deploy job only protects this file — a fork can ship its own workflow that targets your `self-hosted` runner and runs commands on your PC. If the repo must be public, set Settings → Actions → "Require approval for all outside contributors" and treat the runner as compromised-able.
- Actions are referenced by moving major tags (`@v4`) to keep this file readable for the lab. For a real production repo, pin each `uses:` to a full commit SHA.
- The container serves nginx on port **8100** (`nginx.conf`), which is why the workflow maps `-p 8100:8100`.
- `try_files ... /index.html` in `nginx.conf` is required — without it Ionic's client-side routes 404 on refresh.
- `.dockerignore` keeps `node_modules`/`www` out of the build context.
- The Angular `ci` configuration (`angular.json`) sets `watch: false` for tests, so `npm test` does not hang in a non-interactive runner. Do **not** build with `--configuration ci` — that config is not a production build and skips `environment.prod.ts` replacement.
- `www/` is git-ignored and built inside the image; nothing to commit after a build.
