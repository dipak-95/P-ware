'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { apiFetch, isAdminLoggedIn } from '../../utils/api';

export default function TradersPage() {
  const router = useRouter();
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTraders = async () => {
    try {
      const response = await apiFetch('/admin/traders');
      setTraders(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch trader requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/');
      return;
    }
    fetchTraders();
  }, [router]);

  const handleApprove = async (traderId) => {
    setActionLoading(true);
    try {
      await apiFetch(`/admin/traders/${traderId}/approve`, {
        method: 'PUT',
      });
      fetchTraders();
    } catch (err) {
      alert(err.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (traderId, status) => {
    setActionLoading(true);
    try {
      await apiFetch(`/admin/traders/${traderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      fetchTraders();
    } catch (err) {
      alert(err.message || 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading traders database...</p>
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
            <h1 className="page-title">Trader Approvals & Network</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Approve new dealers, suspend accounts, and view codes
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
                  <th>Company Info</th>
                  <th>GST Number</th>
                  <th>Contact Details</th>
                  <th>Trader Code</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {traders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      No traders found in the system database.
                    </td>
                  </tr>
                ) : (
                  traders.map((trader) => (
                    <tr key={trader._id}>
                      <td>
                        <strong style={{ display: 'block', color: 'white' }}>{trader.companyName}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Owner: {trader.ownerName}</span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{trader.gstNumber}</td>
                      <td>
                        <div style={{ fontSize: '13px' }}>{trader.userId?.email}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{trader.userId?.phone || 'No phone'}</div>
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--accent-cyan)' }}>
                        {trader.traderCode || 'Not Generated'}
                      </td>
                      <td>
                        <span className={`badge badge-${trader.userId?.status}`}>
                          {trader.userId?.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {trader.userId?.status === 'pending' && (
                            <button
                              onClick={() => handleApprove(trader.userId?._id)}
                              disabled={actionLoading}
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              Approve
                            </button>
                          )}
                          {trader.userId?.status === 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(trader.userId?._id, 'suspended')}
                              disabled={actionLoading}
                              className="btn btn-danger"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              Suspend
                            </button>
                          )}
                          {trader.userId?.status === 'suspended' && (
                            <button
                              onClick={() => handleStatusUpdate(trader.userId?._id, 'pending')}
                              disabled={actionLoading}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              Re-activate
                            </button>
                          )}
                        </div>
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
