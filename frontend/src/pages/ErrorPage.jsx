import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const ErrorPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Animated 404 Text */}
      <div className="relative">
        <h1 className="text-9xl font-bold text-center mb-4">
          <span className="text-amber-500 animate-bounce inline-block">4</span>
          <span className="text-blue-500 animate-pulse inline-block">0</span>
          <span className="text-green-500 animate-bounce inline-block">4</span>
        </h1>
        
        {/* Floating Elements */}
        <div className="absolute -top-8 -left-8 w-16 h-16 bg-amber-500 rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-blue-500 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500 rounded-full opacity-10 animate-pulse"></div>
      </div>

      {/* Error Message */}
      <div className="text-center max-w-md mx-auto mb-8">
        <h2 className="text-3xl font-bold mb-4">Oops! Page Not Found</h2>
        <p className="text-lg mb-6">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track!
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/" 
          className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Back to Home
        </Link>
        <Link 
          to="/explore" 
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          Explore India
        </Link>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-transparent to-current opacity-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32">
          <div className="w-full h-full">
            <div className="absolute bottom-0 left-1/4 w-8 h-8 bg-amber-500 rounded-full opacity-20 animate-float"></div>
            <div className="absolute bottom-0 right-1/4 w-8 h-8 bg-blue-500 rounded-full opacity-20 animate-float-delayed"></div>
            <div className="absolute bottom-0 left-1/2 w-8 h-8 bg-green-500 rounded-full opacity-20 animate-float"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 