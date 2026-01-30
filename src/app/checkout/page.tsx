// src/app/checkout/page.tsx - COMPLETELY REDESIGNED WITH API INTEGRATION
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Calendar, Clock, User, Phone, Mail, Shield, MapPin, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { KentePattern, ZigzagPattern, AdinkraPattern } from '@/components/patterns/AfricanPatterns';
import { useRouter } from 'next/navigation';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(price);
};

// Generate time slots
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 16; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 23) slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    tax,
    total,
    orderType,
    setOrderType,
    pickupTime,
    setPickupTime,
    clearCart,
  } = useCart();

  const [step, setStep] = useState(1); // 1 = Order Type, 2 = Details, 3 = Payment
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    specialInstructions: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Get min/max dates
  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const now = new Date();
    const maxDate = new Date(now.setDate(now.getDate() + 30));
    return maxDate.toISOString().split('T')[0];
  };

  // Generate time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateTimeSlots());
    }
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dine-in requires date/time
    if (orderType === 'dine-in' && (!selectedDate || !selectedTime)) {
      alert('Please select a date and time for your dine-in reservation');
      return;
    }
    
    // Validate pickup requires time
    if (orderType === 'pickup' && !pickupTime) {
      alert('Please select a pickup time');
      return;
    }

    setIsProcessing(true);

    try {
      // Generate order number
      const newOrderNumber = `UB-${Date.now().toString().slice(-6)}`;
      setOrderNumber(newOrderNumber);

      // Create order data for API
      const orderData = {
        orderNumber: newOrderNumber,
        orderType: orderType, // 'dine-in' or 'pickup'
        status: 'PENDING',
        subtotal: subtotal,
        tax: tax,
        total: total,
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        specialRequests: customerInfo.specialInstructions || null,
        // Include reservation info for dine-in orders
        reservationDate: orderType === 'dine-in' ? selectedDate : null,
        reservationTime: orderType === 'dine-in' ? selectedTime : null,
        pickupTime: orderType === 'pickup' ? pickupTime : null,
        items: items.map(item => ({
          menuItemId: item.id, // Ensure cart items have the database menuItem.id
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions || '',
        })),
      };

      // Send order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create order');
      }

      const createdOrder = await response.json();
      console.log('Order created successfully:', createdOrder);

      // Show confirmation and clear cart
      setIsProcessing(false);
      setShowConfirmation(true);
      clearCart();

    } catch (error) {
      console.error('Error creating order:', error);
      alert(error instanceof Error ? error.message : 'Failed to create order. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  if (items.length === 0 && !showConfirmation) {
    return (
      <div className="min-h-screen bg-cream pt-20 pb-12 sm:pb-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="mb-8">
            <ZigzagPattern className="w-48 h-3 mx-auto text-gold" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-forest mb-6">Your cart is empty</h1>
          <p className="text-charcoal-light mb-8">Add delicious African dishes to get started!</p>
          <button
            onClick={() => router.push('/menu')}
            className="px-8 py-4 bg-gold hover:bg-gold-light text-forest font-bold rounded-full transition-all shadow-lg hover:shadow-gold/30"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-cream pt-20 pb-12 sm:pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Pattern header */}
            <div className="bg-forest p-1">
              <KentePattern className="w-full h-3 text-gold" />
            </div>
            
            <div className="p-8 md:p-12 text-center">
              <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield size={48} className="text-gold" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-forest mb-4">
                {orderType === 'dine-in' ? 'Reservation & Order Confirmed!' : 'Order Confirmed!'}
              </h1>
              
              <p className="text-lg text-charcoal-light mb-8">
                Thank you, {customerInfo.name.split(' ')[0]}!
              </p>
              
              {/* Order details */}
              <div className="bg-cream/50 rounded-2xl p-6 mb-8 border-2 border-gold/20 relative">
                <div className="absolute top-0 left-0 right-0">
                  <ZigzagPattern className="w-full h-2 text-gold/30" />
                </div>
                
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between py-2 border-b border-cream-dark">
                    <span className="text-charcoal-light flex items-center gap-2">
                      <Shield size={18} />
                      Order Number
                    </span>
                    <span className="font-semibold text-forest">{orderNumber}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-cream-dark">
                    <span className="text-charcoal-light flex items-center gap-2">
                      {orderType === 'dine-in' ? <UtensilsCrossed size={18} /> : <ShoppingBag size={18} />}
                      Order Type
                    </span>
                    <span className="font-semibold text-forest capitalize">
                      {orderType === 'dine-in' ? 'Dine-in' : 'Pickup'}
                    </span>
                  </div>
                  
                  {orderType === 'pickup' && pickupTime && (
                    <div className="flex items-center justify-between py-2 border-b border-cream-dark">
                      <span className="text-charcoal-light flex items-center gap-2">
                        <Clock size={18} />
                        Pickup Time
                      </span>
                      <span className="font-semibold text-forest">{pickupTime}</span>
                    </div>
                  )}
                  
                  {orderType === 'dine-in' && selectedDate && selectedTime && (
                    <>
                      <div className="flex items-center justify-between py-2 border-b border-cream-dark">
                        <span className="text-charcoal-light flex items-center gap-2">
                          <Calendar size={18} />
                          Date
                        </span>
                        <span className="font-semibold text-forest">
                          {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-cream-dark">
                        <span className="text-charcoal-light flex items-center gap-2">
                          <Clock size={18} />
                          Time
                        </span>
                        <span className="font-semibold text-forest">{selectedTime}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-charcoal-light flex items-center gap-2">
                      <CreditCard size={18} />
                      Total Paid
                    </span>
                    <span className="font-semibold text-forest">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
              
              {/* Important notes */}
              <div className="bg-forest/5 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-bold text-forest mb-3 flex items-center gap-2">
                  <Shield size={20} />
                  What's Next?
                </h3>
                <ul className="space-y-2 text-sm text-charcoal">
                  <li>• Confirmation sent to {customerInfo.email}</li>
                  {orderType === 'pickup' && (
                    <li>• Pickup at Zenzele Building, Hospital Road, Section 5, Madadeni</li>
                  )}
                  {orderType === 'dine-in' && (
                    <li>• Please arrive 5 minutes before your reservation time</li>
                  )}
                  <li>• For changes, call +27 73 498 4451</li>
                  <li>• Save your order number: {orderNumber}</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/menu')}
                  className="px-6 py-3 bg-forest hover:bg-forest-dark text-white font-bold rounded-full transition-colors"
                >
                  Order Again
                </button>
                
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 border-2 border-forest text-forest hover:bg-forest hover:text-white font-bold rounded-full transition-colors"
                >
                  Return Home
                </button>
              </div>
            </div>
            
            <div className="bg-forest p-1">
              <KentePattern className="w-full h-3 text-gold rotate-180" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-20 pb-12 sm:pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-forest hover:text-gold transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back to Cart</span>
          </button>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-forest mb-2">
                Complete Your Order
              </h1>
              <p className="text-charcoal-light">
                {step === 1 && 'Choose how you want to enjoy your meal'}
                {step === 2 && 'Provide your details'}
                {step === 3 && 'Review and confirm'}
              </p>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= num ? 'bg-gold text-forest' : 'bg-cream-dark text-charcoal-light'
                  }`}>
                    {num}
                  </div>
                  {num < 3 && (
                    <div className={`w-6 h-0.5 ${step > num ? 'bg-gold' : 'bg-cream-dark'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2">
            {step === 1 ? (
              /* STEP 1: Order Type Selection */
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6"
              >
                <h2 className="text-xl font-bold text-forest mb-6">How would you like to enjoy your meal?</h2>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Pickup Option */}
                  <button
                    onClick={() => {
                      setOrderType('pickup');
                      setStep(2);
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      orderType === 'pickup' 
                        ? 'border-gold bg-gold/5' 
                        : 'border-cream-dark hover:border-gold/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        orderType === 'pickup' ? 'bg-gold' : 'bg-cream-dark'
                      }`}>
                        <ShoppingBag className={`w-6 h-6 ${orderType === 'pickup' ? 'text-forest' : 'text-charcoal'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-forest">Pickup</h3>
                        <p className="text-sm text-charcoal-light">Take away</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-charcoal-light">
                      <li>• Order ready in 20-30 minutes</li>
                      <li>• Pickup at our location</li>
                      <li>• No waiting at the restaurant</li>
                    </ul>
                  </button>
                  
                  {/* Dine-in Option */}
                  <button
                    onClick={() => {
                      setOrderType('dine-in');
                      setStep(2);
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      orderType === 'dine-in' 
                        ? 'border-gold bg-gold/5' 
                        : 'border-cream-dark hover:border-gold/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        orderType === 'dine-in' ? 'bg-gold' : 'bg-cream-dark'
                      }`}>
                        <UtensilsCrossed className={`w-6 h-6 ${orderType === 'dine-in' ? 'text-forest' : 'text-charcoal'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-forest">Dine-in</h3>
                        <p className="text-sm text-charcoal-light">At restaurant</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-charcoal-light">
                      <li>• Full restaurant experience</li>
                      <li>• Table reservation included</li>
                      <li>• Served at your table</li>
                    </ul>
                  </button>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => router.back()}
                    className="px-6 py-3 border-2 border-forest text-forest hover:bg-forest hover:text-white font-bold rounded-full transition-colors"
                  >
                    Back to Cart
                  </button>
                  <div className="text-sm text-charcoal-light">
                    Step 1 of 3
                  </div>
                </div>
              </motion.div>
            ) : step === 2 ? (
              /* STEP 2: Details & Timing */
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6"
              >
                <h2 className="text-xl font-bold text-forest mb-6">
                  {orderType === 'dine-in' ? 'Reservation & Contact Details' : 'Contact Details & Pickup Time'}
                </h2>
                
                <form className="space-y-6">
                  {/* Timing Section */}
                  {orderType === 'dine-in' ? (
                    <div className="space-y-4">
                      <h3 className="font-bold text-forest">Reservation Details</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-forest mb-2">Date *</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light" size={20} />
                            <input
                              type="date"
                              required
                              min={getMinDate()}
                              max={getMaxDate()}
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border-2 border-cream-dark rounded-xl focus:border-gold focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-forest mb-2">Time *</label>
                          <select
                            required
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            disabled={!selectedDate}
                            className="w-full px-4 py-3 border-2 border-cream-dark rounded-xl focus:border-gold focus:outline-none transition-colors disabled:opacity-50"
                          >
                            <option value="">Select time</option>
                            {timeSlots.map((slot) => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-forest/5 rounded-xl">
                        <p className="text-sm text-charcoal-light">
                          We'll reserve your table for the selected time. Please arrive within 15 minutes of your reservation.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-forest mb-3">Pickup Time</h3>
                      <select
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-cream-dark rounded-xl focus:border-gold focus:outline-none transition-colors"
                      >
                        <option value="">Select pickup time</option>
                        <option value="ASAP">As soon as possible (20-30 min)</option>
                        <option value="18:00">6:00 PM</option>
                        <option value="19:00">7:00 PM</option>
                        <option value="20:00">8:00 PM</option>
                        <option value="21:00">9:00 PM</option>
                      </select>
                      <p className="text-sm text-charcoal-light mt-2">
                        Pickup at Zenzele Building, Hospital Road, Section 5, Madadeni
                      </p>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-forest">Contact Information</h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-forest mb-2">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light" size={20} />
                          <input
                            type="text"
                            name="name"
                            required
                            value={customerInfo.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border-2 border-cream-dark rounded-xl focus:border-gold focus:outline-none transition-colors"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-forest mb-2">Phone *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light" size={20} />
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={customerInfo.phone}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border-2 border-cream-dark rounded-xl focus:border-gold focus:outline-none transition-colors"
                            placeholder="+27 73 498 4451"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-forest mb-2">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light" size={20} />
                        <input
                          type="email"
                          name="email"
                          required
                          value={customerInfo.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border-2 border-cream-dark rounded-xl focus:border-gold focus:outline-none transition-colors"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-forest mb-2">
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        name="specialInstructions"
                        value={customerInfo.specialInstructions}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-cream-dark rounded-xl focus:border-gold focus:outline-none transition-colors resize-none"
                        placeholder="Dietary requirements, allergies, specific requests..."
                      />
                    </div>
                  </div>
                </form>
                
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border-2 border-forest text-forest hover:bg-forest hover:text-white font-bold rounded-full transition-colors"
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={() => setStep(3)}
                    disabled={
                      !customerInfo.name || 
                      !customerInfo.email || 
                      !customerInfo.phone ||
                      (orderType === 'dine-in' && (!selectedDate || !selectedTime)) ||
                      (orderType === 'pickup' && !pickupTime)
                    }
                    className="px-6 py-3 bg-gold hover:bg-gold-light text-forest font-bold rounded-full transition-all shadow-lg hover:shadow-gold/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                  </button>
                </div>
              </motion.div>
            ) : (
              /* STEP 3: Review & Payment */
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6"
              >
                <h2 className="text-xl font-bold text-forest mb-6">Review Your Order</h2>
                
                {/* Order Summary */}
                <div className="space-y-6">
                  {/* Order Type & Timing */}
                  <div className="p-4 bg-cream/50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      {orderType === 'dine-in' ? (
                        <>
                          <UtensilsCrossed className="w-5 h-5 text-gold" />
                          <span className="font-bold text-forest">Dine-in Reservation</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-5 h-5 text-gold" />
                          <span className="font-bold text-forest">Pickup Order</span>
                        </>
                      )}
                    </div>
                    
                    {orderType === 'dine-in' ? (
                      <div className="text-sm text-charcoal">
                        <p>Date: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <p>Time: {selectedTime}</p>
                        <p className="mt-2 text-charcoal-light">Please arrive within 15 minutes of your reservation time.</p>
                      </div>
                    ) : (
                      <div className="text-sm text-charcoal">
                        <p>Pickup Time: {pickupTime === 'ASAP' ? 'As soon as possible (20-30 min)' : pickupTime}</p>
                        <p className="mt-2 text-charcoal-light">Location: Zenzele Building, Hospital Road, Section 5, Madadeni</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Contact Details */}
                  <div className="p-4 bg-cream/50 rounded-xl">
                    <h3 className="font-bold text-forest mb-3">Contact Details</h3>
                    <div className="text-sm text-charcoal space-y-1">
                      <p>Name: {customerInfo.name}</p>
                      <p>Email: {customerInfo.email}</p>
                      <p>Phone: {customerInfo.phone}</p>
                      {customerInfo.specialInstructions && (
                        <p className="mt-2">
                          <span className="font-medium">Special Instructions:</span> {customerInfo.specialInstructions}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div>
                    <h3 className="font-bold text-forest mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-cream-dark">
                          <div>
                            <h4 className="font-semibold text-forest">{item.name}</h4>
                            <p className="text-sm text-charcoal-light">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                          <div className="font-bold text-forest">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Payment Method */}
                <div className="mt-8 p-6 border-2 border-gold/20 rounded-xl bg-gold/5">
                  <h3 className="font-bold text-forest mb-4">Payment Method</h3>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
                    <CreditCard className="w-6 h-6 text-gold" />
                    <div>
                      <p className="font-semibold text-forest">Simulated Payment</p>
                      <p className="text-sm text-charcoal-light">
                        No real payment required for this demonstration
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-charcoal-light mt-4">
                    This is a demonstration. No real payment will be processed.
                  </p>
                </div>
                
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border-2 border-forest text-forest hover:bg-forest hover:text-white font-bold rounded-full transition-colors"
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="px-8 py-3 bg-gold hover:bg-gold-light text-forest font-bold rounded-full transition-all shadow-lg hover:shadow-gold/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isProcessing ? (
                      'Processing...'
                    ) : orderType === 'dine-in' ? (
                      'Confirm Reservation & Pay'
                    ) : (
                      'Confirm Order & Pay'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Order Summary (Static) */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sticky top-24">
              <div className="mb-6">
                <AdinkraPattern className="w-full h-2 text-gold" />
              </div>
              
              <h2 className="text-xl font-bold text-forest mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-charcoal-light">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-charcoal-light">Tax (15% VAT)</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                
                <div className="pt-4 border-t border-cream-dark">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-forest">Total</span>
                    <span className="font-bold text-lg text-forest">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-light mt-2">
                    {items.length} item{items.length !== 1 ? 's' : ''} • {orderType === 'dine-in' ? 'Dine-in' : 'Pickup'}
                  </p>
                </div>
              </div>
              
              {/* Security Note */}
              <div className="mt-6 pt-6 border-t border-cream-dark">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-gold" />
                  <span className="text-charcoal-light">Secure Demo Transaction</span>
                </div>
              </div>
            </div>
            
            {/* Help Card */}
            <div className="bg-forest/5 rounded-2xl p-6">
              <h3 className="font-bold text-forest mb-3">Need Help?</h3>
              <p className="text-sm text-charcoal-light mb-4">
                Call us for assistance with your order or reservation
              </p>
              <a
                href="tel:+27734984451"
                className="inline-flex items-center gap-2 text-forest hover:text-gold font-medium"
              >
                <Phone className="w-4 h-4" />
                +27 73 498 4451
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}