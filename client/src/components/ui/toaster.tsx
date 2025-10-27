import { useToast } from "@/hooks/useToast";
import { Toast, ToastDescription, ToastTitle, ToastViewport, ToastProvider, ToastClose } from "./toast";
import type { ToasterToast, ToastVariant } from "@/types/toast";

// Extend the ToasterToast type to include the variant
interface ToastData extends Omit<ToasterToast, 'id' | 'title' | 'variant'> {
  id: string;
  title: string;
  variant?: ToastVariant;
}

export function Toaster() {
  const { toasts } = useToast() as { toasts: ToastData[] };

  return (
    <ToastProvider>
      <ToastViewport>
        {toasts.map(({ id, title, description, variant }) => (
          <Toast key={id} variant={variant}>
            <div className="relative pr-6">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
              <ToastClose />
            </div>
          </Toast>
        ))}
      </ToastViewport>
    </ToastProvider>
  );
}
