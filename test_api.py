#!/usr/bin/env python3
"""Test OtherIncomeHead and OtherIncomeAccountMapper API endpoints."""

import httpx
import json
from datetime import datetime

base_url = 'http://127.0.0.1:8000/api/v1'

# Use timestamp to make data unique
timestamp = datetime.now().strftime('%Y%m%d%H%M%S')

# Test 1: Create OtherIncomeHead
print('=== TEST 1: Create OtherIncomeHead ===')
head_data = {
    'name': f'Scholarship Income {timestamp}',
    'code': f'SCHOL{timestamp}',
    'status': 'Active',
    'description': 'Income from scholarships'
}

head_id = None
with httpx.Client() as client:
    response = client.post(f'{base_url}/other-income-heads', json=head_data)
    print(f'Status: {response.status_code}')
    if response.status_code in (200, 201):
        result = response.json()
        print(f'Response: {json.dumps(result, indent=2)}')
        head_id = result.get('data', result.get('id'))
        if isinstance(head_id, dict):
            head_id = head_id.get('id')
        print(f'Created Head ID: {head_id}')
    else:
        print(f'Error: {response.text}')

# Test 2: Create OtherIncomeAccountMapper
print('\n=== TEST 2: Create OtherIncomeAccountMapper ===')
if head_id:
    mapper_data = {
        'otherIncomeHeadId': head_id,
        'accountName': f'Scholarship Account {timestamp}',
        'accountCode': f'ACC-SCHOL-{timestamp}',
        'status': 'Active',
        'description': 'Scholarship account mapping'
    }
    
    with httpx.Client() as client:
        response = client.post(f'{base_url}/other-income-account-mappers', json=mapper_data)
        print(f'Status: {response.status_code}')
        if response.status_code in (200, 201):
            result = response.json()
            print(f'Response: {json.dumps(result, indent=2)}')
        else:
            print(f'Error: {response.text}')

# Test 3: Retrieve list
print('\n=== TEST 3: Retrieve OtherIncomeHeads ===')
with httpx.Client() as client:
    response = client.get(f'{base_url}/other-income-heads')
    print(f'Status: {response.status_code}')
    result = response.json()
    data = result.get('data', {})
    items = data.get('items', [])
    print(f'Total items: {len(items)}')
    if items:
        print(f'First item: {json.dumps(items[0], indent=2)}')
    print(f'Full data: {json.dumps(data, indent=2)}')

print('\n=== TEST 4: Retrieve OtherIncomeAccountMappers ===')
with httpx.Client() as client:
    response = client.get(f'{base_url}/other-income-account-mappers')
    print(f'Status: {response.status_code}')
    result = response.json()
    data = result.get('data', {})
    items = data.get('items', [])
    print(f'Total items: {len(items)}')
    if items:
        print(f'First item: {json.dumps(items[0], indent=2)}')
    print(f'Full data: {json.dumps(data, indent=2)}')
