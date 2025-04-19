import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import StatePage from './pages/StatePage';
import PlacePage from './pages/PlacePage';
import { ThemeProvider } from './context/ThemeContext';

// Layout component that includes Navbar and Footer
const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Define routes using the new createBrowserRouter
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "state/:stateName",
        element: <StatePage />
      },
      {
        path: "state/:stateName/place/:placeId",
        element: <PlacePage />
      },
      {
        path: "places/city/:cityName",
        element: <PlacePage />
      },
      {
        path: "*",
        element: (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                The page you're looking for doesn't exist.
              </p>
            </div>
          </div>
        )
      }
    ]
  }
]);

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App; 