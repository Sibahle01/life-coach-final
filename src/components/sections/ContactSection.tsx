// src/components/sections/ContactSection.tsx
'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
            Get In Touch
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ready to start your spiritual journey? Reach out today.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
              <Mail className="text-gray-700" size={20} />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Email</h3>
            <a href="mailto:pastor@example.com" className="text-gray-600 hover:text-gray-900">
              pastor@example.com
            </a>
          </div>
          
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
              <Phone className="text-gray-700" size={20} />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Phone</h3>
            <a href="tel:+27123456789" className="text-gray-600 hover:text-gray-900">
              +27 12 345 6789
            </a>
          </div>
          
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
              <MapPin className="text-gray-700" size={20} />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Based In</h3>
            <p className="text-gray-600">Johannesburg, South Africa</p>
          </div>
        </div>
      </div>
    </section>
  );
}