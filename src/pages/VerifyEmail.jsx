import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import Logo from '../assets/Logo.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fggg.space/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(''); // 'success', 'error', ''
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token');
      setLoading(false);
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/verify-email?token=${token}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Your email has been verified successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // Check if the error is about invalid token - this might mean email is already verified
        if (data.message && data.message.includes('Invalid or expired verification token')) {
          setStatus('success');
          setMessage('Your email appears to be already verified. You can now log in to your account.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to verify email');
        }
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img src={Logo} alt="UMUNSI MEDIA" className="mx-auto h-20 w-20 rounded-full object-contain mb-4" />
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email...</h2>
              <p className="text-gray-600">Please wait while we verify your email address.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <img src={Logo} alt="UMUNSI MEDIA" className="mx-auto h-20 w-20 rounded-full object-contain mb-4" />
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex justify-center mb-4">
              {status === 'success' ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            
            <h2 className={`text-2xl font-bold mb-2 ${
              status === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
            </h2>
            
            <p className={`text-gray-600 mb-6 ${
              status === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              {message}
            </p>

            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-sm text-green-700">
                    You will be redirected to the login page in a few seconds.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">
                    The verification link may have expired or is invalid.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
              >
                Go to Login
              </Link>
              
              {status === 'error' && (
                <Link
                  to="/register"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                >
                  Register Again
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Need help? Contact our support team.</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
