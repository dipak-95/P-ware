'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn } from '../utils/api';

// Fixed admin credentials (frontend-only check; backend JWT is the real guard)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'pware@2024';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdminLoggedIn()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Credential check
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      setError('Invalid username or password.');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: 'mock_admin_google_token',
          email: 'admin@pware.com',
          name: 'P-Ware Administrator',
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        localStorage.setItem('pware_admin_token', data.token);
        localStorage.setItem('pware_admin_role', data.user.role);
        localStorage.setItem('pware_admin_email', data.user.email);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Server authentication failed.');
      }
    } catch (err) {
      setError('Could not connect to the API server. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="glass-card login-card" style={{ textAlign: 'center' }}>

        {/* Brand */}
        <div style={{ marginBottom: '8px' }}>
          <div
            className="logo-icon"
            style={{ width: '52px', height: '52px', margin: '0 auto 16px', fontSize: '26px', fontWeight: '900' }}
          >
            P
          </div>
          <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>P-Ware Admin Portal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Manufacturer Control Console
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--status-suspended)',
              padding: '11px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
          
          {/* Username */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              required
              autoComplete="username"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-light)',
                background: 'rgba(15, 23, 42, 0.6)',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  padding: 0,
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '15px', marginTop: '4px' }}
          >
            {loading ? 'Signing In...' : 'Sign In to Admin Panel'}
          </button>
        </form>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '14px', marginTop: '4px' }}>
          Morbi Sanitary Products Manufacturing — Restricted Access
        </div>
      </div>
    </div>
  );
}
