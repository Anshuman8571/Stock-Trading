import clsx from 'clsx';

/**
 * Badge Component
 * 
 * Small status indicator or label
 * 
 * @param {Object} props
 * @param {'success' | 'danger' | 'warning' | 'info' | 'neutral'} props.variant - Badge color variant
 * @param {'sm' | 'md' | 'lg'} props.size - Badge size
 * @param {boolean} props.dot - Show dot indicator
 * @param {React.ReactNode} props.icon - Icon element
 * @param {React.ReactNode} props.children - Badge content
 */
export default function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className,
  children,
  ...props
}) {
  // Base styles
  const baseStyles = 'inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap';

  // Variant styles
  const variantStyles = {
    success: 'bg-profit-100 dark:bg-profit-900/30 text-profit-700 dark:text-profit-400 border border-profit-200 dark:border-profit-700/50',
    
    danger: 'bg-loss-100 dark:bg-loss-900/30 text-loss-700 dark:text-loss-400 border border-loss-200 dark:border-loss-700/50',
    
    warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 border border-warning-200 dark:border-warning-700/50',
    
    info: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-700/50',
    
    neutral: 'bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700/50',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  // Dot color
  const dotColors = {
    success: 'bg-profit-500',
    danger: 'bg-loss-500',
    warning: 'bg-warning-500',
    info: 'bg-primary-500',
    neutral: 'bg-gray-500',
  };

  return (
    <span
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </span>
  );
}

/**
 * Badge.Pill - Pill-shaped badge variant
 */
Badge.Pill = function BadgePill({ children, className, ...props }) {
  return (
    <Badge className={clsx('rounded-full px-3', className)} {...props}>
      {children}
    </Badge>
  );
};

/**
 * Badge.Dot - Just a dot indicator (no text)
 */
Badge.Dot = function BadgeDot({ variant = 'neutral', size = 'md', className, ...props }) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    success: 'bg-profit-500',
    danger: 'bg-loss-500',
    warning: 'bg-warning-500',
    info: 'bg-primary-500',
    neutral: 'bg-gray-500',
  };

  return (
    <span
      className={clsx(
        'inline-block rounded-full',
        sizeClasses[size],
        colorClasses[variant],
        className
      )}
      {...props}
    />
  );
};

/**
 * Badge.Pulsing - Animated pulsing badge (for live indicators)
 */
Badge.Pulsing = function BadgePulsing({ children, variant = 'success', className, ...props }) {
  return (
    <Badge
      variant={variant}
      className={clsx('relative', className)}
      {...props}
    >
      <span className="absolute -inset-1 rounded-full opacity-75 animate-ping" />
      <span className="relative">{children}</span>
    </Badge>
  );
};

/**
 * Order status badges (convenience components)
 */
Badge.OrderStatus = function OrderStatus({ status, ...props }) {
  const variants = {
    PENDING: 'warning',
    EXECUTED: 'success',
    FAILED: 'danger',
    CANCELLED: 'neutral',
    PROCESSING: 'info',
  };

  const labels = {
    PENDING: 'Pending',
    EXECUTED: 'Executed',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
    PROCESSING: 'Processing',
  };

  return (
    <Badge variant={variants[status] || 'neutral'} {...props}>
      {labels[status] || status}
    </Badge>
  );
};

/**
 * Market status badge
 */
Badge.MarketStatus = function MarketStatus({ isOpen, ...props }) {
  return (
    <Badge.Pulsing variant={isOpen ? 'success' : 'danger'} {...props}>
      {isOpen ? 'Market Open' : 'Market Closed'}
    </Badge.Pulsing>
  );
};