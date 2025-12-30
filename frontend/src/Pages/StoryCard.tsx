// src/Pages/StoryCard.tsx
import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Your real posts
const allPosts = [
  {
    id: 1,
    title: "Linda’s Thread of Change",
    excerpt: "From a hostel room with an old sewing machine, Linda built a thriving tailoring business...",
    author: "CHIDERA E. ABEL",
    date: "Aug 14",
    readTime: "7 min read",
    image: "/linda-sewing.jpg",
    category: "fashion-sewing",
  },
  {
    id: 2,
    title: "From Farmer to Millionaire",
    excerpt: "In the quiet mornings before sunrise, while Zaria still slept, Abdul Sani was already awake...",
    author: "CHIDERA E. ABEL",
    date: "Aug 10",
    readTime: "8 min read",
    image: "/farmer.jpg",
    category: "entrepreneurship-journeys",
  },
  // Add more posts here
];

const categories = [
  { name: "All Posts", slug: "" },
  { name: "Entrepreneurship Journeys", slug: "entrepreneurship-journeys" },
  { name: "Fashion & Sewing", slug: "fashion-sewing" },
];

export default function StoryCard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSlug = searchParams.get("category") || "";
  const isAllPosts = currentSlug === "" || currentSlug === "all";

  const filteredPosts = isAllPosts
    ? allPosts
    : allPosts.filter((post) => post.category === currentSlug);

  const setCategory = (slug: string) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <nav className="flex flex-wrap gap-8 justify-center text-lg font-medium">
          {categories.map((cat) => {
            const isActive = (cat.slug === "" && isAllPosts) || cat.slug === currentSlug;
            return (
              <button
                key={cat.slug}
                onClick={() => setCategory(cat.slug)}
                className={`pb-3 border-b-2 transition-all ${
                  isActive
                    ? "text-amber-900 font-semibold border-amber-900"
                    : "text-gray-600 hover:text-amber-800 border-transparent"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Posts Grid / Single View */}
      <div
        className={`max-w-6xl mx-auto px-6 ${
          isAllPosts
            ? "grid grid-cols-1 md:grid-cols-2 gap-12"
            : "flex flex-col gap-20"
        }`}
      >
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className={`group cursor-pointer bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all ${
              !isAllPosts && "max-w-4xl mx-auto"
            }`}
          >
            <div className={isAllPosts ? "flex flex-col h-full" : "flex flex-col md:flex-row"}>
              {/* Image */}
              <div
                className={`${
                  isAllPosts
                    ? "w-full h-64 md:h-80"
                    : "md:w-[45%] w-full h-80 md:h-96"
                } overflow-hidden`}
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                />
              </div>

              {/* Content */}
              <div
                className={`p-8 md:p-10 ${isAllPosts ? "flex-grow" : "md:w-[55%]"} flex flex-col justify-between`}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <img src="/chidera.jpg" alt="author" className="w-10 h-10 rounded-full object-cover" />
                    <span className="font-medium">{post.author}</span>
                    <span>•</span>
                    <span>{post.date} • {post.readTime}</span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900">
                    {post.title}
                  </h2>

                  <p className="text-lg text-gray-700 leading-relaxed line-clamp-4">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>0 views • 0 comments</span>
                    <button className="text-3xl text-pink-500 hover:scale-125 transition-transform">
                       ♡
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty state */}
      {!isAllPosts && filteredPosts.length === 0 && (
        <p className="text-center text-gray-500 py-20 text-lg">
          No stories in this category yet. Coming soon!
        </p>
      )}
    </section>
  );
}