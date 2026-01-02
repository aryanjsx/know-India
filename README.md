# 🇮🇳 Know India

<div align="center">

<img src="frontend/src/Assets/mandala%20logo.png" alt="Know India Logo" width="180"/>

### ✨ Discover the Soul of Incredible India ✨

_An immersive digital experience exploring India's rich heritage, diverse culture, and breathtaking destinations_

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Latest-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Built with ❤️ by [aryanjsx](https://github.com/aryanjsx)**

[🚀 Live Demo](https://knowindia.vercel.app) • [📖 Features](#-features) • [🛠️ Installation](#️-installation) • [🤝 Contributing](#-contributing)

---

</div>

## 📸 Preview

| Home Page | Interactive Map | Place Details |
|:---------:|:--------------:|:-------------:|
| 🏠 Modern hero with slideshow | 🗺️ Clickable India map | 📍 Rich destination info |

## ✨ Features

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

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Styling | Animation | Data |
|:--------:|:-------:|:-------:|:---------:|:----:|
| React 18 | Express.js | Tailwind CSS | Framer Motion | knowindia (npm) |
| React Router | Node.js | CSS3 | CSS Keyframes | Open-Meteo API |
| Context API | REST API | Glassmorphism | SVG Animations | localStorage |

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
│   │   │   ├── navbar.jsx          # Navigation with integrated search
│   │   │   ├── Footer.jsx          # Footer with branding
│   │   │   ├── GlobalSearch.jsx    # Smart autocomplete search
│   │   │   ├── BookmarkButton.jsx  # Reusable bookmark component
│   │   │   ├── ThemeToggle.jsx     # Dark/Light mode toggle
│   │   │   └── MapTour.jsx         # Interactive map tour
│   │   ├── 📂 context/
│   │   │   └── ThemeContext.jsx    # Theme state management
│   │   ├── 📂 pages/
│   │   │   ├── home.jsx            # Hero with slideshow
│   │   │   ├── IndiaMap.jsx        # Interactive map explorer
│   │   │   ├── StatePage.jsx       # State details & places
│   │   │   ├── PlacePage.jsx       # Place details, weather, essentials
│   │   │   ├── SavedPlaces.jsx     # Bookmarked places page
│   │   │   ├── constitution/       # Constitution sub-pages
│   │   │   ├── AboutUs.jsx         # Team information
│   │   │   ├── ContactUs.jsx       # Contact & FAQ
│   │   │   ├── FeedbackPage.jsx    # User feedback form
│   │   │   └── ErrorPage.jsx       # 404 page
│   │   ├── 📂 utils/
│   │   │   ├── seo.js              # SEO utility functions
│   │   │   ├── bookmarks.js        # Bookmark localStorage utilities
│   │   │   └── stateCodeMapping.js # State code conversions
│   │   └── 📄 config.js            # API configuration
│   └── 📄 package.json
│
└── 📂 backend/
    ├── 📄 server.js                # Express server & API routes
    ├── 📂 certs/                   # SSL certificates
    └── 📄 package.json
```

## 🚀 Installation

### Prerequisites

- Node.js >= 16.x
- npm >= 8.x or yarn

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

4️⃣ **Start Development Servers**

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

5️⃣ **Open in Browser**
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/states` | GET | Get all states data |
| `/api/states/:stateName` | GET | Get specific state info |
| `/api/places` | GET | Get all places |
| `/api/places/state/:stateName` | GET | Get places for a state |
| `/api/places/:stateName/place/:placeSlug` | GET | Get specific place details |
| `/api/feedback` | POST | Submit user feedback |
| `/api/feedback` | GET | Get all feedback (admin) |

## 🎯 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| 🏠 Home | `/` | Hero section with slideshow, features, and CTA |
| 🗺️ Explore | `/places` | Interactive India map with state selection |
| 📍 State | `/places/:stateName` | Detailed state info with tourist places |
| 🏞️ Place | `/places/:stateName/:placeSlug` | Place details, weather, nearby essentials |
| 💾 Saved | `/saved` | User's bookmarked/favorite places |
| 📜 Constitution | `/constitution` | Constitution overview with search |
| 📖 Preamble | `/constitution/preamble` | Detailed preamble page |
| ℹ️ About | `/aboutus` | Team and project information |
| 📞 Contact | `/contactus` | Contact form and FAQ |
| 💬 Feedback | `/feedback` | User feedback form |
| ❌ 404 | `/*` | Creative error page |

## 🌐 Environment Variables

Create a `.env` file in the respective directories:

**Frontend (`frontend/.env`)**
```env
REACT_APP_API_URL=http://localhost:5000
```

**Backend (`backend/.env`)**
```env
PORT=5000
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
```

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
- Follow security best practices (see `.cursor/rules`)

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

---

<div align="center">

### 🕉️ Made with ❤️ in India 🇮🇳

<img src="frontend/src/Assets/logo.png" alt="Know India" width="60"/>

**Built by [aryanjsx](https://github.com/aryanjsx) • "Unity in Diversity"**

⭐ Star this repo if you find it helpful!

[![GitHub stars](https://img.shields.io/github/stars/aryanjsx/know-india?style=social)](https://github.com/aryanjsx/know-india)
[![Twitter Follow](https://img.shields.io/twitter/follow/aryanjsx?style=social)](https://twitter.com/aryanjsx)

</div>
