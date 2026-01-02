import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Linkedin, Github, Globe, Heart, Quote } from "lucide-react";
import logo from "../Assets/logo.png";
import { useTheme } from "../context/ThemeContext";

const quotes = [
  { text: "Swaraj is my birthright, and I shall have it.", author: "Bal Gangadhar Tilak" },
  { text: "Give me blood, and I will give you freedom.", author: "Subhas Chandra Bose" },
  { text: "You may kill me, but you cannot kill my ideas.", author: "Bhagat Singh" },
  { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
];

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const socialLinks = [
    { name: "LinkedIn", url: "https://www.linkedin.com/in/aryanjsx/", icon: Linkedin, color: "hover:text-blue-400" },
    { name: "GitHub", url: "https://github.com/aryanjsx", icon: Github, color: "hover:text-gray-300" },
    { name: "Portfolio", url: "https://aryankr.netlify.app/", icon: Globe, color: "hover:text-green-400" },
  ];

  return (
    <footer className={`relative ${isDark ? 'bg-gray-950' : 'bg-gray-900'}`}>
      {/* Top Border */}
      <div className="h-0.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500"></div>

      <div className="w-full px-6 sm:px-10 lg:px-16 py-5">
        {/* Main Row: Logo | Quote | Social */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
          {/* Left: Logo & Name */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={logo} alt="Know India" className="h-9 w-auto" />
            <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Know India
            </span>
          </Link>

          {/* Center: Quote */}
          <div className="hidden md:flex items-center justify-center flex-1 px-6">
            <div className="flex items-center gap-2 max-w-lg">
              <Quote className="w-4 h-4 text-orange-400/60 flex-shrink-0" />
              <AnimatePresence mode="wait">
          <motion.p
                  key={quoteIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-400 text-sm italic text-center"
          >
                  "{quotes[quoteIndex].text}" <span className="text-orange-400/80">— {quotes[quoteIndex].author}</span>
          </motion.p>
              </AnimatePresence>
            </div>
        </div>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.name}
                  href={social.url}
              target="_blank"
              rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center text-gray-500 ${social.color} transition-colors`}
            >
                  <Icon size={16} />
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Bottom Row - Copyright */}
        <div className="mt-4 pt-3 border-t border-gray-800/50 flex items-center justify-center">
          <div className="flex items-center gap-1 text-gray-600 text-xs">
            <span>© {new Date().getFullYear()} Know India</span>
            <span className="mx-1">•</span>
            <span className="flex items-center gap-1">
              Made with <Heart size={10} className="text-red-500 fill-red-500" /> in India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
