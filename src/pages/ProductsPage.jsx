/**
 * pages/ProductsPage.jsx
 * Fetches and displays all products in a responsive grid
 */

import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { addItem } = useCart();

  const categories = ['all', 'clothing', 'accessories', 'footwear', 'lifestyle'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        setProducts(data.products);
      } catch (err) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = filter === 'all' ? products : products.filter((p) => p.category === filter);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="section-tag mb-2">The Collection</p>
        <h1 className="font-display text-6xl sm:text-8xl tracking-wider text-white mb-4">
          ALL DROPS
        </h1>
        <p className="text-gray-400 text-sm max-w-md">
          Every piece is a limited run. When it's gone, it's gone.
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mt-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`font-mono text-xs tracking-widest uppercase px-4 py-2 rounded-lg border transition-all ${
                filter === cat
                  ? 'bg-accent border-accent text-white'
                  : 'border-white/10 text-gray-400 hover:border-white/25 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {filtered.length === 0 ? (
          <p className="text-gray-500 font-mono text-sm text-center py-16">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <ProductCard
                key={product._id}
                product={product}
                onAdd={addItem}
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAdd, style }) {
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (product.stock === 0) return;
    setAdding(true);
    onAdd(product, 1);
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div
      className="bg-[#141414] border border-white/8 rounded-xl overflow-hidden group animate-fade-up hover:border-white/20 transition-all duration-300"
      style={style}
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-[#1a1a1a] relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="font-mono text-xs tracking-widest uppercase text-gray-300">Sold Out</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="font-mono text-[10px] tracking-widest uppercase bg-[#0a0a0a]/80 text-accent px-2 py-1 rounded">
            {product.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-display text-xl tracking-wider text-white mb-1">{product.name}</h3>
        <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{product.description}</p>

        {/* Stars */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="font-mono text-[10px] text-gray-500 ml-1">({product.numReviews})</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-display text-2xl tracking-wider text-white">${product.price.toFixed(2)}</span>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0 || adding}
            className={`btn-primary py-2 px-4 text-xs ${adding ? 'bg-green-600 hover:bg-green-600' : ''}`}
          >
            {adding ? '✓ Added' : product.stock === 0 ? 'Sold Out' : '+ Add'}
          </button>
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <p className="font-mono text-[10px] text-orange-400 mt-2">Only {product.stock} left!</p>
        )}
      </div>
    </div>
  );
}
