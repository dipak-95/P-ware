/**
 * End-to-End Flow Verification Script for P-Ware B2B System
 * Tests the full journey: Retailer → Inquiry → Admin creates Quotation → Trader downloads PDF → Retailer blocked
 */

const API_URL = 'http://localhost:5000/api';

let adminToken, traderToken, retailerToken;
let traderCode, inquiryId, quotationId;
let pass = 0, fail = 0;

const log = (ok, desc, extra = '') => {
  if (ok) { console.log(`  [PASS] ${desc}${extra}`); pass++; }
  else     { console.log(`  [FAIL] ❌ ${desc}${extra}`); fail++; }
};

const step = (label) => console.log(`\n── ${label} ──────────────────────────────────`);

async function run() {
  console.log('======================================================');
  console.log('🔄  P-WARE B2B: END-TO-END FLOW VERIFICATION          ');
  console.log('======================================================');

  // ── STEP 1: Authenticate all roles ─────────────────────────────
  step('STEP 1 – Authenticate all 3 roles');

  const admLogin = await fetch(`${API_URL}/auth/google-login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: 'mock_admin_google_token', email: 'admin@pware.com', name: 'Admin Boss' }),
  }).then(r => r.json());
  adminToken = admLogin.token;
  log(!!adminToken, 'Admin login', ` (status: ${admLogin.status})`);

  const trdLogin = await fetch(`${API_URL}/auth/google-login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: 'mock_trader_google_token', email: 'trader100@pware.com', name: 'Rajesh Traders' }),
  }).then(r => r.json());
  traderToken = trdLogin.token;
  log(!!traderToken, 'Trader login', ` (status: ${trdLogin.status})`);

  const retLogin = await fetch(`${API_URL}/auth/google-login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: 'mock_retailer_google_token', email: 'retailer50@pware.com', name: 'Sagar Ceramic Shop' }),
  }).then(r => r.json());
  retailerToken = retLogin.token;
  log(!!retailerToken, 'Retailer login', ` (status: ${retLogin.status})`);

  // ── STEP 2: Fetch Trader Profile Code ──────────────────────────
  step('STEP 2 – Fetch Trader referral code');

  const meData = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${traderToken}` },
  }).then(r => r.json());

  traderCode = meData.profile?.traderCode;
  log(!!traderCode, 'Trader code retrieved', traderCode ? ` (${traderCode})` : '');

  // ── STEP 3: Public Catalog browsing (no auth) ───────────────────
  step('STEP 3 – Public product catalog browsing (no auth required)');

  const catalogRes = await fetch(`${API_URL}/catalog/products?limit=3`).then(r => r.json());
  log(Array.isArray(catalogRes.data) && catalogRes.data.length > 0, 'Public catalog returns products', ` (${catalogRes.data?.length} found)`);
  const firstProduct = catalogRes.data?.[0];

  // ── STEP 4: Retailer submits inquiry ───────────────────────────
  step('STEP 4 – Retailer submits inquiry cart');

  const inquiryRes = await fetch(`${API_URL}/inquiries/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${retailerToken}` },
    body: JSON.stringify({
      items: [{ productId: firstProduct._id, quantity: 10 }],
    }),
  }).then(r => r.json());

  inquiryId = inquiryRes.data?._id;
  log(inquiryRes.status === 'success', 'Retailer inquiry submitted', inquiryId ? ` (ID: ${inquiryId})` : '');

  // ── STEP 5: Admin views inquiry list ───────────────────────────
  step('STEP 5 – Admin views inquiry list');

  const adminInquiries = await fetch(`${API_URL}/inquiries/admin`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  }).then(r => r.json());

  log(adminInquiries.status === 'success' && adminInquiries.data?.length > 0,
    'Admin can view all inquiries',
    ` (${adminInquiries.data?.length} total)`);

  // ── STEP 6: Trader views their inquiry list ─────────────────────
  step('STEP 6 – Trader views inquiry list for their retailers');

  const traderInq = await fetch(`${API_URL}/inquiries/trader`, {
    headers: { Authorization: `Bearer ${traderToken}` },
  }).then(r => r.json());
  log(traderInq.status === 'success', 'Trader can view retailer inquiries', ` (${traderInq.data?.length} found)`);

  // ── STEP 7: Admin creates a quotation ──────────────────────────
  step('STEP 7 – Admin creates quotation from inquiry');

  const quotationRes = await fetch(`${API_URL}/quotations/admin/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      inquiryId,
      rates: [{ productId: firstProduct._id, rate: 850 }],
    }),
  }).then(r => r.json());

  quotationId = quotationRes.data?._id;
  log(quotationRes.status === 'success', 'Admin quotation created', quotationId ? ` (${quotationRes.data?.quotationNumber})` : ` (err: ${quotationRes.message})`);

  // ── STEP 8: Trader downloads quotation PDF ─────────────────────
  step('STEP 8 – Trader downloads quotation PDF');

  const pdfRes = await fetch(`${API_URL}/quotations/${quotationId}/download`, {
    headers: { Authorization: `Bearer ${traderToken}` },
  });
  log(pdfRes.status === 200, 'Trader can download quotation PDF', ` (Content-Type: ${pdfRes.headers.get('content-type')})`);

  // ── STEP 9: Retailer blocked from PDF ─────────────────────────
  step('STEP 9 – Retailer blocked from accessing quotation PDF (security)');

  const blockedRes = await fetch(`${API_URL}/quotations/${quotationId}/download`, {
    headers: { Authorization: `Bearer ${retailerToken}` },
  }).then(r => r.json());
  log(blockedRes.status === 'error', 'Retailer blocked from quotation PDF', ` (message: ${blockedRes.message})`);

  // ── STEP 10: Trader retailer list ─────────────────────────────
  step('STEP 10 – Trader can view their retailer pool');

  const retailersRes = await fetch(`${API_URL}/auth/retailers`, {
    headers: { Authorization: `Bearer ${traderToken}` },
  }).then(r => r.json());
  log(retailersRes.status === 'success', 'Trader retailers list accessible', ` (${retailersRes.data?.length} retailers)`);

  // ── FINAL SUMMARY ──────────────────────────────────────────────
  console.log('\n======================================================');
  console.log(`✅  E2E FLOW COMPLETE  |  Passed: ${pass}  |  Failed: ${fail}  `);
  console.log('======================================================\n');
}

run().catch(err => console.error('E2E Test Error:', err.message));
