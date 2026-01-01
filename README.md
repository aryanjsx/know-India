# 🇮🇳 Know India

<div align="center">

<img src="frontend/src/Assets/mandala%20logo.png" alt="Know India Logo" width="180"/>

### ✨ Discover the Soul of Incredible India ✨

_An immersive digital experience exploring India's rich heritage, diverse culture, and constitutional values_

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Latest-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

[🚀 Live Demo](https://know-india.vercel.app) • [📖 Features](#-features) • [🛠️ Installation](#️-installation) • [🤝 Contributing](#-contributing)

---

</div>

## 📸 Preview

| Home Page | Explore States | Constitution |
|:---------:|:--------------:|:------------:|
| 🏠 Modern hero with slideshow | 🗺️ Interactive India map | 📜 Constitutional journey |

## ✨ Features

### 🗺️ **Interactive India Map**
- Click on any state to explore its unique culture, heritage, and tourist destinations
- Beautiful SVG map with hover animations and state information
- Smooth navigation to detailed state pages

### 🏛️ **State Explorer**
- Comprehensive information about each state including:
  - 📍 State symbols (bird, animal, flower, tree)
  - 🎭 Cultural heritage and festivals
  - 🍛 Authentic regional cuisine
  - 🏞️ Tourist attractions with image galleries
  - 📚 Historical facts and interesting trivia
- Modern card-based UI with animations

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

### 📱 **Fully Responsive**
- Optimized for desktop, tablet, and mobile devices
- Touch-friendly interactions
- Adaptive layouts and typography

### 🎨 **Modern UI/UX**
- Framer Motion animations throughout
- Glassmorphism design elements
- Animated gradient backgrounds
- Interactive hover effects

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Styling | Animation |
|:--------:|:-------:|:-------:|:---------:|
| React 18 | Express.js | Tailwind CSS | Framer Motion |
| React Router | Node.js | CSS3 | CSS Keyframes |
| Context API | REST API | Glassmorphism | SVG Animations |

</div>

## 📁 Project Structure

```
know-india/
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 Assets/          # Images, logos, and static files
│   │   ├── 📂 components/      # Reusable UI components
│   │   │   ├── navbar.jsx
│   │   │   ├── footer.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── ConstitutionSidebar.jsx
│   │   ├── 📂 context/         # React Context providers
│   │   │   └── ThemeContext.jsx
│   │   ├── 📂 pages/           # Page components
│   │   │   ├── home.jsx
│   │   │   ├── IndiaMap.jsx
│   │   │   ├── StatePage.jsx
│   │   │   ├── constitution.jsx
│   │   │   ├── constitution/   # Constitution sub-pages
│   │   │   ├── AboutUs.jsx
│   │   │   ├── ContactUs.jsx
│   │   │   ├── FeedbackPage.jsx
│   │   │   └── ErrorPage.jsx
│   │   ├── 📂 services/        # API service functions
│   │   └── 📂 utils/           # Utility functions
│   └── 📄 package.json
│
└── 📂 backend/
    ├── 📄 server.js            # Express server & API routes
    ├── 📂 certs/               # SSL certificates
    └── 📄 package.json
```

## 🚀 Installation

### Prerequisites

- Node.js >= 16.x
- npm >= 8.x or yarn

### Quick Start

1️⃣ **Clone the repository**
```bash
git clone https://github.com/Aryank728/know-india.git
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
| `/api/places/:stateName` | GET | Get places for a state |
| `/api/places/:stateName/:placeId` | GET | Get specific place details |
| `/api/feedback` | POST | Submit user feedback |
| `/api/feedback` | GET | Get all feedback (admin) |

## 🎯 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| 🏠 Home | `/` | Hero section with slideshow, features, and CTA |
| 🗺️ Explore | `/places` | Interactive India map |
| 📍 State | `/places/:stateName` | Detailed state information |
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

## 📈 Performance

- ⚡ Lighthouse Score: 90+
- 🎨 First Contentful Paint: < 1.5s
- 📱 Mobile Optimized
- 🔍 SEO Friendly

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
| [![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/Aryank728) | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/brajesh) |

</div>

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 🇮🇳 Inspired by the incredible diversity of India
- 📚 Data sourced from official government resources
- 🎨 Icons from [Lucide Icons](https://lucide.dev/)
- 🗺️ Map component from [react-svgmap-india](https://www.npmjs.com/package/react-svgmap-india)

---

<div align="center">

### 🕉️ Made with ❤️ in India 🇮🇳

<img src="frontend/src/Assets/logo.png" alt="Know India" width="60"/>

**"Unity in Diversity"**

⭐ Star this repo if you find it helpful!

</div>
