import httpx
import json

base_url = 'http://127.0.0.1:8000/api/v1'

login_payload = {
    'email': 'admin@example.com',
    'password': 'Admin123'
}

print('Testing login with admin@example.com...')
with httpx.Client(timeout=10.0) as client:
    try:
        response = client.post(f'{base_url}/auth/login', json=login_payload)
        print(f'Status: {response.status_code}')
        data = response.json()
        if response.status_code == 200:
            print('Login successful!')
            token = data.get('data', {}).get('access_token', 'N/A')
            print(f'Token: {token[:50] if token else "N/A"}...')
        else:
            print(f'Error: {data}')
    except Exception as e:
        print(f'Error: {str(e)}')
