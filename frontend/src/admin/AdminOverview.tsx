import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiRequest } from "../lib/api";

type OverviewResponse = {
  totals: {
    articles: number;
    comments: number;
    replies: number;
    likes: number;
    subscribers: number;
    totalSubscribers?: number;
    verifiedSubscribers?: number;
    unverifiedSubscribers?: number;
    verificationRate?: number;
    views: number;
  };
  recentComments: Array<{
    id: number;
    article_id: number;
    article_title: string;
    name: string;
    comment: string;
    created_at: string;
    has_reply: number;
  }>;
};

type MetricKey =
  | "articles"
  | "comments"
  | "replies"
  | "likes"
  | "totalSubscribers"
  | "verifiedSubscribers"
  | "unverifiedSubscribers"
  | "verificationRate"
  | "views";

type DashboardTotals = Record<MetricKey, number>;

const metricCards: Array<{
  key: MetricKey;
  label: string;
  formatter?: (value: number) => string;
}> = [
  { key: "articles", label: "Articles" },
  { key: "comments", label: "Comments" },
  { key: "replies", label: "Replies" },
  { key: "likes", label: "Likes" },
  { key: "totalSubscribers", label: "Subscribers (Total)" },
  { key: "verifiedSubscribers", label: "Subscribers (Verified)" },
  { key: "unverifiedSubscribers", label: "Subscribers (Unverified)" },
  {
    key: "verificationRate",
    label: "Verification Rate",
    formatter: (value) => `${value.toFixed(2)}%`,
  },
  { key: "views", label: "Views" },
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

const normalizeTotals = (source: OverviewResponse["totals"] | undefined): DashboardTotals => {
  const totalSubscribers = Number(source?.totalSubscribers ?? source?.subscribers ?? 0);
  const verifiedSubscribers = Number(source?.verifiedSubscribers ?? 0);
  const unverifiedSubscribers = Number(
    source?.unverifiedSubscribers ?? Math.max(totalSubscribers - verifiedSubscribers, 0)
  );
  const verificationRate = Number(
    source?.verificationRate ??
      (totalSubscribers > 0 ? (verifiedSubscribers / totalSubscribers) * 100 : 0)
  );

  return {
    articles: Number(source?.articles ?? 0),
    comments: Number(source?.comments ?? 0),
    replies: Number(source?.replies ?? 0),
    likes: Number(source?.likes ?? 0),
    totalSubscribers,
    verifiedSubscribers,
    unverifiedSubscribers,
    verificationRate,
    views: Number(source?.views ?? 0),
  };
};

export default function AdminOverview() {
  const navigate = useNavigate();
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useMemo<HeadersInit | undefined>(() => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }, []);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest<OverviewResponse>("/api/admin/overview", {
          headers: authHeaders,
        });
        setData(response);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem("admin_token");
          navigate("/admin?reason=expired", { replace: true });
          return;
        }

        if (err instanceof ApiError && err.status === 404) {
          setError(
            "Admin endpoint missing. Verify backend restart/build and API base URL."
          );
          return;
        }

        setError((err as Error).message || "Failed to load admin overview");
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [authHeaders, navigate]);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-gray-300">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-red-400">
        {error}
      </div>
    );
  }

  const totals = normalizeTotals(data?.totals);
  const recentComments = data?.recentComments || [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((item) => (
          <article
            key={item.key}
            className="rounded-xl border border-gray-800 bg-gray-900 p-4"
          >
            <p className="text-xs uppercase tracking-wide text-gray-400">
              {item.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-gray-100">
              {item.formatter
                ? item.formatter(totals[item.key])
                : totals[item.key]}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Recent Comments</h2>
          <span className="text-xs text-gray-500">Latest 5</span>
        </div>

        {recentComments.length === 0 && (
          <p className="text-gray-500">No comments yet.</p>
        )}

        <div className="space-y-3">
          {recentComments.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-gray-800 bg-gray-950/50 p-3"
            >
              <p className="text-xs uppercase tracking-wide text-amber-400">
                {item.article_title}
              </p>
              <p className="mt-1 text-sm text-gray-200">
                <span className="font-semibold">{item.name}</span> &middot;{" "}
                {formatDate(item.created_at)}
              </p>
              <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                {item.comment}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {item.has_reply ? "Replied" : "Awaiting reply"}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
