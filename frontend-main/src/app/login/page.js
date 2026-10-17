'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn, getUserRole, isOnboardingComplete } from '../../utils/api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [focusedField, setFocusedField] = useState('');
  const [btnHover, setBtnHover] = useState(false);
  const [linkHover, setLinkHover] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      if (!isOnboardingComplete()) {
        router.push(`/onboarding${refCode ? `?ref=${encodeURIComponent(refCode)}` : ''}`);
      } else {
        const role = getUserRole();
        if (role === 'trader') router.push('/trader/dashboard');
        if (role === 'retailer') router.push('/retailer/dashboard');
      }
    }
  }, [router, refCode]);

  const saveSession = (data) => {
    localStorage.setItem('pware_token', data.token);
    localStorage.setItem('pware_role', data.user.role);
    localStorage.setItem('pware_status', data.user.status);
    localStorage.setItem('pware_email', data.user.email);
    localStorage.setItem('pware_onboarding_complete', data.user.onboardingComplete ? 'true' : 'false');
  };

  const redirect = (data) => {
    if (!data.user.onboardingComplete) {
      router.push(`/onboarding${refCode ? `?ref=${encodeURIComponent(refCode)}` : ''}`);
    } else {
      if (data.user.role === 'trader') router.push('/trader/dashboard');
      if (data.user.role === 'retailer') router.push('/retailer/dashboard');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        saveSession(data);
        redirect(data);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('Could not reach the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (fieldName) => ({
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: focusedField === fieldName ? '1px solid #2563eb' : '1px solid #e2e8f0',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: focusedField === fieldName ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
    transition: 'all 0.2s ease',
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 70px)',
        backgroundColor: '#f8fafc',
        padding: '30px 20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px 28px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#2563eb',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: '700',
              margin: '0 auto 14px',
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
            }}
          >
            P
          </div>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '6px',
            }}
          >
            Partner Sign In
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
            Enter your email or mobile number to continue
          </p>

          {refCode && (
            <div
              style={{
                marginTop: '12px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>Referral Code: <strong>{refCode}</strong></span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              lineHeight: '1.4',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email or Phone */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '700',
                color: '#64748b',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Email Address or Mobile Number
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onFocus={() => setFocusedField('identifier')}
              onBlur={() => setFocusedField('')}
              placeholder="e.g. rajesh@company.com or 9876543210"
              required
              autoComplete="username"
              style={getInputStyle('identifier')}
            />
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '700',
                color: '#64748b',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                style={{
                  ...getInputStyle('password'),
                  paddingRight: '48px',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '4px',
                }}
              >
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              backgroundColor: btnHover && !loading ? '#1d4ed8' : '#2563eb',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '600',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.75 : 1,
              marginTop: '4px',
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flexGrow: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', whiteSpace: 'nowrap' }}>
            New to P-Ware?
          </span>
          <div style={{ flexGrow: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
        </div>

        {/* Register Link */}
        <Link
          href={`/register${refCode ? `?ref=${encodeURIComponent(refCode)}` : ''}`}
          onMouseEnter={() => setLinkHover(true)}
          onMouseLeave={() => setLinkHover(false)}
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '12px',
            borderRadius: '10px',
            border: '1.5px solid #2563eb',
            backgroundColor: linkHover ? '#eff6ff' : '#ffffff',
            color: '#2563eb',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
          }}
        >
          Create a New Account
        </Link>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
          By signing in, you agree to P-Ware distributor networking policy.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
