import clsx from 'clsx';

/**
 * Card Component
 * 
 * Versatile card container with multiple variants
 * 
 * @param {Object} props
 * @param {'default' | 'glass' | 'elevated' | 'bordered' | 'gradient'} props.variant - Card style variant
 * @param {boolean} props.hover - Enable hover effect
 * @param {boolean} props.clickable - Show pointer cursor and add subtle interaction
 * @param {string} props.gradient - Gradient direction for gradient variant ('primary' | 'profit' | 'loss' | 'dark')
 * @param {React.ReactNode} props.children - Card content
 */
export default function Card({
  variant = 'default',
  hover = false,
  clickable = false,
  gradient,
  className,
  children,
  ...props
}) {
  // Base styles
  const baseStyles = 'rounded-2xl transition-all duration-200';

  // Variant styles
  const variantStyles = {
    default: 'bg-white dark:bg-dark-bg-secondary shadow-sm border border-gray-100 dark:border-dark-border-primary',
    
    glass: 'bg-white/80 dark:bg-dark-bg-secondary/80 backdrop-blur-lg shadow-glass border border-gray-200/50 dark:border-dark-border-primary/50',
    
    elevated: 'bg-white dark:bg-dark-bg-secondary shadow-lg border border-gray-100 dark:border-dark-border-primary',
    
    bordered: 'bg-white dark:bg-dark-bg-secondary border-2 border-gray-200 dark:border-dark-border-secondary',
    
    gradient: (() => {
      const gradients = {
        primary: 'bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0',
        profit: 'bg-gradient-to-br from-profit-500 to-profit-700 text-white border-0',
        loss: 'bg-gradient-to-br from-loss-500 to-loss-700 text-white border-0',
        dark: 'bg-gradient-to-br from-dark-bg-primary to-dark-bg-tertiary text-dark-text-primary border border-dark-border-primary',
      };
      return gradients[gradient] || gradients.primary;
    })(),
  };

  // Hover effect
  const hoverStyles = hover && 'hover:shadow-md hover:-translate-y-0.5 cursor-default';

  // Clickable effect
  const clickableStyles = clickable && 'cursor-pointer active:scale-[0.98]';

  return (
    <div
      className={clsx(
        baseStyles,
        variantStyles[variant],
        hoverStyles,
        clickableStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card.Header - Header section of card
 */
Card.Header = function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={clsx(
        'px-6 py-5 border-b border-gray-100 dark:border-dark-border-primary',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card.Body - Main content section of card
 */
Card.Body = function CardBody({ className, children, ...props }) {
  return (
    <div className={clsx('px-6 py-5', className)} {...props}>
      {children}
    </div>
  );
};

/**
 * Card.Footer - Footer section of card
 */
Card.Footer = function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={clsx(
        'px-6 py-4 border-t border-gray-100 dark:border-dark-border-primary bg-gray-50 dark:bg-dark-bg-primary/30 rounded-b-2xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card.Title - Title for card header
 */
Card.Title = function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={clsx(
        'text-lg font-bold text-gray-900 dark:text-dark-text-primary',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

/**
 * Card.Description - Description/subtitle for card header
 */
Card.Description = function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={clsx(
        'text-sm text-gray-500 dark:text-dark-text-muted mt-1',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};