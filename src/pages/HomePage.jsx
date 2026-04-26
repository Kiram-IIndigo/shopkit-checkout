/**
 * pages/HomePage.jsx
 */

import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-24 relative overflow-hidden">
        {/* BG text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-display opacity-10 text-[18vw] text-white/3 leading-none">
            SHOP
          </span>
        </div>

        <div className="relative z-10 text-center max-w-2xl animate-fade-up">
          <p className="section-tag mb-4">WEAR IT. OWN IT.</p>
          <h1 className="font-display text-7xl sm:text-9xl tracking-wider text-white leading-none mb-6">
            IINDIGO<span className="text-accent">GRAPHIC</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-10 leading-relaxed">
            High-quality shirts meets high-speed tech. We’ve built this shop to
            be fast, secure, and easy to use. No fluff, just the best apparel
            and a checkout process that actually works.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn-primary py-4 px-10 text-sm">
              Browse Products →
            </Link>
            <Link to="/register" className="btn-ghost py-4 px-10 text-sm">
              Create Account
            </Link>
          </div>
        </div>

        {/* Feature pills */}
      </div>

      {/* Stripe test card reminder */}
      <div className="border-t border-white/8 bg-[#111] py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <span className="font-mono text-[10px] tracking-widest uppercase text-accent">
            Test Mode
          </span>
          <span className="text-gray-600 hidden sm:block">·</span>
          <span className="font-mono text-[10px] text-gray-500">
            Use card: 4242 4242 4242 4242 · Any future date · Any CVC
          </span>
        </div>
      </div>
    </div>
  );
}
