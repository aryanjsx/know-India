import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { API_CONFIG, getApiUrl } from '../config';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    feedback: '',
    suggestions: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isServerDownError, setIsServerDownError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    setIsServerDownError(false); // Reset server down error flag
    
    try {
      // Show submitting state
      const submitButton = e.target.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerText = 'Submitting...';
      }
      
      // First check if the server is online
      try {
        // Skip the health check, go directly to feedback submission
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.FEEDBACK), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: formData.feedback,
            rating: formData.rating
          }),
          mode: 'cors'
        });

        if (!response.ok) {
          let errorMessage = `Error: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
            
            // Check for database connection errors
            if (errorMessage.includes('ECONNREFUSED') || 
                errorMessage.includes('database') || 
                errorMessage.includes('Database') ||
                errorMessage.includes('connection')) {
              setIsServerDownError(true);
              throw new Error('Our database is temporarily unavailable. Your feedback has been saved locally and will be sent when the service is restored.');
            }
          } catch (parseError) {
            await response.text(); // Just read the text to clear the response stream
          }
          throw new Error(`Failed to submit feedback: ${errorMessage}`);
        }

        // Parse the response
        await response.json(); // Just read the response to clear the stream
        
        // Show success message
        setIsSubmitted(true);
        
        // Reset form after 3 seconds and close modal
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            name: '',
            email: '',
            rating: 5,
            feedback: '',
            suggestions: ''
          });
          onClose();
        }, 3000);
      } catch (err) {
        // Only set server down error if it's a connection issue
        if (err.message.includes('database') || 
            err.message.includes('Database') || 
            err.message.includes('unavailable') ||
            err.message.includes('saved locally')) {
          setIsServerDownError(true);
        }
        
        throw err; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      setErrorMessage(error.message);
      
      // If this is a server down error, save the feedback to local storage for later submission
      if (isServerDownError) {
        try {
          const pendingFeedback = JSON.parse(localStorage.getItem('pendingFeedback')) || [];
          pendingFeedback.push({
            ...formData,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('pendingFeedback', JSON.stringify(pendingFeedback));
          
          // Show special success message for offline mode
          setIsSubmitted(true);
          setTimeout(() => {
            setIsSubmitted(false);
            setFormData({
              name: '',
              email: '',
              rating: 5,
              feedback: '',
              suggestions: ''
            });
            onClose();
          }, 5000);
        } catch (storageError) {
          console.error('Error saving feedback to local storage:', storageError);
        }
      }
    } finally {
      // Reset button state
      const submitButton = document.querySelector('form button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerText = 'Submit Feedback';
      }
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Share Your Feedback</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Thank You!</h3>
                  {isServerDownError ? (
                    <p className="text-gray-600 dark:text-gray-300">
                      Your feedback has been saved locally. We'll submit it as soon as our services are back online.
                    </p>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300">
                      Your feedback has been submitted successfully. We appreciate your input!
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {errorMessage && !isServerDownError && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300">
                      <p>{errorMessage}</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    {/* Rating */}
                    <div>
                      <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate your experience (1-5)</label>
                      <div className="flex space-x-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                            className="focus:outline-none"
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-8 w-8 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                              fill={star <= formData.rating ? 'currentColor' : 'none'}
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                              />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feedback */}
                    <div>
                      <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">What did you like about our website?</label>
                      <textarea
                        id="feedback"
                        name="feedback"
                        value={formData.feedback}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      ></textarea>
                    </div>

                    {/* Suggestions */}
                    <div>
                      <label htmlFor="suggestions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">What could we improve?</label>
                      <textarea
                        id="suggestions"
                        name="suggestions"
                        value={formData.suggestions}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 ${
                          isSubmitting 
                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 dark:from-blue-500 dark:to-indigo-600 dark:hover:from-blue-600 dark:hover:to-indigo-700'
                        } text-white font-medium rounded-lg transition-colors`}
                        onClick={(e) => {
                          if (isSubmitting) {
                            e.preventDefault(); // Prevent form submission if already submitting
                          }
                        }}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal; 