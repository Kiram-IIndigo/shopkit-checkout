/**
 * pages/RegisterPage.jsx
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormField } from './LoginPage';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
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
      await register(form.name.trim(), form.email, form.password);
      navigate('/products', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 font-display text-[18rem] text-white/3 leading-none pointer-events-none select-none">
        JOIN
      </div>

      <div className="w-full max-w-md animate-fade-up relative z-10">
        <div className="text-center mb-8">
          <p className="section-tag mb-2">Create account</p>
          <h1 className="font-display text-4xl tracking-wider text-white">REGISTER</h1>
        </div>

        <div className="card">
          {serverError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm font-mono">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <FormField label="Full Name" name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="John Doe" autoComplete="name" />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" autoComplete="email" />
            <FormField label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="Min. 6 characters" autoComplete="new-password" />
            <FormField label="Confirm Password" name="confirm" type="password" value={form.confirm} onChange={handleChange} error={errors.confirm} placeholder="Repeat your password" autoComplete="new-password" />

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account →'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6 font-mono">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
