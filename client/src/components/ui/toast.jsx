import React from 'react';

export const Toast = ({ children, variant = 'default', className = '', ...props }) => {
  const baseStyles = 'p-4 rounded-md shadow-md';
  const variantStyles = {
    default: 'bg-white text-gray-900',
    destructive: 'bg-red-500 text-white',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const ToastTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-sm font-medium ${className}`} {...props}>
    {children}
  </h3>
);

export const ToastDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm mt-1 ${className}`} {...props}>
    {children}
  </p>
);

export const ToastClose = ({ className = '', ...props }) => (
  <button
    className={`absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors ${className}`}
    {...props}
  >
    ×
  </button>
);

export const ToastViewport = ({ className = '', ...props }) => (
  <div
    className={`fixed top-0 right-0 p-4 space-y-2 max-w-sm w-full ${className}`}
    {...props}
  />
);

export const ToastProvider = ({ children }) => (
  <>{children}</>
);
