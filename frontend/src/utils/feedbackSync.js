/**
 * Utility to sync locally stored feedback with the server
 * when the database connection is restored
 */

/**
 * Attempts to sync any pending feedback stored in local storage
 * @returns {Promise<{success: boolean, synced: number, failed: number, errors: Array}>}
 */
export const syncPendingFeedback = async () => {
  const result = {
    success: false,
    synced: 0,
    failed: 0,
    errors: []
  };

  try {
    // Check if there's any pending feedback
    const pendingFeedback = JSON.parse(localStorage.getItem('pendingFeedback')) || [];
    
    if (pendingFeedback.length === 0) {
      console.log('No pending feedback to sync');
      result.success = true;
      return result;
    }

    console.log(`Found ${pendingFeedback.length} pending feedback items to sync`);

    // Check if the server is online and database is connected
    try {
      console.log('Checking server and database health...');
      const healthCheck = await fetch('https://knowindiaback.vercel.app/api/health');
      
      if (!healthCheck.ok) {
        console.error('Server health check failed, aborting sync');
        result.errors.push('Server health check failed');
        return result;
      }
      
      const healthStatus = await healthCheck.json();
      console.log('Server health status:', healthStatus);
      
      if (healthStatus.db_connection !== 'connected') {
        console.error('Database is still not connected, aborting sync');
        result.errors.push('Database not connected');
        return result;
      }
      
      // Double-check with a database test endpoint
      const dbTest = await fetch('https://knowindiaback.vercel.app/api/db-test');
      
      if (!dbTest.ok) {
        console.error('Database test failed, aborting sync');
        result.errors.push('Database test failed');
        return result;
      }
      
      const dbStatus = await dbTest.json();
      console.log('Database test status:', dbStatus);
      
      if (!dbStatus.connected) {
        console.error('Database test indicates database is not connected, aborting sync');
        result.errors.push('Database test indicates not connected');
        return result;
      }
    } catch (healthError) {
      console.error('Error checking server health:', healthError);
      result.errors.push(`Health check error: ${healthError.message}`);
      return result;
    }

    // Server and database are available, start syncing
    const successfullySubmitted = [];
    
    for (let i = 0; i < pendingFeedback.length; i++) {
      const feedback = pendingFeedback[i];
      try {
        // Remove the timestamp field before sending
        const { timestamp, ...feedbackData } = feedback;
        
        console.log(`Syncing item ${i+1}/${pendingFeedback.length}:`, feedbackData);
        
        const response = await fetch('https://knowindiaback.vercel.app/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData),
          mode: 'cors'
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log(`Successfully synced item ${i+1}, server response:`, responseData);
          // Successfully submitted this feedback
          successfullySubmitted.push(i);
          result.synced++;
        } else {
          // Failed to submit this feedback
          result.failed++;
          try {
            const errorData = await response.json();
            console.error(`Failed to sync item ${i+1}:`, errorData);
            result.errors.push(`Failed to sync item ${i+1}: ${errorData.error || response.status}`);
          } catch (e) {
            console.error(`Failed to parse error response for item ${i+1}:`, e);
            result.errors.push(`Failed to sync item ${i+1}: ${response.status}`);
          }
        }
      } catch (error) {
        // Error submitting this feedback
        result.failed++;
        console.error(`Error syncing item ${i+1}:`, error);
        result.errors.push(`Error syncing item ${i+1}: ${error.message}`);
      }
    }

    // Remove successfully submitted feedback from local storage
    if (successfullySubmitted.length > 0) {
      const remainingFeedback = pendingFeedback.filter((_, index) => !successfullySubmitted.includes(index));
      
      if (remainingFeedback.length > 0) {
        localStorage.setItem('pendingFeedback', JSON.stringify(remainingFeedback));
        console.log(`Updated local storage: ${remainingFeedback.length} items remaining`);
      } else {
        localStorage.removeItem('pendingFeedback');
        console.log('All feedback synced, cleared local storage');
      }
      
      console.log(`Synced ${successfullySubmitted.length} feedback items, ${remainingFeedback.length} remaining`);
    }

    result.success = result.synced > 0;
    return result;
  } catch (error) {
    console.error('Error syncing feedback:', error);
    result.errors.push(`Sync error: ${error.message}`);
    return result;
  }
};

/**
 * Check if there's any pending feedback in local storage
 * @returns {boolean} - True if there's pending feedback
 */
export const hasPendingFeedback = () => {
  try {
    const pendingFeedback = JSON.parse(localStorage.getItem('pendingFeedback')) || [];
    return pendingFeedback.length > 0;
  } catch (error) {
    console.error('Error checking pending feedback:', error);
    return false;
  }
};

/**
 * Get count of pending feedback items
 * @returns {number} - Number of pending feedback items
 */
export const getPendingFeedbackCount = () => {
  try {
    const pendingFeedback = JSON.parse(localStorage.getItem('pendingFeedback')) || [];
    return pendingFeedback.length;
  } catch (error) {
    console.error('Error getting pending feedback count:', error);
    return 0;
  }
}; 