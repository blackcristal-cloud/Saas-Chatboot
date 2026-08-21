"""
Comprehensive backend API testing for SaaS Chatbot Management Platform
Tests all endpoints including seed, companies, licenses, channels, bot-config, dashboard, and admin
"""
import requests
import sys
from datetime import datetime

BASE_URL = "https://saas-chatbot-preview.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.failures = []
        self.admin_token = None

    def test(self, name, func):
        """Run a single test"""
        self.tests_run += 1
        print(f"\n{'='*60}")
        print(f"🔍 Test {self.tests_run}: {name}")
        print(f"{'='*60}")
        try:
            func()
            self.tests_passed += 1
            print(f"✅ PASSED: {name}")
            return True
        except AssertionError as e:
            self.tests_failed += 1
            self.failures.append({"test": name, "error": str(e)})
            print(f"❌ FAILED: {name}")
            print(f"   Error: {e}")
            return False
        except Exception as e:
            self.tests_failed += 1
            self.failures.append({"test": name, "error": f"Exception: {str(e)}"})
            print(f"❌ FAILED: {name}")
            print(f"   Exception: {e}")
            return False

    def test_seed(self):
        """Test POST /api/seed - repopulates 3 companies, 3 licenses, 15 channels, 1 sync log"""
        print("Testing seed endpoint...")
        response = requests.post(f"{BASE_URL}/seed")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"Response: {data}")
        assert "inserted" in data, "Missing 'inserted' in response"
        inserted = data["inserted"]
        assert inserted["companies"] == 3, f"Expected 3 companies, got {inserted['companies']}"
        assert inserted["licenses"] == 3, f"Expected 3 licenses, got {inserted['licenses']}"
        assert inserted["channels"] == 15, f"Expected 15 channels, got {inserted['channels']}"
        assert inserted["syncLogs"] == 1, f"Expected 1 sync log, got {inserted['syncLogs']}"
        print("✓ Seed completed successfully with correct counts")

    def test_companies_list(self):
        """Test GET /api/companies - returns license join with c2 expired"""
        print("Testing companies list endpoint...")
        response = requests.get(f"{BASE_URL}/companies")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        companies = response.json()
        assert len(companies) == 3, f"Expected 3 companies, got {len(companies)}"
        
        # Find c2 (Pousada Vista Mar)
        c2 = next((c for c in companies if c["id"] == "c2"), None)
        assert c2 is not None, "Company c2 not found"
        assert c2["name"] == "Pousada Vista Mar", f"Expected 'Pousada Vista Mar', got {c2['name']}"
        assert c2["license"] is not None, "c2 should have a license"
        assert c2["license"]["computedStatus"] == "expired", f"Expected c2 license to be expired, got {c2['license']['computedStatus']}"
        print(f"✓ c2 license status: {c2['license']['computedStatus']}")
        
        # Verify c1 is active
        c1 = next((c for c in companies if c["id"] == "c1"), None)
        assert c1 is not None, "Company c1 not found"
        assert c1["license"]["computedStatus"] == "active", f"Expected c1 license to be active, got {c1['license']['computedStatus']}"
        print(f"✓ c1 license status: {c1['license']['computedStatus']}")

    def test_license_status_c2_expired(self):
        """Test GET /api/license/status?companyId=c2 - returns expired"""
        print("Testing license status for c2 (should be expired)...")
        response = requests.get(f"{BASE_URL}/license/status", params={"companyId": "c2"})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"Response: {data}")
        assert data["status"] == "expired", f"Expected status 'expired', got {data['status']}"
        assert data["valid"] == False, f"Expected valid=False, got {data['valid']}"
        print("✓ c2 license is expired and invalid")

    def test_license_status_c1_active(self):
        """Test GET /api/license/status?companyId=c1 - returns active"""
        print("Testing license status for c1 (should be active)...")
        response = requests.get(f"{BASE_URL}/license/status", params={"companyId": "c1"})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"Response: {data}")
        assert data["status"] == "active", f"Expected status 'active', got {data['status']}"
        assert data["valid"] == True, f"Expected valid=True, got {data['valid']}"
        print("✓ c1 license is active and valid")

    def test_admin_login_success(self):
        """Test POST /api/admin/login with correct credentials"""
        print("Testing admin login with correct credentials...")
        response = requests.post(f"{BASE_URL}/admin/login", json={
            "email": "admin@saas.com",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"Response: {data}")
        assert "token" in data, "Missing 'token' in response"
        assert data["email"] == "admin@saas.com", f"Expected email 'admin@saas.com', got {data['email']}"
        self.admin_token = data["token"]
        print(f"✓ Admin login successful, token: {self.admin_token}")

    def test_admin_login_failure(self):
        """Test POST /api/admin/login with wrong credentials"""
        print("Testing admin login with wrong credentials...")
        response = requests.post(f"{BASE_URL}/admin/login", json={
            "email": "admin@saas.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Admin login correctly rejected wrong credentials")

    def test_issue_license(self):
        """Test POST /api/licenses - issue new license for c2"""
        print("Testing issue license for c2...")
        response = requests.post(f"{BASE_URL}/licenses", json={
            "companyId": "c2",
            "plan": "pro"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"Response: {data}")
        assert data["companyId"] == "c2", f"Expected companyId 'c2', got {data['companyId']}"
        assert data["plan"] == "pro", f"Expected plan 'pro', got {data['plan']}"
        assert data["computedStatus"] == "active", f"Expected status 'active', got {data['computedStatus']}"
        print("✓ License issued successfully for c2")
        return data["id"]

    def test_renew_license(self):
        """Test POST /api/licenses/{id}/renew - renew license"""
        print("Testing renew license...")
        # First get a license to renew
        response = requests.get(f"{BASE_URL}/licenses")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        licenses = response.json()
        assert len(licenses) > 0, "No licenses found"
        license_id = licenses[0]["id"]
        print(f"Renewing license: {license_id}")
        
        response = requests.post(f"{BASE_URL}/licenses/{license_id}/renew", json={})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"Response: {data}")
        assert data["status"] == "active", f"Expected status 'active', got {data['status']}"
        print("✓ License renewed successfully")

    def test_update_channel_whatsapp(self):
        """Test PUT /api/channels/{companyId}/{channelType} - update WhatsApp status"""
        print("Testing update channel status for WhatsApp...")
        response = requests.put(f"{BASE_URL}/channels/c1/whatsapp", json={
            "status": "active"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"Response: {data}")
        assert data["status"] == "active", f"Expected status 'active', got {data['status']}"
        assert data["channelType"] == "whatsapp", f"Expected channelType 'whatsapp', got {data['channelType']}"
        print("✓ WhatsApp channel updated successfully")

    def test_update_channel_tiktok_fails(self):
        """Test PUT /api/channels/{companyId}/{channelType} - TikTok returns 400"""
        print("Testing update channel for TikTok (should fail)...")
        response = requests.put(f"{BASE_URL}/channels/c1/tiktok", json={
            "status": "active"
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ TikTok channel correctly returns 400")

    def test_get_bot_config(self):
        """Test GET /api/bot-config/{companyId} - get bot config"""
        print("Testing get bot config for c1...")
        response = requests.get(f"{BASE_URL}/bot-config/c1")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"Response: {data}")
        assert "persona" in data, "Missing 'persona' in response"
        assert "tone" in data, "Missing 'tone' in response"
        assert "instructions" in data, "Missing 'instructions' in response"
        assert "faqs" in data, "Missing 'faqs' in response"
        print("✓ Bot config retrieved successfully")

    def test_update_bot_config(self):
        """Test PUT /api/bot-config/{companyId} - update and verify persistence"""
        print("Testing update bot config for c1...")
        test_persona = f"Test persona {datetime.now().timestamp()}"
        test_faq = {"question": "Test question?", "answer": "Test answer"}
        
        # Update config
        response = requests.put(f"{BASE_URL}/bot-config/c1", json={
            "persona": test_persona,
            "tone": "formal",
            "instructions": "Test instructions",
            "faqs": [test_faq]
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"Update response: {data}")
        assert data["persona"] == test_persona, f"Expected persona '{test_persona}', got {data['persona']}"
        
        # Verify persistence by getting again
        response = requests.get(f"{BASE_URL}/bot-config/c1")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"Get response: {data}")
        assert data["persona"] == test_persona, f"Expected persisted persona '{test_persona}', got {data['persona']}"
        assert data["tone"] == "formal", f"Expected tone 'formal', got {data['tone']}"
        assert len(data["faqs"]) == 1, f"Expected 1 FAQ, got {len(data['faqs'])}"
        print("✓ Bot config updated and persisted successfully")

    def test_get_dashboard(self):
        """Test GET /api/dashboard/{companyId} - returns metrics with conversasSemana array"""
        print("Testing get dashboard metrics for c1...")
        response = requests.get(f"{BASE_URL}/dashboard/c1")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        print(f"Response: {data}")
        assert "conversasTotal" in data, "Missing 'conversasTotal' in response"
        assert "leadsTotal" in data, "Missing 'leadsTotal' in response"
        assert "uptimePct" in data, "Missing 'uptimePct' in response"
        assert "mensagensHoje" in data, "Missing 'mensagensHoje' in response"
        assert "conversasSemana" in data, "Missing 'conversasSemana' in response"
        assert isinstance(data["conversasSemana"], list), "conversasSemana should be a list"
        assert len(data["conversasSemana"]) == 7, f"Expected 7 days in conversasSemana, got {len(data['conversasSemana'])}"
        print(f"✓ Dashboard metrics retrieved successfully with conversasSemana: {data['conversasSemana']}")

    def run_all_tests(self):
        """Run all backend tests in order"""
        print("\n" + "="*60)
        print("🚀 STARTING BACKEND API TESTS")
        print("="*60)
        
        # Test seed first (required for other tests)
        self.test("POST /api/seed - Repopulate data", self.test_seed)
        
        # Test companies and licenses
        self.test("GET /api/companies - Verify license join with c2 expired", self.test_companies_list)
        self.test("GET /api/license/status?companyId=c2 - Verify expired", self.test_license_status_c2_expired)
        self.test("GET /api/license/status?companyId=c1 - Verify active", self.test_license_status_c1_active)
        
        # Test admin login
        self.test("POST /api/admin/login - Success with correct credentials", self.test_admin_login_success)
        self.test("POST /api/admin/login - Fail with wrong credentials", self.test_admin_login_failure)
        
        # Test license operations
        self.test("POST /api/licenses - Issue new license for c2", self.test_issue_license)
        self.test("POST /api/licenses/{id}/renew - Renew license", self.test_renew_license)
        
        # Test channels
        self.test("PUT /api/channels/{companyId}/{channelType} - Update WhatsApp", self.test_update_channel_whatsapp)
        self.test("PUT /api/channels/{companyId}/{channelType} - TikTok returns 400", self.test_update_channel_tiktok_fails)
        
        # Test bot config
        self.test("GET /api/bot-config/{companyId} - Get bot config", self.test_get_bot_config)
        self.test("PUT /api/bot-config/{companyId} - Update and verify persistence", self.test_update_bot_config)
        
        # Test dashboard
        self.test("GET /api/dashboard/{companyId} - Get metrics with conversasSemana", self.test_get_dashboard)
        
        # Print summary
        print("\n" + "="*60)
        print("📊 BACKEND TEST SUMMARY")
        print("="*60)
        print(f"Total tests: {self.tests_run}")
        print(f"✅ Passed: {self.tests_passed}")
        print(f"❌ Failed: {self.tests_failed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failures:
            print("\n" + "="*60)
            print("❌ FAILED TESTS:")
            print("="*60)
            for i, failure in enumerate(self.failures, 1):
                print(f"{i}. {failure['test']}")
                print(f"   Error: {failure['error']}")
        
        return 0 if self.tests_failed == 0 else 1

if __name__ == "__main__":
    tester = BackendTester()
    sys.exit(tester.run_all_tests())
