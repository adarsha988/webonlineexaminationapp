import * as React from 'react';

declare module './toast' {
  export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  }
  
  export interface ToasterToast extends ToastProps {
    id: string;
    title: string;
    description?: string;
  }

  export const Toast: React.FC<ToastProps>;
  
  export interface ToastTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
  export const ToastTitle: React.FC<ToastTitleProps>;
  
  export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
  export const ToastDescription: React.FC<ToastDescriptionProps>;
  
  export interface ToastCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
  export const ToastClose: React.FC<ToastCloseProps>;
  
  export interface ToastViewportProps extends React.HTMLAttributes<HTMLDivElement> {}
  export const ToastViewport: React.FC<ToastViewportProps>;
  
  export interface ToastProviderProps {
    children: React.ReactNode;
  }
  export const ToastProvider: React.FC<ToastProviderProps>;
}
