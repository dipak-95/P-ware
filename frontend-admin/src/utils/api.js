const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiFetch = async (endpoint, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pware_admin_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

// Check if user is logged in as admin
export const isAdminLoggedIn = () => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('pware_admin_token');
  const role = localStorage.getItem('pware_admin_role');
  return !!token && role === 'admin';
};

// Log out helper
export const logoutAdmin = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pware_admin_token');
    localStorage.removeItem('pware_admin_role');
    localStorage.removeItem('pware_admin_email');
    window.location.href = '/';
  }
};
