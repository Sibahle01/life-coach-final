// src/app/contact/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, MessageSquare, User, Send, ChevronDown, ChevronUp, Instagram, Facebook, Twitter } from 'lucide-react';
import { KentePattern, AdinkraPattern, ZigzagPattern, MudclothPattern } from '@/components/patterns/AfricanPatterns';

// FAQ data
const faqItems = [
  {
    question: 'Do I need a reservation?',
    answer: 'While walk-ins are welcome, we highly recommend making a reservation, especially on weekends and holidays. You can book online through our reservations page or call us directly.'
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'We kindly request at least 4 hours notice for cancellations. For large groups (8+), please provide 24 hours notice. Late cancellations may incur a fee.'
  },
  {
    question: 'Do you accommodate dietary restrictions?',
    answer: 'Yes! We offer vegetarian, vegan, and gluten-free options. Please inform us of any allergies or dietary requirements when making your reservation or ordering.'
  },
  {
    question: 'Is there parking available?',
    answer: 'Yes, we have dedicated parking spaces for our guests at the Zenzele Building. Valet parking is available on weekends.'
  },
  {
    question: 'Do you host private events?',
    answer: 'Absolutely! We host private dinners, celebrations, and corporate events. Contact us for special event packages and availability.'
  },
  {
    question: 'What is the dress code?',
    answer: 'Smart casual attire is appreciated. While we welcome all guests, we recommend avoiding overly casual wear like sportswear or beachwear.'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-forest-dark to-forest text-white pt-20 pb-12 sm:py-16 md:py-20">
        <div className="absolute inset-0 opacity-10">
          <KentePattern className="w-full h-full text-white" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <div className="flex justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <ZigzagPattern className="w-16 h-4 sm:w-20 sm:h-5 md:w-24 md:h-6 text-gold/40" />
              <AdinkraPattern className="w-16 h-4 sm:w-20 sm:h-5 md:w-24 md:h-6 text-gold/40" />
              <ZigzagPattern className="w-16 h-4 sm:w-20 sm:h-5 md:w-24 md:h-6 text-gold/40" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Connect With Us
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-cream/90 max-w-2xl mx-auto mb-6 sm:mb-8 font-serif leading-relaxed">
              Have questions, feedback, or special requests? We'd love to hear from you.
            </p>
            
            <div className="flex justify-center mt-6 sm:mt-8">
              <AdinkraPattern className="w-32 h-2 sm:w-40 md:w-48 text-gold" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="grid lg:grid-cols-3 gap-8 sm:gap-12">
          
          {/* Left Column - Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8"
            >
              <div className="mb-8">
                <ZigzagPattern className="w-full h-2 text-gold mb-6" />
                <h2 className="text-2xl sm:text-3xl font-bold text-forest mb-3">
                  Send Us a Message
                </h2>
                <p className="text-charcoal-light">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </div>
              
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 sm:py-12"
                >
                  <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-forest mb-3">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-charcoal-light mb-6 max-w-md mx-auto">
                    Thank you for reaching out. We've received your message and will respond as soon as possible.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-3 bg-forest hover:bg-forest-dark text-white font-bold rounded-full transition-colors"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-forest mb-2">
                        Your Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light w-5 h-5" />
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
                      <label className="block text-sm font-bold text-forest mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light w-5 h-5" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border-2 border-cream-dark rounded-xl focus:border-gold focus:outline-none transition-colors"
                          placeholder="+27 73 498 4451"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-forest mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light w-5 h-5" />
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
                    <label className="block text-sm font-bold text-forest mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-cream-dark rounded-xl focus:border-gold focus:outline-none transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="reservation">Reservation Inquiry</option>
                      <option value="feedback">Feedback</option>
                      <option value="event">Private Event</option>
                      <option value="dietary">Dietary Requirements</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-forest mb-2">
                      Your Message *
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 text-charcoal-light w-5 h-5" />
                      <textarea
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full pl-10 pr-4 py-3 border-2 border-cream-dark rounded-xl focus:border-gold focus:outline-none transition-colors resize-none"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gold hover:bg-gold-light text-forest font-bold py-4 rounded-full transition-all shadow-lg hover:shadow-gold/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </motion.div>
            
            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-8 sm:mt-12"
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-forest mb-6">
                  Frequently Asked Questions
                </h2>
                
                <div className="space-y-4">
                  {faqItems.map((faq, index) => (
                    <div key={index} className="border border-cream-dark rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between hover:bg-cream-light transition-colors"
                      >
                        <span className="text-left font-semibold text-forest text-sm sm:text-base">
                          {faq.question}
                        </span>
                        {openFaqIndex === index ? (
                          <ChevronUp className="w-5 h-5 text-gold flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gold flex-shrink-0" />
                        )}
                      </button>
                      
                      {openFaqIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 sm:px-6 pb-4 sm:pb-5"
                        >
                          <p className="text-charcoal-light text-sm sm:text-base leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Right Column - Map & Quick Info */}
          <div className="space-y-6 sm:space-y-8">
            
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden"
            >
              <div className="h-48 sm:h-64 bg-gradient-to-br from-forest-dark via-forest to-gold/20 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-1">Our Location</h3>
                    <p className="text-sm opacity-90">Newcastle, South Africa</p>
                  </div>
                </div>
                
                {/* Pattern overlay */}
                <div className="absolute bottom-0 left-0 right-0">
                  <MudclothPattern className="w-full h-3 text-white/10" />
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <h4 className="font-bold text-forest mb-3">How to Find Us</h4>
                <div className="space-y-2 text-sm text-charcoal">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                    <span>Zenzele Building, Hospital Road, Section 5, Madadeni, Newcastle</span>
                  </p>
                  <p className="text-xs text-charcoal-light mt-3">
                    Free parking available • Wheelchair accessible • Public transport nearby
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Quick Contact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-forest text-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8"
            >
              <div className="mb-6">
                <AdinkraPattern className="w-full h-2 text-gold/30" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold mb-6">Quick Contact</h3>
              
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="w-5 h-5 text-gold" />
                    <p className="text-sm text-cream/70">Phone</p>
                  </div>
                  <a href="tel:+27734984451" className="font-semibold hover:text-gold transition-colors block">
                    +27 73 498 4451
                  </a>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-gold" />
                    <p className="text-sm text-cream/70">Email</p>
                  </div>
                  <a href="mailto:kkhuzwayo@ymail.com" className="font-semibold hover:text-gold transition-colors block text-sm">
                    kkhuzwayo@ymail.com
                  </a>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-gold" />
                    <p className="text-sm text-cream/70">Hours</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold">Mon-Thu: 4PM-11PM</p>
                    <p className="font-semibold">Fri-Sat: 4PM-12AM</p>
                    <p className="font-semibold">Sun: 4PM-10PM</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Social Media */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-forest/10 to-gold/10 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-forest mb-6">Follow Our Journey</h3>
              
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <a
                  href="#"
                  className="bg-white hover:bg-forest group rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all"
                >
                  <Instagram className="w-6 h-6 text-forest group-hover:text-white mx-auto mb-2" />
                  <span className="text-xs font-medium text-forest group-hover:text-white">
                    Instagram
                  </span>
                </a>
                
                <a
                  href="#"
                  className="bg-white hover:bg-forest group rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all"
                >
                  <Facebook className="w-6 h-6 text-forest group-hover:text-white mx-auto mb-2" />
                  <span className="text-xs font-medium text-forest group-hover:text-white">
                    Facebook
                  </span>
                </a>
                
                <a
                  href="#"
                  className="bg-white hover:bg-forest group rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all"
                >
                  <Twitter className="w-6 h-6 text-forest group-hover:text-white mx-auto mb-2" />
                  <span className="text-xs font-medium text-forest group-hover:text-white">
                    Twitter
                  </span>
                </a>
              </div>
              
              <p className="text-sm text-charcoal-light mt-6">
                Follow us for updates, special offers, and behind-the-scenes glimpses of Ubuntu.
              </p>
            </motion.div>
            
            {/* Emergency Contact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-gold/20 to-forest/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8"
            >
              <h3 className="text-lg sm:text-xl font-bold text-forest mb-3">Need Immediate Assistance?</h3>
              <p className="text-sm text-charcoal-light mb-4">
                For urgent matters regarding existing reservations, please call us directly.
              </p>
              <a
                href="tel:+27734984451"
                className="inline-flex items-center gap-2 bg-forest hover:bg-forest-dark text-white font-bold px-4 py-3 rounded-full transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                Call Now: +27 73 498 4451
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}