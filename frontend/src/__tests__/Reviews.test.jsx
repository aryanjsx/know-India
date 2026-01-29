import { render, screen, waitFor } from '@testing-library/react';
import Reviews from '../pages/Reviews';
import { AuthProvider } from '../context/AuthContext';

// Mock fetch globally
global.fetch = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom');

// Mock ThemeContext to avoid matchMedia issues
jest.mock('../context/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({ theme: 'light', toggleTheme: jest.fn() }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Sample mock reviews data
const mockReviews = [
  {
    id: 1,
    title: 'Amazing Trip to Taj Mahal',
    content: 'The Taj Mahal was absolutely breathtaking...',
    place_name: 'Taj Mahal',
    state: 'Uttar Pradesh',
    user_name: 'Travel Enthusiast',
    user_avatar: null,
    upvotes: 42,
    downvotes: 2,
    created_at: '2024-01-15T10:30:00Z',
  },
];

// Import ThemeProvider after mocking
const { ThemeProvider } = require('../context/ThemeContext');

// Helper to render with providers
const renderReviews = (options = {}) => {
  const { isAuthenticated = false, reviews = mockReviews } = options;
  
  global.fetch.mockImplementation((url) => {
    // Mock auth status
    if (url.includes('/auth/status')) {
      return Promise.resolve({
        json: () => Promise.resolve({
          authenticated: isAuthenticated,
          user: isAuthenticated ? { id: 1, name: 'Test User' } : null,
        }),
      });
    }
    // Mock CSRF token
    if (url.includes('/auth/csrf-token')) {
      return Promise.resolve({
        json: () => Promise.resolve({ csrfToken: 'mock-csrf' }),
      });
    }
    // Mock reviews/posts endpoint
    if (url.includes('/profile-posts')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: reviews,
        }),
      });
    }
    // Default
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });

  return render(
    <ThemeProvider>
      <AuthProvider>
        <Reviews />
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('Reviews Page - Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders Reviews page for guest users without crashing', async () => {
    renderReviews({ isAuthenticated: false });

    // The page should render without crashing
    // Wait for loading to complete
    await waitFor(() => {
      // Either we see reviews or the "no reviews" message
      const hasReviews = screen.queryByText('Amazing Trip to Taj Mahal');
      const noReviews = screen.queryByText(/no reviews yet/i);
      expect(hasReviews || noReviews).toBeTruthy();
    }, { timeout: 3000 });
  });

  test('renders page header correctly', async () => {
    renderReviews();

    // Check that the page header renders
    await waitFor(() => {
      expect(screen.getByText('Travel Reviews')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('renders page description', async () => {
    renderReviews();

    await waitFor(() => {
      expect(screen.getByText(/discover authentic travel experiences/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('shows loading indicator initially', () => {
    // Don't resolve fetch immediately
    global.fetch.mockImplementation(() => new Promise(() => {}));

    const { container } = render(
      <ThemeProvider>
        <AuthProvider>
          <Reviews />
        </AuthProvider>
      </ThemeProvider>
    );

    // Should show loading indicator - component uses animate-spin class
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
