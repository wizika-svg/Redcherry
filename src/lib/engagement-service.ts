import { supabase } from "@/lib/supabase";

export type VideoActions = {
  liked: boolean;
  saved: boolean;
  favorited: boolean;
};

const DEFAULT_ACTIONS: VideoActions = {
  liked: false,
  saved: false,
  favorited: false,
};

function getViewerKey(userId?: string | null): string {
  if (userId) return userId;

  const storageKey = "Eroctichqtv_viewer_key";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;

  const created = crypto.randomUUID();
  window.localStorage.setItem(storageKey, created);
  return created;
}

export async function getUserVideoActions(userId: string, videoId: string): Promise<VideoActions> {
  if (!supabase) return DEFAULT_ACTIONS;

  const { data, error } = await supabase
    .from("user_video_actions")
    .select("liked,saved,favorited")
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .maybeSingle();

  if (error || !data) return DEFAULT_ACTIONS;

  return {
    liked: Boolean(data.liked),
    saved: Boolean(data.saved),
    favorited: Boolean(data.favorited),
  };
}

export async function setUserVideoAction(
  userId: string,
  videoId: string,
  action: keyof VideoActions,
  value: boolean,
): Promise<VideoActions> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const payload = {
    user_id: userId,
    video_id: videoId,
    [action]: value,
  };

  const { data, error } = await supabase
    .from("user_video_actions")
    .upsert(payload, { onConflict: "user_id,video_id" })
    .select("liked,saved,favorited")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to save action.");
  }

  return {
    liked: Boolean(data.liked),
    saved: Boolean(data.saved),
    favorited: Boolean(data.favorited),
  };
}

export async function recordVideoView(videoId: string, userId?: string | null): Promise<boolean> {
  if (!supabase) return false;

  const viewerKey = getViewerKey(userId);
  const viewSlot = Math.floor(Date.now() / (30 * 60 * 1000));

  const { data, error } = await supabase.rpc("record_video_view", {
    p_video_id: videoId,
    p_viewer_key: viewerKey,
    p_view_slot: viewSlot,
  });

  if (error) {
    console.error("Failed to record view:", error.message);
    return false;
  }

  return Boolean(data);
}
