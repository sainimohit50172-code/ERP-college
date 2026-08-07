"""Top-level seeder script.

Usage:
  python backend/seed.py master
  python backend/seed.py cleanup-demo
"""
from app.seeders import cli
import sys


if __name__ == "__main__":
    raise SystemExit(cli.main(sys.argv[1:]))
