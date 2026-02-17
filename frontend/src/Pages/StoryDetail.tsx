import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Facebook, Heart, Linkedin, Link2, Twitter } from "lucide-react";
import { apiRequest } from "../lib/api";
import { useLikes } from "../lib/likes";
import ShareModal from "../components/ShareModal";
import ShareMenu from "../components/ShareMenu";
import CategoryTabs from "../components/CategoryTabs";
import {
  categoryApiToSlug,
  categoryLabel,
  imageByCategory,
} from "../lib/categories";
import { resolveImageUrl } from "../lib/images";

type Article = {
  id: number;
  title: string;
  content: string;
  category: "ENTREPRENEURSHIP" | "FASHION";
  views: number;
  created_at: string;
  quote?: string | null;
  image_url?: string | null;
};

type Comment = {
  id: number;
  name: string;
  comment: string;
  created_at: string;
  admin_reply?: string | null;
  admin_reply_updated_at?: string | null;
};

type CommentsResponse = {
  articleId: number;
  comments: Comment[];
  total: number;
};

type LikesResponse = {
  articleId: number;
  likes: number;
};

const estimateReadTime = (content: string) => {
  const words = content?.trim().split(/\s+/).filter(Boolean).length || 0;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
};

const formatDetailDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const splitParagraphs = (content: string) =>
  content
    .split(/\r?\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

const extractQuote = (content: string, quote?: string | null) => {
  if (quote && quote.trim().length >= 40) return quote.trim();
  const curlyMatch = content.match(/“([^”]{40,220})”/);
  if (curlyMatch?.[1]) return curlyMatch[1];
  const straightMatch = content.match(/"([^"]{40,220})"/);
  if (straightMatch?.[1]) return straightMatch[1];
  return null;
};

const buildShareLinks = (shareUrl: string, title: string) => {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };
};

export default function StoryDetail() {
  const { id } = useParams();
  const articleId = useMemo(() => Number(id), [id]);

  const { like, likedIds, likeCounts, setLikeCount } = useLikes();

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeError, setLikeError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      if (!articleId || Number.isNaN(articleId)) {
        setError("Invalid story id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [articleData, likesData, commentsData] = await Promise.all([
          apiRequest<Article>(`/api/articles/${articleId}`),
          apiRequest<LikesResponse>(`/api/interactions/likes/${articleId}`),
          apiRequest<CommentsResponse>(
            `/api/interactions/comments/${articleId}`
          ),
        ]);

        if (!ignore) {
          setArticle(articleData);
          setLikeCount(articleId, likesData.likes || 0);
          setComments(commentsData.comments || []);
        }
      } catch (err) {
        if (!ignore) {
          setError((err as Error).message || "Failed to load story");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [articleId, setLikeCount]);

  const handleLike = async () => {
    if (!articleId) return;
    setLikeError(null);
    const result = await like(articleId);
    if (!result.ok && result.message) {
      setLikeError(result.message);
    }
  };

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCommentError(null);

    if (!name.trim() || !comment.trim()) {
      setCommentError("Name and comment are required.");
      return;
    }

    try {
      setCommentLoading(true);
      await apiRequest(`/api/interactions/comment/${articleId}`, {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), comment: comment.trim() }),
      });

      const refreshed = await apiRequest<CommentsResponse>(
        `/api/interactions/comments/${articleId}`
      );
      setComments(refreshed.comments || []);
      setName("");
      setComment("");
    } catch (err) {
      setCommentError((err as Error).message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-24 text-center text-gray-500">
        Loading story...
      </section>
    );
  }

  if (error || !article) {
    return (
      <section className="py-24 text-center text-red-500">
        {error || "Story not found."}
      </section>
    );
  }

  const heroImage =
    resolveImageUrl(article.image_url) ||
    imageByCategory[article.category] ||
    "/hero-bookshelf.jpg";
  const paragraphs = splitParagraphs(article.content || "");
  const quote = extractQuote(article.content || "", article.quote);
  const likes = likeCounts[articleId] ?? 0;
  const isLiked = likedIds.has(articleId);
  const activeSlug = categoryApiToSlug[article.category] || "";
  const shareUrl =
    typeof window === "undefined"
      ? `/story/${articleId}`
      : `${window.location.origin}/story/${articleId}`;
  const shareLinks = buildShareLinks(shareUrl, article.title);

  return (
    <article className="bg-white">
      <section className="max-w-5xl mx-auto px-6 pt-10 pb-6">
        <CategoryTabs activeSlug={activeSlug} linkBase="/" align="left" />

        <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1 min-w-65">
            <h1 className="text-4xl md:text-5xl font-['Cormorant_Garamond'] text-gray-900 tracking-[0.08em]">
              {article.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <img
                  src="/chidera.jpg"
                  alt="author"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-xs uppercase tracking-widest text-gray-700">
                  CHIDERA E. ABEL
                </span>
              </div>
              <span>&middot;</span>
              <span>{formatDetailDate(article.created_at)}</span>
              <span>&middot;</span>
              <span>{estimateReadTime(article.content)}</span>
            </div>
          </div>

          <ShareMenu
            open={shareMenuOpen}
            onOpen={() => setShareMenuOpen(true)}
            onClose={() => setShareMenuOpen(false)}
            onShare={() => {
              setShareMenuOpen(false);
              setShareOpen(true);
            }}
          />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6">
        <div className="relative overflow-hidden border border-(--border)">
          <img
            src={heroImage}
            alt={article.title}
            className="w-full h-90 md:h-115 object-cover"
          />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pt-10 pb-8 text-[17px] md:text-[18px] text-gray-800 leading-[1.9]">
        {quote && (
          <blockquote className="border-l-4 border-(--accent-brown) pl-6 italic text-xl text-gray-900 mb-10 font-['Cormorant_Garamond']">
            &ldquo;{quote}&rdquo;
          </blockquote>
        )}

        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-6">
              {paragraph}
            </p>
          ))
        ) : (
          <p>{article.content}</p>
        )}
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-8">
        <div className="text-sm text-gray-700 border-b border-(--border) pb-4 flex items-center gap-2">
          <span className="underline decoration-(--accent-brown) decoration-2 underline-offset-4">
            {categoryLabel[article.category] || article.category}
          </span>
        </div>
        <div className="flex items-center gap-6 text-gray-500 text-sm py-5 border-b border-(--border)">
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noreferrer"
            className="hover:text-(--accent-brown)"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noreferrer"
            className="hover:text-(--accent-brown)"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noreferrer"
            className="hover:text-(--accent-brown)"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(shareUrl)}
            className="hover:text-(--accent-brown)"
            aria-label="Copy link"
          >
            <Link2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 py-4">
          <span>
            {article.views} views &middot; {comments.length} comments
          </span>
          <button
            type="button"
            onClick={handleLike}
            className={`inline-flex items-center gap-2 ${
              isLiked ? "text-red-600" : "text-gray-400"
            } hover:text-red-500`}
          >
            <span>{likes}</span>
            <Heart
              className={isLiked ? "w-4 h-4 fill-current" : "w-4 h-4"}
            />
          </button>
        </div>
        {likeError && <p className="text-xs text-red-500">{likeError}</p>}
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
        <div className="border-b border-(--border) mb-6" />

        <form onSubmit={handleCommentSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <input
              type="text"
              placeholder="Write a comment..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="flex-1 border border-gray-300 px-4 py-3 focus:outline-none focus:border-(--accent-brown)"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-(--accent-brown)"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-(--accent-brown)"
            />
          </div>

          {commentError && <p className="text-sm text-red-500">{commentError}</p>}

          <button
            type="submit"
            disabled={commentLoading}
            className="border border-gray-800 px-6 py-2 text-sm uppercase tracking-widest hover:bg-gray-900 hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {commentLoading ? "Posting..." : "Post Comment"}
          </button>
        </form>

        <div className="mt-10 space-y-6">
          {comments.length === 0 && (
            <p className="text-gray-500">Be the first to comment.</p>
          )}

          {comments.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1 border-b border-(--border) pb-4">
                <p className="text-sm font-semibold text-gray-800">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDetailDate(item.created_at)}
                </p>
                <p className="mt-2 text-sm text-gray-700">{item.comment}</p>
                {item.admin_reply && (
                  <div className="mt-3 border-l-2 border-(--accent-brown) pl-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Admin Reply
                    </p>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                      {item.admin_reply}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDetailDate(item.admin_reply_updated_at || item.created_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={shareUrl}
        title={article.title}
      />
    </article>
  );
}
