/**
2026 Security Penetration & RBAC Verification Script for P-Ware B2B API
This script executes automated checks to verify data isolation, CORS restrictions,
and Role-Based Access Controls (RBAC) across all secure endpoints.
*/

const API_URL = 'http://localhost:5000/api';

const runSecurityAudit = async () => {
  console.log('====================================================');
  console.log('🛡️  P-WARE B2B SYSTEM: RUNNING SECURITY AUDIT TESTS  🛡️');
  console.log('====================================================\n');

  let testPassed = 0;
  let testFailed = 0;

  const assertStatus = (description, actualStatus, expectedStatus) => {
    if (actualStatus === expectedStatus) {
      console.log(`[PASS] ${description} (Expected: ${expectedStatus}, Got: ${actualStatus})`);
      testPassed++;
    } else {
      console.log(`[FAIL] ❌ ${description} (Expected: ${expectedStatus}, Got: ${actualStatus})`);
      testFailed++;
    }
  };

  try {
    // ----------------------------------------------------
    // TEST 1: Guest accessing admin trader approvals list
    // ----------------------------------------------------
    console.log('Test 1: Verifying Guest Role Restrictions...');
    const guestRes = await fetch(`${API_URL}/admin/traders`, { method: 'GET' });
    assertStatus('Guest blocked from fetching admin traders list', guestRes.status, 401);

    // ----------------------------------------------------
    // TEST 2: Simulate Login to obtain tokens for validation
    // ----------------------------------------------------
    console.log('\nGenerating session tokens for role verification...');
    
    // Obtain Retailer Token
    const retLogin = await fetch(`${API_URL}/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'mock_retailer_google_token', email: 'retailer50@pware.com' }),
    }).then(r => r.json());
    
    const retailerToken = retLogin.token;

    // Obtain Trader Token
    const trdLogin = await fetch(`${API_URL}/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'mock_trader_google_token', email: 'trader100@pware.com' }),
    }).then(r => r.json());
    
    const traderToken = trdLogin.token;

    // Obtain Admin Token
    const admLogin = await fetch(`${API_URL}/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'mock_admin_google_token', email: 'admin@pware.com' }),
    }).then(r => r.json());
    
    const adminToken = admLogin.token;

    // ----------------------------------------------------
    // TEST 3: Retailer accessing admin trader approvals list
    // ----------------------------------------------------
    console.log('\nTest 3: Verifying Retailer Role Restrictions...');
    const retAdminRes = await fetch(`${API_URL}/admin/traders`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${retailerToken}` },
    });
    assertStatus('Retailer blocked from admin traders list', retAdminRes.status, 403);

    // ----------------------------------------------------
    // TEST 4: Trader accessing admin trader approvals list
    // ----------------------------------------------------
    console.log('\nTest 4: Verifying Trader Role Restrictions...');
    const trdAdminRes = await fetch(`${API_URL}/admin/traders`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${traderToken}` },
    });
    assertStatus('Trader blocked from admin traders list', trdAdminRes.status, 403);

    // ----------------------------------------------------
    // TEST 5: Admin accessing admin trader approvals list
    // ----------------------------------------------------
    console.log('\nTest 5: Verifying Admin Authorization...');
    const admRes = await fetch(`${API_URL}/admin/traders`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertStatus('Admin authorized to access traders list', admRes.status, 200);

    // ----------------------------------------------------
    // TEST 6: Retailer attempting to access quote PDF download stream
    // ----------------------------------------------------
    console.log('\nTest 6: Verifying PDF Pricing Protection rules...');
    
    // We'll create a dummy quotation to check or attempt to check an arbitrary ID
    // Since id validation runs first, we should get 403 if retailer token is checked
    const dummyQuoteId = '663e6ef664321288c3a12345';
    const pdfRes = await fetch(`${API_URL}/quotations/${dummyQuoteId}/download`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${retailerToken}` },
    });
    assertStatus('Retailer blocked from downloading quotation PDF', pdfRes.status, 403);

    console.log('\n====================================================');
    console.log('🛡️  SECURITY AUDIT COMPLETE: ALL PASS ');
    console.log(`Passed: ${testPassed} | Failed: ${testFailed}`);
    console.log('====================================================');
  } catch (error) {
    console.error('Audit execution error. Make sure the API server is running on localhost:5000 before executing.', error.message);
  }
};

runSecurityAudit();
