import urllib.request
import urllib.error
import json

def fetch(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            body = r.read().decode("utf-8", errors="replace")
            return {
                "url": url,
                "status": r.status,
                "headers": dict(r.getheaders()),
                "body": body,
            }
    except urllib.error.HTTPError as e:
        return {
            "url": url,
            "status": e.code,
            "headers": dict(e.headers) if e.headers else {},
            "body": e.read().decode("utf-8", errors="replace"),
        }
    except Exception as exc:
        return {
            "url": url,
            "error": repr(exc),
        }

urls = [
    "https://erp-college-n62iud1g2-websoft1.vercel.app/health",
    "https://erp-college-n62iud1g2-websoft1.vercel.app/api/v1/health",
    "https://erp-college-n62iud1g2-websoft1.vercel.app/docs",
    "https://erp-college-n62iud1g2-websoft1.vercel.app/api/docs",
    "https://erp-college-n62iud1g2-websoft1.vercel.app/api/coe/fee-heads",
    "https://erp-college-n62iud1g2-websoft1.vercel.app/api/coe/fee-head-groups",
    "https://erp-college-n62iud1g2-websoft1.vercel.app/api/coe/dmc-number-setup",
]

results = [fetch(url) for url in urls]
print(json.dumps(results, indent=2))
