// import { ArrowRight } from 'lucide-react';

// Hero Section Component
export default function Hero() {
  return (
    <section className="relative h-[80px] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat absolute"
        style={{
          backgroundImage: `url(/hero-bookshelf.jpg)`,
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Book Lover */}
      <div className="relative z-10 mt-20 md:mt-24 max-w-2xl mx-auto px-6 text-center">
        <div className="bg-white shadow-xl px-2 py-4 md:px-4 md:py-5 border-black border-1 rounded-lg">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight tracking-wide">
            THE BOOK LOVER
          </h1>
          <p className="mt-6 text-lg md:text-xl font-medium text-gray-700 uppercase tracking-widest">
            Read All About It
          </p>

          {/* <button className="mt-10 inline-flex items-center gap-3 bg-black text-white px-8 py-4 font-medium hover:bg-gray-800 transition rounded-lg">
            Explore Stories
            <ArrowRight className="w-5 h-5" />
          </button> */}
        </div>
      </div>

      {/* Scroll indicator */}
      {/* <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2" />
        </div>
      </div> */}
    </section>
  );
}