'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { apiFetch, isAdminLoggedIn } from '../../utils/api';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [editId, setEditId] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await apiFetch('/catalog/categories');
      setCategories(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/');
      return;
    }
    fetchCategories();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      parentCategoryId: parentCategoryId || null,
    };

    try {
      if (editId) {
        await apiFetch(`/catalog/admin/categories/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        alert('Category updated successfully!');
      } else {
        await apiFetch('/catalog/admin/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        alert('Category created successfully!');
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Saving category failed');
    }
  };

  const handleEdit = (category) => {
    setEditId(category._id);
    setName(category.name);
    setParentCategoryId(category.parentCategoryId?._id || category.parentCategoryId || '');
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await apiFetch(`/catalog/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Deletion failed. Check if products are mapped to this category.');
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setParentCategoryId('');
  };

  const mainCategories = categories.filter((c) => !c.parentCategoryId);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading categories...</p>
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
            <h1 className="page-title">Category Builder</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Define product categories and nesting subcategories (e.g. Wash Basin &rarr; Wall Mounted)
            </p>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', color: 'var(--status-suspended)', marginBottom: '30px' }}>
            {error}
          </div>
        )}

        <div className="grid-3" style={{ gridTemplateColumns: '1fr 2fr', alignItems: 'start' }}>
          {/* Add / Edit Form Panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ fontSize: '18px', color: 'white', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              {editId ? 'Edit Category' : 'Create Category'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Wall Mounted"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Parent Category (Optional)</label>
                <select
                  value={parentCategoryId}
                  onChange={(e) => setParentCategoryId(e.target.value)}
                  className="form-input"
                >
                  <option value="">None (Make it a Main Category)</option>
                  {mainCategories
                    .filter((c) => c._id !== editId)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Selecting a parent category nests this category as a subcategory.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: '1' }}>
                  {editId ? 'Update Category' : 'Create Category'}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-secondary"
                    style={{ padding: '10px 15px' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Categories Listing Grid/Table */}
          <div className="glass-card">
            <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '15px' }}>Existing Categories</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Nesting Structure</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                        No categories found in the system.
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category._id}>
                        <td>
                          <strong style={{ color: 'white' }}>{category.name}</strong>
                        </td>
                        <td>
                          {category.parentCategoryId ? (
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                              Subcategory of <strong>{category.parentCategoryId.name || category.parentCategoryId}</strong>
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: 'var(--accent-blue)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                              Main Category
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleEdit(category)}
                              className="btn btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '11px' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(category._id)}
                              className="btn btn-danger"
                              style={{ padding: '5px 10px', fontSize: '11px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: 'var(--status-suspended)' }}
                            >
                              Delete
                            </button>
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
