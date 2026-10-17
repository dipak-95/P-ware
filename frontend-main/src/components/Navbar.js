'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isLoggedIn, getUserRole, logoutUser } from '../utils/api';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const cartContext = useCart();
  const cartItems = cartContext?.cartItems || [];
  const [userState, setUserState] = useState({ loggedIn: false, role: null });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUserState({
      loggedIn: isLoggedIn(),
      role: getUserRole(),
    });
    setMobileMenuOpen(false);
  }, [pathname]);

  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    closeMobileMenu();
    logoutUser();
  };

  const isHomeActive = pathname === '/';
  const isCatalogActive = pathname?.startsWith('/products');
  const isAboutActive = pathname === '/about';
  const isCartActive = pathname === '/retailer/cart';
  const isRetailerDashActive = pathname?.startsWith('/retailer/dashboard');
  const isTraderDashActive = pathname?.startsWith('/trader/dashboard');

  return (
    <>
      <style>{`
        /* Light Theme Navbar Styles */
        .pware-navbar {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
        }

        .pware-nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pware-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          user-select: none;
        }

        .pware-logo-icon {
          width: 36px;
          height: 36px;
          background-color: #2563eb;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
          flex-shrink: 0;
        }

        .pware-logo-text {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a !important;
          -webkit-text-fill-color: #0f172a !important;
          background: none !important;
          letter-spacing: -0.02em;
        }

        /* Desktop Navigation */
        .pware-desktop-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .pware-nav-link {
          color: #475569;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 4px;
          transition: color 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .pware-nav-link:hover {
          color: #0f172a;
        }

        .pware-nav-link.active {
          color: #2563eb !important;
          font-weight: 600;
        }

        .pware-badge {
          background-color: #2563eb;
          color: #ffffff;
          padding: 2px 7px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.2;
        }

        /* Desktop Buttons */
        .pware-btn-signin {
          background-color: #2563eb;
          color: #ffffff !important;
          font-size: 14px;
          font-weight: 600;
          padding: 8px 18px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #2563eb;
          transition: background-color 0.15s ease, border-color 0.15s ease;
        }

        .pware-btn-signin:hover {
          background-color: #1d4ed8;
          border-color: #1d4ed8;
        }

        .pware-btn-logout {
          background-color: transparent;
          color: #0f172a;
          font-size: 14px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: inherit;
        }

        .pware-btn-logout:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
        }

        /* Mobile Hamburger Toggle */
        .pware-hamburger-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          padding: 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #0f172a;
          cursor: pointer;
          transition: background-color 0.15s ease, border-color 0.15s ease;
        }

        .pware-hamburger-btn:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
        }

        /* Mobile Menu Dropdown */
        .pware-mobile-menu {
          display: none;
          background-color: #ffffff;
          border-top: 1px solid #e2e8f0;
          padding: 16px 20px 24px 20px;
          box-shadow: 0 8px 16px -4px rgba(15, 23, 42, 0.08);
        }

        .pware-mobile-links {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .pware-mobile-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          border-radius: 8px;
          color: #475569;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: background-color 0.15s ease, color 0.15s ease;
        }

        .pware-mobile-link:hover {
          background-color: #f8fafc;
          color: #0f172a;
        }

        .pware-mobile-link.active {
          background-color: #eff6ff;
          color: #2563eb !important;
          font-weight: 600;
        }

        .pware-mobile-divider {
          height: 1px;
          background-color: #e2e8f0;
          margin: 12px 0 8px 0;
        }

        .pware-mobile-btn-signin {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 12px 16px;
          background-color: #2563eb;
          color: #ffffff !important;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          border: none;
          transition: background-color 0.15s ease;
        }

        .pware-mobile-btn-signin:hover {
          background-color: #1d4ed8;
        }

        .pware-mobile-btn-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 12px 16px;
          background-color: transparent;
          color: #0f172a;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .pware-mobile-btn-logout:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
        }

        /* Mobile Breakpoint (< 768px) */
        @media (max-width: 767px) {
          .pware-desktop-links {
            display: none !important;
          }
          .pware-hamburger-btn {
            display: inline-flex !important;
          }
          .pware-mobile-menu.open {
            display: block !important;
          }
        }
      `}</style>

      <nav className="pware-navbar">
        <div className="pware-nav-container">
          {/* Left: Logo */}
          <Link href="/" className="pware-logo" onClick={closeMobileMenu}>
            <div className="pware-logo-icon">P</div>
            <span className="pware-logo-text">P-Ware B2B</span>
          </Link>

          {/* Right: Desktop Links */}
          <div className="pware-desktop-links">
            <Link
              href="/"
              className={`pware-nav-link ${isHomeActive ? 'active' : ''}`}
            >
              Home
            </Link>

            <Link
              href="/products"
              className={`pware-nav-link ${isCatalogActive ? 'active' : ''}`}
            >
              Catalog
            </Link>

            <Link
              href="/about"
              className={`pware-nav-link ${isAboutActive ? 'active' : ''}`}
            >
              About
            </Link>

            {userState.loggedIn && (userState.role === 'retailer' || userState.role === 'trader') && (
              <Link
                href="/retailer/cart"
                className={`pware-nav-link ${isCartActive ? 'active' : ''}`}
              >
                Inquiry Cart
                {cartCount > 0 && <span className="pware-badge">{cartCount}</span>}
              </Link>
            )}

            {userState.loggedIn && userState.role === 'retailer' && (
              <Link
                href="/retailer/dashboard"
                className={`pware-nav-link ${isRetailerDashActive ? 'active' : ''}`}
              >
                My Inquiries
              </Link>
            )}

            {userState.loggedIn && userState.role === 'trader' && (
              <Link
                href="/trader/dashboard"
                className={`pware-nav-link ${isTraderDashActive ? 'active' : ''}`}
              >
                Trader Dashboard
              </Link>
            )}

            {userState.loggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="pware-btn-logout"
              >
                Log Out
              </button>
            ) : (
              <Link href="/login" className="pware-btn-signin">
                Sign In
              </Link>
            )}
          </div>

          {/* Right: Mobile Hamburger Button */}
          <button
            type="button"
            className="pware-hamburger-btn"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`pware-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="pware-mobile-links">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className={`pware-mobile-link ${isHomeActive ? 'active' : ''}`}
            >
              <span>Home</span>
            </Link>

            <Link
              href="/products"
              onClick={closeMobileMenu}
              className={`pware-mobile-link ${isCatalogActive ? 'active' : ''}`}
            >
              <span>Catalog</span>
            </Link>

            <Link
              href="/about"
              onClick={closeMobileMenu}
              className={`pware-mobile-link ${isAboutActive ? 'active' : ''}`}
            >
              <span>About</span>
            </Link>

            {userState.loggedIn && (userState.role === 'retailer' || userState.role === 'trader') && (
              <Link
                href="/retailer/cart"
                onClick={closeMobileMenu}
                className={`pware-mobile-link ${isCartActive ? 'active' : ''}`}
              >
                <span>Inquiry Cart</span>
                {cartCount > 0 && <span className="pware-badge">{cartCount}</span>}
              </Link>
            )}

            {userState.loggedIn && userState.role === 'retailer' && (
              <Link
                href="/retailer/dashboard"
                onClick={closeMobileMenu}
                className={`pware-mobile-link ${isRetailerDashActive ? 'active' : ''}`}
              >
                <span>My Inquiries</span>
              </Link>
            )}

            {userState.loggedIn && userState.role === 'trader' && (
              <Link
                href="/trader/dashboard"
                onClick={closeMobileMenu}
                className={`pware-mobile-link ${isTraderDashActive ? 'active' : ''}`}
              >
                <span>Trader Dashboard</span>
              </Link>
            )}

            <div className="pware-mobile-divider" />

            {userState.loggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="pware-mobile-btn-logout"
              >
                Log Out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="pware-mobile-btn-signin"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
