// import { ArrowRight } from 'lucide-react';

// Hero Section Component
export default function Hero() {
  return (
    <section
      className="relative h-105 md:h-130 flex items-center justify-center overflow-hidden"
      style={{
        marginTop: "calc(var(--nav-height) * -1)",
        paddingTop: "var(--nav-height)",
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat absolute"
        style={{
          backgroundImage: `url(/hero-bookshelf.jpg)`,
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Book Lover */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <div className="bg-white shadow-[0_20px_45px_rgba(0,0,0,0.15)] px-8 py-10 md:px-12 md:py-12 border border-(--border) border-black">
          <h1 className="text-4xl md:text-6xl font-['Cormorant_Garamond'] text-gray-900 tracking-[0.15em]">
            THE BOOK LOVER
          </h1>
          <p className="mt-4 text-sm md:text-base text-gray-600 uppercase tracking-[0.3em]">
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
