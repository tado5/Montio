import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

/**
 * Main Layout component
 * Combines Header, Sidebar, and Footer for consistent page structure
 *
 * Usage:
 * <Layout title="Dashboard" subtitle="Prehľad firmy" showSearch>
 *   <YourPageContent />
 * </Layout>
 */
const Layout = ({ children, title, subtitle, showSearch = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          title={title}
          subtitle={subtitle}
          showSearch={showSearch}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

export default Layout
