// File: /src/app/(public)/about/page.tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Heart, 
  BookOpen, 
  Users, 
  Mic, 
  Calendar,
  MapPin,
  Award,
  Target,
  ChevronRight,
  Quote,
  Sparkles,
  Clock,
  Globe,
  Coffee
} from 'lucide-react'

export default function AboutPage() {
  const milestones = [
    { year: 2008, title: "Ordained Minister", description: "Called to serve and lead" },
    { year: 2010, title: "Began Coaching", description: "First one-on-one sessions" },
    { year: 2015, title: "Published First Book", description: "Circle of Seven" },
    { year: 2018, title: "International Speaking", description: "Africa, Europe, USA" },
    { year: 2021, title: "Online Academy", description: "Digital courses launched" },
    { year: 2024, title: "15,000+ Lives", description: "Global impact milestone" }
  ]

  const values = [
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Faith-Centered",
      description: "Every teaching rooted in biblical truth and practical application"
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Purpose-Driven",
      description: "Guiding individuals to discover and fulfill their divine calling"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Relational",
      description: "Building authentic connections that foster lasting transformation"
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: "Excellence",
      description: "Committed to the highest standard in coaching and content"
    }
  ]

  const stats = [
    { value: "16", label: "Years", suffix: "+" },
    { value: "3,500", label: "Lives Coached", suffix: "+" },
    { value: "120", label: "Events", suffix: "+" },
    { value: "5", label: "Books", suffix: "" },
    { value: "15", label: "Countries", suffix: "" },
    { value: "2,500", label: "Coaching Hours", suffix: "+" }
  ]

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
        
        {/* ===== HERO SECTION ===== */}
        <div className="mb-16 md:mb-24">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <span className="text-gray-900">About</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-[2px] w-8 bg-black" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-600 font-light">
                  My Story
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-6 leading-tight">
                Sifiso<span className="font-serif italic text-gray-700 mx-2">Nkabinde</span>
              </h1>
              
              <div className="space-y-5 text-gray-700 font-light leading-relaxed">
                <p className="text-base md:text-lg">
                  For <span className="font-medium text-gray-900">16 years</span>, I've walked alongside individuals, 
                  couples, and leaders, helping them discover the intersection between 
                  their faith and their life's purpose.
                </p>
                <p className="text-base md:text-lg">
                  My journey began not in a boardroom, but in the quiet moments of 
                  pastoral ministry—counselling sessions, late-night calls, and the 
                  privilege of witnessing God transform brokenness into beauty. It was 
                  there I realized that <span className="font-medium text-gray-900">spiritual clarity</span> and 
                  <span className="font-medium text-gray-900">practical direction</span> must go hand in hand.
                </p>
                <p className="text-base md:text-lg">
                  Today, through coaching, books, and events, I equip individuals to 
                  move from where they are to where God is calling them to be—with 
                  clarity, confidence, and conviction.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-all active:scale-95"
                >
                  <span>Work With Me</span>
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href="/books"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 text-sm border border-gray-300 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-all active:scale-95"
                >
                  <BookOpen size={16} />
                  <span>Browse Books</span>
                </Link>
              </div>
            </motion.div>

            {/* Right: Image/Quote */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
                {/* Replace with actual image when available */}
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
                    <Quote size={32} className="text-gray-700 rotate-180" />
                  </div>
                  <blockquote className="text-xl md:text-2xl font-light text-gray-900 mb-6 leading-relaxed">
                    "Your calling is not just about what you do—it's about who you become."
                  </blockquote>
                  <div className="w-12 h-[2px] bg-black/30 mb-4" />
                  <p className="text-sm text-gray-600 font-medium">
                    — Pastor Sifiso Nkabinde
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    16 Years of Ministry
                  </p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-black/5 rounded-full -z-10" />
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-black/5 rounded-full -z-10" />
            </motion.div>
          </div>
        </div>

        {/* ===== STATS SECTION ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 md:mb-28"
        >
          <div className="bg-black rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl lg:text-4xl font-light text-white mb-1">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-[10px] md:text-xs text-white/60 uppercase tracking-[0.2em] font-light">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ===== THE CALLING ===== */}
        <div className="mb-20 md:mb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-[2px] w-8 bg-black" />
                <span className="text-xs uppercase tracking-[0.2em] text-gray-600 font-light">
                  The Calling
                </span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-6 leading-tight">
                From the Pulpit to the<span className="block font-serif italic text-gray-700 mt-2">Coaching Room</span>
              </h2>
              
              <div className="space-y-4 text-gray-700 font-light leading-relaxed">
                <p>
                  In 2008, I stood before my first congregation—nervous, eager, and 
                  deeply aware of the weight of pastoral responsibility. What I didn't 
                  anticipate was how many people would stay after the service, not for 
                  prayer, but for guidance on career decisions, marriage struggles, and 
                  life transitions.
                </p>
                <p>
                  <span className="font-medium text-gray-900">"Pastor, I know God has a plan—but how do I actually find it?"</span>
                </p>
                <p>
                  That question became the seed of my coaching ministry. I realized that 
                  while Sunday sermons feed the spirit, Monday decisions require practical 
                  wisdom. Over the next decade, I developed a framework that bridges 
                  biblical truth with behavioral science, spiritual formation with 
                  strategic planning.
                </p>
                <p>
                  Today, that framework has helped thousands move from confusion to 
                  clarity, from stagnation to momentum, from surviving to thriving.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <Clock size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">16 Years of Ministry</h3>
                    <p className="text-xs text-gray-500">2008 — Present</p>
                  </div>
                </div>
                
                {/* Timeline */}
                <div className="space-y-5">
                  {milestones.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative flex flex-col items-center">
                        <div className="w-2 h-2 bg-black rounded-full mt-1.5" />
                        {index < milestones.length - 1 && (
                          <div className="absolute top-3.5 bottom-0 w-px h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-5">
                        <div className="text-xs font-medium text-gray-900 mb-0.5">
                          {item.year}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ===== VALUES ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 md:mb-28"
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-[2px] w-8 bg-black" />
              <span className="text-xs uppercase tracking-[0.2em] text-gray-600 font-light">
                What I Believe
              </span>
              <div className="h-[2px] w-8 bg-black" />
            </div>
            <h2 className="text-2xl md:text-3xl font-light text-gray-900">
              Principles That Guide My Work
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center mb-4">
                  <div className="text-gray-700">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-xs text-gray-600 font-light leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ===== TESTIMONIAL ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 md:mb-28"
        >
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <Quote size={40} className="text-gray-300 mx-auto mb-6" />
              <blockquote className="text-xl md:text-2xl font-light text-gray-900 mb-6 leading-relaxed">
                "Pastor Sifiso doesn't just tell you what to do—he helps you discover 
                who you are. His coaching gave me the clarity I'd been praying for 
                for years. In six sessions, I found direction that had eluded me for 
                a decade."
              </blockquote>
              <div className="w-16 h-[2px] bg-black/20 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-900">
                — Thabo M.
              </p>
              <p className="text-xs text-gray-500">
                Coaching Client, Johannesburg
              </p>
            </div>
          </div>
        </motion.div>

        {/* ===== CALL TO ACTION ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-black rounded-2xl p-8 md:p-12 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
            Ready to Discover Your Purpose?
          </h2>
          <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto mb-8 font-light">
            Whether through coaching, a workshop, or one of my books—I'd be honored 
            to walk with you on your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-sm rounded-lg hover:bg-gray-100 transition-all active:scale-95"
            >
              <span>Book a Session</span>
              <ChevronRight size={16} />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent text-white text-sm border border-white/30 rounded-lg hover:bg-white/10 transition-all active:scale-95"
            >
              <Calendar size={16} />
              <span>View Upcoming Events</span>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  )
}