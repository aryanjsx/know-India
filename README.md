<div align="center">
  <img src="frontend/src/assets/logo.png" alt="Know India" width="180" />
  
  # Know India
  
  **Discover India's soul**
  
  Explore 28 states, 8 union territories, rich culture, and heritage sites.

  [![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://knowindia.vercel.app)
  [![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-orange?style=for-the-badge)](CONTRIBUTING.md)
  
  [Live Demo](https://knowindia.vercel.app) · [Report Bug](https://github.com/aryanjsx/know-India/issues) · [Request Feature](https://github.com/aryanjsx/know-India/issues)

</div>

---

## ✨ What Makes This Special

🗺️ **Comprehensive Coverage** — Detailed info on all Indian states, union territories, destinations, and cultural heritage

🎉 **Festivals** — Explore India's vibrant festivals with detailed info on celebrations across states

⭐ **Traveler Reviews** — Read authentic experiences shared by visitors with ratings and photos

🔐 **Secure Auth** — Google OAuth 2.0 with JWT sessions

💾 **Cloud Sync** — Save favorite places across devices

📱 **Responsive** — Beautiful UI on any screen size

📲 **PWA Ready** — Install on mobile/desktop, works offline

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8+
- Google OAuth credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/aryanjsx/know-India.git
cd know-India

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### Environment Setup

Create `backend/.env`:

```env
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=knowindia
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
```

### Run Locally

```bash
# Terminal 1 — Backend
cd backend && npm start

# Terminal 2 — Frontend
cd frontend && npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL |
| **Auth** | Google OAuth 2.0, JWT |
| **PWA** | Service Worker, Web App Manifest, Cache API |
| **Data** | [@aryanjsx/knowindia](https://www.npmjs.com/package/@aryanjsx/knowindia) |

---

## 📁 Project Structure

```
know-India/
├── .github/
│   └── workflows/
│       └── ci.yml            # CI/CD pipeline
├── frontend/                 # React application
│   ├── .eslintrc.js          # ESLint configuration
│   ├── public/
│   │   ├── manifest.json     # PWA manifest
│   │   ├── service-worker.js # Service worker for offline
│   │   └── offline.html      # Offline fallback page
│   └── src/
│       ├── __tests__/        # Smoke tests
│       ├── __mocks__/        # Test mocks
│       ├── components/
│       │   ├── RatingStars.jsx    # Star rating display
│       │   ├── ReviewCard.jsx     # Review card component
│       │   └── ...
│       ├── pages/
│       │   ├── FestivalsPage.jsx      # Festivals listing
│       │   ├── FestivalDetailPage.jsx # Individual festival
│       │   ├── Reviews.jsx            # Traveler reviews
│       │   └── ...
│       ├── context/
│       └── utils/
├── backend/                  # Express API server
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── utils/
└── README.md
```

---

## 🎉 Features

### Festivals
Discover India's vibrant celebrations throughout the year:
- Browse festivals by month or search by name/state
- View detailed information including best places to experience
- Beautiful card-based UI with full-page detail view

### Traveler Reviews
Read authentic experiences from real visitors:
- Star rating system (1-5 stars)
- Search and filter by place, state, or rating
- Upvote/downvote community reviews
- Photo galleries from travelers

### Progressive Web App (PWA)
Install Know India on any device and use it offline:
- **Installable** — Add to home screen on mobile/desktop
- **Offline Support** — Browse cached pages without internet
- **Smart Caching** — Images and API responses cached automatically
- **Background Sync** — API data updates when back online

#### Caching Strategy
| Resource Type | Strategy | Description |
|---------------|----------|-------------|
| Static Assets | Pre-cache | Cached on install (HTML, CSS, JS, icons) |
| Images | Cache-first | Served from cache, fetched if not available |
| API (`/api/places`) | Network-first | Fresh data preferred, falls back to cache |
| Navigation | Network-first | Shows offline page if unavailable |

#### Testing Offline Mode
1. Open Chrome DevTools (F12)
2. Go to **Application** → **Service Workers** to verify registration
3. Go to **Network** tab → Check **Offline**
4. Refresh and navigate — cached content loads offline

---

## 🔒 Security

**Security Posture: MODERATE (80%)** — Production-ready with OWASP Top 10 alignment.

This platform is built with security-first principles:

| Category | Implementation |
|----------|----------------|
| **HTTP Security Headers** | Helmet.js with CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| **Rate Limiting** | API protection (200 req/15min) + Auth limits (10 attempts/15min) |
| **Authentication** | JWT with mandatory secret, 1h expiry, HS256 algorithm, token blacklisting on logout |
| **Authorization** | Ownership verification for user content, IDOR protection via JWT-based user ID |
| **Database** | MySQL connection pooling, SSL enforcement in production, parameterized queries |
| **Input Validation** | Server-side validation on all endpoints, ID validation, string length limits |
| **File Uploads** | Strict MIME type + extension validation, SVG blocked, path traversal prevention |
| **Error Handling** | Sanitized responses in production, no internal details leaked |
| **Debug Endpoints** | Automatically disabled in production (`NODE_ENV=production`) |

### Required Environment Variables

```env
# Authentication (CRITICAL)
JWT_SECRET=your-strong-secret-min-32-chars

# Database
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USERNAME=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_DATABASE=knowindia

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Environment
NODE_ENV=production  # Enables strict security mode
```

### Security Audit

```bash
# Check for known vulnerabilities
cd backend && npm audit

# Fix automatically where possible
cd backend && npm audit fix
```

---

## 🗺️ Roadmap

- [x] Festivals feature with detailed pages
- [x] Enhanced reviews with star ratings and filters
- [x] Offline PWA mode
- [ ] Multi-language support
- [ ] Budget calculator

---

## 🧪 Development

### Code Quality

This project uses **ESLint** to maintain code quality with strict rules for unused imports.

```bash
# Run linter
cd frontend && npm run lint

# Auto-fix issues
cd frontend && npm run lint:fix

# Run tests
cd frontend && npm test
```

### CI/CD Pipeline

GitHub Actions automatically runs on every push and PR to `main`/`develop`:

| Check | Description |
|-------|-------------|
| **ESLint** | Catches unused imports/variables as errors |
| **Tests** | Runs smoke tests for critical pages |
| **Build** | Ensures production build succeeds |
| **Syntax** | Validates backend JavaScript syntax |

---

## 🤝 Contributing

Contributions make open source amazing. **All skill levels welcome!**

### Good First Issues

- 🐛 Bug fixes
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🌐 Adding translations

### How to Contribute

1. Fork the repository
2. Create a branch: `git checkout -b feature/amazing-feature`
3. Run lint before committing: `npm run lint`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

> **Note:** CI will fail if there are unused imports or linting errors.

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [KnowIndia NPM Package](https://www.npmjs.com/package/@aryanjsx/knowindia) — Curated Indian destination data
- All our amazing [contributors](https://github.com/aryanjsx/know-India/graphs/contributors)

---

<div align="center">
  
  **If this project helped you, consider giving it a ⭐**
  
  It helps others discover the project and motivates continued development.
  
  [![Star History](https://img.shields.io/github/stars/aryanjsx/know-India?style=social)](https://github.com/aryanjsx/know-India)

</div>