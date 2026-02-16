import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest } from "./api";

type LikeResult = { ok: boolean; message?: string };

type LikesContextValue = {
  likedIds: Set<number>;
  likeCounts: Record<number, number>;
  like: (id: number) => Promise<LikeResult>;
  setLikeCount: (id: number, count: number) => void;
};

const LikesContext = createContext<LikesContextValue | undefined>(undefined);

const STORAGE_KEY = "smallwins_liked_ids";

const readStoredIds = () => {
  if (typeof window === "undefined") return new Set<number>();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set<number>();
    const parsed = JSON.parse(raw) as number[];
    return new Set(parsed.filter((value) => Number.isFinite(value)));
  } catch {
    return new Set<number>();
  }
};

export function LikesProvider({ children }: { children: React.ReactNode }) {
  const [likedIds, setLikedIds] = useState<Set<number>>(readStoredIds);
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Array.from(likedIds))
    );
  }, [likedIds]);

  const setLikeCount = useCallback((id: number, count: number) => {
    setLikeCounts((prev) => ({ ...prev, [id]: count }));
  }, []);

  const like = useCallback(
    async (id: number): Promise<LikeResult> => {
      if (!id || Number.isNaN(id)) {
        return { ok: false, message: "Invalid story" };
      }

      if (likedIds.has(id)) {
        return { ok: false, message: "Already liked" };
      }

      try {
        await apiRequest(`/api/interactions/like/${id}`, { method: "POST" });
        setLikedIds((prev) => new Set(prev).add(id));
        setLikeCounts((prev) => ({
          ...prev,
          [id]: (prev[id] || 0) + 1,
        }));
        return { ok: true };
      } catch (err) {
        const message = (err as Error).message || "Could not like this story";
        if (message.toLowerCase().includes("already liked")) {
          setLikedIds((prev) => new Set(prev).add(id));
        }
        return { ok: false, message };
      }
    },
    [likedIds]
  );

  const value = useMemo(
    () => ({ likedIds, likeCounts, like, setLikeCount }),
    [likedIds, likeCounts, like, setLikeCount]
  );

  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
}

export function useLikes() {
  const context = useContext(LikesContext);
  if (!context) {
    throw new Error("useLikes must be used within LikesProvider");
  }
  return context;
}
