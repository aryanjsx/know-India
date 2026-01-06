# 🇮🇳 Know India

<div align="center">

<img src="frontend/src/Assets/mandala%20logo.png" alt="Know India Logo" width="180"/>

### ✨ Discover the Soul of Incredible India ✨

_An immersive digital experience exploring India's rich heritage, diverse culture, and breathtaking destinations_

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Latest-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Built with ❤️ by [aryanjsx](https://github.com/aryanjsx)**

[🚀 Live Demo](https://knowindia.vercel.app) • [📖 Features](#-features) • [🛠️ Installation](#️-installation) • [🤝 Contributing](#-contributing)

---

</div>

## 📸 Preview

| Home Page | Interactive Map | Place Details | Travel Reviews |
|:---------:|:--------------:|:-------------:|:--------------:|
| 🏠 Modern hero with slideshow | 🗺️ Clickable India map | 📍 Rich destination info | ⭐ Community experiences |

## ✨ Features

### 🔐 **User Authentication**
- **Google OAuth 2.0** login with Passport.js
- **JWT-based** session management (7-day token expiry)
- Secure authentication flow with proper redirects
- Persistent login across browser sessions
- Profile dropdown with quick access to settings

### 👤 **User Profile Management**
- **Profile Settings** - Update display name and profile picture
- **Profile About** - Share and manage travel experiences
- Avatar upload with image validation (5MB max, JPG/PNG/WebP)
- Real-time profile updates across the app

### ⭐ **Travel Reviews & Experiences**
- **Share Travel Stories** - Post your travel experiences with:
  - Place name and state selection
  - Detailed experience description
  - Rating (1-5 stars)
  - Photo uploads (up to 5 images)
- **Community Reviews** - Browse experiences from all travelers
- **Upvote/Downvote** - Rate helpful reviews
- **Edit & Delete** - Manage your own posts
- Strict validation on all form fields

### 🔍 **Global Search**
- **Smart autocomplete** suggestions as you type
- Search across **states, union territories, and tourist places**
- **Fuzzy matching** for typo-tolerance
- Keyboard navigation support (↑/↓/Enter/Escape)
- Instant navigation to state or place pages
- Optimized with debouncing for performance

### 💾 **Bookmark & Favorites**
- **Save your favorite places** with one click
- Persistent storage using `localStorage` - survives page reloads
- Dedicated `/saved` page to view all bookmarked destinations
- Quick remove functionality
- Clear all bookmarks option with confirmation
- Beautiful bookmark icons on place cards and detail pages

### 🗺️ **Interactive India Map**
- Click on any state to explore its unique culture and destinations
- Beautiful SVG map with hover animations and tooltips
- Real-time state information display
- Smooth navigation to detailed state pages

### 🏛️ **State Explorer**
- Comprehensive information about each state including:
  - 📍 State symbols (bird, animal, flower, tree)
  - 🎭 Cultural heritage and festivals
  - 🍛 Authentic regional cuisine
  - 🏞️ Tourist attractions with image galleries
  - 📚 Historical facts and interesting trivia
- Modern card-based UI with animations

### 📍 **Rich Place Details**
- **Beautiful image galleries** with auto-slideshow
- **Live Weather Updates** - Real-time temperature, humidity, and weather conditions
  - Powered by Open-Meteo API (free, no API key required)
  - Automatic location detection with fallback strategies
  - Weather refresh functionality
  - "Feels like" temperature display
- **Best Time to Visit** - Season-based recommendations
- **Essentials Nearby** - Quick links to find:
  - 🏨 Hotels
  - 🏥 Hospitals
  - 💊 Pharmacies
  - 🚔 Police Stations
  - Opens Google Maps in new tab for directions
- Share functionality with Web Share API support
- Bookmark/favorite toggle

### 📜 **Constitution Section**
- Explore India's constitutional framework
- Interactive pages for:
  - 🕉️ Preamble with detailed explanation
  - 📖 Constitutional Overview
  - ⚖️ Key Features & Amendments
  - 🏛️ Constitutional Initiation
- Searchable content across all sections
- Sidebar navigation for easy exploration

### 🌗 **Dark/Light Theme**
- Seamless theme switching with beautiful animations
- Consistent styling across all pages
- Vibrant backgrounds for both themes
- System preference detection

### 📱 **Fully Responsive**
- Optimized for desktop, tablet, and mobile devices
- Touch-friendly interactions
- Adaptive layouts and typography
- Mobile-specific navigation

### 🔎 **SEO Optimized**
- **Dynamic meta tags** for each page (title, description, keywords)
- **Open Graph tags** for rich social media sharing
- **Twitter Card** support
- **Structured data** (JSON-LD) for tourist destinations
- **Semantic HTML** with proper heading hierarchy
- **Image lazy loading** for performance
- **Descriptive alt text** on all images
- **Search engine** friendly URLs
- **robots.txt** and **manifest.json** configured

### 🎨 **Modern UI/UX**
- Framer Motion animations throughout
- Glassmorphism design elements
- Animated gradient backgrounds
- Interactive hover effects
- Loading skeletons and states
- Toast notifications and modals

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Database | Auth | Styling |
|:--------:|:-------:|:--------:|:----:|:-------:|
| React 18 | Express.js | MySQL | Google OAuth 2.0 | Tailwind CSS |
| React Router | Node.js | mysql2 | Passport.js | Framer Motion |
| Context API | REST API | - | JWT | Glassmorphism |

| Animation | Storage | APIs | Deployment |
|:---------:|:-------:|:----:|:----------:|
| Framer Motion | localStorage | Open-Meteo | Vercel |
| CSS Keyframes | MySQL | knowindia (npm) | - |

</div>

## 📁 Project Structure

```
know-india/
├── 📂 frontend/
│   ├── 📂 public/
│   │   ├── index.html          # SEO meta tags, Open Graph
│   │   ├── manifest.json       # PWA manifest
│   │   └── robots.txt          # Search engine directives
│   ├── 📂 src/
│   │   ├── 📂 Assets/          # Images, logos, and static files
│   │   ├── 📂 components/
│   │   │   ├── navbar.jsx          # Navigation with search & auth
│   │   │   ├── Footer.jsx          # Footer with branding
│   │   │   ├── GlobalSearch.jsx    # Smart autocomplete search
│   │   │   ├── BookmarkButton.jsx  # Reusable bookmark component
│   │   │   └── ThemeToggle.jsx     # Dark/Light mode toggle
│   │   ├── 📂 context/
│   │   │   ├── ThemeContext.jsx    # Theme state management
│   │   │   └── AuthContext.jsx     # Authentication state management
│   │   ├── 📂 pages/
│   │   │   ├── home.jsx            # Hero with slideshow
│   │   │   ├── IndiaMap.jsx        # Interactive map explorer
│   │   │   ├── StatePage.jsx       # State details & places
│   │   │   ├── PlacePage.jsx       # Place details, weather, essentials
│   │   │   ├── SavedPlaces.jsx     # Bookmarked places page
│   │   │   ├── Reviews.jsx         # Public travel reviews
│   │   │   ├── ProfileAbout.jsx    # User profile & post management
│   │   │   ├── ProfileSettings.jsx # Profile settings page
│   │   │   ├── AuthSuccess.jsx     # OAuth success handler
│   │   │   ├── AuthFailure.jsx     # OAuth failure handler
│   │   │   ├── constitution/       # Constitution sub-pages
│   │   │   ├── AboutUs.jsx         # Team information
│   │   │   ├── ContactUs.jsx       # Contact & FAQ
│   │   │   ├── FeedbackPage.jsx    # User feedback form
│   │   │   └── ErrorPage.jsx       # 404 page
│   │   ├── 📂 utils/
│   │   │   ├── seo.js              # SEO utility functions
│   │   │   ├── jwt.js              # JWT decode utilities
│   │   │   ├── bookmarks.js        # Bookmark localStorage utilities
│   │   │   └── stateCodeMapping.js # State code conversions
│   │   └── 📄 config.js            # API configuration
│   └── 📄 package.json
│
└── 📂 backend/
    ├── 📄 server.js                # Express server & API routes
    ├── 📂 config/
    │   ├── passport.js             # Google OAuth configuration
    │   └── multer.js               # File upload configuration
    ├── 📂 controllers/
    │   ├── profilePosts.controller.js    # Travel posts logic
    │   └── profileSettings.controller.js # Profile settings logic
    ├── 📂 middleware/
    │   └── auth.middleware.js      # JWT authentication middleware
    ├── 📂 routes/
    │   ├── auth.routes.js          # OAuth routes
    │   ├── profilePosts.routes.js  # Travel posts API
    │   └── profileSettings.routes.js # Profile settings API
    ├── 📂 utils/
    │   ├── db.js                   # Database connection & utilities
    │   └── jwt.js                  # JWT generation & verification
    ├── 📂 certs/                   # SSL certificates
    ├── 📄 vercel.json              # Vercel deployment config
    └── 📄 package.json
```

## 🚀 Installation

### Prerequisites

- Node.js >= 16.x
- npm >= 8.x or yarn
- MySQL 8.x

### Quick Start

1️⃣ **Clone the repository**
```bash
git clone https://github.com/aryanjsx/know-india.git
cd know-india
```

2️⃣ **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3️⃣ **Install Backend Dependencies**
```bash
cd ../backend
npm install
```

4️⃣ **Configure Environment Variables**

Create `backend/.env`:
```env
# Database
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=3306

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# JWT
JWT_SECRET=your_jwt_secret_key

# Frontend URL
CLIENT_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

5️⃣ **Start Development Servers**

Frontend (Terminal 1):
```bash
cd frontend
npm start
```

Backend (Terminal 2):
```bash
cd backend
npm run dev
```

6️⃣ **Open in Browser**
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

## 🔌 API Endpoints

### Public APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/states` | GET | Get all states data |
| `/api/states/:stateName` | GET | Get specific state info |
| `/api/places` | GET | Get all places |
| `/api/places/state/:stateName` | GET | Get places for a state |
| `/api/places/:stateName/place/:placeSlug` | GET | Get specific place details |
| `/api/feedback` | POST | Submit user feedback |
| `/api/feedback` | GET | Get all feedback (admin) |
| `/api/profile/posts` | GET | Get all travel posts |
| `/api/profile/posts/:id` | GET | Get single post |

### Authentication APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/google` | GET | Initiate Google OAuth |
| `/auth/google/callback` | GET | OAuth callback handler |
| `/auth/failure` | GET | OAuth failure redirect |

### Protected APIs (JWT Required)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/profile/settings` | GET | Get user profile |
| `/api/profile/settings` | PUT | Update profile (name, avatar) |
| `/api/profile/posts` | POST | Create travel post |
| `/api/profile/posts/:id` | PUT | Update own post |
| `/api/profile/posts/:id` | DELETE | Delete own post |
| `/api/profile/posts/:id/vote` | POST | Upvote/downvote post |
| `/api/profile/posts/:id/vote` | GET | Get user's vote on post |

## 🎯 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| 🏠 Home | `/` | Hero section with slideshow, features, and CTA |
| 🗺️ Explore | `/places` | Interactive India map with state selection |
| 📍 State | `/places/:stateName` | Detailed state info with tourist places |
| 🏞️ Place | `/places/:stateName/:placeSlug` | Place details, weather, nearby essentials |
| 💾 Saved | `/saved` | User's bookmarked/favorite places |
| ⭐ Reviews | `/reviews` | Community travel reviews |
| 👤 Profile About | `/profile/about` | User profile & post management |
| ⚙️ Profile Settings | `/profile/settings` | Update name & avatar |
| ✅ Auth Success | `/auth/success` | OAuth success handler |
| ❌ Auth Failure | `/auth/failure` | OAuth failure handler |
| 📜 Constitution | `/constitution` | Constitution overview with search |
| 📖 Preamble | `/constitution/preamble` | Detailed preamble page |
| ℹ️ About | `/aboutus` | Team and project information |
| 📞 Contact | `/contactus` | Contact form and FAQ |
| 💬 Feedback | `/feedback` | User feedback form |
| ❌ 404 | `/*` | Creative error page |

## 🌐 Environment Variables


## 🔍 SEO Features

Know India is optimized for search engines with:

| Feature | Implementation |
|---------|----------------|
| **Dynamic Titles** | Each page has unique, keyword-rich titles |
| **Meta Descriptions** | Descriptive meta tags for all pages |
| **Open Graph** | Rich previews when shared on Facebook, LinkedIn |
| **Twitter Cards** | Optimized cards for Twitter sharing |
| **Structured Data** | JSON-LD schema for tourist destinations |
| **Semantic HTML** | Proper heading hierarchy (h1-h3) |
| **Image Alt Text** | Descriptive alt attributes for accessibility |
| **Lazy Loading** | Images load on-demand for faster initial load |
| **robots.txt** | Configured for optimal crawling |
| **Canonical URLs** | Prevent duplicate content issues |

**Target Keywords:** India travel, India tourism, tourist places India, aryanjsx, know india

## 📈 Performance

- ⚡ Lighthouse Score: 90+
- 🎨 First Contentful Paint: < 1.5s
- 📱 Mobile Optimized
- 🔍 SEO Score: 95+
- ♿ Accessibility Score: 90+
- 🖼️ Image Lazy Loading
- ⚙️ Code Splitting via React Router

## 🔒 Security Features

- 🔐 JWT-based authentication with secure token handling
- 🛡️ Input validation on all API endpoints
- 🚫 SQL injection prevention with parameterized queries
- 🔑 Environment variables for sensitive data
- 🌐 CORS configuration for allowed origins
- 📝 Request rate limiting ready
- 🔒 HTTPS in production

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. 💻 **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. 📤 **Push** to the branch (`git push origin feature/amazing-feature`)
5. 🎉 **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Update documentation as needed
- Test your changes thoroughly

## 👥 Team

<div align="center">

| <img src="frontend/src/Assets/Aryan.webp" width="120px" style="border-radius: 50%"/> | <img src="frontend/src/Assets/Brajesh.JPG" width="120px" style="border-radius: 50%"/> |
|:---:|:---:|
| **Aryan Kumar** | **Brajesh Kumar** |
| Frontend Lead | Backend Lead |
| [@aryanjsx](https://github.com/aryanjsx) | [@brajeshkrjha](https://github.com/brajeshkrjha) |
| [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/aryanjsx) | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/brajeshkrjha) |

</div>

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 🇮🇳 Inspired by the incredible diversity of India
- 📚 Data sourced from official government resources
- 🌤️ Weather data powered by [Open-Meteo](https://open-meteo.com/)
- 📦 State data from [knowindia](https://www.npmjs.com/package/knowindia) npm package
- 🎨 Icons from [Lucide Icons](https://lucide.dev/)
- 🗺️ Map component from [react-svgmap-india](https://www.npmjs.com/package/react-svgmap-india)
- 🔐 Authentication powered by [Passport.js](http://www.passportjs.org/)

---

<div align="center">

### 🕉️ Made with ❤️ in India 🇮🇳

<img src="frontend/src/Assets/logo.png" alt="Know India" width="60"/>

**Built by [aryanjsx](https://github.com/aryanjsx) • "Unity in Diversity"**

⭐ Star this repo if you find it helpful!

[![GitHub stars](https://img.shields.io/github/stars/aryanjsx/know-india?style=social)](https://github.com/aryanjsx/know-india)
[![Twitter Follow](https://img.shields.io/twitter/follow/aryanjsx?style=social)](https://twitter.com/aryanjsx)

</div>
