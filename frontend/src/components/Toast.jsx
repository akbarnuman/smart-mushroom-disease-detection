import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const icons = {
        success: <CheckCircle size={18} />,
        error: <AlertCircle size={18} />,
        info: <Info size={18} />,
    };

    const colors = {
        success: { bg: '#ecfdf5', border: '#10b981', color: '#065f46', icon: '#10b981' },
        error: { bg: '#fef2f2', border: '#ef4444', color: '#991b1b', icon: '#ef4444' },
        info: { bg: '#eff6ff', border: '#3b82f6', color: '#1e40af', icon: '#3b82f6' },
    };

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            {/* Toast Container */}
            <div style={{
                position: 'fixed', top: 20, right: 20, zIndex: 99999,
                display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380,
            }}>
                {toasts.map(toast => {
                    const c = colors[toast.type] || colors.info;
                    return (
                        <div
                            key={toast.id}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '12px 16px', borderRadius: 12,
                                background: c.bg, borderLeft: `4px solid ${c.border}`,
                                color: c.color, fontSize: 14, fontWeight: 500,
                                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                animation: 'slideInRight 0.3s ease',
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            <span style={{ color: c.icon, flexShrink: 0 }}>{icons[toast.type]}</span>
                            <span style={{ flex: 1 }}>{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, padding: 0, flexShrink: 0 }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};
