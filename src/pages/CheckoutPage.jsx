/**
 * pages/CheckoutPage.jsx
 * Multi-section checkout: billing form + Stripe card payment
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Load Stripe outside component to avoid re-initialization
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const { items, itemCount } = useCart();
  const navigate = useNavigate();

  if (itemCount === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#4f8ef7',
            colorBackground: '#1a1a1a',
            colorText: '#f0f0f0',
            colorDanger: '#ef4444',
            fontFamily: '"DM Sans", sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      <CheckoutForm />
    </Elements>
  );
}

// ─── Inner form (needs Stripe hooks inside Elements) ──────
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { items, subtotal, shippingCost, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=billing, 2=shipping, 3=payment
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(true);

  const [billing, setBilling] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'US',
  });
  const [shipping, setShipping] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'US',
  });
  const [billingErrors, setBillingErrors] = useState({});
  const [shippingErrors, setShippingErrors] = useState({});
  const [cardError, setCardError] = useState('');

  // Fetch PaymentIntent when component mounts
  useEffect(() => {
    const fetchIntent = async () => {
      try {
        const { data } = await api.post('/payments/create-intent', {
          items: items.map((i) => ({ productId: i._id, quantity: i.quantity })),
        });
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } catch (err) {
        toast.error('Could not initialize payment. Please try again.');
      }
    };
    fetchIntent();
  }, []);

  // ─── Validation ────────────────────────────────────────
  const validateBilling = () => {
    const e = {};
    if (!billing.fullName) e.fullName = 'Full name is required';
    if (!billing.email || !/\S+@\S+\.\S+/.test(billing.email)) e.email = 'Valid email required';
    if (!billing.address) e.address = 'Address is required';
    if (!billing.city) e.city = 'City is required';
    if (!billing.postalCode) e.postalCode = 'Postal code is required';
    if (!billing.country) e.country = 'Country is required';
    return e;
  };

  const validateShipping = () => {
    const addr = sameAsBilling ? billing : shipping;
    const e = {};
    if (!addr.fullName) e.fullName = 'Full name is required';
    if (!addr.address) e.address = 'Address is required';
    if (!addr.city) e.city = 'City is required';
    if (!addr.postalCode) e.postalCode = 'Postal code is required';
    if (!addr.country) e.country = 'Country is required';
    return e;
  };

  const handleBillingNext = () => {
    const errs = validateBilling();
    if (Object.keys(errs).length) { setBillingErrors(errs); return; }
    setStep(2);
  };

  const handleShippingNext = () => {
    if (!sameAsBilling) {
      const errs = validateShipping();
      if (Object.keys(errs).length) { setShippingErrors(errs); return; }
    }
    setStep(3);
  };

  // ─── Submit payment ────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    setCardError('');

    try {
      // 1. Confirm card payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: billing.fullName,
            email: billing.email,
            phone: billing.phone,
            address: {
              line1: billing.address,
              city: billing.city,
              postal_code: billing.postalCode,
              country: billing.country,
            },
          },
        },
      });

      if (error) {
        setCardError(error.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status !== 'succeeded') {
        setCardError('Payment was not successful. Please try again.');
        setProcessing(false);
        return;
      }

      // 2. Create order in our database
      const shippingAddr = sameAsBilling
        ? { fullName: billing.fullName, address: billing.address, city: billing.city, postalCode: billing.postalCode, country: billing.country }
        : shipping;

      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ productId: i._id, quantity: i.quantity })),
        billingAddress: billing,
        shippingAddress: shippingAddr,
        stripePaymentIntentId: paymentIntentId,
      });

      // 3. Clear cart and redirect to success
      clearCart();
      toast.success('Payment successful! 🎉');
      navigate(`/orders/${data.order._id}`, { state: { newOrder: true } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please contact support.');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#f0f0f0',
        fontFamily: '"DM Sans", sans-serif',
        fontSize: '15px',
        '::placeholder': { color: '#555' },
      },
      invalid: { color: '#ef4444' },
    },
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-5xl tracking-wider text-white mb-8">CHECKOUT</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-4 mb-10">
          {[['1', 'Billing'], ['2', 'Shipping'], ['3', 'Payment']].map(([num, label], i) => (
            <React.Fragment key={num}>
              <div className={`flex items-center gap-2 ${step >= parseInt(num) ? 'text-white' : 'text-gray-600'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs border transition-all ${
                  step > parseInt(num) ? 'bg-green-500 border-green-500 text-white' :
                  step === parseInt(num) ? 'bg-accent border-accent text-white' :
                  'border-white/15 text-gray-600'
                }`}>
                  {step > parseInt(num) ? '✓' : num}
                </div>
                <span className="font-mono text-xs tracking-wider hidden sm:block">{label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-px max-w-[60px] ${step > i + 1 ? 'bg-green-500/50' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: forms */}
          <div className="lg:col-span-2">

            {/* ── STEP 1: BILLING ── */}
            <StepCard title="Billing Details" step={1} currentStep={step} onEdit={() => setStep(1)}>
              <AddressForm
                data={billing}
                onChange={(field, val) => { setBilling(p => ({ ...p, [field]: val })); setBillingErrors(p => ({ ...p, [field]: '' })); }}
                errors={billingErrors}
                showEmail
                showPhone
              />
              <div className="mt-6 flex justify-end">
                <button onClick={handleBillingNext} className="btn-primary py-3 px-8">Continue to Shipping →</button>
              </div>
            </StepCard>

            {/* ── STEP 2: SHIPPING ── */}
            <StepCard title="Shipping Address" step={2} currentStep={step} onEdit={() => setStep(2)}>
              <label className="flex items-center gap-3 mb-5 cursor-pointer group">
                <div
                  onClick={() => setSameAsBilling(!sameAsBilling)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${sameAsBilling ? 'bg-accent border-accent' : 'border-white/20 group-hover:border-white/40'}`}
                >
                  {sameAsBilling && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                </div>
                <span className="font-mono text-xs tracking-wider text-gray-300">Same as billing address</span>
              </label>

              {!sameAsBilling && (
                <AddressForm
                  data={shipping}
                  onChange={(field, val) => { setShipping(p => ({ ...p, [field]: val })); setShippingErrors(p => ({ ...p, [field]: '' })); }}
                  errors={shippingErrors}
                />
              )}

              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(1)} className="btn-ghost py-3 px-6">← Back</button>
                <button onClick={handleShippingNext} className="btn-primary py-3 px-8">Continue to Payment →</button>
              </div>
            </StepCard>

            {/* ── STEP 3: PAYMENT ── */}
            <StepCard title="Payment" step={3} currentStep={step} onEdit={() => setStep(3)}>
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="block font-mono text-xs tracking-widest uppercase text-gray-400 mb-2">
                    Card Details
                  </label>
                  <div className="input-field py-3.5">
                    <CardElement options={cardElementOptions} onChange={() => setCardError('')} />
                  </div>
                  {cardError && (
                    <p className="mt-2 text-red-400 text-xs font-mono">{cardError}</p>
                  )}
                </div>

                {/* Test card hint */}
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg mb-5">
                  <p className="font-mono text-[10px] text-accent tracking-wider uppercase mb-1">Stripe Test Card</p>
                  <p className="font-mono text-xs text-gray-400">4242 4242 4242 4242 · Any future date · Any 3-digit CVC</p>
                </div>

                <div className="flex justify-between items-center">
                  <button type="button" onClick={() => setStep(2)} className="btn-ghost py-3 px-6">← Back</button>
                  <button
                    type="submit"
                    disabled={!stripe || processing || !clientSecret}
                    className="btn-primary py-4 px-10 text-sm"
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      `Pay $${total.toFixed(2)} →`
                    )}
                  </button>
                </div>
              </form>
            </StepCard>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="font-display text-xl tracking-wider text-white mb-4">ORDER SUMMARY</h2>
              <div className="flex flex-col gap-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#1e1e1e] flex-shrink-0">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-[#2a2a2a]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-mono truncate">{item.name}</p>
                      <p className="text-gray-500 text-[10px] font-mono">×{item.quantity}</p>
                    </div>
                    <span className="text-gray-300 text-xs font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/8 pt-4 flex flex-col gap-2">
                <div className="flex justify-between font-mono text-xs text-gray-500">
                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-mono text-xs text-gray-500">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? 'text-green-400' : ''}>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-mono text-xs text-gray-500">
                  <span>Tax (10%)</span><span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-mono text-lg text-white border-t border-white/8 pt-2 mt-1">
                  <span className="text-xs uppercase tracking-wider">Total</span>
                  <span className="text-accent font-display text-2xl">${total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-mono text-[10px] tracking-wider uppercase">Secured by Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step card wrapper ─────────────────────────────────────
function StepCard({ title, step, currentStep, onEdit, children }) {
  const isActive = currentStep === step;
  const isComplete = currentStep > step;

  return (
    <div className={`card mb-4 transition-all duration-300 ${!isActive && !isComplete ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl tracking-wider text-white">{title}</h2>
        {isComplete && (
          <button onClick={onEdit} className="font-mono text-xs text-accent hover:underline tracking-wider uppercase">Edit</button>
        )}
        {isComplete && (
          <span className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 text-green-400 flex items-center justify-center text-xs ml-2">✓</span>
        )}
      </div>
      {isActive && children}
    </div>
  );
}

// ─── Reusable address form ─────────────────────────────────
function AddressForm({ data, onChange, errors, showEmail = false, showPhone = false }) {
  const Field = ({ label, name, type = 'text', placeholder, half }) => (
    <div className={half ? '' : 'col-span-2 sm:col-span-1'}>
      <label className="block font-mono text-xs tracking-widest uppercase text-gray-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={data[name] || ''}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={`input-field ${errors[name] ? 'border-red-500/50' : ''}`}
      />
      {errors[name] && <p className="mt-1 text-red-400 text-xs font-mono">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="col-span-1 sm:col-span-2"><Field label="Full Name" name="fullName" placeholder="John Doe" /></div>
      {showEmail && <div className="col-span-1 sm:col-span-2"><Field label="Email" name="email" type="email" placeholder="you@example.com" /></div>}
      {showPhone && <Field label="Phone (optional)" name="phone" type="tel" placeholder="+1 555 000 0000" />}
      <div className="col-span-1 sm:col-span-2"><Field label="Street Address" name="address" placeholder="123 Main St, Apt 4B" /></div>
      <Field label="City" name="city" placeholder="New York" />
      <Field label="Postal Code" name="postalCode" placeholder="10001" />
      <div className="col-span-1 sm:col-span-2">
        <label className="block font-mono text-xs tracking-widest uppercase text-gray-400 mb-1.5">Country</label>
        <select
          value={data.country || 'US'}
          onChange={(e) => onChange('country', e.target.value)}
          className={`input-field ${errors.country ? 'border-red-500/50' : ''}`}
        >
          <option value="US">United States</option>
          <option value="GB">United Kingdom</option>
          <option value="DE">Germany</option>
          <option value="FR">France</option>
          <option value="CA">Canada</option>
          <option value="AU">Australia</option>
          <option value="BA">Bosnia and Herzegovina</option>
          <option value="HR">Croatia</option>
          <option value="RS">Serbia</option>
          <option value="SI">Slovenia</option>
          <option value="AT">Austria</option>
          <option value="IT">Italy</option>
          <option value="ES">Spain</option>
          <option value="NL">Netherlands</option>
          <option value="PL">Poland</option>
          <option value="JP">Japan</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
    </div>
  );
}
