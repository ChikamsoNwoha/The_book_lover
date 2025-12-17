export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
        <img
          src="/about-hero.jpg"
          alt="About hero"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/40" />
      </section>

      {/* PORTRAIT OVERLAP */}
      <section className="relative -mt-[250px] z-20">
        <div className="max-w-4xl mx-auto text-center">
          <img
            src="/about-lady.jpg"
            alt="Founder"
            className="w-[380px] h-[520px] object-cover mx-auto shadow-2xl"
          />
        </div>
      </section>

      {/* TEXT CONTENT (FULLY VISIBLE ON WHITE) */}
      <section className="bg-white pt-32 pb-24">
        <div className="relative z-30 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-light tracking-wider text-gray-900 mb-8">
            The Small Wins Business Stories
          </h1>

          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Welcome to The Small Wins Business Stories! We are a platform dedicated
            to sharing inspiring stories of individuals and businesses achieving
            small wins that lead to big change. Our mission is to motivate, empower,
            and showcase real journeys of growth.
          </p>
        </div>
      </section>
    </>
  );
}
