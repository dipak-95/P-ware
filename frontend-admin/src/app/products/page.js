'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { apiFetch, isAdminLoggedIn } from '../../utils/api';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function ProductsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [catalogPdf, setCatalogPdf] = useState('');

  // Image State
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Specifications State
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [specifications, setSpecifications] = useState({});

  const fetchData = async () => {
    try {
      const prodRes = await apiFetch('/catalog/products?limit=100');
      const catRes = await apiFetch('/catalog/categories');
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch catalog data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/');
      return;
    }
    fetchData();
  }, [router]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // Generate previews for new files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, { type: 'new', src: ev.target.result, file }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, { type: 'new', src: ev.target.result, file }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePreview = (index) => {
    const preview = imagePreviews[index];
    if (preview.type === 'existing') {
      setExistingImages((prev) => prev.filter((url) => url !== preview.src));
    } else {
      setImageFiles((prev) => prev.filter((f) => f !== preview.file));
    }
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSpecification = (e) => {
    e.preventDefault();
    if (!specKey.trim() || !specVal.trim()) return;
    setSpecifications({ ...specifications, [specKey.trim()]: specVal.trim() });
    setSpecKey('');
    setSpecVal('');
  };

  const handleRemoveSpecification = (key) => {
    const updated = { ...specifications };
    delete updated[key];
    setSpecifications(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !code || !categoryId) {
      alert('Name, Code, and Category are required!');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('code', code);
    formData.append('categoryId', categoryId);
    if (subCategoryId) formData.append('subCategoryId', subCategoryId);
    if (catalogPdf) formData.append('catalogPdf', catalogPdf);
    formData.append('specifications', JSON.stringify(specifications));

    // Append new image files
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    // Append existing image URLs to keep
    if (existingImages.length > 0) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }

    try {
      const token = localStorage.getItem('admin_token');
      const url = editId
        ? `${BACKEND_URL}/api/catalog/admin/products/${editId}`
        : `${BACKEND_URL}/api/catalog/admin/products`;
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert(editId ? 'Product updated successfully!' : 'Product created successfully!');
      resetForm();
      fetchData();
    } catch (err) {
      alert(err.message || 'Product save failed');
    }
  };

  const handleEdit = (product) => {
    setEditId(product._id);
    setName(product.name);
    setCode(product.code);
    setCategoryId(product.categoryId?._id || '');
    setSubCategoryId(product.subCategoryId?._id || '');
    setCatalogPdf(product.catalogPdf || '');
    setImageFiles([]);

    // Load existing images as previews
    const existingUrls = product.images || [];
    setExistingImages(existingUrls);
    setImagePreviews(
      existingUrls.map((url) => ({
        type: 'existing',
        src: url.startsWith('/') ? `${BACKEND_URL}${url}` : url,
      }))
    );

    const specsObj = {};
    if (product.specifications) {
      if (product.specifications instanceof Map) {
        product.specifications.forEach((v, k) => { specsObj[k] = v; });
      } else {
        Object.keys(product.specifications).forEach((k) => { specsObj[k] = product.specifications[k]; });
      }
    }
    setSpecifications(specsObj);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiFetch(`/catalog/admin/products/${productId}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert(err.message || 'Product deletion failed');
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setCode('');
    setCategoryId('');
    setSubCategoryId('');
    setCatalogPdf('');
    setImageFiles([]);
    setExistingImages([]);
    setImagePreviews([]);
    setSpecifications({});
  };

  const mainCategories = categories.filter((c) => !c.parentCategoryId);
  const subCategories = categories.filter(
    (c) => c.parentCategoryId?._id === categoryId || c.parentCategoryId === categoryId
  );

  const getImageSrc = (url) => {
    if (!url) return '';
    return url.startsWith('/') ? `${BACKEND_URL}${url}` : url;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading catalog database...</p>
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
            <h1 className="page-title">Product Catalog</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Add, update, or remove sanitaryware and wash basin products
            </p>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', color: 'var(--status-suspended)', marginBottom: '30px' }}>
            {error}
          </div>
        )}

        <div className="grid-3" style={{ gridTemplateColumns: '1fr 2fr', alignItems: 'start' }}>
          {/* Form Panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ fontSize: '18px', color: 'white', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              {editId ? 'Edit Product Details' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label">Product Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input" placeholder="e.g. Prism Wall Hung Basin" required />
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label">Product Model Code</label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="form-input" placeholder="e.g. WB-PR-01" required />
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label">Main Category</label>
                <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(''); }} className="form-input" required>
                  <option value="">Select Main Category</option>
                  {mainCategories.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label">Sub Category (Optional)</label>
                <select value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)} className="form-input" disabled={!categoryId}>
                  <option value="">Select Sub Category</option>
                  {subCategories.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
                </select>
              </div>

              {/* Image Upload Area */}
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label">Product Images</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  style={{
                    border: '2px dashed var(--border-light)', borderRadius: '10px', padding: '24px',
                    textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.1)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>📸</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                    Click to browse or drag & drop images
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
                    JPG, PNG, WEBP • Max 5MB each • Up to 5 images
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                        <img src={preview.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removePreview(idx); }}
                          style={{
                            position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px',
                            borderRadius: '50%', background: 'rgba(239,68,68,0.9)', border: 'none',
                            color: 'white', fontSize: '10px', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                          }}
                        >
                          ✕
                        </button>
                        {preview.type === 'existing' && (
                          <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'rgba(37,99,235,0.8)', color: 'white', fontSize: '8px', textAlign: 'center', padding: '1px' }}>
                            Saved
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label">Catalog PDF Path/URL</label>
                <input type="text" value={catalogPdf} onChange={(e) => setCatalogPdf(e.target.value)} className="form-input" placeholder="e.g. /catalogs/prism.pdf" />
              </div>

              {/* Specifications */}
              <div style={{ border: '1px solid var(--border-light)', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.1)' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Specifications List</span>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  <input type="text" value={specKey} onChange={(e) => setSpecKey(e.target.value)} placeholder="Key" className="form-input" style={{ padding: '8px', fontSize: '12px' }} />
                  <input type="text" value={specVal} onChange={(e) => setSpecVal(e.target.value)} placeholder="Value" className="form-input" style={{ padding: '8px', fontSize: '12px' }} />
                  <button onClick={handleAddSpecification} className="btn btn-primary" style={{ padding: '8px 12px' }}>+</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {Object.keys(specifications).map((key) => (
                    <div key={key} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', color: 'white' }}>
                      <span><strong>{key}:</strong> {specifications[key]}</span>
                      <span onClick={() => handleRemoveSpecification(key)} style={{ cursor: 'pointer', color: 'var(--status-suspended)', fontWeight: 'bold' }}>×</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: '1' }}>
                  {editId ? 'Update Product' : 'Create Product'}
                </button>
                {editId && (
                  <button type="button" onClick={resetForm} className="btn btn-secondary" style={{ padding: '10px 15px' }}>Cancel</button>
                )}
              </div>
            </form>
          </div>

          {/* Product Table */}
          <div className="glass-card">
            <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '15px' }}>Products Database</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product details</th>
                    <th>Code</th>
                    <th>Category</th>
                    <th>Subcategory</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>No products found.</td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {product.images?.[0] && (
                              <img src={getImageSrc(product.images[0])} alt={product.name} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', background: '#333' }} />
                            )}
                            <div>
                              <strong style={{ color: 'white' }}>{product.name}</strong>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {product.images?.length || 0} images • Specs: {product.specifications ? Object.keys(product.specifications).length : 0}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{product.code}</td>
                        <td>{product.categoryId?.name}</td>
                        <td>{product.subCategoryId?.name || '-'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleEdit(product)} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '11px' }}>Edit</button>
                            <button onClick={() => handleDelete(product._id)} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '11px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: 'var(--status-suspended)' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
