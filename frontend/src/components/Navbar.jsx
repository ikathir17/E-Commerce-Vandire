import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { FiUser, FiShoppingBag, FiMenu, FiX, FiChevronRight, FiHeart, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const { getCartCount, navigate, token, setToken, setCartItems, wishlist } = useContext(ShopContext);
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
        navigate('/login');
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
                                className="p-2 text-gray-700 hover:text-black transition-colors relative"
                                aria-label="User menu"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiUser className="w-5 h-5" />
                            </motion.button>
                            
                            <AnimatePresence>
                                {isUserMenuOpen && token && (
                                    <motion.div 
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={dropdownVariants}
                                    >
                                        <Link
                                            to="/account"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            My Account
                                        </Link>
                                        <Link
                                            to="/orders"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            My Orders
                                        </Link>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link 
                                to="/wishlist" 
                                className="p-2 text-gray-700 hover:text-black transition-colors relative block"
                                aria-label="Wishlist"
                            >
                                <FiHeart className="w-5 h-5" />
                                {wishlist.length > 0 && (
                                    <motion.span 
                                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    >
                                        {wishlist.length}
                                    </motion.span>
                                )}
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link 
                                to="/cart" 
                                className="p-2 text-gray-700 hover:text-black transition-colors relative block"
                                aria-label="Shopping cart"
                            >
                                <FiShoppingBag className="w-5 h-5" />
                                {getCartCount() > 0 && (
                                    <motion.span 
                                        className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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
                            {navLinks.map((link) => (
                                <motion.div 
                                    key={link.to} 
                                    className="border-b border-gray-100"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.2 }}
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
                            {!token ? (
                                <motion.div 
                                    className="border-b border-gray-100"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.2, delay: 0.1 }}
                                >
                                    <Link
                                        to="/login"
                                        className="block px-3 py-3 text-base font-medium text-gray-600 hover:text-black"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Login / Register
                                    </Link>
                                </motion.div>
                            ) : (
                                <>
                                    <motion.div 
                                        className="border-b border-gray-100"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.2, delay: 0.1 }}
                                    >
                                        <Link
                                            to="/account"
                                            className="block px-3 py-3 text-base font-medium text-gray-600 hover:text-black"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            My Account
                                        </Link>
                                    </motion.div>
                                    <motion.div 
                                        className="border-b border-gray-100"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.2, delay: 0.15 }}
                                    >
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="block w-full text-left px-3 py-3 text-base font-medium text-gray-600 hover:text-black"
                                        >
                                            Logout
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar
