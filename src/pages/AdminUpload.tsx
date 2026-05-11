import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Upload as UploadIcon, Film, Image, ChevronLeft, Plus, X, Check, Crown, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/mock-data";
import { createVideo, uploadThumbnailFile, uploadVideoFile } from "@/lib/videos-service";
import { toast } from "@/components/ui/use-toast";
import { parseVideoSource } from "@/lib/video-source";

export default function AdminUploadPage() {
  const queryClient = useQueryClient();
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("00:00");
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [isVideoDragActive, setIsVideoDragActive] = useState(false);
  const [isThumbnailDragActive, setIsThumbnailDragActive] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [category, setCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [is_premium, setIsPremium] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const createVideoMutation = useMutation({
    mutationFn: createVideo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["videos"] });
      setUploaded(true);
      setTimeout(() => setUploaded(false), 3000);
      setTitle(""); setDescription(""); setThumbnailUrl(""); setVideoUrl("");
      setDuration("00:00"); setSelectedVideoFile(null); setSelectedThumbnailFile(null);
      setCategory(""); setTags([]); setFeatured(false); setTrending(false); setIsPremium(false);
      toast({ title: "Video published", description: "Your video is now available across the site." });
    },
    onError: (error) => {
      toast({ title: "Upload failed", description: error instanceof Error ? error.message : "Unable to publish video.", variant: "destructive" });
    },
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const formatDuration = (seconds: number): string => {
    const rounded = Math.max(0, Math.round(seconds));
    const hours = Math.floor(rounded / 3600);
    const minutes = Math.floor((rounded % 3600) / 60);
    const secs = rounded % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const extractVideoDuration = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = objectUrl;
      video.onloadedmetadata = () => { resolve(formatDuration(video.duration)); URL.revokeObjectURL(objectUrl); };
      video.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Unable to read video metadata.")); };
    });
  };

  const onVideoFileSelected = async (file: File) => {
    setSelectedVideoFile(file);
    setVideoUrl("");
    try {
      const detectedDuration = await extractVideoDuration(file);
      setDuration(detectedDuration);
      toast({ title: "Video selected", description: `Duration detected: ${detectedDuration}` });
    } catch {
      toast({ title: "Could not detect duration", description: "Enter duration manually if needed.", variant: "destructive" });
    }
  };

  const onThumbnailFileSelected = (file: File) => { setSelectedThumbnailFile(file); setThumbnailUrl(""); };

  const handleVideoInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void onVideoFileSelected(file);
  };

  const handleThumbnailInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onThumbnailFileSelected(file);
  };

  const preventDefaultDrag = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); event.stopPropagation(); };

  const handleVideoDrop = (event: DragEvent<HTMLDivElement>) => {
    preventDefaultDrag(event);
    setIsVideoDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { toast({ title: "Invalid file", description: "Please drop a video file.", variant: "destructive" }); return; }
    void onVideoFileSelected(file);
  };

  const handleThumbnailDrop = (event: DragEvent<HTMLDivElement>) => {
    preventDefaultDrag(event);
    setIsThumbnailDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast({ title: "Invalid file", description: "Please drop an image file.", variant: "destructive" }); return; }
    onThumbnailFileSelected(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category || (!videoUrl.trim() && !selectedVideoFile)) {
      toast({ title: "Missing fields", description: "Title, description, category, and video file or URL are required.", variant: "destructive" });
      return;
    }
    setIsUploadingFiles(true);
    try {
      const parsedSource = parseVideoSource(videoUrl.trim());
      if (!selectedVideoFile && parsedSource.kind === "unknown") {
        toast({ title: "Unsupported video link", description: "Upload a video file or use YouTube, Vimeo, Dailymotion, TikTok, or a direct .mp4/.webm URL.", variant: "destructive" });
        return;
      }
      const resolvedVideoUrl = selectedVideoFile ? await uploadVideoFile(selectedVideoFile) : parsedSource.playableUrl;
      const resolvedThumbnailUrl = selectedThumbnailFile ? await uploadThumbnailFile(selectedThumbnailFile) : thumbnailUrl.trim();
      if (!resolvedVideoUrl) {
        toast({ title: "Missing video source", description: "Upload a video file or paste a valid video link.", variant: "destructive" });
        return;
      }
      await createVideoMutation.mutateAsync({
        title: title.trim(), description: description.trim(), thumbnail_url: resolvedThumbnailUrl,
        video_url: resolvedVideoUrl, category, tags, duration: duration.trim() || "00:00",
        featured, trending, is_premium,
      });
    } catch (error) {
      toast({ title: "Upload failed", description: error instanceof Error ? error.message : "Unable to upload selected files.", variant: "destructive" });
    } finally {
      setIsUploadingFiles(false);
    }
  };

  // ─── Shared input classes ────────────────────────────────────────────────
  const inputCls = "w-full h-11 px-4 rounded-lg bg-background text-foreground placeholder:text-muted-foreground outline-none border border-[rgba(56,139,253,0.2)] focus:border-[rgba(56,139,253,0.45)] focus:bg-[rgba(56,139,253,0.03)] text-sm transition-colors";
  const labelCls = "text-xs font-medium text-muted-foreground uppercase tracking-wider";

  // ─── Flag toggle ─────────────────────────────────────────────────────────
  const FlagToggle = ({
    icon: Icon, label, checked, onChange, isPremium = false,
  }: { icon: React.ElementType; label: string; checked: boolean; onChange: (v: boolean) => void; isPremium?: boolean }) => (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
      isPremium
        ? checked ? "border-[rgba(45,212,140,0.35)] bg-[rgba(45,212,140,0.08)]" : "border-[rgba(45,212,140,0.15)] bg-[rgba(45,212,140,0.04)]"
        : checked ? "border-[rgba(56,139,253,0.35)] bg-[rgba(56,139,253,0.08)]" : "border-[rgba(56,139,253,0.12)] bg-[rgba(56,139,253,0.03)]"
    }`}>
      <div className="flex items-center gap-2.5">
        <Icon className={`w-4 h-4 ${isPremium ? "text-[#2DD48C]" : "text-[#388BFD]"} opacity-75`} />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full border transition-all relative ${
          checked
            ? isPremium ? "bg-[rgba(45,212,140,0.4)] border-[rgba(45,212,140,0.5)]" : "bg-[rgba(56,139,253,0.4)] border-[rgba(56,139,253,0.5)]"
            : "bg-transparent border-[rgba(100,140,200,0.25)]"
        }`}
        aria-pressed={checked}
        aria-label={`Toggle ${label}`}
      >
        <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all ${
          checked
            ? isPremium ? "left-[18px] bg-[#2DD48C]" : "left-[18px] bg-[#388BFD]"
            : "left-0.5 bg-[rgba(100,140,200,0.35)]"
        }`} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b border-[rgba(56,139,253,0.15)] bg-[rgba(14,26,46,0.97)] backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between h-14 px-5">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[rgba(56,139,253,0.22)] bg-[rgba(56,139,253,0.08)] text-[rgba(150,185,255,0.8)] hover:text-[#a8d4ff] transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <h1 className="font-display font-semibold text-[#e8f2ff] text-sm">Upload video</h1>
          </div>
          <Link to="/admin">
            <button className="px-3 py-1.5 rounded-lg border border-[rgba(56,139,253,0.2)] bg-[rgba(56,139,253,0.08)] text-[#6fc3ff] text-xs hover:bg-[rgba(56,139,253,0.14)] transition-colors">
              Back to dashboard
            </button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6"
        >
          {/* ══ LEFT COLUMN ════════════════════════════════════════════════ */}
          <div className="space-y-6">

            {/* Video drop zone */}
            <div>
              <p className={`${labelCls} mb-3`}>Video file</p>
              <div
                className={`border-2 border-dashed rounded-2xl p-7 text-center transition-colors group cursor-pointer ${
                  isVideoDragActive
                    ? "border-[rgba(56,139,253,0.6)] bg-[rgba(56,139,253,0.08)]"
                    : "border-[rgba(56,139,253,0.25)] hover:border-[rgba(56,139,253,0.45)] hover:bg-[rgba(56,139,253,0.04)]"
                }`}
                onDragEnter={(e) => { preventDefaultDrag(e); setIsVideoDragActive(true); }}
                onDragOver={preventDefaultDrag}
                onDragLeave={(e) => { preventDefaultDrag(e); setIsVideoDragActive(false); }}
                onDrop={handleVideoDrop}
              >
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoInputChange} />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(56,139,253,0.12)] flex items-center justify-center group-hover:bg-[rgba(56,139,253,0.18)] transition-colors">
                    <Film className="w-6 h-6 text-[#388BFD]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Drop video here or choose from your folder</p>
                    <p className="text-xs text-muted-foreground mt-1">MP4, WebM, MOV · duration auto-detected</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(56,139,253,0.3)] bg-[rgba(56,139,253,0.08)] text-[#388BFD] text-xs font-medium hover:bg-[rgba(56,139,253,0.14)] transition-colors"
                  >
                    <UploadIcon className="w-3.5 h-3.5" />
                    {selectedVideoFile ? selectedVideoFile.name : "Choose video file"}
                  </button>
                  <input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Or paste a YouTube / Vimeo / direct URL…"
                    className={`${inputCls} max-w-md`}
                  />
                </div>
              </div>
            </div>

            {/* Title + Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-4">
              <div className="space-y-2">
                <label className={labelCls}>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter video title…" className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className={labelCls}>Duration (mm:ss)</label>
                <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Auto from file" className={inputCls} />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className={labelCls}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your video…"
                rows={4}
                className={`${inputCls} h-auto py-3 resize-none`}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className={labelCls}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
                <option value="">Select a category</option>
                {categories.filter((c) => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className={labelCls}>Tags</label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add a tag and press Enter…"
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="w-11 h-11 rounded-lg border border-[rgba(56,139,253,0.28)] bg-[rgba(56,139,253,0.08)] text-[#388BFD] flex items-center justify-center hover:bg-[rgba(56,139,253,0.14)] transition-colors flex-shrink-0"
                  aria-label="Add tag"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(56,139,253,0.1)] border border-[rgba(56,139,253,0.22)] text-[#388BFD] text-xs font-medium"
                    >
                      {tag}
                      <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} aria-label={`Remove ${tag}`}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ══ RIGHT COLUMN ═══════════════════════════════════════════════ */}
          <div className="space-y-5">

            {/* Thumbnail */}
            <div>
              <p className={`${labelCls} mb-3`}>Thumbnail</p>

              {/* Preview area */}
              <div className="w-full aspect-video rounded-xl border border-[rgba(45,212,140,0.18)] bg-[rgba(45,212,140,0.04)] flex flex-col items-center justify-center gap-2 mb-3 overflow-hidden">
                {selectedThumbnailFile ? (
                  <img src={URL.createObjectURL(selectedThumbnailFile)} alt="Thumbnail preview" className="w-full h-full object-cover" />
                ) : thumbnailUrl ? (
                  <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Image className="w-7 h-7 text-[rgba(45,212,140,0.35)]" />
                    <span className="text-xs text-muted-foreground">Preview appears here</span>
                  </>
                )}
              </div>

              <div
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors group cursor-pointer ${
                  isThumbnailDragActive
                    ? "border-[rgba(45,212,140,0.6)] bg-[rgba(45,212,140,0.08)]"
                    : "border-[rgba(45,212,140,0.25)] hover:border-[rgba(45,212,140,0.45)] hover:bg-[rgba(45,212,140,0.04)]"
                }`}
                onDragEnter={(e) => { preventDefaultDrag(e); setIsThumbnailDragActive(true); }}
                onDragOver={preventDefaultDrag}
                onDragLeave={(e) => { preventDefaultDrag(e); setIsThumbnailDragActive(false); }}
                onDrop={handleThumbnailDrop}
              >
                <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailInputChange} />
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[rgba(45,212,140,0.28)] bg-[rgba(45,212,140,0.08)] text-[#0d8c5a] dark:text-[#5ffabe] text-xs font-medium hover:bg-[rgba(45,212,140,0.14)] transition-colors"
                  >
                    <Image className="w-3.5 h-3.5" />
                    {selectedThumbnailFile ? selectedThumbnailFile.name : "Choose thumbnail"}
                  </button>
                  <input
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="Or paste image URL…"
                    className="w-full h-9 px-3 rounded-lg border border-[rgba(45,212,140,0.18)] bg-[rgba(45,212,140,0.04)] text-foreground placeholder:text-muted-foreground outline-none focus:border-[rgba(45,212,140,0.4)] text-xs transition-colors"
                  />
                  <p className="text-[10.5px] text-muted-foreground">16:9 recommended</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[rgba(56,139,253,0.1)]" />

            {/* Flags */}
            <div>
              <p className={`${labelCls} mb-3`}>Visibility flags</p>
              <div className="space-y-2">
                <FlagToggle icon={Star} label="Featured" checked={featured} onChange={setFeatured} />
                <FlagToggle icon={TrendingUp} label="Trending" checked={trending} onChange={setTrending} />
                <FlagToggle icon={Crown} label="Premium content" checked={is_premium} onChange={setIsPremium} isPremium />
              </div>
            </div>

            {/* Submit */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={createVideoMutation.isPending || isUploadingFiles}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#388BFD 0%,#2DD48C 100%)" }}
              >
                {uploaded ? (
                  <><Check className="w-4 h-4" /> Uploaded!</>
                ) : (
                  <><UploadIcon className="w-4 h-4" />{isUploadingFiles ? "Uploading files…" : createVideoMutation.isPending ? "Publishing…" : "Upload video"}</>
                )}
              </button>
              <Link to="/admin">
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl border border-[rgba(56,139,253,0.22)] bg-[rgba(56,139,253,0.06)] text-[#6fc3ff] text-sm hover:bg-[rgba(56,139,253,0.1)] transition-colors"
                >
                  Cancel
                </button>
              </Link>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}