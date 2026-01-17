// Toast utility wrapper for consistent notifications
import toast from 'react-hot-toast';

// Success notifications
export const showSuccess = (message: string) => {
    toast.success(message);
};

// Error notifications
export const showError = (message: string) => {
    toast.error(message);
};

// Info notifications (uses custom styling)
export const showInfo = (message: string) => {
    toast(message, {
        icon: 'ℹ️',
    });
};

// Warning notifications
export const showWarning = (message: string) => {
    toast(message, {
        icon: '⚠️',
        style: {
            background: '#fef3c7',
            color: '#92400e',
        },
    });
};

// Loading toast (returns id to dismiss later)
export const showLoading = (message: string) => {
    return toast.loading(message);
};

// Dismiss a specific toast
export const dismissToast = (toastId: string) => {
    toast.dismiss(toastId);
};

// Promise-based toast (for async operations)
export const showPromise = <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
) => {
    return toast.promise(promise, messages);
};

// Export the raw toast for advanced usage
export { toast };
