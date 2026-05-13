import { Video } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

export type CreateVideoInput = {
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  category: string;
  tags: string[];
  duration: string;
  featured: boolean;
  trending: boolean;
  is_premium: boolean;
};

const VIDEO_BUCKET = "videos";
const THUMBNAIL_BUCKET = "videos";

type VideoRow = {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  category: string;
  tags: string[] | null;
  view_count: number | null;
  duration: string;
  featured: boolean | null;
  trending: boolean | null;
  is_premium: boolean | null;
  created_at: string;
};

function normalizeRow(row: VideoRow): Video {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    thumbnail_url: row.thumbnail_url ?? "",
    video_url: row.video_url ?? "",
    category: row.category,
    tags: row.tags ?? [],
    view_count: row.view_count ?? 0,
    duration: row.duration ?? "00:00",
    featured: Boolean(row.featured),
    trending: Boolean(row.trending),
    is_premium: Boolean(row.is_premium),
    created_at: row.created_at,
  };
}

export async function fetchVideos(): Promise<Video[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("videos")
    .select("id,title,description,thumbnail_url,video_url,category,tags,view_count,duration,featured,trending,is_premium,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch videos from Supabase:", error.message);
    return [];
  }

  return (data as VideoRow[]).map(normalizeRow);
}

export async function createVideo(input: CreateVideoInput): Promise<Video> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const payload = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    thumbnail_url: input.thumbnail_url,
    video_url: input.video_url,
    category: input.category,
    tags: input.tags,
    view_count: 0,
    duration: input.duration,
    featured: input.featured,
    trending: input.trending,
    is_premium: input.is_premium,
  };

  const { data, error } = await supabase
    .from("videos")
    .insert(payload)
    .select("id,title,description,thumbnail_url,video_url,category,tags,view_count,duration,featured,trending,is_premium,created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to create video.");
  }

  return normalizeRow(data as VideoRow);
}

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uploadFileToBucket(file: File, bucket: string): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : undefined;
  const baseName = sanitizeFileName(file.name.replace(/\.[^/.]+$/, "")) || "upload";
  const fileName = `${crypto.randomUUID()}-${baseName}${ext ? `.${ext}` : ""}`;
  const filePath = `${new Date().toISOString().slice(0, 10)}/${fileName}`;

  console.log(`[Upload] Uploading to bucket: ${bucket}, path: ${filePath}`);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: false, contentType: file.type || undefined });

  if (error) {
    console.error(`[Upload Error] Bucket: ${bucket}, Error: ${error.message}`);
    throw new Error(`Failed to upload to "${bucket}" bucket: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  console.log(`[Upload Success] Public URL: ${data.publicUrl}`);
  return data.publicUrl;
}

export async function uploadVideoFile(file: File): Promise<string> {
  return uploadFileToBucket(file, VIDEO_BUCKET);
}

export async function uploadThumbnailFile(file: File): Promise<string> {
  return uploadFileToBucket(file, THUMBNAIL_BUCKET);
}

export async function deleteVideo(videoId: string): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const { error } = await supabase
    .from("videos")
    .delete()
    .eq("id", videoId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteVideos(videoIds: string[]): Promise<void> {
  if (!videoIds.length) return;

  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const { error } = await supabase
    .from("videos")
    .delete()
    .in("id", videoIds);

  if (error) {
    throw new Error(error.message);
  }
}
