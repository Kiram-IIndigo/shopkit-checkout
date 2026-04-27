import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { items, itemCount, subtotal, shippingCost, tax, total, removeItem, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (itemCount === 0) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <p className="font-display text-6xl tracking-wider text-white mb-2">EMPTY</p>
          <p className="text-gray-500 font-mono text-sm">Your cart has no items yet.</p>
        </div>
        <Link to="/products" className="btn-primary py-3 px-8">Browse Products</Link>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="section-tag mb-2">Review</p>
        <h1 className="font-display text-5xl sm:text-7xl tracking-wider text-white mb-10">YOUR CART</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => (
              <CartItem key={item._id} item={item} onRemove={removeItem} onUpdateQty={updateQuantity} />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="font-display text-2xl tracking-wider text-white mb-6">ORDER SUMMARY</h2>
              <div className="flex flex-col gap-3 mb-6">
                <SummaryRow label="Subtotal" value={`${subtotal.toFixed(2)} BAM`} />
                <SummaryRow
                  label="Shipping"
                  value={shippingCost === 0 ? 'Free' : `${shippingCost.toFixed(2)} BAM`}
                  valueClass={shippingCost === 0 ? 'text-green-400' : ''}
                />
                <SummaryRow label="Tax (10%)" value={'{tax.toFixed(2)} BAM'} />
                <div className="border-t border-white/8 pt-3">
                  <SummaryRow label="Total" value={`${total.toFixed(2)} BAM`} bold />
                </div>
              </div>

              {shippingCost > 0 && (
                <p className="font-mono text-xs text-gray-500 mb-4">
                  Add {(50 - subtotal).toFixed(2)} BAM more for free shipping
                </p>
              )}

              <button onClick={handleCheckout} className="btn-primary w-full py-4 text-sm">
                {isAuthenticated ? 'Proceed to Checkout →' : 'Login to Checkout →'}
              </button>

              <Link to="/products" className="block text-center font-mono text-xs text-gray-500 hover:text-gray-300 mt-4 transition-colors">
                ← Continue Shopping
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
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
        ) : (
          <div className="w-full h-full bg-[#222]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div>
            <span className="font-mono text-[10px] tracking-widest uppercase text-accent">{item.category}</span>
            <h3 className="font-display text-lg tracking-wider text-white leading-tight">{item.name}</h3>
          </div>
          <button onClick={() => onRemove(item._id)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className=
