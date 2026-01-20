import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import Home from "./pages/home.jsx";
import IndiaMapPage from "./pages/IndiaMap.jsx";
import StatePage from "./pages/StatePage.jsx"; // Component for individual state pages
import PlacePage from "./pages/PlacePage.jsx"; // Component for individual place pages
import AboutUs from "./pages/AboutUs.jsx"; // Import About Us page
import ContactUs from "./pages/ContactUs.jsx"; // Import Contact Us page
import FeedbackPage from "./pages/FeedbackPage.jsx"; // Import Feedback page
import Constitution from "./pages/constitution.jsx"; // Import Constitution page
import { 
  PreamblePage, 
  ConstitutionOverview, 
  ConstitutionalInitiation, 
  AmendmentsPage, 
  KeyFeaturesPage 
} from "./pages/constitution/index.js"; // Import Constitution sub-pages
import TestKnowIndia from "./pages/TestKnowIndia.jsx"; // Import test component
import SavedPlaces from "./pages/SavedPlaces.jsx"; // Import Saved Places page
import ErrorPage from "./pages/ErrorPage.jsx"; // Import Error/404 page
import AuthSuccess from "./pages/AuthSuccess.jsx"; // Import Auth Success page
import AuthFailure from "./pages/AuthFailure.jsx"; // Import Auth Failure page
import ProfileAbout from "./pages/ProfileAbout.jsx"; // Import Profile About page
import ProfileSettings from "./pages/ProfileSettings.jsx"; // Import Profile Settings page
import Reviews from "./pages/Reviews.jsx"; // Import Reviews page
import { ThemeProvider } from "./context/ThemeContext.jsx"; // Import ThemeProvider
import { AuthProvider } from "./context/AuthContext.jsx"; // Import AuthProvider
import { syncPendingFeedback, hasPendingFeedback } from "./utils/feedbackSync.js"; // Import feedback sync utility

// ScrollToTop component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Component to handle feedback sync on app startup
function FeedbackSyncHandler() {
  useEffect(() => {
    // Check if there's any pending feedback to sync
    const checkForPendingFeedback = async () => {
      if (hasPendingFeedback()) {
        console.log("Found pending feedback, attempting to sync...");
        try {
          const result = await syncPendingFeedback();
          if (result.success) {
            console.log(`Successfully synced ${result.synced} feedback items`);
            if (result.failed > 0) {
              console.warn(`Failed to sync ${result.failed} feedback items`);
            }
          } else {
            console.error("Failed to sync feedback:", result.errors);
          }
        } catch (error) {
          console.error("Error syncing feedback:", error);
        }
      }
    };

    // Wait a bit for the app to initialize before checking
    const syncTimer = setTimeout(() => {
      checkForPendingFeedback();
    }, 5000); // 5 second delay to avoid interfering with initial app load

    // Set up periodic checks for syncing feedback
    const periodicSyncTimer = setInterval(() => {
      checkForPendingFeedback();
    }, 60000); // Check every minute

    return () => {
      clearTimeout(syncTimer);
      clearInterval(periodicSyncTimer);
    };
  }, []);

  return null;
}

function App() {
  console.log("App component rendered");
  
  return (
    <ThemeProvider>
      <AuthProvider>
      <Router>
        <ScrollToTop />
        <FeedbackSyncHandler />
        <div className="flex flex-col min-h-screen dark:bg-gray-900 transition-colors duration-300">
          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/places" element={<IndiaMapPage />} />
              <Route path="/places/:stateName" element={<StatePage />} />
              <Route path="/places/:stateName/:placeSlug" element={<PlacePage />} />
              <Route path="/constitution" element={<Constitution />} />
              <Route path="/constitution/preamble" element={<PreamblePage />} />
              <Route path="/constitution/overview" element={<ConstitutionOverview />} />
              <Route path="/constitution/initiation" element={<ConstitutionalInitiation />} />
              <Route path="/constitution/amendments" element={<AmendmentsPage />} />
              <Route path="/constitution/features" element={<KeyFeaturesPage />} />
              <Route path="/aboutus" element={<AboutUs />} />
              <Route path="/contactus" element={<ContactUs />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/saved" element={<SavedPlaces />} />
              <Route path="/test-knowindia" element={<TestKnowIndia />} />
                {/* Auth Routes */}
                <Route path="/auth/success" element={<AuthSuccess />} />
                <Route path="/auth/failure" element={<AuthFailure />} />
                {/* Reviews Route */}
                <Route path="/reviews" element={<Reviews />} />
                
                {/* Profile Routes */}
                <Route path="/profile/about" element={<ProfileAbout />} />
                <Route path="/profile/settings" element={<ProfileSettings />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
