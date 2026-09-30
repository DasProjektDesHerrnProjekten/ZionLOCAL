import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineAuth } from '@/contexts/OfflineAuthContext';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';
import { isOfflineMode } from '@/lib/offline-mode';

const Index = () => {
  // State hooks
  const [admissionId, setAdmissionId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Refs and context hooks
  const tapTimeout = useRef<number | null>(null);
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const offlineAuth = useOfflineAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set isClient to true after component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle redirection when authenticated
  useEffect(() => {
    const isAuth = isOfflineMode() ? offlineAuth.isAuthenticated : isAuthenticated;
    if (isAuth) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, offlineAuth.isAuthenticated, navigate]);

  // Initialize analytics (skip in offline mode)
  useEffect(() => {
    if (isClient && !isOfflineMode()) {
      import('@/utils/analytics').then(({ default: trackEvent }) => {
        trackEvent('page_view', { page: 'Index' });
      });
    }
  }, [isClient]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
    };
  }, []);

  // Define handleSubmit at the top level with useCallback
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!admissionId.trim() || !password.trim()) {
      toast({
        title: 'Missing Credentials',
        description: 'Please enter both Admission ID and Password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (isOfflineMode()) {
        // Use offline authentication
        await offlineAuth.login(admissionId, password);
        toast({
          title: 'Welcome!',
          description: 'Login successful. Redirecting to dashboard...',
        });
        navigate('/dashboard');
      } else {
        // Use online authentication
        const result = await login(admissionId, password);
        
        if (result.success) {
          toast({
            title: 'Welcome!',
            description: 'Login successful. Redirecting to dashboard...',
          });
          navigate('/dashboard');
        } else {
          toast({
            title: 'Login Failed',
            description: result.error || 'Invalid Admission ID or Password. Please try again.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred during login',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [admissionId, password, login, offlineAuth, navigate, toast]);

  // Show loading state while checking auth
  const authLoading = isOfflineMode() ? offlineAuth.loading : isAuthLoading;
  if (authLoading || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Don't render anything if authenticated (redirect will happen in useEffect)
  const isAuth = isOfflineMode() ? offlineAuth.isAuthenticated : isAuthenticated;
  if (isAuth) {
    return null;
  }

  const handleLogoClick = () => {
    // Clear any existing timeout
    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
    }

    // Increment tap count
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // Set timeout to reset tap counter after 3 seconds
    tapTimeout.current = window.setTimeout(() => {
      setTapCount(0);
    }, 3000);

    // If reached 10 taps, navigate to admin login
    if (newTapCount >= 10) {
      setTapCount(0);
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
      navigate('/admin/login');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/80 to-secondary/20"
          style={{
            backgroundSize: '200% 200%',
            animation: 'gradient 15s ease infinite',
          }}
        />
      </div>
      
      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl -translate-y-1/2"
          style={{
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute top-3/4 right-0 w-80 h-80 bg-secondary/15 rounded-full blur-3xl translate-y-1/2" 
          style={{ 
            animation: 'float 10s ease-in-out infinite 2s' 
          }} 
        />
        <div 
          className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-accent/15 rounded-full blur-3xl" 
          style={{ 
            animation: 'float 12s ease-in-out infinite 4s' 
          }} 
        />
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="w-full max-w-md relative">
        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl shadow-elevated p-8 animate-scale-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8 relative">
            <div
              className="p-4 rounded-2xl mb-4 animate-fade-in relative cursor-pointer transition-transform active:scale-95"
              style={{ backgroundColor: '#FFFACD' }}
              onClick={handleLogoClick}
            >
              <img src={logo} alt="ZionExams Logo" className="h-20 w-20 object-contain relative z-10" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">ZioniansExams Portal</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to access your exams</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <label htmlFor="admissionId" className="text-sm font-medium text-foreground">
                Admission ID
              </label>
              <input
                id="admissionId"
                type="text"
                value={admissionId}
                onChange={(e) => setAdmissionId(e.target.value)}
                placeholder="Enter your Admission ID"
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up shadow-soft hover:shadow-glow"
                style={{
                  backgroundColor: '#8B6914',
                  animationDelay: '300ms',
                  border: '1px solid #6B4F0F'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/forgot-id')}
                className="w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up shadow-soft hover:shadow-glow"
                style={{
                  backgroundColor: '#F4D03F',
                  color: '#000000',
                  animationDelay: '300ms',
                  border: '1px solid #E4C030'
                }}
              >
                Forgot ID?
              </button>
            </div>
          </form>
          
          {/* Website Link - Hidden in offline mode */}
          {!import.meta.env.VITE_OFFLINE_MODE && (
            <div className="mt-8 text-center">
              <a 
                href="https://Zionianmain.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                elyonmain.vercel.app
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;