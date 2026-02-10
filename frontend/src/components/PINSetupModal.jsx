import { useState } from 'react';
import { X, Lock, Check } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function PINSetupModal({ isOpen, onClose, onSuccess }) {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [step, setStep] = useState(1); // 1: enter PIN, 2: confirm PIN
    const [loading, setLoading] = useState(false);

    const handleSetupPIN = async () => {
        if (pin !== confirmPin) {
            toast.error("PINs don't match!");
            setConfirmPin('');
            setStep(1);
            setPin('');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/pin/setup', { pin });
            toast.success('PIN setup successful! You can now use PIN for quick login.');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to setup PIN');
        } finally {
            setLoading(false);
        }
    };

    const handlePinInput = (value) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 4);
        if (step === 1) {
            setPin(cleaned);
            if (cleaned.length === 4) {
                setTimeout(() => setStep(2), 300);
            }
        } else {
            setConfirmPin(cleaned);
            if (cleaned.length === 4) {
                // Auto-submit when 4 digits entered
                setTimeout(() => handleSetupPIN(), 300);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                        <Lock size={32} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    Setup Quick Login PIN
                </h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8 text-sm">
                    {step === 1 
                        ? "Create a 4-digit PIN for quick login next time"
                        : "Re-enter your PIN to confirm"
                    }
                </p>

                {/* PIN Input */}
                <div className="mb-8">
                    <input
                        type="password"
                        inputMode="numeric"
                        value={step === 1 ? pin : confirmPin}
                        onChange={(e) => handlePinInput(e.target.value)}
                        className="w-full px-4 py-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-3xl tracking-[1em] font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        placeholder="••••"
                        maxLength="4"
                        autoFocus
                    />

                    {/* Progress indicator */}
                    <div className="flex justify-center gap-2 mt-4">
                        <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    {step === 2 && (
                        <button
                            onClick={handleSetupPIN}
                            disabled={loading || confirmPin.length !== 4}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Setting up...' : (
                                <>
                                    <Check size={20} />
                                    Confirm PIN
                                </>
                            )}
                        </button>
                    )}
                    
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-all"
                    >
                        Skip for now
                    </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                    You can setup PIN later from Settings
                </p>
            </div>
        </div>
    );
}