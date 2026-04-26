/**
 * pages/OrderDetailPage.jsx
 * Shows full details of a single order
 */

import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const isNewOrder = location.state?.newOrder;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch {
        toast.error('Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <p className="font-display text-4xl text-white">ORDER NOT FOUND</p>
        <Link to="/orders" className="btn-primary py-3 px-6">Back to Orders</Link>
      </div>
    );
  }

  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Success banner */}
        {isNewOrder && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl animate-fade-up">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm">✓</div>
              <div>
                <p className="font-display text-xl tracking-wider text-green-400">PAYMENT SUCCESSFUL!</p>
                <p className="font-mono text-xs text-gray-400 mt-0.5">Your order has been confirmed. A receipt has been sent to {order.billingAddress.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <Link to="/orders" className="font-mono text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1 mb-3">
              ← Back to Orders
            </Link>
            <h1 className="font-display text-4xl tracking-wider text-white">ORDER DETAILS</h1>
            <p className="font-mono text-xs text-gray-500 mt-1">{date}</p>
          </div>
          <StatusBadge status={order.orderStatus} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="card">
              <h2 className="font-display text-xl tracking-wider text-white mb-4">ITEMS</h2>
              <div className="flex flex-col gap-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#1e1e1e] flex-shrink-0">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-[#2a2a2a]" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-mono text-sm">{item.name}</p>
                      <p className="text-gray-500 font-mono text-xs">×{item.quantity} @ ${item.price.toFixed(2)}</p>
                    </div>
                    <span className="font-display text-xl tracking-wider text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AddressCard title="Billing Address" address={order.billingAddress} showEmail />
              <AddressCard title="Shipping Address" address={order.shippingAddress} />
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="font-display text-xl tracking-wider text-white mb-4">SUMMARY</h2>
              <div className="flex flex-col gap-3">
                <Row label="Subtotal" value={`$${order.subtotal.toFixed(2)}`} />
                <Row label="Shipping" value={order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost.toFixed(2)}`} highlight={order.shippingCost === 0} />
                <Row label="Tax" value={`$${order.tax.toFixed(2)}`} />
                <div className="border-t border-white/8 pt-3">
                  <Row label="Total" value={`$${order.total.toFixed(2)}`} large />
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/8">
                <p className="font-mono text-[10px] tracking-wider uppercase text-gray-600 mb-2">Payment</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <span className="font-mono text-xs text-gray-400 capitalize">{order.paymentStatus}</span>
                </div>
                <p className="font-mono text-[10px] text-gray-600 mt-1 break-all">{order.stripePaymentIntentId}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <Link to="/products" className="btn-primary py-3 text-center block">Continue Shopping</Link>
              <Link to="/orders" className="btn-ghost py-3 text-center block">View All Orders</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    processing: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    shipped: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    delivered: 'text-green-400 bg-green-400/10 border-green-400/30',
    cancelled: 'text-red-400 bg-red-400/10 border-red-400/30',
  };
  return (
    <span className={`font-mono text-xs tracking-widest uppercase px-4 py-2 rounded-full border ${colors[status] || 'text-gray-400 bg-gray-400/10 border-gray-400/30'}`}>
      {status}
    </span>
  );
}

function AddressCard({ title, address, showEmail }) {
  return (
    <div className="card">
      <p className="font-mono text-[10px] tracking-widest uppercase text-gray-500 mb-3">{title}</p>
      <p className="text-white text-sm font-mono">{address.fullName}</p>
      {showEmail && address.email && <p className="text-gray-400 text-xs font-mono">{address.email}</p>}
      {address.phone && <p className="text-gray-400 text-xs font-mono">{address.phone}</p>}
      <p className="text-gray-400 text-xs font-mono mt-1">{address.address}</p>
      <p className="text-gray-400 text-xs font-mono">{address.city}, {address.postalCode}</p>
      <p className="text-gray-400 text-xs font-mono">{address.country}</p>
    </div>
  );
}

function Row({ label, value, large, highlight }) {
  return (
    <div className="flex justify-between">
      <span className={`font-mono text-xs tracking-wider uppercase ${large ? 'text-white' : 'text-gray-500'}`}>{label}</span>
      <span className={`font-mono ${large ? 'text-accent text-xl' : highlight ? 'text-green-400 text-xs' : 'text-gray-300 text-xs'}`}>{value}</span>
    </div>
  );
}
