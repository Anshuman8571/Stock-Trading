import { useMemo, useEffect, useState } from 'react';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

/**
 * PriceDisplay Component
 * 
 * Displays prices with proper formatting, color coding, and flash animations
 * 
 * @param {Object} props
 * @param {number} props.value - Price value
 * @param {number} props.previousValue - Previous price (for change calculation)
 * @param {number} props.change - Absolute change value
 * @param {number} props.changePercent - Percentage change
 * @param {'large' | 'medium' | 'small' | 'tiny'} props.size - Display size
 * @param {boolean} props.showChange - Show change indicator
 * @param {boolean} props.showArrow - Show arrow icon
 * @param {boolean} props.showCurrency - Show currency symbol
 * @param {boolean} props.animated - Enable flash animation on change
 * @param {string} props.currency - Currency symbol (default: ₹)
 */
export default function PriceDisplay({
  value,
  previousValue,
  change,
  changePercent,
  size = 'medium',
  showChange = false,
  showArrow = false,
  showCurrency = true,
  animated = false,
  currency = '₹',
  className,
  ...props
}) {
  const [flashClass, setFlashClass] = useState('');

  // Determine price direction
  const direction = useMemo(() => {
    if (change !== undefined) {
      if (change > 0) return 'up';
      if (change < 0) return 'down';
      return 'neutral';
    }
    
    if (previousValue !== undefined && value !== undefined) {
      if (value > previousValue) return 'up';
      if (value < previousValue) return 'down';
      return 'neutral';
    }
    
    return 'neutral';
  }, [value, previousValue, change]);

  // Calculate change if not provided
  const calculatedChange = useMemo(() => {
    if (change !== undefined) return change;
    if (previousValue !== undefined && value !== undefined) {
      return value - previousValue;
    }
    return 0;
  }, [value, previousValue, change]);

  const calculatedChangePercent = useMemo(() => {
    if (changePercent !== undefined) return changePercent;
    if (previousValue !== undefined && calculatedChange !== 0) {
      return (calculatedChange / previousValue) * 100;
    }
    return 0;
  }, [previousValue, calculatedChange, changePercent]);

  // Flash animation on price change
  useEffect(() => {
    if (animated && previousValue !== undefined && value !== previousValue) {
      const flash = value > previousValue ? 'animate-flash-green' : 'animate-flash-red';
      setFlashClass(flash);
      
      const timer = setTimeout(() => setFlashClass(''), 500);
      return () => clearTimeout(timer);
    }
  }, [value, previousValue, animated]);

  // Size classes
  const sizeClasses = {
    large: 'text-3xl md:text-4xl',
    medium: 'text-xl md:text-2xl',
    small: 'text-base md:text-lg',
    tiny: 'text-sm',
  };

  // Color classes
  const colorClasses = {
    up: 'text-profit-600 dark:text-profit-400',
    down: 'text-loss-600 dark:text-loss-400',
    neutral: 'text-gray-700 dark:text-dark-text-primary',
  };

  // Arrow icons
  const ArrowIcon = {
    up: ArrowUpRight,
    down: ArrowDownRight,
    neutral: Minus,
  };

  const Icon = ArrowIcon[direction];

  // Format price
  const formatPrice = (price) => {
    if (price === undefined || price === null) return '—';
    
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // Format change
  const formatChange = (val) => {
    if (val === 0) return '0.00';
    const formatted = Math.abs(val).toFixed(2);
    return val > 0 ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <div className={clsx('inline-flex items-center gap-2', className)} {...props}>
      {/* Main Price */}
      <span
        className={clsx(
          'font-mono font-bold tabular-nums',
          sizeClasses[size],
          colorClasses[direction],
          flashClass
        )}
      >
        {showCurrency && currency}
        {formatPrice(value)}
      </span>

      {/* Change Indicator */}
      {showChange && (change !== undefined || previousValue !== undefined) && (
        <span className="inline-flex items-center gap-1">
          {showArrow && <Icon size={size === 'large' ? 24 : size === 'medium' ? 20 : 16} />}
          
          <span
            className={clsx(
              'font-semibold',
              size === 'large' ? 'text-lg' : size === 'medium' ? 'text-base' : 'text-sm',
              colorClasses[direction]
            )}
          >
            {formatChange(calculatedChange)}
            {calculatedChangePercent !== 0 && (
              <span className="ml-1">
                ({formatChange(calculatedChangePercent)}%)
              </span>
            )}
          </span>
        </span>
      )}
    </div>
  );
}

/**
 * PriceDisplay.Compact - Compact version for tables
 */
PriceDisplay.Compact = function PriceDisplayCompact({
  value,
  change,
  changePercent,
  showCurrency = true,
  currency = '₹',
  className,
  ...props
}) {
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  
  const colorClasses = {
    up: 'text-profit-600 dark:text-profit-400',
    down: 'text-loss-600 dark:text-loss-400',
    neutral: 'text-gray-700 dark:text-dark-text-primary',
  };

  return (
    <div className={clsx('flex flex-col gap-0.5', className)} {...props}>
      <span className={clsx('font-mono font-semibold text-sm tabular-nums', colorClasses[direction])}>
        {showCurrency && currency}{value.toFixed(2)}
      </span>
      {(change !== undefined || changePercent !== undefined) && (
        <span className={clsx('text-xs font-medium', colorClasses[direction])}>
          {change !== undefined && `${change > 0 ? '+' : ''}${change.toFixed(2)}`}
          {changePercent !== undefined && ` (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%)`}
        </span>
      )}
    </div>
  );
};