const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiFetch = async (endpoint, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pware_token') : null;

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

// Check if user is logged in
export const isLoggedIn = () => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('pware_token');
  return !!token;
};

// Get user role
export const getUserRole = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pware_role');
};

// Get user approval status
export const getUserStatus = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pware_status');
};

// Check if onboarding is complete
export const isOnboardingComplete = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('pware_onboarding_complete') === 'true';
};

// Log out helper
export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pware_token');
    localStorage.removeItem('pware_role');
    localStorage.removeItem('pware_status');
    localStorage.removeItem('pware_email');
    localStorage.removeItem('pware_onboarding_complete');
    window.location.href = '/';
  }
};
