/**
 * components/layout/Navbar.jsx
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-white/8"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="font-display text-2xl tracking-wider text-white hover:text-accent transition-colors"
          >
            IINDIGO<span className="text-accent">GRAPHIC</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/products"
              className="font-mono text-xs tracking-widest uppercase text-gray-400 hover:text-white transition-colors"
            >
              Shop
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className="font-mono text-xs tracking-widest uppercase text-gray-400 hover:text-white transition-colors"
              >
                My Orders
              </Link>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-gray-500">
                  {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-ghost py-2 px-4 text-xs"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-ghost py-2 px-4 text-xs">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-xs">
                  Register
                </Link>
              </div>
            )}
            {/* Cart icon */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-mono w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="md:hidden flex items-center gap-4">
            <Link to="/cart" className="relative text-gray-400">
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-400 hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/8 py-4 flex flex-col gap-3">
            <Link
              to="/products"
              onClick={() => setMobileOpen(false)}
              className="font-mono text-xs tracking-widest uppercase text-gray-400 py-2"
            >
              Shop
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                onClick={() => setMobileOpen(false)}
                className="font-mono text-xs tracking-widest uppercase text-gray-400 py-2"
              >
                My Orders
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="text-left font-mono text-xs tracking-widest uppercase text-gray-400 py-2"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="font-mono text-xs tracking-widest uppercase text-gray-400 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="font-mono text-xs tracking-widest uppercase text-accent py-2"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function CartIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );
}
