import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Upload as UploadIcon, Film, Image, ChevronLeft, Plus, X, Check, Crown } from "lucide-react";
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

      setTitle("");
      setDescription("");
      setThumbnailUrl("");
      setVideoUrl("");
      setDuration("00:00");
      setSelectedVideoFile(null);
      setSelectedThumbnailFile(null);
      setCategory("");
      setTags([]);
      setFeatured(false);
      setTrending(false);
      setIsPremium(false);

      toast({
        title: "Video published",
        description: "Your video is now available across the site.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unable to publish video.",
        variant: "destructive",
      });
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

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const extractVideoDuration = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = objectUrl;

      video.onloadedmetadata = () => {
        const nextDuration = formatDuration(video.duration);
        URL.revokeObjectURL(objectUrl);
        resolve(nextDuration);
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Unable to read video metadata."));
      };
    });
  };

  const onVideoFileSelected = async (file: File) => {
    setSelectedVideoFile(file);
    setVideoUrl("");

    try {
      const detectedDuration = await extractVideoDuration(file);
      setDuration(detectedDuration);
      toast({
        title: "Video selected",
        description: `Duration detected: ${detectedDuration}`,
      });
    } catch {
      toast({
        title: "Could not detect duration",
        description: "Enter duration manually if needed.",
        variant: "destructive",
      });
    }
  };

  const onThumbnailFileSelected = (file: File) => {
    setSelectedThumbnailFile(file);
    setThumbnailUrl("");
  };

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

  const preventDefaultDrag = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleVideoDrop = (event: DragEvent<HTMLDivElement>) => {
    preventDefaultDrag(event);
    setIsVideoDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast({ title: "Invalid file", description: "Please drop a video file.", variant: "destructive" });
      return;
    }
    void onVideoFileSelected(file);
  };

  const handleThumbnailDrop = (event: DragEvent<HTMLDivElement>) => {
    preventDefaultDrag(event);
    setIsThumbnailDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please drop an image file.", variant: "destructive" });
      return;
    }
    onThumbnailFileSelected(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !category || (!videoUrl.trim() && !selectedVideoFile)) {
      toast({
        title: "Missing fields",
        description: "Title, description, category, and video file or URL are required.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingFiles(true);

    try {
      const parsedSource = parseVideoSource(videoUrl.trim());

      if (!selectedVideoFile && parsedSource.kind === "unknown") {
        toast({
          title: "Unsupported video link",
          description: "This link is not supported. Upload a video file or use YouTube, Vimeo, Dailymotion, TikTok, or a direct .mp4/.webm URL.",
          variant: "destructive",
        });
        return;
      }

      const resolvedVideoUrl = selectedVideoFile
        ? await uploadVideoFile(selectedVideoFile)
        : parsedSource.playableUrl;
      const resolvedThumbnailUrl = selectedThumbnailFile ? await uploadThumbnailFile(selectedThumbnailFile) : thumbnailUrl.trim();

      if (!resolvedVideoUrl) {
        toast({
          title: "Missing video source",
          description: "Upload a video file or paste a valid video link.",
          variant: "destructive",
        });
        return;
      }

      await createVideoMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        thumbnail_url: resolvedThumbnailUrl,
        video_url: resolvedVideoUrl,
        category,
        tags,
        duration: duration.trim() || "00:00",
        featured,
        trending,
        is_premium,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unable to upload selected files.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingFiles(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border glass-strong sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display font-semibold text-foreground">Upload Video</h1>
          </div>
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="text-muted-foreground">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto max-w-3xl px-4 py-8">
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Video upload / URL */}
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors group ${isVideoDragActive ? "border-primary/70 bg-primary/5" : "border-border hover:border-primary/40"}`}
            onDragEnter={(event) => {
              preventDefaultDrag(event);
              setIsVideoDragActive(true);
            }}
            onDragOver={preventDefaultDrag}
            onDragLeave={(event) => {
              preventDefaultDrag(event);
              setIsVideoDragActive(false);
            }}
            onDrop={handleVideoDrop}
          >
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoInputChange}
            />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Film className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="w-full max-w-xl space-y-3">
                <p className="text-sm font-medium text-foreground">Drop video here or choose from your folder</p>
                <p className="text-xs text-muted-foreground">MP4, WebM, MOV (duration is detected automatically)</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button variant="glass" type="button" size="sm" onClick={() => videoInputRef.current?.click()}>
                    Choose Video File
                  </Button>
                  {selectedVideoFile && (
                    <span className="text-xs text-primary">{selectedVideoFile.name}</span>
                  )}
                </div>
                <input
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="Or paste video URL (optional)"
                  className="w-full h-11 px-4 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/50 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Thumbnail upload / URL */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors group ${isThumbnailDragActive ? "border-primary/70 bg-primary/5" : "border-border hover:border-primary/40"}`}
            onDragEnter={(event) => {
              preventDefaultDrag(event);
              setIsThumbnailDragActive(true);
            }}
            onDragOver={preventDefaultDrag}
            onDragLeave={(event) => {
              preventDefaultDrag(event);
              setIsThumbnailDragActive(false);
            }}
            onDrop={handleThumbnailDrop}
          >
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailInputChange}
            />
            <div className="flex flex-col items-center gap-3 w-full max-w-xl mx-auto">
              <Image className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="w-full space-y-3">
                <p className="text-sm font-medium text-foreground">Drop thumbnail here or choose an image</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button variant="glass" type="button" size="sm" onClick={() => thumbnailInputRef.current?.click()}>
                    Choose Thumbnail
                  </Button>
                  {selectedThumbnailFile && (
                    <span className="text-xs text-primary">{selectedThumbnailFile.name}</span>
                  )}
                </div>
                <input
                  value={thumbnailUrl}
                  onChange={e => setThumbnailUrl(e.target.value)}
                  placeholder="Or paste thumbnail URL (optional)"
                  className="w-full h-11 px-4 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/50 text-sm"
                />
                <p className="text-xs text-muted-foreground">Use a 16:9 image for best look</p>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Duration (mm:ss)</label>
            <input
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="Auto from file (or edit manually)"
              className="w-full h-11 px-4 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/50 text-sm"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter video title..."
              className="w-full h-11 px-4 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/50 text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your video..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/50 text-sm resize-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full h-11 px-4 rounded-lg bg-secondary text-foreground outline-none border border-border focus:border-primary/50 text-sm appearance-none"
            >
              <option value="">Select a category</option>
              {categories.filter(c => c !== "All").map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tags</label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 h-10 px-3 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/50 text-sm"
              />
              <Button variant="glass" type="button" onClick={addTag} size="icon" className="h-10 w-10">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {tag}
                    <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Flags */}
          <div className="flex gap-6 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="w-4 h-4 rounded border-border accent-primary" />
              <span className="text-sm text-foreground">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={trending} onChange={e => setTrending(e.target.checked)} className="w-4 h-4 rounded border-border accent-primary" />
              <span className="text-sm text-foreground">Trending</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={is_premium} onChange={e => setIsPremium(e.target.checked)} className="w-4 h-4 rounded border-border accent-primary" />
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">Premium Content</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button variant="premium" className="gap-2 flex-1" type="submit" disabled={createVideoMutation.isPending || isUploadingFiles}>
              {uploaded ? (
                <><Check className="w-4 h-4" /> Uploaded!</>
              ) : (
                <><UploadIcon className="w-4 h-4" /> {isUploadingFiles ? "Uploading files..." : createVideoMutation.isPending ? "Publishing..." : "Upload Video"}</>
              )}
            </Button>
            <Link to="/admin">
              <Button variant="glass" type="button">Cancel</Button>
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
