import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addItem } = useCart();

  const categories = ['all', 'clothing'];

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="section-tag mb-2">The Collection</p>
        <h1 className="font-display text-6xl sm:text-8xl tracking-wider text-white mb-4">ALL DROPS</h1>
        <p className="text-gray-400 text-sm max-w-md">Every piece is a limited run. When it's gone, it's gone.</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {filtered.length === 0 ? (
          <p className="text-gray-500 font-mono text-sm text-center py-16">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product, i) => (
              <ProductCard
                key={product._id}
                product={product}
                onAdd={addItem}
                onPreview={() => setSelectedProduct(product)}
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={addItem}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onAdd, onPreview, style }) {
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
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
      <div
        className="overflow-hidden bg-[#1a1a1a] relative cursor-pointer"
        style={{ aspectRatio: '4/3' }}
        onClick={onPreview}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
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
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="font-mono text-xs tracking-widest uppercase text-white bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm">
            Quick View
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-xl tracking-wider text-white mb-1">{product.name}</h3>
        <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-display text-2xl tracking-wider text-white">{product.price.toFixed(2)} BAM</span>
          <div className="flex gap-2">
            <button onClick={onPreview} className="btn-ghost py-2 px-3 text-xs">View</button>
            <button
              onClick={handleAdd}
              disabled={product.stock === 0 || adding}
              className={`btn-primary py-2 px-4 text-xs ${adding ? 'bg-green-600 hover:bg-green-600' : ''}`}
            >
              {adding ? '✓' : product.stock === 0 ? 'Sold Out' : '+ Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleAdd = () => {
    setAdding(true);
    onAdd(product, 1);
    setTimeout(() => { setAdding(false); onClose(); }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 pt-2">
          <div className="bg-[#1a1a1a] rounded-xl overflow-hidden" style={{ aspectRatio: '1' }}>
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4" />
            ) : (
              <div className="w-full h-full bg-[#222]" />
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <span className="font-mono text-[10px] tracking-widest uppercase text-accent">{product.category}</span>
              <h2 className="font-display text-3xl tracking-wider text-white mt-1">{product.name}</h2>
              <p className="font-display text-3xl text-accent mt-2">{product.price.toFixed(2)} BAM</p>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>

            <div>
              <p className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-2">
                Select Size {selectedSize && <span className="text-accent">— {selectedSize}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`font-mono text-xs px-3 py-2 rounded-lg border transition-all ${
                      selectedSize === size
                        ? 'bg-accent border-accent text-white'
                        : 'border-white/15 text-gray-400 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={product.stock === 0 || adding}
              className={`btn-primary py-4 text-sm mt-auto ${adding ? 'bg-green-600 hover:bg-green-600' : ''}`}
            >
              {adding ? '✓ Added to Cart!' : product.stock === 0 ? 'Sold Out' : '+ Add to Cart'}
            </button>

            <p className="font-mono text-[10px] text-gray-600 text-center tracking-wider">
              FREE SHIPPING OVER 200 BAM · MADE ON DEMAND
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
