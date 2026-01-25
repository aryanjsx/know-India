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

🔐 **Secure Auth** — Google OAuth 2.0 with JWT sessions

💾 **Cloud Sync** — Save favorite places across devices

📱 **Responsive** — Beautiful UI on any screen size

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
| **Data** | [@aryanjsx/knowindia](https://www.npmjs.com/package/@aryanjsx/knowindia) |

---

## 📁 Project Structure

```
know-India/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── public/
├── backend/           # Express API server
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── utils/
└── README.md
```

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

- [ ] Multi-language support
- [ ] Offline PWA mode
- [ ] Community travel stories
- [ ] Budget calculator
- [ ] Hotel/flight integration

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
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

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