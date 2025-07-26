import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { FiUser, FiShoppingBag, FiMenu, FiX, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const { getCartCount, navigate, token, setToken, setCartItems } = useContext(ShopContext);
    const location = useLocation();
    
    const dropdownVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.2,
                ease: 'easeOut'
            } 
        },
        exit: { 
            opacity: 0, 
            y: -10,
            transition: { 
                duration: 0.15,
                ease: 'easeIn'
            } 
        }
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
            className={`fixed w-full z-50 transition-all duration-300 ${
                scrolled 
                    ? 'bg-white shadow-md py-2' 
                    : 'bg-white/90 backdrop-blur-sm py-4'
            }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <motion.img 
                            src={assets.logo} 
                            alt="Yaazhi Logo" 
                            className="h-10 md:h-12"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <div key={link.to} className="relative group">
                                <NavLink
                                    to={link.to}
                                    className={({ isActive: isNavActive }) =>
                                        `relative px-2 py-1 text-sm font-medium transition-colors duration-200 ${
                                            isNavActive ? 'text-black' : 'text-gray-600 hover:text-black'
                                        }`
                                    }
                                    onMouseEnter={() => link.subLinks && setActiveDropdown(link.to)}
                                    onMouseLeave={() => link.subLinks && setActiveDropdown(null)}
                                >
                                    {({ isActive }) => (
                                        <>
                                            {link.label}
                                            {link.subLinks && (
                                                <FiChevronDown className="inline-block ml-1 w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
                                            )}
                                            <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 ${
                                                isActive ? 'w-full' : 'group-hover:w-full'
                                            }`}></span>
                                        </>
                                    )}
                                </NavLink>

                                {link.subLinks && (
                                    <AnimatePresence>
                                        {activeDropdown === link.to && (
                                            <motion.div
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                variants={dropdownVariants}
                                                className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                                                onMouseEnter={() => setActiveDropdown(link.to)}
                                                onMouseLeave={() => setActiveDropdown(null)}
                                            >
                                                {link.subLinks.map((sublink) => (
                                                    <Link
                                                        key={sublink.to}
                                                        to={sublink.to}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        onClick={() => setActiveDropdown(null)}
                                                    >
                                                        {sublink.label}
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Icons */}
                    <div className="flex items-center space-x-4">

                        




                        <div className="relative">
                            <motion.button 
                                onClick={toggleUserMenu}
                                className="p-2 text-gray-700 hover:text-indigo-600 transition-colors relative group"
                                aria-label="User menu"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiUser className="w-5 h-5 group-hover:rotate-6 transition-transform" />
                            </motion.button>
                            
                            <AnimatePresence>
                                {isUserMenuOpen && token && (
                                    <motion.div 
                                        className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl py-2 z-50 border border-gray-100"
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={dropdownVariants}
                                    >
                                        <Link
                                            to="/orders"
                                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <FiChevronRight className="mr-2 w-4 h-4 opacity-70" />
                                            <span>My Orders</span>
                                        </Link>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-3 text-sm text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                            <FiChevronRight className="mr-2 w-4 h-4 opacity-70" />
                                            <span>Logout</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                        >
                            <Link 
                                to="/cart" 
                                className="p-2 text-gray-700 hover:text-indigo-600 transition-colors relative block group"
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
                            className="md:hidden p-2 text-gray-700 hover:text-black transition-colors"
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
