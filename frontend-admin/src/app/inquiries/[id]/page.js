'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import { apiFetch, isAdminLoggedIn } from '../../../utils/api';

export default function InquiryDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rates, setRates] = useState({}); // { [productId]: rate }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/');
      return;
    }

    const fetchInquiry = async () => {
      try {
        const response = await apiFetch(`/inquiries/admin/${params.id}`);
        setInquiry(response.data);
        
        // Initialize rates state
        const initialRates = {};
        response.data.items.forEach((item) => {
          initialRates[item.productId._id] = 0;
        });
        setRates(initialRates);
      } catch (err) {
        setError(err.message || 'Failed to fetch inquiry details');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [router, params.id]);

  const handleRateChange = (productId, val) => {
    const rateVal = parseFloat(val);
    setRates({
      ...rates,
      [productId]: isNaN(rateVal) ? 0 : rateVal,
    });
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!inquiry) return { subtotal: 0, gst: 0, total: 0 };
    
    let subtotal = 0;
    inquiry.items.forEach((item) => {
      const rate = rates[item.productId._id] || 0;
      subtotal += rate * item.quantity;
    });

    const gst = subtotal * 0.18; // 18% GST
    const total = subtotal + gst;

    return { subtotal, gst, total };
  };

  const { subtotal, gst, total } = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Format rates array
    const ratesArray = Object.keys(rates).map((productId) => ({
      productId,
      rate: rates[productId],
    }));

    // Verify all rates are positive
    const hasInvalidRate = ratesArray.some((r) => r.rate <= 0);
    if (hasInvalidRate) {
      alert('Please fill in positive rates for all products before generating quotation!');
      setSubmitting(false);
      return;
    }

    try {
      await apiFetch('/quotations/admin/create', {
        method: 'POST',
        body: JSON.stringify({
          inquiryId: params.id,
          rates: ratesArray,
        }),
      });

      alert('Quotation and PDF generated successfully!');
      router.push('/inquiries');
    } catch (err) {
      alert(err.message || 'Failed to create quotation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading inquiry details...</p>
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
            <h1 className="page-title">Quotation Builder</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Add product pricing for Inquiry #{inquiry?.inquiryNumber} to compile final quotation PDF
            </p>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', color: 'var(--status-suspended)', marginBottom: '30px' }}>
            {error}
          </div>
        )}

        <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
          {/* Main Pricing Form */}
          <div className="glass-card">
            <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '15px' }}>Requested Products</h3>
            <form onSubmit={handleSubmit}>
              <div className="table-container" style={{ marginTop: '0', marginBottom: '20px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Product Info</th>
                      <th>Quantity</th>
                      <th style={{ width: '180px' }}>Unit Price (Rs.)</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiry?.items.map((item) => {
                      const currentRate = rates[item.productId._id] || 0;
                      const itemTotal = currentRate * item.quantity;
                      return (
                        <tr key={item._id}>
                          <td>
                            <strong style={{ color: 'white' }}>{item.productId.name}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              Code: {item.productId.code}
                            </div>
                          </td>
                          <td style={{ fontWeight: '600' }}>{item.quantity}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              step="0.01"
                              value={rates[item.productId._id] || ''}
                              onChange={(e) => handleRateChange(item.productId._id, e.target.value)}
                              className="form-input"
                              placeholder="Enter Price"
                              style={{ padding: '8px 12px' }}
                              required
                            />
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '600', color: 'white' }}>
                            Rs. {itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => router.push('/inquiries')}
                  className="btn btn-secondary"
                >
                  Back to Queue
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px' }}
                >
                  {submitting ? 'Generating PDF...' : 'Compile & Send PDF'}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Metadata & Calculations panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Calculation Overview */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', color: 'white', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                Quotation Summary
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>Subtotal:</span>
                <span style={{ color: 'white' }}>Rs. {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>GST (18%):</span>
                <span style={{ color: 'white' }}>Rs. {gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: 'white',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '10px',
                  marginTop: '5px',
                }}
              >
                <span>Grand Total:</span>
                <span style={{ color: 'var(--accent-cyan)' }}>
                  Rs. {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Trader Context (Privacy Check) */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', color: 'white', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                Trader Channel
              </h3>
              {inquiry?.trader ? (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    <strong>Company:</strong> {inquiry.trader.companyName}
                  </div>
                  <div>
                    <strong>Trader Code:</strong> {inquiry.trader.traderCode}
                  </div>
                  <div>
                    <strong>GSTIN:</strong> {inquiry.trader.gstNumber}
                  </div>
                  <div style={{ marginTop: '10px', padding: '10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--status-approved)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                    <svg style={{ width: '16px', height: '16px', flexShrink: '0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Retailer Info is Hidden
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No trader info mapped.</span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
