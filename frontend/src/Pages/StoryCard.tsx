import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { apiRequest } from "../lib/api";
import ShareModal from "../components/ShareModal";
import { useLikes } from "../lib/likes";
import CategoryTabs from "../components/CategoryTabs";
import ShareMenu from "../components/ShareMenu";
import { categorySlugToApi, imageByCategory } from "../lib/categories";
import { resolveImageUrl } from "../lib/images";

type Article = {
  id: number;
  title: string;
  content: string;
  category: "ENTREPRENEURSHIP" | "FASHION";
  image_url?: string | null;
  views: number;
  created_at: string;
};

type ArticlesResponse = {
  articles: Article[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalArticles: number;
    limit: number;
  };
};

type StatsResponse = {
  stats: Array<{ id: number; likes: number; comments: number }>;
};

const formatListDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const estimateReadTime = (content: string) => {
  const words = content?.trim().split(/\s+/).filter(Boolean).length || 0;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
};

const makeExcerpt = (content: string) => {
  if (!content) return "";
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= 160) return normalized;
  return `${normalized.slice(0, 160)}...`;
};

export default function StoryCard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSlug = searchParams.get("category") || "";
  const isAllPosts = currentSlug === "" || currentSlug === "all";

  const { like, likedIds, likeCounts, setLikeCount } = useLikes();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<
    Record<number, { likes: number; comments: number }>
  >({});
  const [sharePost, setSharePost] = useState<Article | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [likeErrorById, setLikeErrorById] = useState<Record<number, string>>(
    {}
  );

  const apiCategory = useMemo(
    () => categorySlugToApi.get(currentSlug) || "ALL",
    [currentSlug]
  );

  useEffect(() => {
    let ignore = false;

    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const endpoint =
          apiCategory === "ALL"
            ? "/api/articles?page=1&limit=10"
            : `/api/articles/category/${apiCategory}?page=1&limit=10`;

        const data = await apiRequest<ArticlesResponse>(endpoint);
        if (!ignore) {
          setArticles(data.articles || []);
        }
      } catch (err) {
        if (!ignore) {
          setError((err as Error).message || "Failed to load stories");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchArticles();
    return () => {
      ignore = true;
    };
  }, [apiCategory]);

  useEffect(() => {
    if (articles.length === 0) return;

    const fetchStats = async () => {
      try {
        const ids = articles.map((article) => article.id).join(",");
        const data = await apiRequest<StatsResponse>(
          `/api/articles/stats?ids=${ids}`
        );
        const nextStats: Record<number, { likes: number; comments: number }> = {};
        data.stats.forEach((item) => {
          nextStats[item.id] = { likes: item.likes, comments: item.comments };
          setLikeCount(item.id, item.likes);
        });
        setStats(nextStats);
      } catch {
        // stats are optional; ignore failures
      }
    };

    fetchStats();
  }, [articles, setLikeCount]);

  const setCategory = (slug: string) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  const getShareUrl = (id: number) => {
    if (typeof window === "undefined") return `/story/${id}`;
    return `${window.location.origin}/story/${id}`;
  };

  return (
    <section className="py-14 bg-white">
      <div className="max-w-5xl mx-auto px-6 mb-10">
        <CategoryTabs activeSlug={currentSlug} onSelect={setCategory} />
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {loading && (
          <p className="text-center text-gray-500 py-12 text-lg">
            Loading stories...
          </p>
        )}

        {error && !loading && (
          <p className="text-center text-red-500 py-12 text-lg">{error}</p>
        )}
      </div>

      {!loading && !error && (
        <div
          className={`max-w-5xl mx-auto px-6 ${
            isAllPosts ? "grid grid-cols-1 md:grid-cols-2 gap-10" : "grid gap-10"
          }`}
        >
          {articles.map((post) => {
            const image =
              resolveImageUrl(post.image_url) ||
              imageByCategory[post.category] ||
              "/hero-bookshelf.jpg";
            const stat = stats[post.id];
            const likeCount = likeCounts[post.id] ?? stat?.likes ?? 0;
            const commentCount = stat?.comments ?? 0;
            const isLiked = likedIds.has(post.id);
            const isMenuOpen = openMenuId === post.id;

            return (
              <article
                key={post.id}
                className={`group bg-white border border-(--border) shadow-[0_12px_32px_rgba(0,0,0,0.06)] ${
                  !isAllPosts && "max-w-4xl mx-auto"
                }`}
              >
                <Link to={`/story/${post.id}`} className="block">
                  <div className="w-full h-56 md:h-64 overflow-hidden">
                    <img
                      src={image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>

                <div className="px-8 py-7">
                  <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gray-500 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src="/chidera.jpg"
                        alt="author"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-700 tracking-normal uppercase">
                          CHIDERA E. ABEL
                        </span>
                        <span className="text-[11px] text-gray-500 tracking-normal uppercase">
                          {formatListDate(post.created_at)} &middot;{" "}
                          {estimateReadTime(post.content)}
                        </span>
                      </div>
                    </div>
                    <ShareMenu
                      open={isMenuOpen}
                      onOpen={() => setOpenMenuId(post.id)}
                      onClose={() => setOpenMenuId(null)}
                      onShare={() => {
                        setSharePost(post);
                        setOpenMenuId(null);
                      }}
                    />
                  </div>

                  <Link to={`/story/${post.id}`} className="block">
                    <h2 className="text-2xl md:text-3xl font-['Cormorant_Garamond'] text-gray-900 leading-snug group-hover:text-(--accent-brown) transition-colors">
                      {post.title}
                    </h2>

                    <p className="mt-4 text-[15px] text-gray-700 leading-relaxed line-clamp-4 group-hover:text-(--accent-brown) transition-colors">
                      {makeExcerpt(post.content)}
                    </p>
                  </Link>
                </div>

                <div className="px-8 pb-6">
                  <div className="border-t border-(--border) pt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {post.views} views &middot; {commentCount} comments
                    </span>
                    <button
                      type="button"
                      onClick={async (event) => {
                        event.preventDefault();
                        setLikeErrorById(
                          (prev): Record<number, string> => {
                            const { [post.id]: _removed, ...rest } = prev;
                            return rest;
                          }
                        );
                        const result = await like(post.id);
                        if (!result.ok && result.message) {
                          const message = result.message;
                          setLikeErrorById((prev) => ({
                            ...prev,
                            [post.id]: message,
                          }));
                        }
                      }}
                      className={`inline-flex items-center gap-2 ${
                        isLiked ? "text-red-600" : "text-gray-400"
                      } hover:text-red-500`}
                    >
                      <span>{likeCount}</span>
                      <Heart
                        className={isLiked ? "w-4 h-4 fill-current" : "w-4 h-4"}
                      />
                    </button>
                  </div>
                  {likeErrorById[post.id] && (
                    <p className="mt-2 text-xs text-red-500">
                      {likeErrorById[post.id]}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <p className="text-center text-gray-500 py-20 text-lg">
          No stories in this category yet. Coming soon!
        </p>
      )}

      <ShareModal
        open={Boolean(sharePost)}
        onClose={() => setSharePost(null)}
        shareUrl={
          sharePost
            ? getShareUrl(sharePost.id)
            : typeof window === "undefined"
              ? ""
              : window.location.href
        }
        title={sharePost?.title}
      />
    </section>
  );
}
