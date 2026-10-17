'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { apiFetch, isAdminLoggedIn } from '../../utils/api';

export default function RetailersPage() {
  const router = useRouter();
  const [network, setNetwork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTraderId, setExpandedTraderId] = useState(null);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/');
      return;
    }

    const fetchNetwork = async () => {
      try {
        const response = await apiFetch('/admin/retailers-network');
        setNetwork(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch retailer network');
      } finally {
        setLoading(false);
      }
    };

    fetchNetwork();
  }, [router]);

  const toggleExpand = (traderId) => {
    if (expandedTraderId === traderId) {
      setExpandedTraderId(null);
    } else {
      setExpandedTraderId(traderId);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading retailer network database...</p>
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
            <h1 className="page-title">Retailer Network Mapping</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Hierarchical view of Retailers mapped under each Authorized Trader
            </p>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', color: 'var(--status-suspended)', marginBottom: '30px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {network.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
              No traders or mapped retailers found in the network.
            </div>
          ) : (
            network.map((node) => (
              <div key={node.trader.id} className="glass-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleExpand(node.trader.id)}
                >
                  <div>
                    <h3 style={{ fontSize: '18px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {node.trader.companyName}
                      <span
                        style={{
                          fontSize: '11px',
                          background: 'rgba(6, 182, 212, 0.1)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          color: 'var(--accent-cyan)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {node.trader.traderCode || 'No Code'}
                      </span>
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Email: {node.trader.email} | Phone: {node.trader.phone || 'N/A'}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--accent-cyan)' }}>
                      {node.retailersCount} Retailers
                    </span>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                    >
                      {expandedTraderId === node.trader.id ? 'Hide List' : 'View Network'}
                    </button>
                  </div>
                </div>

                {expandedTraderId === node.trader.id && (
                  <div
                    style={{
                      marginTop: '20px',
                      paddingTop: '20px',
                      borderTop: '1px solid var(--border-light)',
                    }}
                  >
                    {node.retailers.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        No retailers have registered under this trader yet.
                      </p>
                    ) : (
                      <table className="custom-table" style={{ marginTop: '0' }}>
                        <thead>
                          <tr>
                            <th>Retailer Company</th>
                            <th>Owner Name</th>
                            <th>Contact Email</th>
                            <th>Phone Number</th>
                          </tr>
                        </thead>
                        <tbody>
                          {node.retailers.map((retailer) => (
                            <tr key={retailer.id}>
                              <td>
                                <strong style={{ color: 'white' }}>{retailer.companyName}</strong>
                              </td>
                              <td>{retailer.ownerName}</td>
                              <td>{retailer.email}</td>
                              <td>{retailer.phone || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
