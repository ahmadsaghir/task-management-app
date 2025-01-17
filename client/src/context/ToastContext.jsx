// context/ToastContext.jsx
import React, { createContext, useContext, useState } from 'react';
import {
    ToastProvider as ToastProviderPrimitive,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose
} from '../components/ui/Toast.jsx';

const ToastContext = createContext({});

export const CustomToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'default') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 3000);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            <ToastProviderPrimitive>
                {children}
                {toasts.map((toast) => (
                    <Toast key={toast.id} variant={toast.type} onOpenChange={() => removeToast(toast.id)}>
                        <ToastDescription>{toast.message}</ToastDescription>
                        <ToastClose />
                    </Toast>
                ))}
                <ToastViewport />
            </ToastProviderPrimitive>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a CustomToastProvider');
    }
    return context;
};