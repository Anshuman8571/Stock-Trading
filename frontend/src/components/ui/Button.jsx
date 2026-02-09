import { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * Button Component
 * 
 * Professional button with multiple variants, sizes, and states
 * 
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline'} props.variant - Button style variant
 * @param {'xs' | 'sm' | 'md' | 'lg' | 'xl'} props.size - Button size
 * @param {boolean} props.loading - Show loading spinner
 * @param {boolean} props.disabled - Disable button
 * @param {boolean} props.fullWidth - Take full width of container
 * @param {React.ReactNode} props.leftIcon - Icon to show on left
 * @param {React.ReactNode} props.rightIcon - Icon to show on right
 * @param {React.ReactNode} props.children - Button content
 */
const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}, ref) => {
  // Base styles (always applied)
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-primary';

  // Variant styles
  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600',
    
    secondary: 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-dark-border-accent shadow-sm focus:ring-gray-500',
    
    success: 'bg-profit-600 text-white hover:bg-profit-700 active:bg-profit-800 shadow-sm hover:shadow-glow-green focus:ring-profit-500 dark:bg-profit-500 dark:hover:bg-profit-600',
    
    danger: 'bg-loss-600 text-white hover:bg-loss-700 active:bg-loss-800 shadow-sm hover:shadow-glow-red focus:ring-loss-500 dark:bg-loss-500 dark:hover:bg-loss-600',
    
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-primary focus:ring-gray-500',
    
    outline: 'bg-transparent border-2 border-gray-300 dark:border-dark-border-primary text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary focus:ring-gray-500',
  };

  // Size styles
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;