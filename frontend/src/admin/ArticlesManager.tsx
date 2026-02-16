import { useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "../lib/api";
import { resolveImageUrl } from "../lib/images";

type Article = {
  id: number;
  title: string;
  content: string;
  category: "ENTREPRENEURSHIP" | "FASHION";
  quote?: string | null;
  image_url?: string | null;
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

const categories = [
  { label: "Entrepreneurship Journeys", value: "ENTREPRENEURSHIP" },
  { label: "Fashion & Sewing", value: "FASHION" },
];

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getToken = () => localStorage.getItem("admin_token");

export default function ArticlesManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] =
    useState<"ENTREPRENEURSHIP" | "FASHION">("ENTREPRENEURSHIP");
  const [content, setContent] = useState("");
  const [quote, setQuote] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [storedImageUrl, setStoredImageUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const authHeaders = useMemo<HeadersInit | undefined>(() => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiRequest<ArticlesResponse>(
        "/api/articles?page=1&limit=50"
      );
      setArticles(data.articles || []);
    } catch (err) {
      setError((err as Error).message || "Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resetForm = () => {
    setTitle("");
    setCategory("ENTREPRENEURSHIP");
    setContent("");
    setQuote("");
    setImageFile(null);
    setImagePreview(null);
    setStoredImageUrl(null);
    setRemoveImage(false);
    setEditingId(null);
    setFormError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = (article: Article) => {
    setTitle(article.title);
    setCategory(article.category);
    setContent(article.content);
    setQuote(article.quote || "");
    setImageFile(null);
    setImagePreview(null);
    setStoredImageUrl(resolveImageUrl(article.image_url) || null);
    setRemoveImage(false);
    setEditingId(article.id);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(previewUrl);
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setStoredImageUrl(null);
    if (editingId) {
      setRemoveImage(true);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (articleId: number) => {
    const confirmDelete = window.confirm(
      "Delete this article? This cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await apiRequest(`/api/articles/${articleId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      await loadArticles();
    } catch (err) {
      setError((err as Error).message || "Failed to delete article");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!title.trim() || !content.trim()) {
      setFormError("Title and content are required.");
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();
      payload.append("title", title.trim());
      payload.append("content", content.trim());
      payload.append("category", category);
      if (quote.trim()) {
        payload.append("quote", quote.trim());
      }
      if (imageFile) {
        payload.append("image", imageFile);
      }
      if (editingId && removeImage) {
        payload.append("removeImage", "true");
      }

      if (editingId) {
        await apiRequest(`/api/articles/${editingId}`, {
          method: "PUT",
          headers: authHeaders,
          body: payload,
        });
      } else {
        await apiRequest("/api/articles", {
          method: "POST",
          headers: authHeaders,
          body: payload,
        });
      }

      resetForm();
      await loadArticles();
    } catch (err) {
      setFormError((err as Error).message || "Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit">
        <h2 className="text-xl font-semibold mb-6">
          {editingId ? "Edit Article" : "New Article"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Article title"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as "ENTREPRENEURSHIP" | "FASHION")
              }
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={10}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Write the story..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Quote (optional)
            </label>
            <textarea
              value={quote}
              onChange={(event) => setQuote(event.target.value)}
              rows={3}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Optional pull quote to highlight"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Feature Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 text-sm text-gray-200"
            />
            {(imagePreview || storedImageUrl) && (
              <div className="mt-3">
                <img
                  src={imagePreview || storedImageUrl}
                  alt="Article preview"
                  className="w-full h-40 object-cover rounded-lg border border-gray-700"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="mt-2 text-xs text-red-400 hover:text-red-300"
                >
                  Remove image
                </button>
              </div>
            )}
            {removeImage && (
              <p className="mt-2 text-xs text-amber-400">
                Image will be removed when you save.
              </p>
            )}
          </div>

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed transition rounded-lg py-2 font-medium"
          >
            {saving ? "Saving..." : editingId ? "Update Article" : "Publish"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full border border-gray-700 rounded-lg py-2 text-gray-300 hover:bg-gray-800 transition"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">All Articles</h2>
          <span className="text-sm text-gray-400">
            {articles.length} total
          </span>
        </div>

        {loading && <p className="text-gray-400">Loading articles...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="border border-gray-800 rounded-xl p-4 bg-gray-950/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-amber-500">
                      {categories.find((cat) => cat.value === article.category)
                        ?.label || article.category}
                    </p>
                    <h3 className="text-lg font-semibold mt-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(article.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(article)}
                      className="px-3 py-1 text-sm rounded-lg border border-gray-700 hover:bg-gray-800 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="px-3 py-1 text-sm rounded-lg border border-red-500 text-red-400 hover:bg-red-950/40 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {articles.length === 0 && (
              <p className="text-gray-500">No articles yet.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
