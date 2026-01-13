import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/navbar';
import Footer from './components/footer';
import HomePage from './pages/HomePage';
import IndiaMap from './pages/IndiaMap';
import StatePage from './pages/StatePage';
import CityPage from './pages/CityPage';
import PlacePage from './pages/PlacePage';
import ItineraryPlanner from './pages/ItineraryPlanner';
import SharedItinerary from './pages/SharedItinerary';
import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route exact path="/" element={<HomePage />} />
              <Route exact path="/explore" element={<IndiaMap />} />
              <Route exact path="/places/state/:stateName" element={<StatePage />} />
              <Route exact path="/places/:stateName/:cityName" element={<CityPage />} />
              <Route exact path="/places/:placeName" element={<PlacePage />} />
              <Route exact path="/trip-planner" element={<ItineraryPlanner />} />
              <Route exact path="/itinerary/:id" element={<SharedItinerary />} />
              {/* Catch-all route for invalid URLs - must be the last route */}
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 