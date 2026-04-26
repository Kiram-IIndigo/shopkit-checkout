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

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { items, subtotal, shippingCost, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
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
    country: 'BA',
  });
  const [shipping, setShipping] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'BA',
  });
  const [billingErrors, setBillingErrors] = useState({});
  const [shippingErrors, setShippingErrors] = useState({});
  const [cardError, setCardError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    setCardError('');

    try {
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

      const shippingAddr = sameAsBilling
        ? { fullName: billing.fullName, address: billing.address, city: billing.city, postalCode: billing.postalCode, country: billing.country }
        : shipping;

      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ productId: i._id, quantity: i.quantity })),
        billingAddress: billing,
        shippingAddress: shippingAddr,
        stripePaymentIntentId: paymentIntentId,
      });

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
          <div className="lg:col-span-2">
            <StepCard title="Billing Details" step={1} currentStep={step} onEdit={() => setStep(1)}>
              <AddressForm
                data={billing}
                onChange={(field, val) => { setBilling(p => ({ ...p, [field]: val })); setBillingErrors(p => ({ ...p, [field]: '' })); }}
                errors={billingErrors}
                showEmail
                showPhone
