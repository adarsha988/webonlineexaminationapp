// Type definitions for toast functionality

export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

export interface ToasterToast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface ToastProps extends Omit<ToasterToast, 'id'> {
  // Additional props if needed
}

export interface UseToastReturn {
  toasts: ToasterToast[];
  toast: (props: ToastProps) => {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToast) => void;
  };
  dismiss: (toastId?: string) => void;
}

export function useToast(): UseToastReturn;

export function toast(props: ToastProps): {
  id: string;
  dismiss: () => void;
  update: (props: ToasterToast) => void;
};
