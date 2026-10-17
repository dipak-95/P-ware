'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, isLoggedIn, getUserRole, getUserStatus } from '../../../utils/api';

export default function TraderDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tab State
  const [activeTab, setActiveTab] = useState('quotes');

  const fetchData = async () => {
    try {
      const meRes = await apiFetch('/auth/me');
      setProfile(meRes.profile);

      // Fetch quotations
      const quoteRes = await apiFetch('/quotations/trader');
      setQuotations(quoteRes.data);

      // Fetch mapped retailers count/list
      const retailerRes = await apiFetch('/auth/retailers');
      setRetailers(retailerRes.data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve trader dashboard details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn() || getUserRole() !== 'trader') {
      router.push('/login');
      return;
    }
    
    // Check if approved
    const status = getUserStatus();
    if (status !== 'approved') {
      setLoading(false);
      return;
    }

    fetchData();
  }, [router]);

  const handleDownloadPDF = async (quoteId, filename) => {
    try {
      const token = localStorage.getItem('pware_token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/quotations/${quoteId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert(err.message || 'Failed to stream PDF');
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const status = getUserStatus();

  if (status !== 'approved') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <main className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div
            className="glass-card"
            style={{
              maxWidth: '500px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
              padding: '32px 24px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-pending)',
                fontSize: '24px',
                margin: '0 auto',
              }}
            >
              !
            </div>
            <h2 style={{ fontSize: '22px', color: '#0f172a' }}>Account Pending Approval</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
              Your Authorized Trader account is registered and waiting for Manufacturer approval. We will notify you once your Trader Code is generated.
            </p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Status: <strong style={{ color: '#0f172a' }}>{status}</strong>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <main className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading trader dashboard...</p>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <main className="container" style={{ padding: '40px 20px' }}>
        <div className="page-header" style={{ marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>Trader Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>
              Manage your retailer network and download quote pricing sheets
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '16px',
              borderRadius: '12px',
              color: 'var(--status-suspended)',
              marginBottom: '30px',
            }}
          >
            {error}
          </div>
        )}

        {/* Trader Referral Panel */}
        <div className="grid-2" style={{ gridTemplateColumns: '1.5fr 1fr', marginBottom: '30px' }}>
          <div
            className="glass-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h3 style={{ fontSize: '18px', color: '#0f172a' }}>Referral Link & Code</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Share your unique referral link with retailers. When they register through this link, they will be automatically mapped to your distributor network.
            </p>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                readOnly
                value={profile?.referralLink || ''}
                className="form-input"
                style={{
                  flexGrow: 1,
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  background: '#f8fafc',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                }}
              />
              <button
                onClick={() => handleCopy(profile?.referralLink, 'Referral Link')}
                className="btn btn-secondary"
                style={{ padding: '10px 16px', flexShrink: 0 }}
              >
                Copy Link
              </button>
            </div>
          </div>

          <div
            className="glass-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
            }}
          >
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Your Trader Code
            </span>
            <span
              style={{
                fontSize: '32px',
                fontWeight: '800',
                color: 'var(--accent-cyan)',
                fontFamily: 'var(--font-heading)',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid var(--border-glow)',
                padding: '4px 20px',
                borderRadius: '10px',
              }}
            >
              {profile?.traderCode || 'TRD-XXXX'}
            </span>
            <button
              onClick={() => handleCopy(profile?.traderCode, 'Trader Code')}
              className="btn btn-secondary"
              style={{ padding: '5px 12px', fontSize: '11px', marginTop: '5px' }}
            >
              Copy Code
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`btn ${activeTab === 'quotes' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Quotations List ({quotations.length})
          </button>
          <button
            onClick={() => setActiveTab('retailers')}
            className={`btn ${activeTab === 'retailers' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            My Retailer Network ({retailers.length})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'quotes' ? (
          <div
            className="glass-card"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '15px' }}>Generated Quotations</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ color: 'var(--text-secondary)' }}>Quotation No.</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Inquiry No.</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Subtotal</th>
                    <th style={{ color: 'var(--text-secondary)' }}>GST (18%)</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Grand Total</th>
                    <th style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                        No quotations have been compiled by the admin yet.
                      </td>
                    </tr>
                  ) : (
                    quotations.map((quote) => (
                      <tr key={quote._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ fontWeight: 'bold', color: '#0f172a' }}>{quote.quotationNumber}</td>
                        <td style={{ color: '#334155' }}>#{quote.inquiryId?.inquiryNumber}</td>
                        <td style={{ color: '#334155' }}>Rs. {quote.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style={{ color: '#334155' }}>Rs. {quote.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style={{ fontWeight: '600', color: 'var(--accent-cyan)' }}>
                          Rs. {quote.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleDownloadPDF(quote._id, quote.quotationNumber)}
                            className="btn btn-primary"
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                          >
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div
            className="glass-card"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '15px' }}>My Connected Retailers</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ color: 'var(--text-secondary)' }}>Retailer Company</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Owner Name</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Contact Email</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Phone Number</th>
                  </tr>
                </thead>
                <tbody>
                  {retailers.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                        No retailers have registered under your referral code yet.
                      </td>
                    </tr>
                  ) : (
                    retailers.map((retailer) => (
                      <tr key={retailer._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ color: '#334155' }}>
                          <strong style={{ color: '#0f172a' }}>{retailer.companyName}</strong>
                        </td>
                        <td style={{ color: '#334155' }}>{retailer.ownerName}</td>
                        <td style={{ color: '#334155' }}>{retailer.userId?.email}</td>
                        <td style={{ color: '#334155' }}>{retailer.userId?.phone || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
