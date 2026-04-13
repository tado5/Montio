import { useState } from 'react'
import CompanyAdminHeader from './CompanyAdminHeader'
import CompanyAdminSidebar from './CompanyAdminSidebar'
import CompanyAdminFooter from './CompanyAdminFooter'

/**
 * Company Admin Layout component
 * Operations Control aesthetic for company administrators
 *
 * Usage:
 * <CompanyAdminLayout title="OPERATIONS HUB" subtitle="Managing company workflow" showSearch>
 *   <YourPageContent />
 * </CompanyAdminLayout>
 */
const CompanyAdminLayout = ({ children, title, subtitle, showSearch = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className="flex h-screen bg-slate-950 overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.05) 1px, transparent 0),
          linear-gradient(to bottom, #020617, #0f172a)
        `,
        backgroundSize: '32px 32px, 100% 100%'
      }}
    >
      {/* Sidebar */}
      <CompanyAdminSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <CompanyAdminHeader
          title={title}
          subtitle={subtitle}
          showSearch={showSearch}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Page content with gradient overlay */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-950/50 to-transparent pointer-events-none"></div>

          <div className="relative px-3 md:px-5 lg:px-6 py-4 md:py-5 lg:py-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <CompanyAdminFooter />
      </div>
    </div>
  )
}

export default CompanyAdminLayout
