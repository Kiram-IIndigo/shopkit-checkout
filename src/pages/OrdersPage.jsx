/**
 * pages/OrdersPage.jsx
 * Lists all orders for the logged-in user
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data.orders);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="section-tag mb-2">Account</p>
        <h1 className="font-display text-5xl tracking-wider text-white mb-8">MY ORDERS</h1>

        {orders.length === 0 ? (
          <div className="card text-center py-16">
            <p className="font-display text-3xl tracking-wider text-white mb-3">NO ORDERS YET</p>
            <p className="text-gray-500 text-sm mb-6">Your order history will appear here.</p>
            <Link to="/products" className="btn-primary py-3 px-8">Start Shopping</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const statusColors = {
    processing: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    shipped: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    delivered: 'text-green-400 bg-green-400/10 border-green-400/20',
    cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <Link to={`/orders/${order._id}`} className="card hover:border-white/20 transition-all duration-200 block group">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-widest uppercase text-gray-500 mb-1">Order</p>
          <p className="font-mono text-xs text-gray-300">{order._id}</p>
          <p className="font-mono text-[10px] text-gray-600 mt-1">{date}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-mono text-[10px] tracking-widest uppercase px-3 py-1 rounded-full border ${statusColors[order.orderStatus] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
            {order.orderStatus}
          </span>
          <span className="font-display text-2xl tracking-wider text-accent">${order.total.toFixed(2)}</span>
          <svg className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Item thumbnails */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {order.items.slice(0, 5).map((item, i) => (
          <div key={i} className="w-10 h-10 rounded-lg overflow-hidden bg-[#1e1e1e] flex-shrink-0">
            {item.image
              ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-[#2a2a2a]" />}
          </div>
        ))}
        {order.items.length > 5 && (
          <div className="w-10 h-10 rounded-lg bg-[#1e1e1e] flex items-center justify-center">
            <span className="font-mono text-[10px] text-gray-500">+{order.items.length - 5}</span>
          </div>
        )}
        <span className="font-mono text-xs text-gray-500 self-center ml-1">
          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
        </span>
      </div>
    </Link>
  );
}
