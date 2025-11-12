import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/useToast';
import { loginUser, clearError } from '../../store/authSlice';
import LoginErrorDisplay from '../../components/auth/LoginErrorDisplay';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { isLoading, error, errorType, isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  
  const [isValidating, setIsValidating] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Clear any existing auth state on component mount
  useEffect(() => {
    console.log('🔄 LOGIN COMPONENT MOUNTED - Clearing auth state');
    setShouldRedirect(false);
    // Clear any existing errors
    if (error) {
      dispatch(clearError());
    }
  }, []);

  useEffect(() => {
    console.log('🔄 LOGIN COMPONENT - Auth state changed:', { 
      isAuthenticated, 
      user, 
      userRole: user?.role,
      shouldRedirect 
    });
    
    // Only redirect if explicitly allowed and user is authenticated
    if (isAuthenticated && user && shouldRedirect) {
      console.log('🚀 REDIRECTING USER - Role:', user.role);
      // Redirect based on user role
      if (user.role === 'admin') {
        console.log('👑 Redirecting to admin dashboard');
        navigate('/admin/dashboard');
      } else if (user.role === 'instructor') {
        console.log('👨‍🏫 Redirecting to instructor dashboard');
        navigate('/instructor/dashboard');
      } else {
        console.log('👨‍🎓 Redirecting to student dashboard');
        navigate('/student/dashboard');
      }
    } else {
      console.log('❌ No redirect - isAuthenticated:', isAuthenticated, 'user:', !!user, 'shouldRedirect:', shouldRedirect);
    }
  }, [isAuthenticated, user, shouldRedirect, navigate]);

  // Clear errors when component unmounts or user starts typing
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear errors and reset redirect permission when user starts typing
    if (error) {
      dispatch(clearError());
    }
    setShouldRedirect(false);
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Remove the separate validation function - we'll handle it in the main submit

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 FORM SUBMITTED:', { email: formData.email, password: '***' });
    
    const { email, password } = formData;
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    // Reset redirect permission
    setShouldRedirect(false);
    setIsValidating(true);
    
    try {
      console.log('🔍 VALIDATING CREDENTIALS: Attempting login...');
      
      // Call the login action
      const result = await dispatch(loginUser({
        email: email,
        password: password,
      }));
      
      // Check if login was successful
      if (loginUser.fulfilled.match(result)) {
        console.log('✅ CREDENTIALS VALID - Login successful');
        console.log('🔧 SETTING shouldRedirect = true');
        toast({
          title: "Login Successful",
          description: `Welcome back!`,
        });
        
        // Only now allow redirect after successful validation
        setShouldRedirect(true);
        console.log('🎯 shouldRedirect state updated to:', true);
        
      } else if (loginUser.rejected.match(result)) {
        // Login failed - show specific error and stay on login page
        console.log('❌ CREDENTIALS INVALID - Staying on login page');
        
        const errorPayload = result.payload;
        const errorMessage = typeof errorPayload === 'string' ? errorPayload : errorPayload?.message || 'Login failed';
        
        // Show specific error messages based on the server response
        if (errorMessage.includes('No account found') || errorMessage.includes('User not found')) {
          toast({
            title: "Account Not Found",
            description: "No account found with this email address...",
            variant: "destructive",
          });
        } else if (errorMessage.includes('Incorrect password') || errorMessage.includes('Invalid password')) {
          toast({
            title: "Incorrect Password",
            description: "Incorrect password. Please check your password and try again.",
            variant: "destructive",
          });
        } else if (errorMessage.includes('inactive')) {
          toast({
            title: "Account Inactive",
            description: "Your account is currently inactive. Please contact the administrator...",
            variant: "destructive",
          });
        } else if (errorMessage.includes('suspended')) {
          toast({
            title: "Account Suspended",
            description: "Your account has been suspended. Please contact the administrator for assistance.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
        
        // Explicitly stay on login page - do not redirect
        setShouldRedirect(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
      setShouldRedirect(false);
    } finally {
      setIsValidating(false);
    }
  };

  const demoAccounts = [
    { type: 'Student', email: 'bob@student.edu', password: 'password123' },
    { type: 'Instructor', email: 'inst@example.com', password: 'password123' },
    { type: 'Admin', email: 'alice@admin.com', password: 'password123' },
  ];

  const fillDemoAccount = (email, password) => {
    setFormData(prev => ({ ...prev, email, password }));
  };

  const handleRetry = () => {
    dispatch(clearError());
    handleSubmit({ preventDefault: () => {} });
  };

  const handleContactSupport = () => {
    // You can implement this to open a support modal, email, or redirect to support page
    toast({
      title: "Contact Support",
      description: "Please email support@yourschool.edu or call (555) 123-4567 for assistance.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <GraduationCap className="mx-auto h-16 w-16 text-primary mb-4" />
          <h2 className="text-3xl font-bold text-foreground">E-XAM</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to access your dashboard</p>
        </div>
        
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          {/* Debug Info */}
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            <strong>Debug:</strong> isAuthenticated: {isAuthenticated ? 'true' : 'false'}, 
            shouldRedirect: {shouldRedirect ? 'true' : 'false'}, 
            user: {user ? user.email : 'null'}
          </div>
          
          {/* Error Display */}
          <LoginErrorDisplay
            error={error}
            errorType={errorType}
            onRetry={handleRetry}
            onContactSupport={handleContactSupport}
          />
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="mt-1"
                data-testid="input-email"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="mt-1"
                data-testid="input-password"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  name="remember"
                  checked={formData.remember}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, remember: checked }))
                  }
                />
                <Label htmlFor="remember" className="text-sm text-foreground">
                  Remember me
                </Label>
              </div>
              <a href="#" className="text-sm text-primary hover:text-primary/80">
                Forgot password?
              </a>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isValidating}
              data-testid="button-submit"
            >
              {isValidating ? 'Validating credentials...' : isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            
            {/* Debug Test Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={() => {
                console.log('🧪 TEST: Setting shouldRedirect = true');
                setShouldRedirect(true);
              }}
            >
              Test Redirect (Debug)
            </Button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Demo Accounts</span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              {demoAccounts.map((account) => (
                <div
                  key={account.type}
                  className="text-center p-2 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => fillDemoAccount(account.email, account.password)}
                  data-testid={`demo-${account.type.toLowerCase()}`}
                >
                  <div className="font-medium">{account.type}</div>
                  <div className="text-muted-foreground">{account.email}</div>
                  <div className="text-muted-foreground">{account.password}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
