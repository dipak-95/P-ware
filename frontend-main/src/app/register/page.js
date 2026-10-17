'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn } from '../../utils/api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [hoverSubmit, setHoverSubmit] = useState(false);
  const [hoverSignIn, setHoverSignIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      router.push('/');
    }
  }, [router]);

  const isMismatch = confirm.length > 0 && confirm !== password;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        localStorage.setItem('pware_token', data.token);
        localStorage.setItem('pware_role', data.user.role);
        localStorage.setItem('pware_status', data.user.status);
        localStorage.setItem('pware_email', data.user.email);
        localStorage.setItem('pware_onboarding_complete', 'false');

        // Redirect to onboarding (with ?ref=X if exists)
        router.push(`/onboarding${refCode ? `?ref=${encodeURIComponent(refCode)}` : ''}`);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Could not reach the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (fieldName, hasError = false) => ({
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: `1px solid ${hasError ? '#ef4444' : focusedField === fieldName ? '#2563eb' : '#e2e8f0'}`,
    background: '#f1f5f9',
    color: '#0f172a',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    boxShadow:
      focusedField === fieldName && !hasError
        ? '0 0 0 3px rgba(37, 99, 235, 0.12)'
        : 'none',
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '32px 16px',
        color: '#0f172a',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 0 0 1px #e2e8f0',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              borderRadius: '12px',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: '800',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            P
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            Create New Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
            Register to access the P-Ware B2B partner network
          </p>

          {/* Referral Banner */}
          {refCode && (
            <div
              style={{
                marginTop: '14px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              Trader Referral Code: <strong>{refCode}</strong> — will be auto-linked
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '11px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              lineHeight: '1.4',
            }}
          >
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Full Name */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. Rajesh Patel"
              required
              style={getInputStyle('name')}
            />
          </div>

          {/* Email Address */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Email Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. rajesh@company.com"
              required
              autoComplete="email"
              style={getInputStyle('email')}
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Mobile Number <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. 9876543210"
              style={getInputStyle('phone')}
            />
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
                style={{
                  ...getInputStyle('password'),
                  paddingRight: '54px',
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

          {/* Confirm Password */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Confirm Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
              style={getInputStyle('confirm', isMismatch)}
            />
            {isMismatch && (
              <span
                style={{
                  fontSize: '12px',
                  color: '#ef4444',
                  marginTop: '4px',
                  display: 'block',
                  fontWeight: '500',
                }}
              >
                Passwords do not match
              </span>
            )}
          </div>

          {/* Info note */}
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '11px 14px',
              fontSize: '12px',
              color: '#1e40af',
              lineHeight: '1.5',
            }}
          >
            After registration you will complete your partner profile (company details, role selection, etc.) in the next step.
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading || isMismatch}
            onMouseEnter={() => setHoverSubmit(true)}
            onMouseLeave={() => setHoverSubmit(false)}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              backgroundColor: hoverSubmit && !loading && !isMismatch ? '#1d4ed8' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              cursor: loading || isMismatch ? 'not-allowed' : 'pointer',
              opacity: loading || isMismatch ? 0.7 : 1,
              transition: 'background-color 0.15s ease, opacity 0.15s ease',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              marginTop: '4px',
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flexGrow: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
            Already have an account?
          </span>
          <div style={{ flexGrow: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        {/* Sign In Link */}
        <Link
          href={`/login${refCode ? `?ref=${encodeURIComponent(refCode)}` : ''}`}
          onMouseEnter={() => setHoverSignIn(true)}
          onMouseLeave={() => setHoverSignIn(false)}
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '12px',
            borderRadius: '10px',
            border: `1px solid ${hoverSignIn ? '#cbd5e1' : '#e2e8f0'}`,
            background: hoverSignIn ? '#f8fafc' : '#ffffff',
            color: '#0f172a',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          Sign In to Existing Account
        </Link>

        {/* Policy Notice */}
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
          By registering, you agree to P-Ware distributor networking policy.
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
