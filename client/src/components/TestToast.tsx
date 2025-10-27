import { useEffect } from 'react';
import { toast } from '@/hooks/useToast';

export function TestToast() {
  useEffect(() => {
    // Test toast on component mount
    const testToast = toast({
      title: 'Test Toast',
      description: 'This is a test toast message.',
      variant: 'default'
    });

    // Dismiss the test toast after 5 seconds
    const timer = setTimeout(() => {
      testToast.dismiss();
    }, 5000);

    return () => {
      clearTimeout(timer);
      testToast.dismiss();
    };
  }, []);

  return null;
}
