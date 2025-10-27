// Mock implementation of useToast to prevent console errors
// Since we removed the Toaster component, this provides a no-op implementation

export function useToast() {
  return {
    toasts: [],
    toast: (_options?: { title?: string; description?: string; variant?: string }) => ({
      id: 'mock',
      dismiss: () => {},
      update: () => {}
    }),
    dismiss: () => {}
  };
}

export function toast(options?: { title?: string; description?: string; variant?: string }) {
  console.log('Toast:', options);
  return {
    id: 'mock',
    dismiss: () => {},
    update: () => {}
  };
}
