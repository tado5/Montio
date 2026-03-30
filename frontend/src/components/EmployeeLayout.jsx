import { useState } from 'react'
import EmployeeHeader from './EmployeeHeader'
import EmployeeSidebar from './EmployeeSidebar'
import EmployeeFooter from './EmployeeFooter'

/**
 * Employee Layout component
 * Field Operations aesthetic for employees
 *
 * Usage:
 * <EmployeeLayout title="FIELD OPS" subtitle="Your tasks and schedule" showSearch>
 *   <YourPageContent />
 * </EmployeeLayout>
 */
const EmployeeLayout = ({ children, title, subtitle, showSearch = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className="flex h-screen bg-slate-950 overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.05) 1px, transparent 0),
          linear-gradient(to bottom, #020617, #0f172a)
        `,
        backgroundSize: '32px 32px, 100% 100%'
      }}
    >
      {/* Sidebar */}
      <EmployeeSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <EmployeeHeader
          title={title}
          subtitle={subtitle}
          showSearch={showSearch}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Page content with gradient overlay */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-950/50 to-transparent pointer-events-none"></div>

          <div className="relative px-4 md:px-6 lg:px-8 py-6 md:py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <EmployeeFooter />
      </div>
    </div>
  )
}

export default EmployeeLayout
