'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch, isLoggedIn, getUserRole } from '../../utils/api';
import { useCart } from '../../context/CartContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const getImageSrc = (url) => {
  if (!url) return '';
  return url.startsWith('/') ? `${BACKEND_URL}${url}` : url;
};

export default function ProductsCatalogPage() {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  const fetchCatalog = async () => {
    try {
      const catRes = await apiFetch('/catalog/categories');
      setCategories(catRes.data);
      let url = `/catalog/products?limit=100`;
      if (selectedCat) url += `&categoryId=${selectedCat}`;
      if (selectedSub) url += `&subCategoryId=${selectedSub}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const prodRes = await apiFetch(url);
      setProducts(prodRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load catalog products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsAuth(isLoggedIn());
    setUserRole(getUserRole());
    fetchCatalog();
  }, [selectedCat, selectedSub, search]);

  const handleAddToCartClick = (product) => {
    addToCart(product, 1);
    setCartOpen(true); // auto-open sidebar when item added
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCat('');
    setSelectedSub('');
  };

  const mainCategories = categories.filter((c) => !c.parentCategoryId);
  const subCategories = categories.filter(
    (c) => c.parentCategoryId?._id === selectedCat || c.parentCategoryId === selectedCat
  );

  const selectedCatName = mainCategories.find((c) => c._id === selectedCat)?.name;
  const selectedSubName = subCategories.find((c) => c._id === selectedSub)?.name;
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const canAddToCart = isAuth && (userRole === 'retailer' || userRole === 'trader');

  return (
    <main style={{ background: '#f8fafc', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container" style={{ padding: '24px 20px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
          <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <span style={{ color: selectedCat ? '#2563eb' : '#475569', cursor: selectedCat ? 'pointer' : 'default' }}
            onClick={() => { if (selectedCat) { setSelectedCat(''); setSelectedSub(''); } }}>
            Products
          </span>
          {selectedCatName && (<><span>›</span><span style={{ color: selectedSub ? '#2563eb' : '#475569' }}>{selectedCatName}</span></>)}
          {selectedSubName && (<><span>›</span><span style={{ color: '#475569' }}>{selectedSubName}</span></>)}
        </div>

        {/* Results Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Product Catalog</h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Showing <strong>{products.length}</strong> products {selectedCatName ? `in ${selectedCatName}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or code..."
              style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#0f172a', fontSize: '13px', width: '220px', outline: 'none' }}
            />
            {/* Cart floating button — only for logged in trader/retailer */}
            {canAddToCart && (
              <button onClick={() => setCartOpen(true)}
                style={{
                  position: 'relative', padding: '9px 14px', borderRadius: '8px', border: '1px solid #e2e8f0',
                  background: cartCount > 0 ? '#2563eb' : 'white', color: cartCount > 0 ? 'white' : '#475569',
                  fontSize: '13px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'all 0.2s',
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Cart
                {cartCount > 0 && (
                  <span style={{ background: cartCount > 0 ? 'white' : '#2563eb', color: cartCount > 0 ? '#2563eb' : 'white', padding: '1px 7px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700' }}>
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => setShowFilters(!showFilters)} className="mobile-filter-btn"
              style={{ display: 'none', padding: '9px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
              {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '14px 18px', borderRadius: '10px', color: '#dc2626', marginBottom: '20px', fontSize: '14px' }}>{error}</div>
        )}

        {/* Catalog Layout */}
        <div className="catalog-layout">
          {/* Sidebar Filters */}
          <aside className={`filter-sidebar ${showFilters ? 'filter-sidebar-open' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Filters</h3>
              {(selectedCat || selectedSub) && (
                <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Clear All</button>
              )}
            </div>
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Categories</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div onClick={() => { setSelectedCat(''); setSelectedSub(''); }}
                  style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: !selectedCat ? '600' : '400', color: !selectedCat ? '#2563eb' : '#475569', background: !selectedCat ? '#eff6ff' : 'transparent', transition: 'all 0.15s' }}>
                  All Products
                </div>
                {mainCategories.map((cat) => (
                  <div key={cat._id}>
                    <div onClick={() => { setSelectedCat(cat._id); setSelectedSub(''); }}
                      style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: selectedCat === cat._id ? '600' : '400', color: selectedCat === cat._id ? '#2563eb' : '#475569', background: selectedCat === cat._id ? '#eff6ff' : 'transparent', transition: 'all 0.15s' }}>
                      {cat.name}
                    </div>
                    {selectedCat === cat._id && subCategories.length > 0 && (
                      <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        {subCategories.map((sub) => (
                          <div key={sub._id} onClick={() => setSelectedSub(sub._id === selectedSub ? '' : sub._id)}
                            style={{ padding: '6px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: selectedSub === sub._id ? '600' : '400', color: selectedSub === sub._id ? '#2563eb' : '#64748b', background: selectedSub === sub._id ? '#eff6ff' : 'transparent', transition: 'all 0.15s' }}>
                            {sub.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '12px', color: '#92400e', lineHeight: '1.5' }}>
              <strong>Note:</strong> Prices are not listed publicly. Sign in to request quotations.
            </div>
          </aside>

          {/* Product Grid */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}><p>Loading products...</p></div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b', fontSize: '16px' }}>No products found matching the criteria.</p>
                <button onClick={clearFilters} className="btn btn-primary" style={{ marginTop: '16px', padding: '10px 20px' }}>Clear Filters</button>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((product) => {
                  const specs = [];
                  if (product.specifications) {
                    Object.keys(product.specifications).forEach((k) => {
                      specs.push({ key: k, val: product.specifications[k] });
                    });
                  }
                  const inCart = cartItems.find((i) => i.product._id === product._id);
                  return (
                    <div key={product._id} className="product-card">
                      {product.images?.[0] ? (
                        <img src={getImageSrc(product.images[0])} alt={product.name} className="product-image" />
                      ) : (
                        <div className="product-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>No Image</div>
                      )}
                      <div className="product-info">
                        <div>
                          <span className="product-code">{product.code}</span>
                          <h4 className="product-title">{product.name}</h4>
                          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
                            {product.categoryId?.name}{product.subCategoryId?.name ? ` › ${product.subCategoryId.name}` : ''}
                          </p>
                        </div>
                        {specs.length > 0 && (
                          <div className="product-specs">
                            {specs.slice(0, 3).map((s, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                                <span style={{ color: '#94a3b8' }}>{s.key}</span>
                                <span style={{ color: '#475569', fontWeight: '500' }}>{s.val}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action — Trader & Retailer both get Add to Cart */}
                        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                          {!isAuth ? (
                            <Link href="/login" className="btn btn-secondary" style={{ width: '100%', fontSize: '12px', padding: '8px', justifyContent: 'center' }}>
                              Sign In to Inquire
                            </Link>
                          ) : canAddToCart ? (
                            inCart ? (
                              /* Already in cart — show qty controls */
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button onClick={() => updateQuantity(product._id, inCart.quantity - 1)}
                                    style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#0f172a', fontSize: '16px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    −
                                  </button>
                                  <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>{inCart.quantity}</span>
                                  <button onClick={() => updateQuantity(product._id, inCart.quantity + 1)}
                                    style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#0f172a', fontSize: '16px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    +
                                  </button>
                                </div>
                                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>✓ In Cart</span>
                              </div>
                            ) : (
                              <button onClick={() => handleAddToCartClick(product)} className="btn btn-primary" style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
                                + Add to Inquiry
                              </button>
                            )
                          ) : (
                            <span style={{ display: 'block', fontSize: '12px', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
                              Pricing via Quotation
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── SLIDING CART SIDEBAR ─── */}
      {/* Overlay */}
      {cartOpen && (
        <div onClick={() => setCartOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 998, transition: 'opacity 0.3s' }}
        />
      )}

      {/* Sidebar Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: '380px', maxWidth: '90vw',
        background: 'white', boxShadow: '-8px 0 30px rgba(0,0,0,0.12)', zIndex: 999,
        transform: cartOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Inquiry Cart</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{cartCount} item{cartCount !== 1 ? 's' : ''} added</p>
          </div>
          <button onClick={() => setCartOpen(false)}
            style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '18px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <p style={{ fontSize: '14px' }}>Your cart is empty</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Browse products and add items to your inquiry</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cartItems.map((item) => (
                <div key={item.product._id}
                  style={{ display: 'flex', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9', alignItems: 'center' }}>
                  {/* Thumbnail */}
                  <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#e2e8f0' }}>
                    {item.product.images?.[0] ? (
                      <img src={getImageSrc(item.product.images[0])} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8' }}>No Img</div>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product.name}
                    </p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 8px', fontFamily: 'monospace' }}>{item.product.code}</p>
                    {/* Qty Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        −
                      </button>
                      <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        +
                      </button>
                    </div>
                  </div>
                  {/* Remove */}
                  <button onClick={() => removeFromCart(item.product._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '12px', fontWeight: '600', padding: '4px', flexShrink: 0 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#64748b' }}>Total Items</span>
              <span style={{ fontWeight: '700', color: '#0f172a' }}>{cartCount}</span>
            </div>
            <Link href="/retailer/cart" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}
              onClick={() => setCartOpen(false)}>
              Proceed to Inquiry →
            </Link>
            <button onClick={() => setCartOpen(false)}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
              Continue Browsing
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-filter-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </main>
  );
}
