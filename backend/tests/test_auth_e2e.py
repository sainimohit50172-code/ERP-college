"""
End-to-end authentication testing script.
Tests all auth endpoints in sequence: register, login, refresh, me, logout.
"""

import asyncio
import sys
import json
from datetime import datetime

sys.path.insert(0, '.')

from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)

# Test credentials
TEST_USER_EMAIL = "admin@erp.example.com"
TEST_USER_USERNAME = "admin-etest-" + str(int(__import__('time').time()) % 10000)
TEST_USER_PASSWORD = "Admin@123456"
TEST_USER_FULLNAME = "System Administrator"

test_results = {
    "timestamp": datetime.now().isoformat(),
    "tests": [],
    "summary": {
        "total": 0,
        "passed": 0,
        "failed": 0,
        "bugs_found": []
    }
}


def log_test(name: str, status: str, details: dict = None):
    """Log test result"""
    result = {
        "name": name,
        "status": status,
        "timestamp": datetime.now().isoformat(),
        "details": details or {}
    }
    test_results["tests"].append(result)
    if status == "PASS":
        test_results["summary"]["passed"] += 1
    else:
        test_results["summary"]["failed"] += 1
    test_results["summary"]["total"] += 1
    
    status_icon = "✅" if status == "PASS" else "❌"
    print(f"\n{status_icon} {name}: {status}")
    if details:
        for key, value in details.items():
            if key not in ["full_response"]:
                print(f"   {key}: {value}")


def test_1_register_admin():
    """Test 1: Register default admin user"""
    print("\n" + "="*80)
    print("TEST 1: Register Default Admin User")
    print("="*80)
    
    # First check if user already exists by trying to login
    login_payload = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    login_check = client.post("/api/v1/auth/login", json=login_payload)
    
    if login_check.status_code == 200:
        log_test(
            "Register Admin - Already Exists",
            "PASS",
            {
                "user_exists": True,
                "email": TEST_USER_EMAIL,
                "action": "Skipped (user already registered)"
            }
        )
        return True
    
    # Register new admin user
    register_payload = {
        "email": TEST_USER_EMAIL,
        "username": TEST_USER_USERNAME,
        "password": TEST_USER_PASSWORD,
        "full_name": TEST_USER_FULLNAME,
        "role_name": "Admin"
    }
    
    response = client.post("/api/v1/auth/register", json=register_payload)
    
    if response.status_code == 201:
        data = response.json()
        user_data = data.get("data", {}).get("user", {})
        log_test(
            "Register Admin User",
            "PASS",
            {
                "user_id": user_data.get("id"),
                "email": user_data.get("email"),
                "username": user_data.get("username"),
                "role": user_data.get("role"),
                "http_status": response.status_code
            }
        )
        return True
    else:
        error_msg = response.json().get("detail", "Unknown error")
        log_test(
            "Register Admin User",
            "FAIL",
            {
                "http_status": response.status_code,
                "error": str(error_msg),
                "payload": register_payload
            }
        )
        test_results["summary"]["bugs_found"].append({
            "test": "Register Admin",
            "error": str(error_msg),
            "status_code": response.status_code
        })
        return False


def test_2_login():
    """Test 2: Login with admin credentials"""
    print("\n" + "="*80)
    print("TEST 2: Login with Admin Credentials")
    print("="*80)
    
    login_payload = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    
    response = client.post("/api/v1/auth/login", json=login_payload)
    
    if response.status_code == 200:
        data = response.json()
        login_response = data.get("data", {})
        
        # Store tokens for later tests
        access_token = login_response.get("access_token")
        refresh_token = login_response.get("refresh_token")
        
        log_test(
            "Login Admin User",
            "PASS",
            {
                "http_status": response.status_code,
                "access_token_present": bool(access_token),
                "refresh_token_present": bool(refresh_token),
                "token_type": login_response.get("token_type"),
                "expires_in": login_response.get("expires_in"),
                "user_email": login_response.get("user", {}).get("email")
            }
        )
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": login_response.get("user", {})
        }
    else:
        error_msg = response.json().get("detail", "Unknown error")
        log_test(
            "Login Admin User",
            "FAIL",
            {
                "http_status": response.status_code,
                "error": str(error_msg)
            }
        )
        test_results["summary"]["bugs_found"].append({
            "test": "Login",
            "error": str(error_msg),
            "status_code": response.status_code
        })
        return None


def test_3_get_current_user(access_token: str):
    """Test 3: Get current user with Bearer token"""
    print("\n" + "="*80)
    print("TEST 3: Get Current User (/auth/me)")
    print("="*80)
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    response = client.get("/api/v1/auth/me", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        user_data = data.get("data", {})
        
        log_test(
            "Get Current User",
            "PASS",
            {
                "http_status": response.status_code,
                "user_id": user_data.get("id"),
                "email": user_data.get("email"),
                "username": user_data.get("username"),
                "full_name": user_data.get("full_name"),
                "is_active": user_data.get("is_active"),
                "is_superuser": user_data.get("is_superuser")
            }
        )
        return True
    else:
        error_msg = response.json().get("detail", "Unknown error") if response.text else "No response"
        log_test(
            "Get Current User",
            "FAIL",
            {
                "http_status": response.status_code,
                "error": str(error_msg)
            }
        )
        test_results["summary"]["bugs_found"].append({
            "test": "Get Current User",
            "error": str(error_msg),
            "status_code": response.status_code
        })
        return False


def test_4_refresh_token(refresh_token: str):
    """Test 4: Refresh token to get new access token"""
    print("\n" + "="*80)
    print("TEST 4: Refresh Token Flow")
    print("="*80)
    
    refresh_payload = {
        "refresh_token": refresh_token
    }
    
    response = client.post("/api/v1/auth/refresh", json=refresh_payload)
    
    if response.status_code == 200:
        data = response.json()
        refresh_response = data.get("data", {})
        
        new_access_token = refresh_response.get("access_token")
        new_refresh_token = refresh_response.get("refresh_token")
        
        log_test(
            "Refresh Token",
            "PASS",
            {
                "http_status": response.status_code,
                "new_access_token_present": bool(new_access_token),
                "new_refresh_token_present": bool(new_refresh_token),
                "token_type": refresh_response.get("token_type"),
                "expires_in": refresh_response.get("expires_in")
            }
        )
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token
        }
    else:
        error_msg = response.json().get("detail", "Unknown error") if response.text else "No response"
        log_test(
            "Refresh Token",
            "FAIL",
            {
                "http_status": response.status_code,
                "error": str(error_msg)
            }
        )
        test_results["summary"]["bugs_found"].append({
            "test": "Refresh Token",
            "error": str(error_msg),
            "status_code": response.status_code
        })
        return None


def test_5_logout(access_token: str, refresh_token: str):
    """Test 5: Logout and verify token revocation"""
    print("\n" + "="*80)
    print("TEST 5: Logout and Token Revocation")
    print("="*80)
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    logout_payload = {
        "refresh_token": refresh_token
    }
    
    response = client.post("/api/v1/auth/logout", json=logout_payload, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        
        log_test(
            "Logout User",
            "PASS",
            {
                "http_status": response.status_code,
                "success": data.get("data", {}).get("success")
            }
        )
        
        # Test that the refresh token is now invalid
        print("\n   Verifying token revocation...")
        refresh_payload = {
            "refresh_token": refresh_token
        }
        refresh_check = client.post("/api/v1/auth/refresh", json=refresh_payload)
        
        if refresh_check.status_code != 200:
            log_test(
                "Token Revocation Verification",
                "PASS",
                {
                    "http_status": refresh_check.status_code,
                    "message": "Revoked token correctly rejected",
                    "error": refresh_check.json().get("detail", "Token invalid")
                }
            )
            return True
        else:
            log_test(
                "Token Revocation Verification",
                "FAIL",
                {
                    "http_status": refresh_check.status_code,
                    "message": "Revoked token was still accepted (should have been rejected)"
                }
            )
            test_results["summary"]["bugs_found"].append({
                "test": "Token Revocation",
                "error": "Revoked token was still accepted",
                "status_code": refresh_check.status_code
            })
            return False
    else:
        error_msg = response.json().get("detail", "Unknown error") if response.text else "No response"
        log_test(
            "Logout User",
            "FAIL",
            {
                "http_status": response.status_code,
                "error": str(error_msg)
            }
        )
        test_results["summary"]["bugs_found"].append({
            "test": "Logout",
            "error": str(error_msg),
            "status_code": response.status_code
        })
        return False


def test_6_invalid_bearer_token():
    """Test 6: Verify invalid token is rejected"""
    print("\n" + "="*80)
    print("TEST 6: Invalid Bearer Token Handling")
    print("="*80)
    
    headers = {
        "Authorization": "Bearer invalid_token_here",
        "Content-Type": "application/json"
    }
    
    response = client.get("/api/v1/auth/me", headers=headers)
    
    if response.status_code == 401:
        log_test(
            "Invalid Bearer Token Rejection",
            "PASS",
            {
                "http_status": response.status_code,
                "message": "Invalid token correctly rejected"
            }
        )
        return True
    else:
        log_test(
            "Invalid Bearer Token Rejection",
            "FAIL",
            {
                "http_status": response.status_code,
                "message": "Invalid token should return 401",
                "error": response.json().get("detail", "Unknown")
            }
        )
        test_results["summary"]["bugs_found"].append({
            "test": "Invalid Bearer Token",
            "error": f"Should return 401, got {response.status_code}",
            "status_code": response.status_code
        })
        return False


def test_7_missing_bearer_token():
    """Test 7: Verify missing token is rejected"""
    print("\n" + "="*80)
    print("TEST 7: Missing Bearer Token Handling")
    print("="*80)
    
    response = client.get("/api/v1/auth/me")
    
    if response.status_code == 401:
        log_test(
            "Missing Bearer Token Rejection",
            "PASS",
            {
                "http_status": response.status_code,
                "message": "Missing token correctly rejected"
            }
        )
        return True
    else:
        log_test(
            "Missing Bearer Token Rejection",
            "FAIL",
            {
                "http_status": response.status_code,
                "message": "Missing token should return 401",
                "error": response.json().get("detail", "Unknown")
            }
        )
        test_results["summary"]["bugs_found"].append({
            "test": "Missing Bearer Token",
            "error": f"Should return 401, got {response.status_code}",
            "status_code": response.status_code
        })
        return False


def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("AUTHENTICATION E2E TEST SUITE")
    print("="*80)
    print(f"Start Time: {datetime.now().isoformat()}")
    
    # Test 1: Register
    test_1_register_admin()
    
    # Test 2: Login
    login_result = test_2_login()
    if not login_result:
        print("\n❌ Cannot proceed without successful login")
        print_report()
        return
    
    access_token = login_result.get("access_token")
    refresh_token = login_result.get("refresh_token")
    
    # Test 3: Get Current User
    test_3_get_current_user(access_token)
    
    # Test 4: Refresh Token
    refresh_result = test_4_refresh_token(refresh_token)
    if refresh_result:
        # Use new tokens for subsequent tests
        new_access_token = refresh_result.get("access_token")
        new_refresh_token = refresh_result.get("refresh_token")
    else:
        new_access_token = access_token
        new_refresh_token = refresh_token
    
    # Test 5: Logout
    test_5_logout(new_access_token, new_refresh_token)
    
    # Test 6: Invalid Bearer Token
    test_6_invalid_bearer_token()
    
    # Test 7: Missing Bearer Token
    test_7_missing_bearer_token()
    
    # Print report
    print_report()


def print_report():
    """Print test report"""
    print("\n" + "="*80)
    print("TEST SUMMARY REPORT")
    print("="*80)
    
    summary = test_results["summary"]
    print(f"\nTotal Tests: {summary['total']}")
    print(f"Passed: {summary['passed']} ✅")
    print(f"Failed: {summary['failed']} ❌")
    
    if summary['failed'] == 0:
        print("\n🎉 ALL TESTS PASSED!")
    else:
        print(f"\n⚠️  {summary['failed']} TEST(S) FAILED")
    
    if summary['bugs_found']:
        print(f"\nBugs Found: {len(summary['bugs_found'])}")
        for i, bug in enumerate(summary['bugs_found'], 1):
            print(f"\n  {i}. {bug['test']}")
            print(f"     Error: {bug['error']}")
            print(f"     Status Code: {bug['status_code']}")
    else:
        print("\n✅ No bugs found!")
    
    # Print all test details
    print("\n" + "-"*80)
    print("DETAILED TEST RESULTS")
    print("-"*80)
    for test in test_results["tests"]:
        print(f"\n{test['name']}: {test['status']}")
        if test['details']:
            for key, value in test['details'].items():
                if key != 'full_response':
                    print(f"  {key}: {value}")
    
    # Save report to file
    report_file = "test_auth_report.json"
    with open(report_file, "w") as f:
        json.dump(test_results, f, indent=2)
    
    print(f"\n📄 Full report saved to: {report_file}")


if __name__ == "__main__":
    main()
