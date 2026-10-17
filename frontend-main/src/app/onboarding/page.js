'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch, isLoggedIn, isOnboardingComplete } from '../../utils/api';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [role, setRole] = useState('retailer');
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [mappedTraderCode, setMappedTraderCode] = useState(refCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    if (isOnboardingComplete()) {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (refCode && !mappedTraderCode) {
      setMappedTraderCode(refCode);
    }
  }, [refCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      role,
      companyName: companyName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      ...(role === 'trader'
        ? { gstNumber: gstNumber.trim() }
        : { mappedTraderCode: mappedTraderCode.trim() }),
    };

    try {
      const data = await apiFetch('/auth/onboarding', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (data.status === 'success') {
        localStorage.setItem('pware_token', data.token);
        localStorage.setItem('pware_role', data.user.role);
        localStorage.setItem('pware_status', data.user.status);
        if (data.user.email) {
          localStorage.setItem('pware_email', data.user.email);
        }
        localStorage.setItem('pware_onboarding_complete', 'true');

        if (data.user.role === 'trader') {
          router.push('/trader/dashboard');
        } else if (data.user.role === 'retailer') {
          router.push('/retailer/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setError(data.message || 'Onboarding update failed');
      }
    } catch (err) {
      setError(err.message || 'Server error during onboarding submission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page-wrap">
      <style>{`
        .onboarding-page-wrap {
          background-color: #f8fafc;
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          box-sizing: border-box;
        }
        .onboarding-card {
          background-color: #ffffff;
          max-width: 600px;
          width: 100%;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
          padding: 32px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .onboarding-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 6px;
          letter-spacing: -0.02em;
        }
        .onboarding-subtitle {
          color: #475569;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }
        .onboarding-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 6px;
        }
        .onboarding-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background-color: #f1f5f9;
          color: #0f172a;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
        }
        .onboarding-input::placeholder {
          color: #94a3b8;
        }
        .onboarding-input:focus {
          border-color: #2563eb;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .onboarding-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .onboarding-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .onboarding-roles-wrap {
          display: flex;
          gap: 12px;
        }
        .onboarding-radio-card {
          flex: 1;
          padding: 14px 16px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .onboarding-btn {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          background-color: #2563eb;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
          margin-top: 6px;
        }
        .onboarding-btn:hover:not(:disabled) {
          background-color: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
        }
        .onboarding-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        @media (max-width: 640px) {
          .onboarding-card {
            padding: 24px 18px;
          }
          .onboarding-grid-2 {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .onboarding-grid-3 {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .onboarding-roles-wrap {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="onboarding-card">
        {/* Header */}
        <div>
          <h2 className="onboarding-title">Complete Partner Profile</h2>
          <p className="onboarding-subtitle">
            Please fill in your company and contact information to access the B2B portal.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              lineHeight: '1.5',
            }}
          >
            {error}
          </div>
        )}

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 1. Role Selector */}
          <div>
            <label className="onboarding-label">Are you registering as a Trader or Retailer?</label>
            <div className="onboarding-roles-wrap">
              {/* Retailer Card */}
              <label
                className="onboarding-radio-card"
                style={{
                  backgroundColor: role === 'retailer' ? '#eff6ff' : '#ffffff',
                  border: role === 'retailer' ? '2px solid #2563eb' : '2px solid #e2e8f0',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="retailer"
                  checked={role === 'retailer'}
                  onChange={() => setRole('retailer')}
                  style={{ accentColor: '#2563eb', marginTop: '2px', cursor: 'pointer' }}
                />
                <div>
                  <strong style={{ display: 'block', color: '#0f172a', fontSize: '14px', marginBottom: '2px' }}>
                    Retailer
                  </strong>
                  <span style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                    Local shop owner requesting inquiries
                  </span>
                </div>
              </label>

              {/* Authorized Trader Card */}
              <label
                className="onboarding-radio-card"
                style={{
                  backgroundColor: role === 'trader' ? '#eff6ff' : '#ffffff',
                  border: role === 'trader' ? '2px solid #2563eb' : '2px solid #e2e8f0',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="trader"
                  checked={role === 'trader'}
                  onChange={() => setRole('trader')}
                  style={{ accentColor: '#2563eb', marginTop: '2px', cursor: 'pointer' }}
                />
                <div>
                  <strong style={{ display: 'block', color: '#0f172a', fontSize: '14px', marginBottom: '2px' }}>
                    Authorized Trader
                  </strong>
                  <span style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                    Distributor / dealer managing network
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Company / Shop Name & Owner Name (2-col grid) */}
          <div className="onboarding-grid-2">
            <div>
              <label className="onboarding-label">Company / Shop Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Morbi Ceramic Studio"
                className="onboarding-input"
                required
              />
            </div>
            <div>
              <label className="onboarding-label">Owner Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Dipak Patel"
                className="onboarding-input"
                required
              />
            </div>
          </div>

          {/* 3. Contact Phone Number */}
          <div>
            <label className="onboarding-label">Contact Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
              className="onboarding-input"
              required
            />
          </div>

          {/* 4. Organization Address block */}
          <div
            style={{
              padding: '16px',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
            }}
          >
            <span
              style={{
                display: 'block',
                marginBottom: '12px',
                fontWeight: '700',
                fontSize: '13px',
                color: '#0f172a',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Organization Address
            </span>

            {/* Street Address */}
            <div style={{ marginBottom: '12px' }}>
              <label className="onboarding-label" style={{ fontSize: '12px' }}>
                Street Address
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Shop No. & street name"
                className="onboarding-input"
                required
              />
            </div>

            {/* City / State / Pincode (3-col grid) */}
            <div className="onboarding-grid-3">
              <div>
                <label className="onboarding-label" style={{ fontSize: '12px' }}>
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Morbi"
                  className="onboarding-input"
                  required
                />
              </div>
              <div>
                <label className="onboarding-label" style={{ fontSize: '12px' }}>
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Gujarat"
                  className="onboarding-input"
                  required
                />
              </div>
              <div>
                <label className="onboarding-label" style={{ fontSize: '12px' }}>
                  Pincode
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="363641"
                  className="onboarding-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* 5. Role conditional field: GST Number (Trader) */}
          {role === 'trader' && (
            <div>
              <label className="onboarding-label">GST Number (15-character ID)</label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 24AAAAP1234A1Z1"
                className="onboarding-input"
                style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}
                required
              />
            </div>
          )}

          {/* 6. Role conditional field: Trader Referral Code (Retailer) */}
          {role === 'retailer' && (
            <div>
              <label className="onboarding-label">Trader Referral Code</label>
              <input
                type="text"
                value={mappedTraderCode}
                onChange={(e) => setMappedTraderCode(e.target.value.toUpperCase())}
                placeholder="e.g. TRD-1001"
                className="onboarding-input"
                style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}
                required
              />
              <span style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', display: 'block' }}>
                Retailers must be mapped to an authorized distributor trader. Enter Trader Code.
              </span>
            </div>
          )}

          {/* 7. Submit button */}
          <button type="submit" disabled={loading} className="onboarding-btn">
            {loading ? 'Saving Profile...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: 'calc(100vh - 70px)',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: '14px',
          }}
        >
          Loading onboarding...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
