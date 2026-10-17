'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import { apiFetch, isAdminLoggedIn } from '../../utils/api';

export default function InquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/');
      return;
    }

    const fetchInquiries = async () => {
      try {
        const response = await apiFetch('/inquiries/admin');
        setInquiries(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch inquiries queue');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading inquiries queue...</p>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />

      <main className="main-content" style={{ flexGrow: 1 }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Inquiries Queue</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              View incoming quotation requests from the trader-retailer network
            </p>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', color: 'var(--status-suspended)', marginBottom: '30px' }}>
            {error}
          </div>
        )}

        <div className="glass-card">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Inquiry No.</th>
                  <th>Date</th>
                  <th>Source Channel</th>
                  <th>Associated Trader</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      No inquiries currently pending or generated.
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inquiry) => (
                    <tr key={inquiry.id}>
                      <td style={{ fontWeight: 'bold', color: 'white' }}>#{inquiry.inquiryNumber}</td>
                      <td>{new Date(inquiry.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', padding: '3px 8px', borderRadius: '4px' }}>
                          {inquiry.source}
                        </span>
                      </td>
                      <td>
                        {inquiry.trader ? (
                          <div>
                            <strong style={{ display: 'block', color: 'white', fontSize: '14px' }}>
                              {inquiry.trader.companyName}
                            </strong>
                            <span style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
                              Code: {inquiry.trader.traderCode}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Unmapped Trader</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${inquiry.status === 'pending' ? 'badge-pending' : 'badge-approved'}`}>
                          {inquiry.status === 'pending' ? 'Pending Price' : 'Quotation Generated'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {inquiry.status === 'pending' ? (
                          <Link
                            href={`/inquiries/${inquiry.id}`}
                            className="btn btn-primary"
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                          >
                            Build Quote
                          </Link>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            Completed
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
    </div>
  );
}
