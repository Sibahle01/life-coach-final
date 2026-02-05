// File: /src/app/admin/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Import CalendarIcon
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
    />
  </svg>
)

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Don't show sidebar on login page
  const isLoginPage = pathname === '/admin/login'

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true')
    }
  }, [])

  useEffect(() => {
    if (!isLoginPage) {
      checkAuth()
    }
  }, [isLoginPage])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUserEmail(data.email || 'admin@lifecoach.co.za')
      }
    } catch (error) {
      console.error('Auth check error:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
  }

  if (isLoginPage) {
    return <div>{children}</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Collapsible */}
      <aside 
        className={`
          hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">LC</span>
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">Life Coach Pro</h1>
              <p className="text-xs text-gray-500 whitespace-nowrap">Admin Platform</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {/* Dashboard */}
          <NavLink
            href="/admin/dashboard"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
            label="Dashboard"
            collapsed={sidebarCollapsed}
            isActive={pathname === '/admin/dashboard'}
          />

          {/* Services */}
          <NavLink
            href="/admin/services"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            label="Coaching Services"
            collapsed={sidebarCollapsed}
            isActive={pathname?.startsWith('/admin/services')}
          />

          {/* Session Bookings */}
          <NavLink
            href="/admin/session-bookings"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            label="Session Bookings"
            collapsed={sidebarCollapsed}
            isActive={pathname?.startsWith('/admin/session-bookings')}
          />

          {/* Availability */}
          <NavLink
            href="/admin/availability"
            icon={<CalendarIcon className="w-5 h-5" />}
            label="Availability"
            collapsed={sidebarCollapsed}
            isActive={pathname === '/admin/availability'}
          />

          {/* Books Management */}
          <NavLink
            href="/admin/books"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            label="Books Shop"
            collapsed={sidebarCollapsed}
            isActive={pathname?.startsWith('/admin/books')}
          />

          {/* Book Orders */}
          <NavLink
            href="/admin/book-orders"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
            label="Book Orders"
            collapsed={sidebarCollapsed}
            isActive={pathname?.startsWith('/admin/book-orders')}
          />

          {/* Events Management */}
          <NavLink
            href="/admin/events"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            label="Events"
            collapsed={sidebarCollapsed}
            isActive={pathname?.startsWith('/admin/events')}
          />

          {/* Speaking Requests */}
          <NavLink
            href="/admin/speaking-requests"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            }
            label="Speaking Requests"
            collapsed={sidebarCollapsed}
            isActive={pathname?.startsWith('/admin/speaking-requests')}
          />

          {/* Separator */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <NavLink
              href="/"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              }
              label="View Public Site"
              collapsed={sidebarCollapsed}
              isActive={false}
              external
            />
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">AD</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">AD</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute top-20 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors z-10"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LC</span>
            </div>
            <span className="font-bold text-gray-900">Life Coach Pro</span>
          </div>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="px-4 py-4 border-t border-gray-200 bg-white">
            <nav className="space-y-1">
              <MobileNavLink href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} isActive={pathname === '/admin/dashboard'} icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              }>
                Dashboard
              </MobileNavLink>

              <MobileNavLink href="/admin/services" onClick={() => setMobileMenuOpen(false)} isActive={pathname?.startsWith('/admin/services')} icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }>
                Coaching Services
              </MobileNavLink>

              <MobileNavLink href="/admin/session-bookings" onClick={() => setMobileMenuOpen(false)} isActive={pathname?.startsWith('/admin/session-bookings')} icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }>
                Session Bookings
              </MobileNavLink>

              <MobileNavLink href="/admin/availability" onClick={() => setMobileMenuOpen(false)} isActive={pathname === '/admin/availability'} icon={<CalendarIcon className="w-5 h-5" />}>
                Availability
              </MobileNavLink>

              <MobileNavLink href="/admin/books" onClick={() => setMobileMenuOpen(false)} isActive={pathname?.startsWith('/admin/books')} icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }>
                Books Shop
              </MobileNavLink>

              <MobileNavLink href="/admin/book-orders" onClick={() => setMobileMenuOpen(false)} isActive={pathname?.startsWith('/admin/book-orders')} icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }>
                Book Orders
              </MobileNavLink>

              <MobileNavLink href="/admin/events" onClick={() => setMobileMenuOpen(false)} isActive={pathname?.startsWith('/admin/events')} icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }>
                Events
              </MobileNavLink>

              <MobileNavLink href="/admin/speaking-requests" onClick={() => setMobileMenuOpen(false)} isActive={pathname?.startsWith('/admin/speaking-requests')} icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              }>
                Speaking Requests
              </MobileNavLink>

              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Public Site
              </Link>
            </nav>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-3 px-4">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">AD</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - Adjusts based on sidebar state */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <main className="flex-1 pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  )
}

// NavLink Component for Desktop Sidebar
function NavLink({ 
  href, 
  icon, 
  label, 
  collapsed, 
  isActive,
  external = false
}: { 
  href: string
  icon: React.ReactNode
  label: string
  collapsed: boolean
  isActive: boolean
  external?: boolean
}) {
  const content = (
    <>
      <div className="flex-shrink-0">{icon}</div>
      {!collapsed && <span className="truncate">{label}</span>}
    </>
  )

  const className = `
    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
    ${collapsed ? 'justify-center' : ''}
    ${isActive
      ? 'bg-gray-100 text-gray-900 border-l-4 border-black'
      : 'text-gray-700 hover:bg-gray-50'
    }
  `

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={collapsed ? label : undefined}
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={className} title={collapsed ? label : undefined}>
      {content}
    </Link>
  )
}

// Mobile NavLink Component
function MobileNavLink({
  href,
  icon,
  children,
  isActive,
  onClick
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
        isActive
          ? 'bg-gray-100 text-gray-900 border-l-4 border-black'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon}
      {children}
    </Link>
  )
}