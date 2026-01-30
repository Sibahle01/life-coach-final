// src/app/reservations/page.tsx
'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, Phone, Mail, User, MessageSquare, CheckCircle, AlertCircle, MapPin, Info, ShoppingBag } from 'lucide-react';
import { KentePattern, AdinkraPattern, ZigzagPattern } from '@/components/patterns/AfricanPatterns';
import { useCart } from '@/contexts/CartContext';

// Create a separate component for the form that uses useSearchParams
function ReservationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCart = searchParams.get('fromCart') === 'true';
  const { items, setOrderType } = useCart();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    guests: '2',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    occasion: '',
    specialRequests: '',
    dietaryRestrictions: ''
  });

  const [availability, setAvailability] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Cart Integration Effect
  useEffect(() => {
    if (fromCart && items.length > 0) {
      setOrderType('dine-in');
    }
  }, [fromCart, items.length]);

  // Get minimum bookable date (today + 2 hours)
  const getMinDate = () => {
    const now = new Date();
    const minDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    return minDate.toISOString().split('T')[0];
  };

  // Get max bookable date (90 days ahead)
  const getMaxDate = () => {
    const now = new Date();
    const maxDate = new Date(now.setDate(now.getDate() + 90));
    return maxDate.toISOString().split('T')[0];
  };

  // Generate time slots based on day
  const getAvailableTimeSlots = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    
    // Monday-Thursday: 4PM-11PM, Friday-Saturday: 4PM-12AM, Sunday: 4PM-10PM
    const slots = [];
    let endHour = 23; // 11PM default
    
    if (dayOfWeek === 5 || dayOfWeek === 6) endHour = 24; // Fri/Sat until 12AM
    if (dayOfWeek === 0) endHour = 22; // Sunday until 10PM
    
    for (let hour = 16; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < endHour - 1) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return slots;
  };

  // Check availability (simulated)
  const checkAvailability = async () => {
    if (!formData.date || !formData.time || !formData.guests) return;
    
    setIsChecking(true);
    
    // Simulate API call
    setTimeout(() => {
      const guests = parseInt(formData.guests);
      const available = guests <= 12; // Simplified logic
      
      setAvailability({
        available,
        alternativeTimes: available ? [] : ['18:30', '19:00', '20:30'],
        tablesAvailable: available ? Math.floor(Math.random() * 5) + 1 : 0
      });
      
      setIsChecking(false);
      if (available) setStep(2);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    if (!formData.name || !formData.email || !formData.phone) return;
    
    setIsChecking(true);
    
    try {
      // Send reservation to your API
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          reservationDate: formData.date,
          time: formData.time,
          partySize: formData.guests,
          specialRequests: formData.specialRequests || '',
          occasion: formData.occasion || '',
        }),
      });

      if (response.ok) {
        const reservation = await response.json();
        console.log('Reservation created:', reservation);
        setIsSubmitted(true);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create reservation'}`);
      }
    } catch (error) {
      console.error('Reservation error:', error);
      alert('Failed to create reservation. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Success screen
  if (isSubmitted) {
    const primaryActionButton = fromCart && items.length > 0 ? (
      <button
        onClick={() => router.push('/checkout?fromReservation=true')}
        className="w-full px-6 py-4 bg-gold hover:bg-gold-light text-forest font-bold rounded-full transition-all shadow-lg hover:shadow-gold/30 text-lg"
      >
        Proceed to Checkout with Your Order
      </button>
    ) : (
      <button
        onClick={() => {
          setIsSubmitted(false);
          setStep(1);
          setFormData({
            guests: '2',
            date: '',
            time: '',
            name: '',
            email: '',
            phone: '',
            occasion: '',
            specialRequests: '',
            dietaryRestrictions: ''
          });
        }}
        className="w-full px-6 py-4 bg-forest hover:bg-forest-dark text-white font-bold rounded-full transition-colors text-lg"
      >
        Make Another Reservation
      </button>
    );

    return (
      <div className="min-h-screen bg-cream pb-24">
        <div className="max-w-3xl mx-auto px-4 pt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* African pattern header */}
            <div className="bg-forest p-1">
              <KentePattern className="w-full h-3 text-gold" />
            </div>
            
            <div className="p-8 md:p-12 text-center">
              <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} className="text-gold" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-forest mb-4">
                Ubuntu Awaits You!
              </h1>
              
              <p className="text-lg text-charcoal-light mb-8">
                Your table has been reserved, {formData.name.split(' ')[0]}.
              </p>
              
              {/* Reservation details with African border */}
              <div className="bg-cream/50 rounded-2xl p-6 mb-8 border-2 border-gold/20 relative">
                <div className="absolute top-0 left-0 right-0">
                  <ZigzagPattern className="w-full h-2 text-gold/30" />
                </div>
                
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between py-2 border-b border-cream-dark">
                    <span className="text-charcoal-light flex items-center gap-2">
                      <Calendar size={18} />
                      Date
                    </span>
                    <span className="font-semibold text-forest">
                      {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-cream-dark">
                    <span className="text-charcoal-light flex items-center gap-2">
                      <Clock size={18} />
                      Time
                    </span>
                    <span className="font-semibold text-forest">{formData.time}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-cream-dark">
                    <span className="text-charcoal-light flex items-center gap-2">
                      <Users size={18} />
                      Party Size
                    </span>
                    <span className="font-semibold text-forest">
                      {formData.guests} {parseInt(formData.guests) === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-charcoal-light flex items-center gap-2">
                      <Mail size={18} />
                      Confirmation
                    </span>
                    <span className="font-semibold text-forest">{formData.email}</span>
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 rotate-180">
                  <ZigzagPattern className="w-full h-2 text-gold/30" />
                </div>
              </div>
              
              {/* Important notes */}
              <div className="bg-forest/5 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-bold text-forest mb-3 flex items-center gap-2">
                  <Info size={20} />
                  Important Information
                </h3>
                <ul className="space-y-2 text-sm text-charcoal">
                  <li>• Confirmation email sent to {formData.email}</li>
                  <li>• Please arrive within 15 minutes of your reservation time</li>
                  <li>• Cancellations must be made at least 4 hours in advance</li>
                  <li>• Call us at +27 123 456 789 if you need to modify your booking</li>
                </ul>
              </div>
              
              {/* Primary action button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {primaryActionButton}
                
                <a
                  href="tel:+27123456789"
                  className="px-6 py-3 border-2 border-forest text-forest hover:bg-forest hover:text-white font-bold rounded-full transition-colors"
                >
                  Call Restaurant
                </a>
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
    <div className="min-h-screen bg-cream pb-24">
      {/* Hero with African patterns */}
      <div className="relative bg-gradient-to-br from-forest via-forest-dark to-forest text-white pt-24 pb-12 md:pt-28 md:pb-16 mb-12">
        <div className="absolute top-0 left-0 right-0">
          <AdinkraPattern className="w-full h-12 text-gold/20" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Reserve Your Experience
            </h1>
            <p className="text-xl text-cream/90 max-w-2xl mx-auto mb-6">
              Secure your table at Ubuntu Garden Lounge for an authentic African dining journey
            </p>
            
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-gold' : 'text-cream/40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? 'border-gold bg-gold text-forest' : 'border-cream/40'}`}>
                  1
                </div>
                <span className="hidden sm:inline text-sm font-medium">Date & Time</span>
              </div>
              
              <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-gold' : 'bg-cream/40'}`} />
              
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-gold' : 'text-cream/40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 2 ? 'border-gold bg-gold text-forest' : 'border-cream/40'}`}>
                  2
                </div>
                <span className="hidden sm:inline text-sm font-medium">Your Details</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 rotate-180">
          <AdinkraPattern className="w-full h-12 text-gold/20" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Reservation Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl shadow-xl p-6 md:p-8"
                >
                  {/* Cart notification */}
                  {fromCart && items.length > 0 && (
                    <div className="mb-6 p-4 bg-gold/10 rounded-xl border border-gold/20">
                      <div className="flex items-start gap-3">
                        <ShoppingBag className="w-5 h-5 text-gold flex-shrink-0" />
                        <div>
                          <p className="font-medium text-forest">Dine-in Order Ready</p>
                          <p className="text-sm text-charcoal-light mt-1">
                            You have {items.length} item{items.length > 1 ? 's' : ''} in your cart. 
                            After booking your table, you'll proceed to checkout to confirm your pre-order.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <KentePattern className="w-full h-2 text-forest mb-6" />
                    <h2 className="text-2xl md:text-3xl font-bold text-forest mb-2">
                      Select Date & Time
                    </h2>
                    <p className="text-charcoal-light">
                      Choose your preferred dining time. We're open daily from 4PM.
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Party Size */}
                    <div>
                      <label className="block text-sm font-bold text-forest mb-3">
                        Party Size *
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setFormData({ ...formData, guests: num.toString() })}
                            className={`py-3 rounded-xl font-semibold transition-all ${
                              formData.guests === num.toString()
                                ? 'bg-gold text-forest shadow-lg scale-105'
                                : 'bg-cream hover:bg-cream-dark text-charcoal'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-charcoal-light mt-2">
                        For parties of 13+, please call us directly at +27 123 456 789
                      </p>
                    </div>

                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-bold text-forest mb-3">
                        Reservation Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light pointer-events-none" size={20} />
                        <input
                          type="date"
                          name="date"
                          required
                          min={getMinDate()}
                          max={getMaxDate()}
                          value={formData.date}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 border-2 border-cream-dark rounded-xl focus:border-gold focus:outline-none transition-colors text-lg"
                        />
                      </div>
                    </div>

                    {/* Time Selection */}
                    {formData.date && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <label className="block text-sm font-bold text-forest mb-3">
                          Preferred Time *
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                          {getAvailableTimeSlots(formData.date).map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setFormData({ ...formData, time: slot })}
                              className={`py-3 rounded-xl font-semibold transition-all ${
                                formData.time === slot
                                  ? 'bg-gold text-forest shadow-lg scale-105'
                                  : 'bg-cream hover:bg-cream-dark text-charcoal'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Check Availability Button */}
                    <button
                      onClick={checkAvailability}
                      disabled={!formData.date || !formData.time || isChecking}
                      className="w-full bg-gold hover:bg-gold-light disabled:bg-cream-dark disabled:cursor-not-allowed text-forest font-bold py-4 rounded-full transition-all shadow-lg hover:shadow-gold/30 text-lg"
                    >
                      {isChecking ? 'Checking Availability...' : 'Check Availability'}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl shadow-xl p-6 md:p-8"
                >
                  <div className="mb-6">
                    <KentePattern className="w-full h-2 text-forest mb-6" />
                    <h2 className="text-2xl md:text-3xl font-bold text-forest mb-2">
                      Your Information
                    </h2>
                    <p className="text-charcoal-light">
                      Complete your reservation details below.
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Personal Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-forest mb-2">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light" size={20} />
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
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
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border-2 border-cream-dark rounded-xl focus:border-gold focus:outline-none transition-colors"
                            placeholder="+27 123 456 789"
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
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border-2 border-cream-dark rounded-xl focus:border-gold focus:outline-none transition-colors"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-forest mb-2">Occasion (Optional)</label>
                      <select
                        name="occasion"
                        value={formData.occasion}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-cream-dark rounded-xl focus:border-gold focus:outline-none transition-colors"
                      >
                        <option value="">Select an occasion</option>
                        <option value="birthday">Birthday</option>
                        <option value="anniversary">Anniversary</option>
                        <option value="business">Business Dinner</option>
                        <option value="date">Date Night</option>
                        <option value="celebration">Celebration</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-forest mb-2">
                        Special Requests (Optional)
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 text-charcoal-light" size={20} />
                        <textarea
                          name="specialRequests"
                          value={formData.specialRequests}
                          onChange={handleChange}
                          rows={3}
                          className="w-full pl-10 pr-4 py-3 border-2 border-cream-dark rounded-xl focus:border-gold focus:outline-none transition-colors resize-none"
                          placeholder="Dietary requirements, seating preferences, celebrations..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 bg-cream hover:bg-cream-dark text-charcoal font-bold py-4 rounded-full transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isChecking}
                        className="flex-1 bg-gold hover:bg-gold-light text-forest font-bold py-4 rounded-full transition-all shadow-lg hover:shadow-gold/30 disabled:opacity-50"
                      >
                        {isChecking ? 'Processing...' : 'Confirm Reservation'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hours */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <ZigzagPattern className="w-full h-2 text-gold mb-4" />
              <h3 className="text-xl font-bold text-forest mb-4">Opening Hours</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-light">Mon - Thu</span>
                  <span className="font-semibold text-forest">4PM - 11PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-light">Fri - Sat</span>
                  <span className="font-semibold text-forest">4PM - 12AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-light">Sunday</span>
                  <span className="font-semibold text-forest">4PM - 10PM</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-forest text-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Need Assistance?</h3>
              <div className="space-y-4">
                <a href="tel:+27123456789" className="flex items-center gap-3 hover:text-gold transition-colors">
                  <Phone size={20} />
                  <div>
                    <p className="text-xs text-cream/70">Call Us</p>
                    <p className="font-semibold">+27 123 456 789</p>
                  </div>
                </a>
                <a href="mailto:reservations@ubuntu.co.za" className="flex items-center gap-3 hover:text-gold transition-colors">
                  <Mail size={20} />
                  <div>
                    <p className="text-xs text-cream/70">Email</p>
                    <p className="font-semibold text-sm">reservations@ubuntu.co.za</p>
                  </div>
                </a>
                <div className="flex items-center gap-3">
                  <MapPin size={20} />
                  <div>
                    <p className="text-xs text-cream/70">Location</p>
                    <p className="font-semibold text-sm">Johannesburg, SA</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy */}
            <div className="bg-cream-dark rounded-2xl p-6">
              <h3 className="text-lg font-bold text-forest mb-3">Reservation Policy</h3>
              <ul className="space-y-2 text-sm text-charcoal">
                <li>• Tables held for 15 minutes past reservation time</li>
                <li>• Cancellations 4+ hours in advance</li>
                <li>• Groups of 13+ please call directly</li>
                <li>• Smart casual dress code appreciated</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component
export default function ReservationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-forest font-medium">Loading reservation system...</p>
      </div>
    </div>}>
      <ReservationForm />
    </Suspense>
  );
}