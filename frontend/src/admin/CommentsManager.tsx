import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiRequest } from "../lib/api";

type AdminComment = {
  id: number;
  article_id: number;
  article_title: string;
  name: string;
  comment: string;
  created_at: string;
  reply: string | null;
  reply_created_at: string | null;
  reply_updated_at: string | null;
  replied_by_name: string | null;
};

type AdminCommentsResponse = {
  comments: AdminComment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalComments: number;
    limit: number;
  };
};

const ADMIN_ENDPOINT_MISSING_MESSAGE =
  "Admin endpoint missing. Verify backend restart/build and API base URL.";
const POLL_INTERVAL_MS = 30_000;

const formatDate = (value: string | null) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (value: Date | null) => {
  if (!value) return "Not refreshed yet";
  return value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getToken = () => localStorage.getItem("admin_token");

export default function CommentsManager() {
  const navigate = useNavigate();
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [savingReplyId, setSavingReplyId] = useState<number | null>(null);
  const [deletingReplyId, setDeletingReplyId] = useState<number | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  const authHeaders = useMemo<HeadersInit | undefined>(() => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }, []);

  const redirectIfUnauthorized = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        localStorage.removeItem("admin_token");
        navigate("/admin?reason=expired", { replace: true });
        return true;
      }
      return false;
    },
    [navigate]
  );

  const loadComments = useCallback(
    async (background = false) => {
      try {
        if (background) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const data = await apiRequest<AdminCommentsResponse>(
          "/api/admin/comments?page=1&limit=100",
          { headers: authHeaders }
        );
        setComments(data.comments || []);
        setTotalComments(data.pagination?.totalComments || 0);
        setLastUpdated(new Date());
      } catch (err) {
        if (redirectIfUnauthorized(err)) return;

        if (err instanceof ApiError && err.status === 404) {
          setError(ADMIN_ENDPOINT_MISSING_MESSAGE);
          return;
        }

        setError((err as Error).message || "Failed to load comments");
      } finally {
        if (background) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [authHeaders, redirectIfUnauthorized]
  );

  useEffect(() => {
    void loadComments(false);
  }, [loadComments]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadComments(true);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadComments]);

  const startReply = (item: AdminComment) => {
    setActiveReplyId(item.id);
    setReplyDrafts((prev) => ({ ...prev, [item.id]: item.reply || "" }));
  };

  const cancelReply = () => {
    setActiveReplyId(null);
  };

  const handleSaveReply = async (commentId: number) => {
    const draft = (replyDrafts[commentId] || "").trim();
    if (!draft) {
      setError("Reply cannot be empty.");
      return;
    }

    try {
      setSavingReplyId(commentId);
      setError(null);
      await apiRequest(`/api/admin/comments/${commentId}/reply`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ reply: draft }),
      });
      setActiveReplyId(null);
      await loadComments(false);
    } catch (err) {
      if (redirectIfUnauthorized(err)) return;
      setError((err as Error).message || "Failed to save reply");
    } finally {
      setSavingReplyId(null);
    }
  };

  const handleDeleteReply = async (commentId: number) => {
    const confirmDelete = window.confirm(
      "Delete this admin reply? This cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      setDeletingReplyId(commentId);
      setError(null);
      await apiRequest(`/api/admin/comments/${commentId}/reply`, {
        method: "DELETE",
        headers: authHeaders,
      });
      setReplyDrafts((prev) => ({ ...prev, [commentId]: "" }));
      if (activeReplyId === commentId) {
        setActiveReplyId(null);
      }
      await loadComments(false);
    } catch (err) {
      if (redirectIfUnauthorized(err)) return;
      setError((err as Error).message || "Failed to delete reply");
    } finally {
      setDeletingReplyId(null);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const confirmDelete = window.confirm(
      "Delete this comment? This cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      setDeletingCommentId(commentId);
      setError(null);
      await apiRequest(`/api/admin/comments/${commentId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (activeReplyId === commentId) {
        setActiveReplyId(null);
      }
      await loadComments(false);
    } catch (err) {
      if (redirectIfUnauthorized(err)) return;
      setError((err as Error).message || "Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleManualRefresh = () => {
    void loadComments(true);
  };

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-100">Comments</h2>
          <p className="mt-1 text-xs text-gray-500">
            Last updated {formatDateTime(lastUpdated)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{totalComments} total</span>
          <button
            onClick={handleManualRefresh}
            disabled={loading || refreshing}
            className="px-3 py-1 text-sm rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {loading && <p className="text-gray-400">Loading comments...</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!loading && comments.length === 0 && (
        <p className="text-gray-500">No comments found.</p>
      )}

      <div className="space-y-4">
        {comments.map((item) => {
          const draft = replyDrafts[item.id] || "";
          const isReplyOpen = activeReplyId === item.id;
          const savingReply = savingReplyId === item.id;
          const deletingReply = deletingReplyId === item.id;
          const deletingComment = deletingCommentId === item.id;

          return (
            <article
              key={item.id}
              className="rounded-xl border border-gray-800 bg-gray-950/50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-amber-400">
                    {item.article_title}
                  </p>
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-gray-100">
                      {item.name}
                    </span>{" "}
                    &middot; {formatDate(item.created_at)}
                  </p>
                  <p className="text-gray-200 whitespace-pre-wrap">
                    {item.comment}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startReply(item)}
                    className="px-3 py-1 text-sm rounded-lg border border-gray-700 hover:bg-gray-800 transition"
                  >
                    {item.reply ? "Edit Reply" : "Reply"}
                  </button>
                  <button
                    onClick={() => handleDeleteComment(item.id)}
                    disabled={deletingComment}
                    className="px-3 py-1 text-sm rounded-lg border border-red-500 text-red-400 hover:bg-red-950/40 transition disabled:opacity-60"
                  >
                    {deletingComment ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              {item.reply && (
                <div className="mt-4 rounded-lg border border-amber-700/60 bg-amber-950/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-amber-300">
                    Admin Reply
                    {item.replied_by_name ? ` by ${item.replied_by_name}` : ""}
                  </p>
                  <p className="mt-2 text-sm text-gray-200 whitespace-pre-wrap">
                    {item.reply}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Updated{" "}
                    {formatDate(item.reply_updated_at || item.reply_created_at)}
                  </p>
                  <button
                    onClick={() => handleDeleteReply(item.id)}
                    disabled={deletingReply}
                    className="mt-3 text-xs text-red-300 hover:text-red-200 disabled:opacity-60"
                  >
                    {deletingReply ? "Deleting reply..." : "Delete reply"}
                  </button>
                </div>
              )}

              {isReplyOpen && (
                <div className="mt-4 space-y-3">
                  <textarea
                    rows={4}
                    value={draft}
                    onChange={(event) =>
                      setReplyDrafts((prev) => ({
                        ...prev,
                        [item.id]: event.target.value,
                      }))
                    }
                    placeholder="Write your admin reply..."
                    className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveReply(item.id)}
                      disabled={savingReply}
                      className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 transition disabled:opacity-60"
                    >
                      {savingReply ? "Saving..." : "Save Reply"}
                    </button>
                    <button
                      onClick={cancelReply}
                      className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
