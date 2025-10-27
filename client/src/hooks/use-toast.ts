// Mock implementation of use-toast to prevent console errors
// Since we removed the Toaster component, this provides a no-op implementation

export function useToast() {
  return {
    toasts: [],
    toast: () => ({
      id: 'mock',
      dismiss: () => {},
      update: () => {}
    }),
    dismiss: () => {}
  };
}

export function toast() {
  return {
    id: 'mock',
    dismiss: () => {},
    update: () => {}
  };
}
