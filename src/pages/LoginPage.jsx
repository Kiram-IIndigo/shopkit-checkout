/**
 * pages/LoginPage.jsx
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/products';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background text */}
      <div className="absolute bottom-0 right-0 font-display text-[20rem] text-white/3 leading-none pointer-events-none select-none">
        LOGIN
      </div>

      <div className="w-full max-w-md animate-fade-up relative z-10">
        <div className="text-center mb-8">
          <p className="section-tag mb-2">Welcome back</p>
          <h1 className="font-display text-4xl tracking-wider text-white">SIGN IN</h1>
        </div>

        <div className="card">
          {serverError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm font-mono">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <FormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <FormField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6 font-mono">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:underline">Register here</Link>
        </p>

        {/* Test credentials hint */}
        <div className="mt-4 p-3 bg-white/3 border border-white/8 rounded-lg">
          <p className="font-mono text-[10px] text-gray-500 text-center tracking-wider uppercase">
            Test: register an account, then log in
          </p>
        </div>
      </div>
    </div>
  );
}

export function FormField({ label, name, type = 'text', value, onChange, error, placeholder, autoComplete }) {
  return (
    <div>
      <label className="block font-mono text-xs tracking-widest uppercase text-gray-400 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`input-field ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}`}
      />
      {error && <p className="mt-1 text-red-400 text-xs font-mono">{error}</p>}
    </div>
  );
}
