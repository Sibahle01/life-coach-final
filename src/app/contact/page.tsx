// File: /src/app/(public)/contact/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Clock,
  MessageCircle,
  Send,
  ChevronRight,
  Heart,
  Users,
  BookOpen,
  Mic,
  CheckCircle,
  AlertCircle,
  Coffee,
  Globe
} from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: ''
  })

  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true)
      setSubmitting(false)
    }, 1500)
  }

  const inquiryTypes = [
    { value: 'coaching', label: '1-on-1 Coaching' },
    { value: 'speaking', label: 'Speaking Engagement' },
    { value: 'workshop', label: 'Group Workshop' },
    { value: 'media', label: 'Media & Interview' },
    { value: 'general', label: 'General Inquiry' }
  ]

  const contactMethods = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email",
      details: "sfiso.nkabinde07@gmail.com",
      response: "Response within 24 hours",
      action: "mailto:sfiso.nkabinde07@gmail.com"
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Phone",
      details: "+27 (0) 71 482 9894",
      response: "Weekdays 9am - 5pm",
      action: "tel:+27714829894"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Office",
      details: "Johannesburg, South Africa",
      response: "By appointment only",
      action: "#"
    }
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-8 md:p-12 max-w-lg mx-auto text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <CheckCircle size={28} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-3">
              Message Sent
            </h1>
            
            <p className="text-gray-600 text-sm mb-6 font-light">
              Thank you for reaching out, {formData.name.split(' ')[0] || 'friend'}. 
              I'll personally read your message and get back to you within 24 hours.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Heart size={16} className="text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-900 mb-1">
                    What happens next?
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-1.5">
                      <span className="text-gray-400">1.</span>
                      <span>I'll read your message personally</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-gray-400">2.</span>
                      <span>You'll receive an email response within 24h</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-gray-400">3.</span>
                      <span>If urgent, I'll call you directly</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="px-5 py-2.5 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
              >
                Return Home
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    inquiryType: '',
                    message: ''
                  })
                }}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16">
        
        {/* ===== HEADER ===== */}
        <div className="mb-10">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Contact</span>
          </div>
          
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-4 leading-tight">
              Let's<span className="font-serif italic text-gray-700 mx-2">Connect</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 font-light max-w-2xl">
              Whether you're seeking coaching, booking a speaking engagement, or simply 
              want to say hello—I'd love to hear from you. Every message is read personally.
            </p>
          </div>
        </div>

        {/* ===== CONTACT METHODS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {contactMethods.map((method, index) => (
            <motion.a
              key={index}
              href={method.action}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center group-hover:bg-black/10 transition-colors">
                  <div className="text-gray-700">
                    {method.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    {method.title}
                  </h3>
                  <p className="text-xs text-gray-900 mb-1 break-all">
                    {method.details}
                  </p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Clock size={10} />
                    {method.response}
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* ===== MAIN CONTACT SECTION ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* LEFT: Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-[2px] w-6 bg-black" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-600 font-light">
                  Send a Message
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                    Full Name <span className="text-gray-900">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email & Phone - Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                      Email <span className="text-gray-900">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                      Phone <span className="text-gray-300 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                      placeholder="+27 82 123 4567"
                    />
                  </div>
                </div>

                {/* Inquiry Type */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                    What are you reaching out about? <span className="text-gray-900">*</span>
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900"
                  >
                    <option value="" disabled>Select an option</option>
                    {inquiryTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                    Your Message <span className="text-gray-900">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                    placeholder="Tell me about your coaching needs, speaking request, or question..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full md:w-auto px-8 py-3.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-500 mt-3">
                    I typically respond within 24 hours. For urgent matters, please call.
                  </p>
                </div>
              </form>
            </motion.div>
          </div>

          {/* RIGHT: Availability & Personal Note */}
          <div className="lg:col-span-1">
            <div className="space-y-5">
              {/* Availability Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center">
                    <Calendar size={18} className="text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Coaching Availability</h3>
                    <p className="text-[10px] text-gray-500">Limited slots available</p>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Monday - Thursday</span>
                    <span className="font-medium text-gray-900">9am - 5pm</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Friday</span>
                    <span className="font-medium text-gray-900">9am - 2pm</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Saturday - Sunday</span>
                    <span className="font-medium text-gray-900">Closed</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-start gap-2">
                    <Clock size={12} className="text-gray-400 mt-0.5" />
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      All times are SAST (UTC+2). Virtual sessions available worldwide.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Personal Note Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-black rounded-2xl p-6 text-white"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Heart size={16} className="text-white/80" />
                  <span className="text-xs uppercase tracking-[0.2em] text-white/60 font-light">
                    A Personal Note
                  </span>
                </div>

                <p className="text-sm font-light text-white/90 leading-relaxed mb-4">
                  "I personally read every message that comes through this site. 
                  Whether you're seeking guidance or just exploring, I'm grateful 
                  you're here and will respond as soon as I can."
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <Coffee size={14} className="text-white/80" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">
                      Pastor Sifiso Nkabinde
                    </p>
                    <p className="text-[9px] text-white/50">
                      Response within 24 hours
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white border border-gray-200 rounded-2xl p-5"
              >
                <h3 className="text-xs font-medium text-gray-900 mb-3 uppercase tracking-wide">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link 
                    href="/books"
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-gray-500" />
                      <span className="text-xs text-gray-700">Browse Books</span>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </Link>
                  <Link 
                    href="/events"
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-500" />
                      <span className="text-xs text-gray-700">Upcoming Events</span>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </Link>
                  <Link 
                    href="/speaking"
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Mic size={14} className="text-gray-500" />
                      <span className="text-xs text-gray-700">Speaking Engagements</span>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ===== OFFICE LOCATION ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 pt-8 border-t border-gray-200"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center">
                <Globe size={18} className="text-gray-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-light">Serving clients</p>
                <p className="text-sm font-medium text-gray-900">Worldwide • Virtual & In-Person</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin size={14} />
              <span>Based in Johannesburg, South Africa</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}