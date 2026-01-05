import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [status, setStatus] = useState('processing');
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing
    if (hasProcessed.current) return;
    
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    hasProcessed.current = true;

    // Attempt to login with the token
    const success = login(token);

    if (success) {
      setStatus('success');
      // Redirect to places page after brief success message
      setTimeout(() => {
        navigate('/places', { replace: true });
      }, 1500);
    } else {
      setStatus('error');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [searchParams, login, navigate]);

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full mx-4 p-8 rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {status === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Signing you in...
            </h2>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Please wait while we complete your authentication.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Welcome back!
            </h2>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              You have been successfully signed in. Redirecting...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Authentication Failed
            </h2>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Something went wrong. Redirecting to homepage...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthSuccess;

