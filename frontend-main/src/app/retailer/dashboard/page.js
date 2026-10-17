'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, isLoggedIn, getUserRole } from '../../../utils/api';

export default function RetailerDashboardPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [traderInfo, setTraderInfo] = useState(null);

  useEffect(() => {
    if (!isLoggedIn() || getUserRole() !== 'retailer') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const inqRes = await apiFetch('/inquiries/retailer');
        setInquiries(inqRes.data);

        const meRes = await apiFetch('/auth/me');
        setTraderInfo(meRes.profile?.mappedTraderId);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <main className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading retailer dashboard...</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '40px 20px' }}>
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>Retailer Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Track inquiry statuses. Mapped distributor: <strong style={{ color: '#0f172a' }}>{traderInfo?.companyName || 'Trader'} ({traderInfo?.traderCode || 'TRD-XXXX'})</strong>
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '12px', color: '#dc2626', marginBottom: '30px' }}>
          {error}
        </div>
      )}

      <div className="glass-card">
        <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px' }}>My Quotation Enquiries</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Inquiry No.</th>
                <th>Requested Date</th>
                <th>Product Items List</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    You have not placed any inquiry requests yet.
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr key={inquiry._id}>
                    <td style={{ fontWeight: 'bold', color: '#0f172a' }}>#{inquiry.inquiryNumber}</td>
                    <td>{new Date(inquiry.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                        {inquiry.items.map((item, idx) => (
                          <div key={idx}>
                            {item.productId?.name} (Qty: {item.quantity})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${inquiry.status === 'pending' ? 'badge-pending' : 'badge-approved'}`}>
                        {inquiry.status === 'pending' ? 'Pending pricing' : 'Quotation Generated'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {inquiry.status === 'quotation_generated' ? (
                        <span style={{ fontSize: '12px', color: '#10b981', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Prices sent to Trader
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                          Awaiting Admin rates
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
