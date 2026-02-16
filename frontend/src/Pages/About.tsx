export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section
        className="relative h-[70vh] min-h-[480px] overflow-hidden"
        style={{
          marginTop: "calc(var(--nav-height) * -1)",
          paddingTop: "var(--nav-height)",
        }}
      >
        <img
          src="/about-hero.jpg"
          alt="About hero"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/25" />
      </section>

      {/* PORTRAIT OVERLAP */}
      <section className="relative -mt-40 md:-mt-56 z-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <img
            src="/about-lady.jpg"
            alt="Founder"
            className="w-[260px] md:w-[360px] h-[360px] md:h-[480px] object-cover mx-auto shadow-2xl"
          />
        </div>
      </section>

      {/* TEXT CONTENT (FULLY VISIBLE ON WHITE) */}
      <section className="bg-white pt-20 md:pt-28 pb-24">
        <div className="relative z-30 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-['Cormorant_Garamond'] tracking-[0.15em] text-gray-900 mb-8">
            The Small Wins Business Stories
          </h1>

          <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
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
