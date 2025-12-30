'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, Facebook, Twitter } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll behavior: hide on scroll down, show on scroll up or at top
  useEffect(() => {
    let previousScroll = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const isScrollingDown = currentScroll > previousScroll;

      if (currentScroll < 50) {
        setScrolled(false); // near top
      } else if (isScrollingDown && currentScroll > 100) {
        setScrolled(true); // hide header
      } else if (!isScrollingDown && currentScroll > 100) {
        setScrolled(false); // show header when scrolling up
      }

      previousScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Main Header */}
      <motion.header
        animate={{ y: scrolled ? -100 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
              The Small Wins Business Stories
            </h1>
            <h1 className="text-lg font-bold text-gray-900 sm:hidden">
              Small Wins
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <a href="/" className="text-gray-700 hover:text-amber-900 font-medium">Home</a>
            <a href="/about" className="text-gray-700 hover:text-amber-900 font-medium">About</a>
            <a href="#subscribe" onClick={(e) => { e.preventDefault();
                document.getElementById('subscribe')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-gray-700 hover:text-amber-900 font-medium cursor-pointer"
            >
              Subscribe
            </a>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-6">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-700 hover:text-gray-900"
            >
              <Search className="w-5 h-5" /> 
            </button>

            {/* Social Icons */}
            <div className="hidden sm:flex items-center space-x-4">
              <a href="#" className="text-gray-700 hover:text-gray-900">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900">
                <Twitter className="w-5 h-5" />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-white z-50 md:hidden"
          >
            <div className="flex justify-between items-center px-6 py-5 border-b">
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col px-6 py-8 space-y-8 text-lg">
              <a href="#" className="text-gray-800 hover:text-amber-900">Home</a>
              <a href="#" className="text-gray-800 hover:text-amber-900">About</a>
              <a
                  href="#subscribe"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('subscribe')?.scrollIntoView({ behavior: 'smooth' });
                    setIsMenuOpen(false); // Close mobile menu after click
                  }}
                  className="text-gray-800 hover:text-amber-900"
                >
                  Subscribe
                </a>
            </nav>
            <div className="absolute bottom-10 left-6 right-6 flex justify-center space-x-8">
              <a href="#" className="text-gray-600">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-600">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Popup */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-40 z-50"
            />

            {/* Search Bar */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 px-6 py-5"
            >
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center flex-1 mr-4">
                  <Search className="w-6 h-6 text-gray-500 mr-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    autoFocus
                    className="w-full outline-none text-lg placeholder-gray-500"
                  />
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Close
                </button>
              </div>

              {/* Optional: Search Results Preview (you said backend not ready yet) */}
              <div className="mt-8 border-t pt-6">
                <p className="text-sm text-gray-500 mb-4">Blog Posts</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Placeholder previews */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex space-x-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm line-clamp-2">
                          Sample Blog Title {i}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          This is a preview of the blog post content...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-8 bg-black text-white px-8 py-3 rounded-none hover:bg-gray-800 transition">
                  Show All Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer so content isn't hidden under fixed header */}
      <div className="h-20" />
    </>
  );
}