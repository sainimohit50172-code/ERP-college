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

for url in urls:
    print('URL:', url)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as r:
            print('STATUS:', r.status)
            print('FINAL_URL:', r.geturl())
            print('HEADERS:', dict(r.headers.items()))
            body = r.read(500).decode('utf-8', errors='replace')
            print('BODY_START:', body)
    except urllib.error.HTTPError as e:
        print('STATUS:', e.code)
        print('HEADERS:', dict(e.headers.items()))
        body = e.read(500).decode('utf-8', errors='replace')
        print('BODY_START:', body)
    except Exception as exc:
        print('ERROR:', repr(exc))
    print('---')
