#!/usr/bin/env python3
"""Test authentication hardening - verify security fixes."""

import requests
import json

def test_protected_endpoints():
    """Test protected endpoints return 401 without auth."""
    base_url = "http://127.0.0.1:8000/api/v1/auth"
    
    print("\n" + "="*60)
    print("AUTH HARDENING TESTS")
    print("="*60)
    
    # Test 1: /me without Bearer token
    print("\n[TEST 1] GET /me without Bearer token")
    response = requests.get(f"{base_url}/me")
    print(f"Status Code: {response.status_code}")
    assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    print("✅ PASS: Returns 401 for unauthenticated request")
    
    # Test 2: /me with invalid Bearer token
    print("\n[TEST 2] GET /me with invalid Bearer token")
    headers = {"Authorization": "Bearer invalid_token_xyz"}
    response = requests.get(f"{base_url}/me", headers=headers)
    print(f"Status Code: {response.status_code}")
    assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    print("✅ PASS: Returns 401 for invalid token")
    
    # Test 3: /me with valid Bearer token
    print("\n[TEST 3] GET /me with valid Bearer token")
    login_resp = requests.post(f"{base_url}/login", json={
        "email": "admin@example.com",
        "password": "Admin123"
    })
    assert login_resp.status_code == 200, f"Login failed: {login_resp.status_code}"
    token = login_resp.json()["data"]["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{base_url}/me", headers=headers)
    print(f"Status Code: {response.status_code}")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    user_data = response.json()["data"]
    assert "hashed_password" not in str(user_data), "Password hash in response!"
    print(f"User Email: {user_data.get('email')}")
    print("✅ PASS: Returns 200 with valid token, no password hash")
    
    # Test 4: Verify /logout requires authentication
    print("\n[TEST 4] POST /logout without Bearer token")
    response = requests.post(f"{base_url}/logout")
    print(f"Status Code: {response.status_code}")
    assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    print("✅ PASS: Returns 401 for unauthenticated logout")
    
    # Test 5: Verify /change-password requires authentication
    print("\n[TEST 5] POST /change-password without Bearer token")
    response = requests.post(f"{base_url}/change-password", json={
        "current_password": "Admin123",
        "new_password": "NewPassword123"
    })
    print(f"Status Code: {response.status_code}")
    assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    print("✅ PASS: Returns 401 for unauthenticated password change")
    
    # Test 6: Verify /register is public
    print("\n[TEST 6] POST /register without Bearer token")
    response = requests.post(f"{base_url}/register", json={
        "email": f"test{hash('test')}@example.com",
        "username": f"testuser{hash('test')}",
        "password": "TestPassword123",
        "full_name": "Test User",
        "role_name": "Admin"
    })
    print(f"Status Code: {response.status_code}")
    assert response.status_code == 201, f"Expected 201, got {response.status_code}"
    print("✅ PASS: Returns 201 for public registration")
    
    # Test 7: Verify /login is public
    print("\n[TEST 7] POST /login without Bearer token")
    response = requests.post(f"{base_url}/login", json={
        "email": "admin@example.com",
        "password": "Admin123"
    })
    print(f"Status Code: {response.status_code}")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    print("✅ PASS: Returns 200 for public login")
    
    # Test 8: Verify password hash not in registration response
    print("\n[TEST 8] Verify password hash not in registration response")
    import random
    test_email = f"test{random.randint(10000, 99999)}@example.com"
    test_username = f"testuser{random.randint(10000, 99999)}"
    
    response = requests.post(f"{base_url}/register", json={
        "email": test_email,
        "username": test_username,
        "password": "TestPassword123",
        "full_name": "Test User"
    })
    
    response_data = response.json()
    response_str = json.dumps(response_data)
    
    assert "hashed_password" not in response_str, "hashed_password found in response!"
    print(f"Response keys: {list(response_data.get('data', {}).get('user', {}).keys())}")
    print("✅ PASS: Password hash not exposed in registration response")

if __name__ == "__main__":
    try:
        test_protected_endpoints()
        print("\n" + "="*60)
        print("ALL TESTS PASSED ✅")
        print("="*60 + "\n")
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}\n")
        exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}\n")
        exit(1)
