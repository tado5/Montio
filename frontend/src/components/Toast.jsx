import { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const Toast = ({ id, type = 'info', message, duration = 5000, onClose }) => {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  const Icon = icons[type];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 50));
        if (newProgress <= 0) {
          clearInterval(interval);
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  const typeStyles = {
    success: 'bg-emerald-500 dark:bg-emerald-600',
    error: 'bg-red-500 dark:bg-red-600',
    warning: 'bg-amber-500 dark:bg-amber-600',
    info: 'bg-blue-500 dark:bg-blue-600',
  };

  const iconBgStyles = {
    success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    error: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div
      className={`
        relative overflow-hidden w-full max-w-sm
        bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))]
        rounded-xl shadow-strong
        ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
      `}
      style={{
        animation: isExiting
          ? 'slideOutRight 0.3s ease-out forwards'
          : 'slideInRight 0.3s ease-out',
      }}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-[rgb(var(--color-bg-secondary))] w-full">
        <div
          className={`h-full transition-all duration-50 ${typeStyles[type]}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={`flex-shrink-0 p-2 rounded-lg ${iconBgStyles[type]}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Message */}
        <div className="flex-1 pt-0.5">
          <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-lg text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
