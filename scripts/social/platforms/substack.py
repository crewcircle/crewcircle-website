import logging
import smtplib
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


def _build_html_body(body: str, image_path: str | None, image_cid: str) -> str:
    html = body.replace("\n", "<br>\n")
    if image_path and Path(image_path).exists():
        html += f'\n<br><img src="cid:{image_cid}">'
    return html


def _attach_image(msg: MIMEMultipart, image_path: str, cid: str) -> None:
    with Path(image_path).open("rb") as f:
        image = MIMEImage(f.read())
    image.add_header("Content-ID", f"<{cid}>")
    image.add_header("Content-Disposition", "inline", filename=Path(image_path).name)
    msg.attach(image)


def publish(config: dict[str, Any], post: dict[str, Any], dry_run: bool = True) -> dict[str, Any]:
    post_email = config.get("post_email")
    smtp_host = config.get("smtp_host")
    smtp_port = config.get("smtp_port", 587)
    smtp_user = config.get("smtp_user")
    smtp_pass = config.get("smtp_pass")

    if not post_email or not smtp_host or not smtp_user:
        return {"success": False, "platform": "substack", "message": "Substack email or SMTP credentials missing"}

    title = post.get("title", "")
    body = post.get("body", "")
    image_path = post.get("image_path")
    footer = config.get("footer", "")
    if footer:
        body = f"{body}\n\n{footer}"

    if dry_run:
        logger.info("[DRY-RUN] Substack post to %s: %s", post_email, title)
        return {"success": True, "platform": "substack", "dry_run": True, "title": title}

    try:
        msg = MIMEMultipart("related")
        msg["Subject"] = title
        msg["From"] = smtp_user
        msg["To"] = post_email

        image_cid = "postimage"
        html_body = _build_html_body(body, image_path, image_cid)
        msg.attach(MIMEText(html_body, "html"))

        if image_path:
            _attach_image(msg, image_path, image_cid)

        with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, [post_email], msg.as_string())

        logger.info("Substack post sent: %s", title)
        return {"success": True, "platform": "substack", "title": title}
    except Exception as e:
        logger.error("Substack post failed: %s", e)
        return {"success": False, "platform": "substack", "title": title, "message": str(e)}
