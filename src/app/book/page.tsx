import Link from 'next/link'
import { Calendar, Target, Users, Clock, Check } from 'lucide-react'

export default function BookPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Professional Life Coaching Sessions
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Transform your personal and professional life through expert guidance and structured coaching programs.
          </p>
          
          <Link 
            href="/book/flow"
            className="inline-flex items-center justify-center px-8 py-4 bg-black text-white text-lg font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
          >
            <Calendar className="mr-3 h-5 w-5" />
            Book Your Session
          </Link>
        </div>
      </div>

      {/* Services Overview */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Coaching Services
            </h2>
            <div className="w-24 h-1 bg-black mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-6">
                <div className="p-3 bg-gray-100 rounded-lg mr-4">
                  <Target className="h-6 w-6 text-gray-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Life Coaching
                  </h3>
                  <p className="text-gray-600">
                    One-on-one sessions focused on personal growth, career development, and achieving life goals.
                  </p>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center text-gray-700 mb-3">
                  <Clock className="h-4 w-4 mr-2" />
                  60-minute sessions
                </div>
                <div className="flex items-center text-gray-700">
                  <Check className="h-4 w-4 mr-2" />
                  Virtual or in-person options
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-6">
                <div className="p-3 bg-gray-100 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-gray-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Pre-Marital Counselling
                  </h3>
                  <p className="text-gray-600">
                    Structured guidance for couples preparing for marriage, focusing on communication and relationship foundations.
                  </p>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center text-gray-700 mb-3">
                  <Clock className="h-4 w-4 mr-2" />
                  90-minute sessions
                </div>
                <div className="flex items-center text-gray-700">
                  <Check className="h-4 w-4 mr-2" />
                  Couples-focused approach
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Process */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple Booking Process
            </h2>
            <p className="text-gray-600">
              Book your session in minutes, with instant confirmation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Choose Service</h3>
              <p className="text-gray-600 text-sm">
                Select from professional coaching services
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Select Time</h3>
              <p className="text-gray-600 text-sm">
                Pick from available time slots
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Confirm Booking</h3>
              <p className="text-gray-600 text-sm">
                Secure payment and instant confirmation
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/book/flow"
              className="inline-flex items-center px-8 py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Begin Booking Process
              <svg className="ml-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 px-4 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Client Success Stories
            </h2>
            <div className="w-24 h-1 bg-black mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-xl p-8">
              <div className="mb-4">
                <div className="text-black font-bold">Career Breakthrough</div>
                <div className="text-gray-600 text-sm mb-4">Senior Manager</div>
              </div>
              <p className="text-gray-700 italic">
                "The structured approach helped me achieve a promotion I'd been working toward for years. The clarity and accountability were invaluable."
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-8">
              <div className="mb-4">
                <div className="text-black font-bold">Relationship Foundation</div>
                <div className="text-gray-600 text-sm mb-4">Engaged Couple</div>
              </div>
              <p className="text-gray-700 italic">
                "Pre-marital counselling gave us tools to communicate effectively. We entered our marriage with confidence and understanding."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="bg-black py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Transform Your Life?
          </h3>
          <p className="text-gray-300 mb-8">
            Book your first session today and start your journey toward personal and professional growth.
          </p>
          <Link 
            href="/book/flow"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Book Session Now
          </Link>
        </div>
      </div>
    </div>
  )
}