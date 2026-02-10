import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import clsx from 'clsx';

/**
 * Tooltip Component
 * 
 * Simple tooltip with positioning
 * 
 * @param {Object} props
 * @param {string} props.content - Tooltip text
 * @param {'top' | 'bottom' | 'left' | 'right'} props.position - Tooltip position
 * @param {React.ReactNode} props.children - Element to attach tooltip to
 */
export default function Tooltip({
    content,
    position = 'top',
    children,
    className,
}) {
    const [isVisible, setIsVisible] = useState(false);

    // Position classes
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    // Arrow classes
    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-dark-bg-tertiary',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-dark-bg-tertiary',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-dark-bg-tertiary',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-dark-bg-tertiary',
    };

    if (!content) return children;

    return (
        <div 
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            
            <Transition
                show={isVisible}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    className={clsx(
                        'absolute z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 dark:bg-dark-bg-tertiary rounded-lg shadow-lg whitespace-nowrap pointer-events-none',
                        positionClasses[position],
                        className
                    )}
                >
                    {content}
                    <div
                        className={clsx(
                            'absolute w-0 h-0 border-4 border-transparent',
                            arrowClasses[position]
                        )}
                    />
                </div>
            </Transition>
        </div>
    );
}

// Import useState at top
import { useState } from 'react';