import urllib.request
import urllib.error
import json

urls = [
    'https://erp-college-n62iud1g2-websoft1.vercel.app/health',
    'https://erp-college-n62iud1g2-websoft1.vercel.app/api/v1/health',
    'https://erp-college-n62iud1g2-websoft1.vercel.app/docs',
    'https://erp-college-n62iud1g2-websoft1.vercel.app/api/docs',
    'https://erp-college-n62iud1g2-websoft1.vercel.app/api/coe/fee-heads',
    'https://erp-college-n62iud1g2-websoft1.vercel.app/api/coe/fee-head-groups',
    'https://erp-college-n62iud1g2-websoft1.vercel.app/api/coe/dmc-number-setup',
]

results = []
for url in urls:
    entry = {'url': url}
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as r:
            body = r.read(800).decode('utf-8', errors='replace')
            entry.update({
                'status': r.status,
                'content_type': r.headers.get('content-type'),
                'body_preview': body,
            })
    except urllib.error.HTTPError as e:
        body = e.read(800).decode('utf-8', errors='replace')
        entry.update({
            'status': e.code,
            'content_type': e.headers.get('content-type'),
            'body_preview': body,
        })
    except Exception as exc:
        entry['error'] = repr(exc)
    results.append(entry)
print(json.dumps(results, indent=2))
