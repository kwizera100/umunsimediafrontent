import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, Loader2, XCircle } from 'lucide-react';
import Logo from '../../assets/Logo.png';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await login(formData);
    if (result.success) {
      navigate('/');
    } else if (result.requiresEmailVerification) {
      setErrors({ 
        general: 'Please verify your email before logging in. Check your inbox for a verification link.' 
      });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotStatus('');

    // Use the email from login form if available, otherwise require it
    const emailToUse = formData.email;
    
    if (!emailToUse || !/\S+@\S+\.\S+/.test(emailToUse)) {
      setErrors(prev => ({ ...prev, email: 'Please enter your email address first' }));
      return;
    }

    try {
      setForgotLoading(true);
      const res = await fetch(`${API_BASE_URL}/users/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to send reset link');
      }
      
      setForgotStatus(`Reset link sent to ${emailToUse}. Check your email and spam folder.`);
    } catch (err) {
      console.error('Password reset error:', err);
      setForgotStatus(`Error: ${err.message}. Please check your email configuration or try again later.`);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter your email address first' }));
      return;
    }

    try {
      setResendLoading(true);
      // We'll need to add a resend verification endpoint
      const response = await fetch(`${API_BASE_URL}/users/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      
      if (response.ok) {
        setErrors({ 
          general: 'Verification email sent! Please check your inbox and spam folder.' 
        });
      } else {
        setErrors({ 
          general: 'Failed to send verification email. Please try again.' 
        });
      }
    } catch (error) {
      setErrors({ 
        general: 'Network error. Please try again.' 
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <img src={Logo} alt="Umunsi Media Logo" className="mx-auto h-20 w-20 rounded-full object-contain mb-4" />
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#FFB600' }}>Welcome back</h2>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {errors.general && (
            <div className={`mb-4 p-3 border rounded-lg ${
              errors.general.includes('verification') || errors.general.includes('sent') 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center">
                {errors.general.includes('verification') || errors.general.includes('sent') ? (
                  <Mail className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <p className={`text-sm ${
                  errors.general.includes('verification') || errors.general.includes('sent') 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>{errors.general}</p>
              </div>
              {errors.general.includes('verify your email') && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium flex items-center"
                  >
                    {resendLoading && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                    {resendLoading ? 'Sending...' : 'Resend verification email'}
                  </button>
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
              ) : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setForgotOpen(v => !v)}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {forgotOpen ? 'Close reset options' : 'Forgot password?'}
            </button>
          </div>

          {forgotOpen && (
            <div className="mt-4 rounded-lg border border-gray-200 p-4 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Reset your password</h4>
              <p className="text-xs text-gray-600 mb-3">
                {formData.email ? 
                  `We'll send a reset link to ${formData.email}` : 
                  'Please enter your email address above first'
                }
              </p>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <button
                  type="submit"
                  disabled={forgotLoading || !formData.email || !/\S+@\S+\.\S+/.test(formData.email)}
                  className="inline-flex items-center px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {forgotLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                  {forgotLoading ? 'Sending...' : 'Send reset link'}
                </button>
                {forgotStatus && (
                  <p className={`text-xs ${forgotStatus.includes('Error') ? 'text-red-600' : 'text-gray-600'}`}>
                    {forgotStatus}
                  </p>
                )}
              </form>
            </div>
          )}

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 