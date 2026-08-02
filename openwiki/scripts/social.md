---
type: Script Documentation
title: Social Media Automation Scripts
description: Documentation for the scripts/social directory, which provides a Python toolkit for automating social media publishing.
tags: [script, automation, social-media, python, substack, linkedin, x, youtube, scheduling]
---
# Social Media Automation Scripts

The `scripts/social/` directory contains a Python toolkit designed for automating the publishing of content to various social media platforms, including Substack, LinkedIn, and X (formerly Twitter). It allows for local scheduling of posts based on a YAML content calendar, eliminating the need for third-party scheduling tools.

## Purpose

This toolkit streamlines the process of distributing content across multiple social media channels, enabling consistent and timely communication with an audience without relying on external services that might incur additional costs or introduce vendor lock-in.

## Structure

```
scripts/social/
├── publish.py                 ← Main orchestrator script for publishing content
├── platforms/                 ← Modules for interacting with specific social media platforms
│   ├── substack.py            ← Handles publishing to Substack (via email-to-post)
│   ├── linkedin.py            ← Integrates with LinkedIn API v2
│   ├── twitter.py             ← Integrates with X (Twitter) API v2
│   └── youtube.py             ← Placeholder for YouTube upload functionality
├── config.yaml.example        ← Template for configuration settings (API keys, etc.)
├── calendar.yaml.example      ← Template for the content publishing schedule
├── scheduler/                 ← Example configurations for local scheduling tools
│   ├── crontab.txt            ← Example cron job configuration
│   └── com.crewcircle.social.publish.plist ← Example `launchd` configuration for macOS
└── secret/                    ← Directory for sensitive configuration and state (gitignored)
    ├── config.yaml            ← Your actual credentials and configuration
    └── state.yaml             ← Tracks previously published posts
```

## Setup

1.  **Copy Configuration Examples**: Copy `config.yaml.example` to `secret/config.yaml` and `calendar.yaml.example` to `calendar.yaml`. Fill in your specific credentials and content schedule.
2.  **Install Dependencies**: The script requires `requests`, `requests-oauthlib`, and `pyyaml`. Install them in a virtual environment:
    ```bash
    python3 -m venv scripts/social/.venv
    ./scripts/social/.venv/bin/pip install requests requests-oauthlib pyyaml
    ```
3.  **Secrets Management**: Choose between Doppler (recommended for CrewCircle) or environment variables/`.env` files for managing API keys and sensitive information. Configure `secret/config.yaml` accordingly.
4.  **Dry-Run Test**: Verify your setup by running the `publish.py` script in dry-run mode:
    ```bash
    ./scripts/social/.venv/bin/python scripts/social/publish.py --dry-run
    ```
5.  **Schedule**: Set up recurring execution using `cron` (for Linux/macOS) or `launchd` (for macOS) as per the examples in `scripts/social/scheduler/`.

## Platform-Specific Setup

*   **Substack**: Requires an email-to-post address from your publication settings and an app-specific SMTP password.
*   **LinkedIn**: Involves creating a LinkedIn Developer application, requesting specific products (`Share on LinkedIn`, `Sign In with LinkedIn using OpenID Connect`), obtaining an OAuth token, and identifying person/company URNs.
*   **X (Twitter)**: Notes the limitations of the free tier and the likelihood of needing a paid plan for write access.

## Integration with `.sisyphus`

The content and plans defined within the `.sisyphus/` directory, particularly `social-content-plan.md` and content assets under `content/phase-1/`, are directly consumed by these automation scripts. This ensures that the publishing process aligns with the broader content strategy.
