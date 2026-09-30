// src/pages/UserLogin.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import logo from '@/assets/logo.png';

const UserLogin = () => {
  useDocumentTitle('Admin Login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [logoClickTimeout, setLogoClickTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const { login, isAuthenticated, admin } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Redirecting to dashboard...');
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate, admin]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (logoClickTimeout) {
        clearTimeout(logoClickTimeout);
      }
    };
  }, [logoClickTimeout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: 'Missing Credentials',
        description: 'Please enter both username and password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      console.log('Login result:', success);
      
      if (success) {
        toast({
          title: 'Welcome Admin!',
          description: 'Login successful. Redirecting to dashboard...',
        });
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid username or password.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred during login. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);

    // Clear existing timeout
    if (logoClickTimeout) {
      clearTimeout(logoClickTimeout);
    }

    // If 5 clicks reached, redirect to index
    if (newCount >= 5) {
      console.log('🎯 Logo tapped 5 times - redirecting to index!');
      navigate('/');
      return;
    }

    // Set timeout to reset counter after 3 seconds
    const timeout = setTimeout(() => {
      setLogoClickCount(0);
    }, 3000);

    setLogoClickTimeout(timeout);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side - Login Form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 md:p-12 shadow-xl">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm">
          {/* Logo and Welcome */}
          <div className="text-center mb-10">
            <img 
              src={logo} 
              alt="Gradiator" 
              className="h-14 mx-auto mb-6 drop-shadow-md cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={handleLogoClick}
            />
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2 drop-shadow-sm">Welcome Back!</h1>
            <p className="text-gray-600 font-medium">Please sign in to your account</p>
          </div>

          {/* Title */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Admin Login
            </h2>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-800 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6914] focus:border-[#8B6914] shadow-sm transition duration-150"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B6914] focus:border-[#8B6914] shadow-sm transition duration-150"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {/* Sign In Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-[#8B6914] hover:bg-[#6B4F0F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A430D] transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Right side - Elegant Pattern */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url("/A.jpg")' }}
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, rgba(0,0,0,0.3), rgba(0,0,0,0.5))' }}></div>
          
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
          
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-white/5"></div>
            <div className="absolute -left-32 -bottom-32 w-96 h-96 rounded-full bg-white/5"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-white/10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;