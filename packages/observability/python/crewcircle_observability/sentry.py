import os


def init_sentry(dsn=None, environment=None, sample_rate=0.1):
    dsn = dsn or os.getenv("SENTRY_DSN")
    if not dsn:
        return

    import sentry_sdk

    sentry_sdk.init(
        dsn=dsn,
        environment=environment or os.getenv("APP_ENV", "production"),
        traces_sample_rate=sample_rate,
    )
