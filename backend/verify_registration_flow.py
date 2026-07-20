import json
import urllib.request

BASE = 'http://127.0.0.1:8000/api/auth/register'


def post(path, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(BASE + path, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as response:
        return response.status, json.loads(response.read().decode('utf-8'))

mobile = '9876543214'
email = 'flow.user4@example.com'
username = 'flowuser4'

status, body = post('/send-otp', {
    'fullName': 'Flow User',
    'username': username,
    'email': email,
    'mobile_number': mobile,
    'role': 'Admin',
})
print('send-otp', status, body)
otp_code = body['data']['otp_code']

status, body = post('/verify-otp', {
    'mobile': mobile,
    'otp': otp_code,
})
print('verify-otp', status, body)

status, body = post('/complete', {
    'mobile': mobile,
    'password': 'Simple123',
    'confirmPassword': 'Simple123',
})
print('complete', status, body)
