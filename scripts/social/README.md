# Local social media automation for CrewCircle

Publish to Substack, LinkedIn, X, and YouTube from your laptop without third-party scheduling tools.

## What it is

A small Python toolkit that reads a YAML content calendar and posts to each platform's native API at the scheduled time. It runs locally on macOS via `launchd` or `cron`.

## Structure

```
scripts/social/
├── publish.py                 # Main orchestrator
├── platforms/
│   ├── substack.py            # Email-to-post
│   ├── linkedin.py            # LinkedIn API v2
│   ├── twitter.py             # X API v2
│   └── youtube.py             # YouTube upload (placeholder)
├── config.yaml.example        # Config template
├── calendar.yaml.example      # Content calendar template
├── scheduler/
│   ├── crontab.txt            # cron example
│   └── com.crewcircle.social.publish.plist  # launchd example
└── secret/
    ├── config.yaml            # Your credentials (gitignored)
    └── state.yaml             # Tracks published posts
```

## Setup

1. **Copy the example files and fill in your credentials:**

   ```bash
   cp scripts/social/config.yaml.example scripts/social/secret/config.yaml
   cp scripts/social/calendar.yaml.example scripts/social/calendar.yaml
   ```

2. **Install dependencies.** The script uses `requests`, `requests-oauthlib`, and `pyyaml`:

   ```bash
   python3 -m venv scripts/social/.venv
   ./scripts/social/.venv/bin/pip install requests requests-oauthlib pyyaml
   ```

3. **Choose how to store secrets.**

   **Option A — Doppler (recommended for CrewCircle):**
   - Install and authenticate the Doppler CLI: https://docs.doppler.com/docs/install-cli
   - Store social credentials in the shared `crewcircle-master` project so the same secrets are available to all CrewCircle components.
   - Add your secrets there, then set in `secret/config.yaml`:
     ```yaml
     secrets_source: "doppler"
     doppler_project: "crewcircle-master"
     doppler_config: "prod"
     ```
   - The rest of the config can use `${ENV_VAR}` references; values are pulled from Doppler at runtime.

   **Option B — Environment variables or `.env`:**
   - Export secrets as environment variables or put them in `scripts/social/.env`.
   - Keep `secrets_source: "env"` in `secret/config.yaml`.
   - All values support `${ENV_VAR}` substitution.

4. **Test in dry-run mode:**

   ```bash
   ./scripts/social/.venv/bin/python scripts/social/publish.py --dry-run
   ```

5. **Schedule it.**

   **cron:**
   ```bash
   crontab scripts/social/scheduler/crontab.txt
   ```

   **launchd (macOS):**
   ```bash
   cp scripts/social/scheduler/com.crewcircle.social.publish.plist ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.crewcircle.social.publish.plist
   ```

## Platform-specific setup

### Substack

- Get your email-to-post address from your publication settings.
- Use an app-specific SMTP password (e.g., Gmail app password).
- Put the password in `SUBSTACK_SMTP_PASS` or directly in `secret/config.yaml`.

### LinkedIn

1. Create an app at https://www.linkedin.com/developers/apps.
2. Request **Share on LinkedIn** and **Sign In with LinkedIn using OpenID Connect** products.
3. Get an OAuth token with `w_member_social` scope.
4. Find your person URN with `GET https://api.linkedin.com/v2/me`.
5. For company posts, use your company URN (`urn:li:organization:XXXX`).

### X / Twitter

- X free tier has very limited write access. You will likely need Basic or higher to post tweets.
- Create keys at https://developer.twitter.com/en/portal/dashboard.
- Required keys: API Key, API Secret, Access Token, Access Token Secret.

### YouTube

- YouTube upload is the most complex platform (OAuth2, video upload, resumable upload).
- A placeholder module is included. Full implementation requires Google API client setup.
- Enable only after you need video publishing.

## Security notes

- `scripts/social/secret/` is excluded from git via `.gitignore`.
- Prefer Doppler or environment variables for credentials. The config supports `${ENV_VAR}` substitution.
- Store tokens in your system keychain if possible; the script does not manage keychain access.

## Adding a post

Edit `scripts/social/calendar.yaml`:

```yaml
- id: my-post-2026-07-21
  scheduled_at: "2026-07-21T07:30:00+10:00"
  platforms: [linkedin, twitter]
  body: |
    Your post text here.
```

Posts are marked `published: true` after a successful run so they are not duplicated.

## Troubleshooting

- Check `scripts/social/secret/publish.log` for errors.
- Use `--dry-run` to test without posting.
- Use `--now "2026-07-21T07:30:00+10:00"` to test a specific time window.
