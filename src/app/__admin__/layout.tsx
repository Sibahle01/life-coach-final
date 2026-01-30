export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple admin header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-green-700">
              Ubuntu Garden Admin
            </h1>
            <div className="flex gap-4">
              <a href="/admin/dashboard" className="text-gray-600 hover:text-green-700">
                Dashboard
              </a>
              <a href="/admin/menu" className="text-gray-600 hover:text-green-700">
                Menu
              </a>
              <a href="/" className="text-gray-600 hover:text-green-700">
                View Site
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <main>{children}</main>
      
      {/* Simple footer */}
      <footer className="mt-8 py-4 text-center text-sm text-gray-500 border-t">
        Admin Panel © {new Date().getFullYear()}
      </footer>
    </div>
  )
}