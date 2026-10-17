'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { apiFetch, isAdminLoggedIn } from '../../utils/api';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await apiFetch('/admin/dashboard-stats');
        setStats(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard metrics...</p>
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
            <h1 className="page-title">Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Welcome back to P-Ware B2B Sanitaryware Console
            </p>
          </div>
          <div style={{ fontSize: '13px', background: 'var(--border-light)', padding: '8px 16px', borderRadius: '8px', color: 'var(--text-secondary)' }}>
            System Role: <strong>Manufacturer (Admin)</strong>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', color: 'var(--status-suspended)', marginBottom: '30px' }}>
            {error}
          </div>
        )}

        <div className="stats-grid">
          <div className="glass-card stat-card">
            <span className="stat-label">Total Products</span>
            <span className="stat-value">{stats?.totalProducts || 0}</span>
            <span className="stat-change up">Active in Catalog</span>
          </div>

          <div className="glass-card stat-card">
            <span className="stat-label">Total Categories</span>
            <span className="stat-value">{stats?.totalCategories || 0}</span>
            <span className="stat-change up">Classified Segments</span>
          </div>

          <div className="glass-card stat-card">
            <span className="stat-label">Authorized Traders</span>
            <span className="stat-value">{stats?.totalTraders || 0}</span>
            <span className="stat-change up">Dealers Network</span>
          </div>

          <div className="glass-card stat-card">
            <span className="stat-label">Connected Retailers</span>
            <span className="stat-value">{stats?.totalRetailers || 0}</span>
            <span className="stat-change up">Shop Owners Pool</span>
          </div>
        </div>

        <div className="grid-2">
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              Quotation Inquiries
            </h3>
            <div style={{ display: 'flex', gap: '40px', padding: '10px 0' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Total Enquiries</span>
                <span style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>{stats?.totalInquiries || 0}</span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Pending Quotes</span>
                <span style={{ fontSize: '28px', fontWeight: '700', color: 'var(--status-pending)' }}>{stats?.pendingInquiries || 0}</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              New quotation requests received from mapped retailers under authorized traders require adding product unit rates.
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justify: 'center', gap: '15px' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              System Integrity Overview
            </h3>
            <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', background: 'var(--accent-cyan)', borderRadius: '50%' }}></span>
                Private Quotation PDFs are restricted strictly from Retailer access.
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', background: 'var(--accent-cyan)', borderRadius: '50%' }}></span>
                Retailer contact information is hidden in the inquiry pipeline.
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', background: 'var(--accent-cyan)', borderRadius: '50%' }}></span>
                Admin portal runs isolated under the admin domain namespace.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
