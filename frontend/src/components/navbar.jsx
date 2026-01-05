import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageSquare, MapPin, Book, Users, Phone, Sparkles, Search, Bookmark, LogIn, LogOut, User, Settings, Info, Star } from "lucide-react";
import logo from "../Assets/logo.png";
import ThemeToggle from "./ThemeToggle";
import GlobalSearch from "./GlobalSearch";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { API_CONFIG } from "../config";

const Navbar = () => {
    const { theme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const isDark = theme === 'dark';

    // Get display name: use name if valid, otherwise fallback to email username
    const getDisplayName = () => {
        if (user?.name && user.name.trim().length > 0) {
            return user.name.trim();
        }
        return user?.email?.split('@')[0] || 'User';
    };
    const location = useLocation();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleGoogleLogin = () => {
        window.location.href = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_GOOGLE}`;
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu and search on route change
    useEffect(() => {
        setIsOpen(false);
        setShowMobileSearch(false);
        setShowUserMenu(false);
    }, [location.pathname]);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showUserMenu && !e.target.closest('[data-user-menu]')) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showUserMenu]);

    const navItems = [
        { name: "Explore", path: "/places", icon: MapPin },
        { name: "Reviews", path: "/reviews", icon: Star },
        { name: "Saved", path: "/saved", icon: Bookmark },
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
                <div className="w-full px-4 sm:px-6 lg:px-10">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        
                        {/* Left: Logo & Name */}
                        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                            <motion.div
                                whileHover={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 0.5 }}
                                className="relative"
                            >
                                <img src={logo} alt="Know India" className="h-9 md:h-10 w-auto" />
                            </motion.div>
                            <span className={`text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent hidden sm:block`}>
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

                        {/* Right: Search Bar, Theme Toggle & Auth */}
                        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                            <GlobalSearch />
                            <ThemeToggle />
                            
                            {/* Auth Section */}
                            {isAuthenticated ? (
                                <div className="relative" data-user-menu>
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                                            isDark 
                                                ? 'hover:bg-white/10 text-gray-300' 
                                                : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ${
                                            isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={16} />
                                            )}
                                        </div>
                                        <span className="text-sm font-medium max-w-[120px] truncate">
                                            {getDisplayName()}
                                        </span>
                                    </button>
                                    
                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {showUserMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className={`absolute right-0 mt-2 w-52 rounded-xl shadow-lg overflow-hidden ${
                                                    isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
                                                }`}
                                            >
                                                {/* User Info Header */}
                                                <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        {getDisplayName()}
                                                    </p>
                                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                                                        {user?.email}
                                                    </p>
                                                </div>
                                                
                                                {/* Menu Items */}
                                                <div className={`py-1 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                                    <Link
                                                        to="/profile/about"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                            isDark 
                                                                ? 'text-gray-300 hover:bg-white/5 hover:text-white' 
                                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        <Info size={16} />
                                                        About
                                                    </Link>
                                                    <Link
                                                        to="/profile/settings"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                            isDark 
                                                                ? 'text-gray-300 hover:bg-white/5 hover:text-white' 
                                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        <Settings size={16} />
                                                        Settings
                                                    </Link>
                                                </div>
                                                
                                                {/* Logout */}
                                                <div className="py-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                            isDark 
                                                                ? 'text-red-400 hover:bg-red-500/10' 
                                                                : 'text-red-600 hover:bg-red-50'
                                                        }`}
                                                    >
                                                        <LogOut size={16} />
                                                        Sign out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <button
                                    onClick={handleGoogleLogin}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                                >
                                    <LogIn size={16} />
                                    Sign in
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Controls */}
                        <div className="flex md:hidden items-center gap-2">
                            {/* Mobile Search Button */}
                            <button 
                                onClick={() => setShowMobileSearch(true)}
                                className={`p-2 rounded-xl transition-colors ${
                                    isDark 
                                        ? 'text-gray-300 hover:bg-white/10' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <Search size={20} />
                            </button>
                            
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

                                {/* Mobile Auth Section */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 * (navItems.length + 1) }}
                                    className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                                >
                                    {isAuthenticated ? (
                                        <div className="space-y-1">
                                            {/* User Info */}
                                            <div className={`flex items-center gap-3 px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ${
                                                    isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
                                                }`}>
                                                    {user?.avatar ? (
                                                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{getDisplayName()}</p>
                                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        {user?.email}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Profile Links */}
                                            <Link
                                                to="/profile/about"
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${
                                                    isDark 
                                                        ? 'text-gray-300 hover:bg-white/5' 
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                <Info size={20} />
                                                About
                                            </Link>
                                            <Link
                                                to="/profile/settings"
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${
                                                    isDark 
                                                        ? 'text-gray-300 hover:bg-white/5' 
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                <Settings size={20} />
                                                Settings
                                            </Link>
                                            
                                            {/* Logout */}
                                            <button
                                                onClick={handleLogout}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${
                                                    isDark 
                                                        ? 'text-red-400 hover:bg-red-500/10' 
                                                        : 'text-red-600 hover:bg-red-50'
                                                }`}
                                            >
                                                <LogOut size={20} />
                                                Sign out
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleGoogleLogin}
                                            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                                        >
                                            <LogIn size={20} />
                                            Sign in with Google
                                        </button>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Mobile Search Modal */}
            <AnimatePresence>
                {showMobileSearch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] md:hidden"
                    >
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowMobileSearch(false)}
                        />
                        
                        {/* Search Container */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className={`relative mx-4 mt-20 p-4 rounded-2xl ${
                                isDark ? 'bg-gray-900' : 'bg-white'
                            } shadow-2xl`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Search
                                </h3>
                                <button
                                    onClick={() => setShowMobileSearch(false)}
                                    className={`p-2 rounded-xl transition-colors ${
                                        isDark 
                                            ? 'text-gray-400 hover:bg-gray-800' 
                                            : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <GlobalSearch isMobile={true} onClose={() => setShowMobileSearch(false)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
