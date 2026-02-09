// src/components/layout/LayoutContent.tsx
'use client'

import { usePathname } from 'next/navigation'
import MobileNavigation from '@/components/layout/MobileNavigation'
import Footer from '@/components/layout/Footer'

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Check if current route is an admin route
  const isAdminRoute = pathname?.startsWith('/admin')

  // If admin route, render children only (no navbar, footer)
  if (isAdminRoute) {
    return <main className="min-h-screen bg-white">{children}</main>
  }

  // For public routes, render with navbar and footer
  return (
    <>
      <MobileNavigation />
      <main className="min-h-screen bg-white">
        {children}
      </main>
      <Footer />
    </>
  )
}