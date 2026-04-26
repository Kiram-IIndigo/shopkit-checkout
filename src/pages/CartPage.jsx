/**
 * pages/CartPage.jsx
 * Shopping cart with quantity controls and order summary
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { items, itemCount, subtotal, shippingCost, tax, total, removeItem, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <p className="font-display text-5xl tracking-wider text-white mb-3">EMPTY CART</p>
          <p className="text-gray-500 text-sm mb-8">You haven't added anything yet.</p>
          <Link to="/products" className="btn-primary py-3 px-8">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-5xl tracking-wider text-white mb-8">
          YOUR CART <span className="text-accent">({itemCount})</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onRemove={removeItem}
                onUpdateQty={updateQuantity}
              />
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="font-display text-2xl tracking-wider text-white mb-6">SUMMARY</h2>
              <div className="flex flex-col gap-3 mb-6">
                <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                <SummaryRow
                  label="Shipping"
                  value={shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  highlight={shippingCost === 0}
                />
                <SummaryRow label="Tax (10%)" value={`$${tax.toFixed(2)}`} />
                <div className="border-t border-white/8 pt-3">
                  <SummaryRow label="Total" value={`$${total.toFixed(2)}`} large />
                </div>
              </div>

              {subtotal < 50 && (
                <p className="font-mono text-xs text-gray-500 mb-4 p-3 bg-white/5 rounded-lg">
                  Add <span className="text-accent">${(50 - subtotal).toFixed(2)}</span> more for free shipping
                </p>
              )}

              <button onClick={handleCheckout} className="btn-primary w-full py-4 text-sm">
                {isAuthenticated ? 'Proceed to Checkout →' : 'Login to Checkout →'}
              </button>
              <Link to="/products" className="btn-ghost w-full py-3 text-xs mt-3 block text-center">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartItem({ item, onRemove, onUpdateQty }) {
  return (
    <div className="card flex gap-4 items-start animate-fade-up">
      {/* Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-[#1e1e1e] flex-shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-xl tracking-wider text-white truncate">{item.name}</h3>
        <p className="font-mono text-xs text-gray-500 capitalize mt-0.5">{item.category}</p>
        <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
          {/* Quantity */}
          <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => onUpdateQty(item._id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
            >
              −
            </button>
            <span className="font-mono text-sm w-8 text-center text-white">{item.quantity}</span>
            <button
              onClick={() => onUpdateQty(item._id, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-display text-xl tracking-wider text-white">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
            <button
              onClick={() => onRemove(item._id)}
              className="text-gray-600 hover:text-red-400 transition-colors"
              title="Remove item"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, large, highlight }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`font-mono text-xs tracking-wider uppercase ${large ? 'text-white' : 'text-gray-500'}`}>
        {label}
      </span>
      <span className={`font-mono ${large ? 'text-xl text-accent' : highlight ? 'text-green-400 text-xs' : 'text-gray-300 text-xs'}`}>
        {value}
      </span>
    </div>
  );
}
