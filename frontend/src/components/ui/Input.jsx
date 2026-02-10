import { forwardRef, useState } from 'react';
import clsx from 'clsx';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

/**
 * Input Component
 * 
 * Professional input field with validation, icons, and states
 * 
 * @param {Object} props
 * @param {'text' | 'email' | 'password' | 'number' | 'tel'} props.type - Input type
 * @param {'sm' | 'md' | 'lg'} props.size - Input size
 * @param {string} props.label - Label text
 * @param {string} props.error - Error message
 * @param {string} props.success - Success message
 * @param {string} props.helper - Helper text
 * @param {React.ReactNode} props.leftIcon - Icon on left
 * @param {React.ReactNode} props.rightIcon - Icon on right
 * @param {boolean} props.disabled - Disable input
 * @param {boolean} props.required - Mark as required
 * @param {boolean} props.fullWidth - Take full width
 */
const Input = forwardRef(({
    type = 'text',
    size = 'md',
    label,
    error,
    success,
    helper,
    leftIcon,
    rightIcon,
    disabled = false,
    required = false,
    fullWidth = true,
    className,
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;

    // Size classes
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-5 py-3 text-lg',
    };

    // State classes
    const stateClasses = error
        ? 'border-loss-500 dark:border-loss-600 focus:ring-loss-500 dark:focus:ring-loss-600'
        : success
        ? 'border-profit-500 dark:border-profit-600 focus:ring-profit-500 dark:focus:ring-profit-600'
        : 'border-gray-300 dark:border-dark-border-primary focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-primary-500 dark:focus:border-primary-600';

    return (
        <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
            {/* Label */}
            {label && (
                <label className="text-sm font-semibold text-gray-700 dark:text-dark-text-primary">
                    {label}
                    {required && <span className="text-loss-500 ml-1">*</span>}
                </label>
            )}

            {/* Input Container */}
            <div className="relative">
                {/* Left Icon */}
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-muted">
                        {leftIcon}
                    </div>
                )}

                {/* Input */}
                <input
                    ref={ref}
                    type={inputType}
                    disabled={disabled}
                    className={clsx(
                        'w-full rounded-lg border bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-dark-text-muted transition-all duration-200',
                        'focus:outline-none focus:ring-2',
                        sizeClasses[size],
                        stateClasses,
                        leftIcon && 'pl-10',
                        (rightIcon || type === 'password') && 'pr-10',
                        disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-dark-bg-tertiary',
                        isFocused && 'ring-2',
                        className
                    )}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {/* Right Icon / Password Toggle */}
                {type === 'password' ? (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                ) : rightIcon ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-muted">
                        {rightIcon}
                    </div>
                ) : null}

                {/* Status Icons */}
                {error && !rightIcon && type !== 'password' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-loss-500">
                        <AlertCircle size={18} />
                    </div>
                )}
                {success && !rightIcon && type !== 'password' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-profit-500">
                        <CheckCircle2 size={18} />
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-xs font-medium text-loss-600 dark:text-loss-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {error}
                </p>
            )}

            {/* Success Message */}
            {success && (
                <p className="text-xs font-medium text-profit-600 dark:text-profit-400 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    {success}
                </p>
            )}

            {/* Helper Text */}
            {helper && !error && !success && (
                <p className="text-xs text-gray-500 dark:text-dark-text-muted">
                    {helper}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;