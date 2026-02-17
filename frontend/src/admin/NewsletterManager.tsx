import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiRequest } from "../lib/api";

type NewsletterSummary = {
  audience: {
    totalSubscribers: number;
    verifiedSubscribers: number;
    unverifiedSubscribers: number;
    verificationRate: number;
  };
  campaigns: {
    totalCampaigns: number;
    queuedCampaigns: number;
    sendingCampaigns: number;
    completedCampaigns: number;
    partialCampaigns: number;
    failedCampaigns: number;
    totalRecipients: number;
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalFailed: number;
  };
};

type Campaign = {
  id: number;
  trigger_type: "MANUAL" | "AUTO_ARTICLE";
  status: "QUEUED" | "SENDING" | "COMPLETED" | "PARTIAL" | "FAILED";
  subject: string;
  article_id: number | null;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  failed_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  last_event_at: string | null;
};

type CampaignsResponse = {
  campaigns: Campaign[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCampaigns: number;
    limit: number;
  };
};

type CampaignDelivery = {
  id: number;
  email: string;
  status:
    | "PENDING"
    | "SENT"
    | "DELIVERED"
    | "OPENED"
    | "CLICKED"
    | "FAILED"
    | "BOUNCED"
    | "COMPLAINED";
  provider_message_id: string | null;
  provider_response_code: string | null;
  provider_response_message: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  failed_at: string | null;
  bounced_at: string | null;
  complained_at: string | null;
  created_at: string;
  updated_at: string;
};

type DeliveriesResponse = {
  campaign: Campaign;
  deliveries: CampaignDelivery[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalDeliveries: number;
    limit: number;
  };
};

const POLL_INTERVAL_MS = 30_000;

const getToken = () => localStorage.getItem("admin_token");

const formatDateTime = (value: string | null) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function NewsletterManager() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<NewsletterSummary | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [deliveries, setDeliveries] = useState<CampaignDelivery[]>([]);

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [triggerFilter, setTriggerFilter] = useState("");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("");
  const [deliveryQuery, setDeliveryQuery] = useState("");

  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedCampaignId = selectedCampaign?.id ?? null;

  const authHeaders = useMemo<HeadersInit | undefined>(() => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }, []);

  const handleAuthError = useCallback(
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

  const loadSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      const data = await apiRequest<NewsletterSummary>("/api/admin/newsletter/summary", {
        headers: authHeaders,
      });
      setSummary(data);
    } catch (err) {
      if (handleAuthError(err)) return;
      setError((err as Error).message || "Failed to load newsletter summary");
    } finally {
      setLoadingSummary(false);
    }
  }, [authHeaders, handleAuthError]);

  const loadCampaigns = useCallback(async () => {
    try {
      setLoadingCampaigns(true);
      setError(null);

      const params = new URLSearchParams({
        page: "1",
        limit: "25",
      });
      if (statusFilter) params.set("status", statusFilter);
      if (triggerFilter) params.set("trigger", triggerFilter);

      const data = await apiRequest<CampaignsResponse>(
        `/api/admin/newsletter/campaigns?${params.toString()}`,
        {
          headers: authHeaders,
        }
      );

      const nextCampaigns = data.campaigns || [];
      setCampaigns(nextCampaigns);
      setSelectedCampaign((previous) => {
        if (!previous) return nextCampaigns[0] || null;
        const refreshedSelected = nextCampaigns.find(
          (item) => item.id === previous.id
        );
        if (refreshedSelected) return refreshedSelected;
        return nextCampaigns[0] || null;
      });
    } catch (err) {
      if (handleAuthError(err)) return;
      setError((err as Error).message || "Failed to load campaigns");
    } finally {
      setLoadingCampaigns(false);
    }
  }, [authHeaders, handleAuthError, statusFilter, triggerFilter]);

  const loadDeliveries = useCallback(
    async (campaignId: number) => {
      try {
        setLoadingDeliveries(true);

        const params = new URLSearchParams({
          page: "1",
          limit: "100",
        });
        if (deliveryStatusFilter) params.set("status", deliveryStatusFilter);
        if (deliveryQuery.trim()) params.set("q", deliveryQuery.trim());

        const data = await apiRequest<DeliveriesResponse>(
          `/api/admin/newsletter/campaigns/${campaignId}/deliveries?${params.toString()}`,
          {
            headers: authHeaders,
          }
        );

        setSelectedCampaign(data.campaign);
        setDeliveries(data.deliveries || []);
      } catch (err) {
        if (handleAuthError(err)) return;
        setError((err as Error).message || "Failed to load deliveries");
      } finally {
        setLoadingDeliveries(false);
      }
    },
    [authHeaders, deliveryQuery, deliveryStatusFilter, handleAuthError]
  );

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    if (!selectedCampaignId) {
      setDeliveries([]);
      return;
    }
    void loadDeliveries(selectedCampaignId);
  }, [loadDeliveries, selectedCampaignId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadSummary();
      void loadCampaigns();
      if (selectedCampaignId) {
        void loadDeliveries(selectedCampaignId);
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadCampaigns, loadDeliveries, loadSummary, selectedCampaignId]);

  const handleCreateCampaign = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subject.trim() || !html.trim()) {
      setError("Subject and HTML content are required.");
      return;
    }

    try {
      setCreatingCampaign(true);
      setError(null);

      const response = await apiRequest<{ campaignId: number }>(
        "/api/admin/newsletter/campaigns",
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            trigger: "MANUAL",
            subject: subject.trim(),
            html: html.trim(),
          }),
        }
      );

      setSubject("");
      setHtml("");
      await loadSummary();
      await loadCampaigns();
      await loadDeliveries(response.campaignId);
    } catch (err) {
      if (handleAuthError(err)) return;
      setError((err as Error).message || "Failed to create campaign");
    } finally {
      setCreatingCampaign(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-red-300">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loadingSummary ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-gray-400">
            Loading summary...
          </div>
        ) : (
          <>
            <article className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Subscribers
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-100">
                {summary?.audience.totalSubscribers ?? 0}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {summary?.audience.verifiedSubscribers ?? 0} verified,{" "}
                {summary?.audience.unverifiedSubscribers ?? 0} unverified
              </p>
            </article>
            <article className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Verification Rate
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-100">
                {(summary?.audience.verificationRate ?? 0).toFixed(2)}%
              </p>
            </article>
            <article className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Campaigns
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-100">
                {summary?.campaigns.totalCampaigns ?? 0}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {summary?.campaigns.sendingCampaigns ?? 0} sending
              </p>
            </article>
            <article className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Delivered / Opened / Clicked
              </p>
              <p className="mt-2 text-xl font-semibold text-gray-100">
                {summary?.campaigns.totalDelivered ?? 0} /{" "}
                {summary?.campaigns.totalOpened ?? 0} /{" "}
                {summary?.campaigns.totalClicked ?? 0}
              </p>
            </article>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-gray-100">Create Manual Campaign</h2>
        <form onSubmit={handleCreateCampaign} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Subject</label>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Newsletter subject"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">HTML Content</label>
            <textarea
              value={html}
              onChange={(event) => setHtml(event.target.value)}
              rows={10}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm"
              placeholder="<h1>Your update</h1><p>...</p>"
            />
          </div>

          <button
            type="submit"
            disabled={creatingCampaign}
            className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-500 disabled:opacity-60"
          >
            {creatingCampaign ? "Queueing..." : "Queue Campaign"}
          </button>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <article className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-100">Campaign History</h2>
            <button
              onClick={() => {
                void loadSummary();
                void loadCampaigns();
              }}
              disabled={loadingCampaigns}
              className="text-sm rounded-lg border border-gray-700 px-3 py-1 hover:bg-gray-800 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="QUEUED">Queued</option>
              <option value="SENDING">Sending</option>
              <option value="COMPLETED">Completed</option>
              <option value="PARTIAL">Partial</option>
              <option value="FAILED">Failed</option>
            </select>

            <select
              value={triggerFilter}
              onChange={(event) => setTriggerFilter(event.target.value)}
              className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm"
            >
              <option value="">All triggers</option>
              <option value="MANUAL">Manual</option>
              <option value="AUTO_ARTICLE">Auto Article</option>
            </select>
          </div>

          {loadingCampaigns && (
            <p className="text-sm text-gray-500">Loading campaigns...</p>
          )}

          {!loadingCampaigns && campaigns.length === 0 && (
            <p className="text-sm text-gray-500">No campaigns found.</p>
          )}

          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                onClick={() => setSelectedCampaign(campaign)}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  selectedCampaign?.id === campaign.id
                    ? "border-amber-500 bg-amber-950/20"
                    : "border-gray-800 bg-gray-950/40 hover:bg-gray-800/50"
                }`}
              >
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  {campaign.trigger_type} &middot; {campaign.status}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-100">{campaign.subject}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {formatDateTime(campaign.created_at)}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  {campaign.total_recipients} recipients &middot; {campaign.delivered_count} delivered &middot;{" "}
                  {campaign.opened_count} opened &middot; {campaign.clicked_count} clicked &middot;{" "}
                  {campaign.failed_count} failed
                </p>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-100">Delivery Details</h2>
            <p className="mt-1 text-xs text-gray-500">
              {selectedCampaign
                ? `Campaign #${selectedCampaign.id} - ${selectedCampaign.subject}`
                : "Select a campaign to view recipient-level status"}
            </p>
          </div>

          <div className="mb-4 grid grid-cols-[180px_1fr_auto] gap-2">
            <select
              value={deliveryStatusFilter}
              onChange={(event) => setDeliveryStatusFilter(event.target.value)}
              className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm"
              disabled={!selectedCampaign}
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SENT">Sent</option>
              <option value="DELIVERED">Delivered</option>
              <option value="OPENED">Opened</option>
              <option value="CLICKED">Clicked</option>
              <option value="FAILED">Failed</option>
              <option value="BOUNCED">Bounced</option>
              <option value="COMPLAINED">Complained</option>
            </select>

            <input
              value={deliveryQuery}
              onChange={(event) => setDeliveryQuery(event.target.value)}
              placeholder="Filter by email"
              className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm"
              disabled={!selectedCampaign}
            />

            <button
              onClick={() => {
                if (selectedCampaign) {
                  void loadDeliveries(selectedCampaign.id);
                }
              }}
              disabled={!selectedCampaign || loadingDeliveries}
              className="rounded-lg border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800 disabled:opacity-60"
            >
              {loadingDeliveries ? "Loading..." : "Apply"}
            </button>
          </div>

          {!selectedCampaign && (
            <p className="text-sm text-gray-500">No campaign selected.</p>
          )}

          {selectedCampaign && deliveries.length === 0 && !loadingDeliveries && (
            <p className="text-sm text-gray-500">No deliveries found for this filter.</p>
          )}

          <div className="space-y-3 max-h-[560px] overflow-auto pr-1">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="rounded-lg border border-gray-800 bg-gray-950/40 p-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-gray-100">{delivery.email}</p>
                  <span className="text-xs uppercase tracking-wide text-amber-400">
                    {delivery.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Message ID: {delivery.provider_message_id || "N/A"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Sent: {formatDateTime(delivery.sent_at)} &middot; Delivered:{" "}
                  {formatDateTime(delivery.delivered_at)} &middot; Opened:{" "}
                  {formatDateTime(delivery.opened_at)} &middot; Clicked:{" "}
                  {formatDateTime(delivery.clicked_at)}
                </p>
                {(delivery.provider_response_code || delivery.provider_response_message) && (
                  <p className="mt-2 text-xs text-red-300">
                    {delivery.provider_response_code || "error"}:{" "}
                    {delivery.provider_response_message || "No details"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
