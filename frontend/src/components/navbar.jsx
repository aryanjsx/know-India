import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageSquare, MapPin, Book, Users, Phone, Sparkles } from "lucide-react";
import logo from "../Assets/logo.png";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const navItems = [
        { name: "Explore", path: "/places", icon: MapPin },
        { name: "Constitution", path: "/constitution", icon: Book },
        { name: "About", path: "/aboutus", icon: Users },
        { name: "Contact", path: "/contactus", icon: Phone }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
                    isScrolled 
                        ? isDark 
                            ? 'bg-gray-900/80 backdrop-blur-xl shadow-lg shadow-black/10 border-b border-gray-800/50' 
                            : 'bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-200/50 border-b border-gray-100'
                        : 'bg-transparent'
                }`}
            >
                <div className="w-full px-6 sm:px-10 lg:px-16">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        
                        {/* Left: Logo & Name */}
                        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
                            <motion.div
                                whileHover={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 0.5 }}
                                className="relative"
                            >
                                <img src={logo} alt="Know India" className="h-10 md:h-12 w-auto" />
                            </motion.div>
                            <span className={`text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent hidden sm:block`}>
                                Know India
                            </span>
                        </Link>

                        {/* Center: Navigation Links */}
                        <div className="hidden md:flex items-center justify-center flex-1">
                            <div className="flex items-center gap-1">
                                {navItems.map((item, index) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <motion.div
                                            key={item.name}
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                        >
                                            <Link
                                                to={item.path}
                                                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                                    active
                                                        ? isDark 
                                                            ? 'text-orange-400 bg-orange-500/10' 
                                                            : 'text-orange-600 bg-orange-50'
                                                        : isDark
                                                            ? 'text-gray-300 hover:text-white hover:bg-white/5'
                                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                                }`}
                                            >
                                                <Icon size={16} />
                                                {item.name}
                                                {active && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500"
                                                    />
                                                )}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                                
                                {/* Feedback Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * navItems.length }}
                                >
                                    <Link
                                        to="/feedback"
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                            isActive('/feedback')
                                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                                                : isDark
                                                    ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 hover:from-orange-500 hover:to-amber-500 hover:text-white'
                                                    : 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600 hover:from-orange-500 hover:to-amber-500 hover:text-white'
                                        }`}
                                    >
                                        <Sparkles size={16} />
                                        Feedback
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                            
                        {/* Right: Theme Toggle */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="hidden md:block flex-shrink-0"
                        >
                            <ThemeToggle />
                        </motion.div>

                        {/* Mobile Menu Controls */}
                        <div className="flex md:hidden items-center gap-2">
                            <ThemeToggle />
                            
                            <button 
                                onClick={() => setIsOpen(!isOpen)}
                                className={`p-2 rounded-xl transition-colors ${
                                    isDark 
                                        ? 'text-gray-300 hover:bg-white/10' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`md:hidden overflow-hidden border-t ${
                                isDark 
                                    ? 'bg-gray-900/95 backdrop-blur-xl border-gray-800' 
                                    : 'bg-white/95 backdrop-blur-xl border-gray-100'
                            }`}
                        >
                            <div className="px-4 py-4 space-y-1">
                                {navItems.map((item, index) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <motion.div
                                            key={item.name}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.05 * index }}
                                        >
                                            <Link
                                                to={item.path}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                                                    active
                                                        ? isDark 
                                                            ? 'text-orange-400 bg-orange-500/10' 
                                                            : 'text-orange-600 bg-orange-50'
                                                        : isDark
                                                            ? 'text-gray-300 hover:bg-white/5'
                                                            : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                <Icon size={20} />
                                                {item.name}
                                                {active && (
                                                    <div className="ml-auto w-2 h-2 rounded-full bg-orange-500"></div>
                                                )}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                                
                                {/* Mobile Feedback Link */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 * navItems.length }}
                                >
                                    <Link
                                        to="/feedback"
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${
                                            isDark 
                                                ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400' 
                                                : 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600'
                                        }`}
                                    >
                                        <MessageSquare size={20} />
                                        Share Feedback
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </>
    );
};

export default Navbar;
