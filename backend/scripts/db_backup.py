#!/usr/bin/env python3
"""Create a full database backup for SQLite or MySQL (if available)."""
import os
import shutil
import subprocess
from datetime import datetime

from app.core.config import get_settings


def backup_sqlite(path: str, out_dir: str) -> str:
    os.makedirs(out_dir, exist_ok=True)
    ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    base = os.path.basename(path)
    dest = os.path.join(out_dir, f"{base}.backup.{ts}")
    shutil.copy2(path, dest)
    return dest


def backup_mysql(settings, out_dir: str) -> str:
    os.makedirs(out_dir, exist_ok=True)
    ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    dest = os.path.join(out_dir, f"mysql_backup_{settings.mysql_db}.{ts}.sql")
    cmd = [
        "mysqldump",
        f"-h{settings.mysql_host}",
        f"-P{settings.mysql_port}",
        f"-u{settings.mysql_user}",
        f"-p{settings.mysql_password}",
        settings.mysql_db,
    ]
    try:
        with open(dest, "wb") as fh:
            subprocess.check_call(cmd, stdout=fh)
        return dest
    except FileNotFoundError:
        raise RuntimeError("mysqldump not found in PATH; cannot backup MySQL")
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(f"mysqldump failed: {exc}")


def main():
    settings = get_settings()
    db_url = settings.database_url
    out_dir = os.path.join(os.path.dirname(__file__), "../db_backups")

    if db_url.startswith("sqlite:///"):
        path = db_url[10:]
        if path.startswith("/") and os.name == "nt":
            path = path[1:]
        path = os.path.abspath(path)
        if not os.path.exists(path):
            print(f"SQLite DB not found at {path}")
            raise SystemExit(1)
        dest = backup_sqlite(path, out_dir)
        print(f"SQLite backup created: {dest}")
    else:
        # attempt MySQL backup
        print("Detected non-sqlite DB. Attempting mysqldump backup.")
        try:
            dest = backup_mysql(settings, out_dir)
            print(f"MySQL backup created: {dest}")
        except RuntimeError as exc:
            print(f"MySQL backup failed: {exc}")
            raise SystemExit(2)


if __name__ == "__main__":
    main()
