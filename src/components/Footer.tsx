import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer id="subscribe" className="bg-black text-white py-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-light mb-10 tracking-wide">
          Subscribe here to get my latest posts
        </h2>

        <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4 justify-center">
          <input
            type="email"
            placeholder="Enter Your Email Here *"
            required
            className="flex-1 px-4 py- bg-black border border-gray-600 rounded-none placeholder-gray-500 focus:outline-none focus:border-white transition-colors text-white text-lg"
          />
          <button
            type="submit"
            className="px-10 py-4 bg-transparent border border-white text-white hover:bg-white hover:text-black transition-all duration-300 whitespace-nowrap"
          >
            Join
          </button>
        </form>

        <div className="mt-16 text-sm text-gray-500">
          <p>© 2035 by The Book Lover. Powered and secured by Wix</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;