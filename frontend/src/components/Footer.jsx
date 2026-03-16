import tsdigitalLogo from '../assets/tsdigital-logo.svg'
import versionData from '../../../version.json'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-6 flex-shrink-0">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Left Side - TSDigital Branding */}
        <div className="flex items-center gap-2">
          <img
            src={tsdigitalLogo}
            alt="TSDigital"
            className="w-6 h-6"
          />
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              Created with
              <span className="text-red-500 text-sm animate-pulse">❤️</span>
              by
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                TSDigital
              </span>
            </p>
            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © {currentYear}
            </p>
          </div>
        </div>

        {/* Right Side - Version */}
        <div className="text-right">
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
            v{versionData.version} • Build #{versionData.buildNumber}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
