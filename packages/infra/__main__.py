import pulumi
from pulumi_github import ActionsOrganizationSecret, ActionsOrganizationVariable
from pulumiverse_sentry import SentryTeam

config = pulumi.Config()
github_org = config.require("github_org")

master_env_var = "crewcircle/master"

# ── GitHub organization secrets ─────────────────────────────────────
master_doppler_token = ActionsOrganizationSecret(
    "doppler-token",
    secret_name="DOPPLER_TOKEN",
    visibility="all",
    value=config.require_secret("doppler_token"),
)

master_supabase_token = ActionsOrganizationSecret(
    "supabase-access-token",
    secret_name="SUPABASE_ACCESS_TOKEN",
    visibility="all",
    value=config.require_secret("supabase_access_token"),
)

master_sentry_token = ActionsOrganizationSecret(
    "sentry-auth-token",
    secret_name="SENTRY_AUTH_TOKEN",
    visibility="all",
    value=config.require_secret("sentry_auth_token"),
)

master_cloudflare_token = ActionsOrganizationSecret(
    "cloudflare-api-token",
    secret_name="CLOUDFLARE_API_TOKEN",
    visibility="all",
    value=config.require_secret("cloudflare_api_token"),
)

master_esc_var = ActionsOrganizationVariable(
    "esc-env",
    variable_name="ESC_ENV",
    visibility="all",
    value=master_env_var,
)

# NOTE: Doppler project "crewcircle-master" with env "prod" must exist
# out-of-band (via Doppler CLI or UI) because ESC imports
# doppler://crewcircle-master/prod at environment-open time, before
# Pulumi runs. That project is NOT managed by Pulumi — it is a
# bootstrap prerequisite shared across all stacks.

sentry_core_team = SentryTeam(
    "core-team",
    name="core",
    slug="core",
    organization=config.require("sentry_org"),
)

pulumi.export("github_org", github_org)
pulumi.export("sentry_team_id", sentry_core_team.id)
pulumi.export("secrets_count", 4)
