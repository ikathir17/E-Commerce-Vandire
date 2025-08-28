import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { FiUser, FiShoppingBag, FiMenu, FiX, FiChevronRight, FiChevronDown, FiHeart } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
    const { getCartCount, navigate, token, setToken, setCartItems, wishlist } = useContext(ShopContext);
    const location = useLocation();
    const isHomePage = location.pathname === '/'; // Check if current route is home page
    
    const dropdownVariants = {
        hidden: { 
            opacity: 0, 
            y: -10,
            scale: 0.98
        },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: { 
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1],
                when: "beforeChildren",
                staggerChildren: 0.05
            } 
        },
        exit: { 
            opacity: 0, 
            y: -5,
            scale: 0.98,
            transition: { 
                duration: 0.15,
                ease: [0.4, 0, 1, 1]
            } 
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -5 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { 
                type: 'spring',
                stiffness: 300,
                damping: 24
            }
        },
        exit: { opacity: 0, x: -5 }
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    // Add scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    const toggleUserMenu = () => {
        if (!token) {
            navigate('/login');
            return;
        }
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const handleLogout = () => {
        navigate('/');
        localStorage.removeItem('token');
        setToken('');
        setCartItems({});
        setIsUserMenuOpen(false);
    };

    const navLinks = [
        { to: '/', label: 'HOME' },
        { to: '/collection', label: 'COLLECTION' },
        { to: '/about', label: 'ABOUT' },
        { to: '/contact', label: 'CONTACT' },
    ];

    return (
        <motion.nav 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`fixed w-full z-50 transition-all duration-300 ${isHomePage && !scrolled ? 'bg-transparent shadow-none py-4' : 'bg-white shadow-md py-2'}`}
        >
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">

                    {/* Left side: Logo and Desktop Nav Dropdown */}
                    <div className="flex items-center space-x-4">
                        {/* Nav Dropdown */}
                        <AnimatePresence>
                            {scrolled && (
                                <motion.div
                                    className="relative hidden md:block"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <button
                                        onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
                                        className={`p-2 rounded-full transition-all duration-200 ${isNavMenuOpen 
                                            ? 'bg-gray-100 transform rotate-90' 
                                            : 'hover:bg-gray-100'}`}
                                        aria-label="Toggle navigation menu"
                                        aria-expanded={isNavMenuOpen}
                                    >
                                        <FiMenu className={`w-5 h-5 ${isHomePage && !scrolled ? 'text-white' : 'text-gray-800'} transition-transform duration-200 ${isNavMenuOpen ? 'opacity-75' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isNavMenuOpen && (
                                            <motion.div
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                variants={dropdownVariants}
                                                className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 backdrop-blur-sm bg-white/95"
                                                onMouseLeave={() => setIsNavMenuOpen(false)}
                                            >
                                                {navLinks.map((link, index) => (
                                                    <motion.div
                                                        key={link.to}
                                                        variants={itemVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                    >
                                                    <NavLink
                                                        key={link.to}
                                                        to={link.to}
                                                        className={({ isActive }) =>
                                                            `block px-5 py-2.5 text-sm font-medium transition-all duration-200 ${isActive 
                                                                ? 'text-indigo-600 bg-indigo-50 border-l-4 border-indigo-500 pl-4' 
                                                                : isHomePage && !scrolled 
                                                                    ? 'text-white hover:bg-white/10 hover:pl-5' 
                                                                    : 'text-gray-700 hover:bg-gray-50 hover:pl-5 hover:text-gray-900'}`
                                                        }
                                                        onClick={() => setIsNavMenuOpen(false)}
                                                    >
                                                            <div className="flex items-center">
                                                                <span className="flex-1">{link.label}</span>
                                                                <FiChevronRight className="w-3.5 h-3.5 opacity-50" />
                                                            </div>
                                                        </NavLink>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Vandire Brand - always visible */}
                        <Link 
                            to="/" 
                            className={`uppercase text-2xl tracking-extra-widest font-bold ${isHomePage && !scrolled ? 'text-white' : 'text-gray-800'}`} 
                            style={{ 
                                fontFamily: 'Cinzel, Playfair Display, ui-serif, Georgia, Cambria, Times New Roman, Times, serif', 
                                letterSpacing: '0.18em' 
                            }}
                        >
                            VANDIRE
                        </Link>
                    </div>

                    {/* Right side: Nav links and Icons */}
                    <div className="flex items-center space-x-6">
                        {/* Desktop Navigation - only visible when not scrolled */}
                        <AnimatePresence>
                            {!scrolled && (
                                <motion.div 
                                    className="hidden md:flex items-center space-x-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {navLinks.map((link) => (
                                        <NavLink
                                            key={link.to}
                                            to={link.to}
                                            className={({ isActive }) =>
                                                `relative px-2 py-1 text-sm font-medium transition-colors duration-200 group ${isActive ? (isHomePage ? 'text-white' : 'text-indigo-600') : (isHomePage ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-indigo-600')}`
                                            }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {link.label}
                                                    <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${isHomePage ? 'bg-white' : 'bg-indigo-600'} transition-all duration-300 ${isActive ? 'w-full' : 'group-hover:w-full'}`}></span>
                                                </>
                                            )}
                                        </NavLink>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Icons */}

                        




                        <div className="relative">
                            <motion.button 
                                onClick={toggleUserMenu}
                                className={`p-2 transition-all duration-200 relative group ${isUserMenuOpen 
                                    ? 'bg-gray-100 rounded-full' 
                                    : ''} ${isHomePage && !scrolled ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-indigo-600'}`}
                                aria-label="User menu"
                                aria-expanded={isUserMenuOpen}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiUser className={`w-5 h-5 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-6 opacity-75' : 'group-hover:rotate-6'}`} />
                            </motion.button>
                            
                            <AnimatePresence>
                                {isUserMenuOpen && token && (
                                    <motion.div 
                                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 backdrop-blur-sm bg-white/95"
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={dropdownVariants}
                                        onMouseLeave={() => setIsUserMenuOpen(false)}
                                    >
                                        <motion.div variants={itemVariants}>
                                            <Link
                                                to="/profile"
                                                className="block px-5 py-2.5 text-sm font-medium transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:pl-5 hover:text-gray-900"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                style={{ fontFamily: 'Cinzel, Playfair Display, ui-serif, Georgia, serif' }}
                                            >
                                                <div className="flex items-center">
                                                    <span className="flex-1 uppercase tracking-wider text-sm">MY PROFILE</span>
                                                    <FiChevronRight className="w-3.5 h-3.5 opacity-50" />
                                                </div>
                                            </Link>
                                        </motion.div>
                                        <motion.div variants={itemVariants}>
                                            <Link
                                                to="/orders"
                                                className="block px-5 py-2.5 text-sm font-medium transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:pl-5 hover:text-gray-900"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                style={{ fontFamily: 'Cinzel, Playfair Display, ui-serif, Georgia, serif' }}
                                            >
                                                <div className="flex items-center">
                                                    <span className="flex-1 uppercase tracking-wider text-sm">MY ORDERS</span>
                                                    <FiChevronRight className="w-3.5 h-3.5 opacity-50" />
                                                </div>
                                            </Link>
                                        </motion.div>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <motion.div variants={itemVariants}>
                                            <button
                                                onClick={handleLogout}
                                                style={{ fontFamily: 'Cinzel, Playfair Display, ui-serif, Georgia, serif' }}
                                            className="w-full text-left block px-5 py-2.5 text-sm font-medium transition-all duration-200 text-red-600 hover:bg-red-50 hover:pl-5 hover:text-red-700"
                                            >
                                                <div className="flex items-center">
                                                    <span className="flex-1 uppercase tracking-wider text-sm">LOGOUT</span>
                                                    <FiChevronRight className="w-3.5 h-3.5 opacity-50" />
                                                </div>
                                            </button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Wishlist */}
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                        >
                            <Link 
                                to="/wishlist" 
                                className={`p-2 transition-colors relative block group ${isHomePage && !scrolled ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-pink-600'}`}
                                aria-label="Wishlist"
                            >
                                <FiHeart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {wishlist && wishlist.length > 0 && (
                                    <motion.span 
                                        className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ 
                                            type: 'spring', 
                                            stiffness: 500, 
                                            damping: 30 
                                        }}
                                    >
                                        {wishlist.length}
                                    </motion.span>
                                )}
                            </Link>
                        </motion.div>

                        {/* Cart */}
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                        >
                            <Link 
                                to="/cart" 
                                className={`p-2 transition-colors relative block group ${isHomePage && !scrolled ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-indigo-600'}`}
                                aria-label="Shopping cart"
                            >
                                <FiShoppingBag className="w-5 h-5 group-hover:rotate-6 transition-transform" />
                                {getCartCount() > 0 && (
                                    <motion.span 
                                        className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ 
                                            type: 'spring', 
                                            stiffness: 500, 
                                            damping: 30 
                                        }}
                                    >
                                        {getCartCount()}
                                    </motion.span>
                                )}
                            </Link>
                        </motion.div>

                        {/* Mobile menu button */}
                        <motion.button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`md:hidden p-2 transition-colors ${isHomePage && !scrolled ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                            aria-label="Toggle menu"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        className="md:hidden bg-white shadow-lg overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <motion.div 
                            className="px-4 pt-2 pb-4 space-y-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                        >
                            {navLinks.map((link, index) => (
                                <motion.div 
                                    key={link.to} 
                                    className="border-b border-gray-100"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                >
                                    <NavLink
                                        to={link.to}
                                        className={({ isActive }) =>
                                            `block px-3 py-3 text-base font-medium ${
                                                isActive ? 'text-black' : 'text-gray-600 hover:text-black'
                                            }`
                                        }
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.label}
                                    </NavLink>
                                </motion.div>
                            ))}
                            {token ? (
                                <>
                                    <motion.div 
                                        className="border-b border-gray-100"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.2, delay: navLinks.length * 0.05 }}
                                    >
                                        <Link
                                            to="/orders"
                                            className="flex items-center px-6 py-4 text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <FiChevronRight className="mr-3 w-4 h-4 opacity-70" />
                                            <span>My Orders</span>
                                        </Link>
                                    </motion.div>
                                    <motion.div 
                                        className="border-b border-gray-100"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.2, delay: (navLinks.length + 1) * 0.05 }}
                                    >
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex items-center w-full text-left px-6 py-4 text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                            <FiChevronRight className="mr-3 w-4 h-4 opacity-70" />
                                            <span>Logout</span>
                                        </button>
                                    </motion.div>
                                </>
                            ) : (
                                <motion.div 
                                    className="border-b border-gray-100"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.2, delay: navLinks.length * 0.05 }}
                                >
                                    <Link
                                        to="/login"
                                        className="flex items-center px-6 py-4 text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <FiChevronRight className="mr-3 w-4 h-4 opacity-70" />
                                        <span>Login / Register</span>
                                    </Link>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar
