import os, smtplib
from email.mime.text import MIMEText
from typing import List

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
ALERT_TO = os.getenv("ALERT_TO_EMAIL")

class Emailer:
    def enabled(self) -> bool:
        return all([SMTP_HOST, SMTP_USER, SMTP_PASS, ALERT_TO])

    def send_alerts(self, alerts: List[str]):
        if not alerts or not self.enabled():
            return
        body = "\n".join(alerts)
        msg = MIMEText(body)
        msg["Subject"] = "Ghost-Bus Detector Alerts"
        msg["From"] = SMTP_USER
        msg["To"] = ALERT_TO
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
            s.starttls()
            s.login(SMTP_USER, SMTP_PASS)
            s.sendmail(SMTP_USER, [ALERT_TO], msg.as_string())