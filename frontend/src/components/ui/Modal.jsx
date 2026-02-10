import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import Button from './Button';

/**
 * Modal Component
 * 
 * Full-featured modal dialog with animations and customization
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Control modal visibility
 * @param {function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {string} props.description - Modal description
 * @param {'sm' | 'md' | 'lg' | 'xl' | 'full'} props.size - Modal size
 * @param {boolean} props.closeOnOutsideClick - Allow closing by clicking outside
 * @param {boolean} props.showCloseButton - Show X button
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} props.footer - Modal footer content
 */
export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    size = 'md',
    closeOnOutsideClick = true,
    showCloseButton = true,
    children,
    footer,
    className,
}) {
    // Size classes
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-7xl',
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog 
                as="div" 
                className="relative z-50" 
                onClose={closeOnOutsideClick ? onClose : () => {}}
            >
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />
                </Transition.Child>

                {/* Modal Container */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel 
                                className={clsx(
                                    'w-full transform overflow-hidden rounded-2xl bg-white dark:bg-dark-bg-secondary shadow-2xl transition-all',
                                    sizeClasses[size],
                                    className
                                )}
                            >
                                {/* Header */}
                                {(title || showCloseButton) && (
                                    <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-dark-border-primary">
                                        <div>
                                            {title && (
                                                <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                                                    {title}
                                                </Dialog.Title>
                                            )}
                                            {description && (
                                                <Dialog.Description className="mt-1 text-sm text-gray-500 dark:text-dark-text-muted">
                                                    {description}
                                                </Dialog.Description>
                                            )}
                                        </div>
                                        {showCloseButton && (
                                            <button
                                                onClick={onClose}
                                                className="text-gray-400 hover:text-gray-600 dark:text-dark-text-muted dark:hover:text-dark-text-secondary transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-6">
                                    {children}
                                </div>

                                {/* Footer */}
                                {footer && (
                                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-dark-border-primary bg-gray-50 dark:bg-dark-bg-tertiary">
                                        {footer}
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

/**
 * Modal.Confirm - Confirmation dialog preset
 */
Modal.Confirm = function ModalConfirm({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "primary",
    loading = false,
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            size="sm"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        {cancelText}
                    </Button>
                    <Button variant={variant} onClick={onConfirm} loading={loading}>
                        {confirmText}
                    </Button>
                </>
            }
        />
    );
};