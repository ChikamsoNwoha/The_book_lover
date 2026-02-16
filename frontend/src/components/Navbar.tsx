import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Facebook, Menu, Search, Twitter, X } from "lucide-react";
import { apiRequest } from "../lib/api";
import { useDebounce } from "../lib/useDebounce";
import { categoryLabel, imageByCategory } from "../lib/categories";
import { resolveImageUrl } from "../lib/images";

type SearchResult = {
  id: number;
  title: string;
  category: string;
  created_at: string;
  excerpt?: string | null;
  image_url?: string | null;
};

type SearchResponse = {
  results: SearchResult[];
  query: string;
  count: number;
  hasMore: boolean;
};

const formatSearchDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const normalizeExcerpt = (value?: string | null) => {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim();
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastScrollY = useRef(0);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!isSearchOpen) return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen || isMenuOpen) {
      setIsHidden(false);
    }
  }, [isSearchOpen, isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (isSearchOpen || isMenuOpen) {
        lastScrollY.current = current;
        return;
      }

      const delta = current - lastScrollY.current;
      if (Math.abs(delta) < 6) return;

      if (current > lastScrollY.current && current > 80) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      lastScrollY.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSearchOpen, isMenuOpen]);

  const fetchResults = useCallback(
    async (offset = 0, append = false) => {
      if (debouncedQuery.trim().length < 2) return;
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);
        const data = await apiRequest<SearchResponse>(
          `/api/search?q=${encodeURIComponent(
            debouncedQuery.trim()
          )}&offset=${offset}`
        );
        setResults((prev) =>
          append ? [...prev, ...data.results] : data.results
        );
        setHasMore(Boolean(data.hasMore));
      } catch (err) {
        setError((err as Error).message || "Search failed");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedQuery]
  );

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setHasMore(false);
      setError(null);
      return;
    }

    fetchResults(0, false);
  }, [debouncedQuery, fetchResults]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-transform duration-300 ${
          isHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/meeting-illustration.svg"
              alt="Meeting illustration"
              className="w-10 h-10 object-contain"
            />
            <p className="text-base md:text-lg font-['Cormorant_Garamond'] tracking-[0.12em] text-gray-900">
              The Small Wins Business Stories
            </p>
          </div>

          <div className="hidden md:flex items-center gap-8 ml-auto">
            <nav className="flex items-center gap-8 font-['Raleway'] text-[15px] font-normal not-italic normal-case tracking-normal leading-[1.4em] text-gray-500">
              <Link
                to="/"
                className="no-underline hover:text-(--accent-brown) transition"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="no-underline hover:text-(--accent-brown) transition"
              >
                About
              </Link>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("subscribe")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="no-underline hover:text-(--accent-brown) transition"
              >
                Subscribe
              </button>
            </nav>

            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-(--accent-brown)"
            >
              <Search className="w-4 h-4" />
              Search...
            </button>

            <div className="hidden md:flex items-center gap-4 text-gray-600">
              <a href="#" className="hover:text-(--accent-brown)">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-(--accent-brown)">
                <Twitter className="w-4 h-4" />
              </a>
            </div>

          </div>

          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-600"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-gray-600"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 bg-white z-50 md:hidden"
          >
            <div className="flex justify-between items-center px-6 py-5 border-b">
              <h2 className="text-xl font-semibold">Menu</h2>
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col px-6 py-8 space-y-8 text-lg">
              <Link
                to="/"
                className="text-gray-800 hover:text-(--accent-brown)"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-800 hover:text-(--accent-brown)"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("subscribe")
                    ?.scrollIntoView({ behavior: "smooth" });
                  setIsMenuOpen(false);
                }}
                className="text-left text-gray-800 hover:text-(--accent-brown)"
              >
                Subscribe
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/30 z-40"
            />

            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50"
            >
              <div className="max-w-6xl mx-auto px-6 py-6">
                <div className="flex items-center gap-4">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search"
                    className="flex-1 text-lg outline-none placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="text-sm uppercase tracking-[0.2em] text-gray-500 hover:text-(--accent-brown)"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-10 border-t border-(--border) pt-8">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">
                    Blog Posts
                  </p>

                  {loading && (
                    <p className="text-sm text-gray-500">Searching...</p>
                  )}

                  {!loading && error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}

                  {!loading && !error && results.length === 0 && (
                    <p className="text-sm text-gray-500">
                      {debouncedQuery.trim().length < 2
                        ? "Type at least 2 characters to search."
                        : "No results found."}
                    </p>
                  )}

                  <div className="grid gap-6 md:grid-cols-3">
                    {results.map((result) => {
                      const image =
                        resolveImageUrl(result.image_url) ||
                        imageByCategory[result.category] ||
                        "/hero-bookshelf.jpg";
                      const excerpt = normalizeExcerpt(result.excerpt);
                      const date = formatSearchDate(result.created_at);
                      const category =
                        categoryLabel[result.category] || result.category;

                      return (
                        <Link
                          key={result.id}
                          to={`/story/${result.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="group flex items-start gap-4"
                        >
                          <img
                            src={image}
                            alt={result.title}
                            className="w-16 h-16 object-cover border border-(--border)"
                          />
                          <div className="flex-1">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400">
                              {category}
                              {date ? ` \u00B7 ${date}` : ""}
                            </p>
                            <p className="mt-1 text-sm font-['Cormorant_Garamond'] text-gray-900 group-hover:text-(--accent-brown) transition-colors">
                              {result.title}
                            </p>
                            {excerpt && (
                              <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                {excerpt}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {hasMore && (
                    <button
                      type="button"
                      onClick={() => fetchResults(results.length, true)}
                      disabled={loadingMore}
                      className="mt-10 bg-black text-white px-8 py-3 uppercase text-xs tracking-[0.3em] hover:bg-gray-800 disabled:opacity-60"
                    >
                      {loadingMore ? "Loading..." : "Show All Results"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
