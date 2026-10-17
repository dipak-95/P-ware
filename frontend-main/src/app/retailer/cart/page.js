'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../../context/CartContext';
import { apiFetch, isLoggedIn, getUserRole } from '../../../utils/api';

export default function CartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn() || getUserRole() !== 'retailer') {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await apiFetch('/auth/me');
        setProfile(response.profile);
      } catch (err) {
        setError('Failed to fetch trader mapping details');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSubmitInquiry = async () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);

    const itemsPayload = cartItems.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
    }));

    try {
      await apiFetch('/inquiries/create', {
        method: 'POST',
        body: JSON.stringify({
          items: itemsPayload,
        }),
      });

      alert('Inquiry submitted successfully! Mapped to your distributor trader.');
      clearCart();
      router.push('/retailer/dashboard');
    } catch (err) {
      alert(err.message || 'Failed to submit inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading inquiry cart details...</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '40px 20px' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>Inquiry Cart</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Review requested products and quantities before submitting to your trader distributor
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '12px', color: '#dc2626', marginBottom: '30px' }}>
          {error}
        </div>
      )}

      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
        {/* Cart List */}
        <div className="glass-card">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: '#64748b', marginBottom: '20px' }}>Your inquiry cart is empty.</p>
              <Link href="/products" className="btn btn-primary">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="table-container" style={{ marginTop: '0' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Model Code</th>
                    <th style={{ width: '150px' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.product._id}>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{item.product.name}</strong>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#475569' }}>{item.product.code}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '14px', fontWeight: '700', minWidth: '32px' }}
                          >
                            −
                          </button>
                          <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 'bold', color: '#0f172a' }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '14px', fontWeight: '700', minWidth: '32px' }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          style={{
                            padding: '6px 14px', fontSize: '12px', fontWeight: '600',
                            background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                            borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Distributor Info & Submit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ fontSize: '16px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', fontWeight: '700' }}>
              Mapped Distributor
            </h3>

            {profile?.mappedTraderId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569' }}>
                <div>
                  <strong>Trader Email:</strong> {profile.mappedTraderId.email}
                </div>
                <div>
                  <strong>Status:</strong> Approved & Connected
                </div>
                <div style={{ marginTop: '10px', padding: '10px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                  <svg style={{ width: '16px', height: '16px', flexShrink: '0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Quotation will route via Trader
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Loading trader mapping details...</p>
            )}

            <button
              onClick={handleSubmitInquiry}
              disabled={cartItems.length === 0 || submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            >
              {submitting ? 'Submitting...' : 'Request Quotation'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
