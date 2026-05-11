import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, Clock, Calendar, Heart, Bookmark, Share2, ThumbsUp, ChevronLeft, Tag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { VideoCard } from "@/components/VideoCard";
import { WatchNextOverlay } from "@/components/WatchNextOverlay";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Video, formatViewCount, getRelatedVideos, getPopularVideos } from "@/lib/mock-data";
import { fetchVideos } from "@/lib/videos-service";
import { useAuth } from "@/hooks/use-auth";
import { getUserVideoActions, recordVideoView, setUserVideoAction, VideoActions } from "@/lib/engagement-service";
import { toast } from "@/components/ui/use-toast";

export default function WatchPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const trackedViewKeyRef = useRef<string | null>(null);
  const { user } = useAuth();
  const { id } = useParams();
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

  const video = videos.find(v => v.id === id);
  const [showWatchNext, setShowWatchNext] = useState(false);

  const actionQueryKey = ["video-actions", user?.id, video?.id];

  const { data: actions = { liked: false, saved: false, favorited: false } } = useQuery({
    queryKey: actionQueryKey,
    queryFn: () => getUserVideoActions(user!.id, video!.id),
    enabled: Boolean(user?.id && video?.id),
  });

  const actionMutation = useMutation({
    mutationFn: ({ action, value }: { action: keyof VideoActions; value: boolean }) =>
      setUserVideoAction(user!.id, video!.id, action, value),
    onSuccess: (nextActions) => {
      queryClient.setQueryData(actionQueryKey, nextActions);
    },
    onError: (error) => {
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "Unable to save this action.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!video?.id) return;
    const viewSlot = Math.floor(Date.now() / (30 * 60 * 1000));
    const trackingKey = `${video.id}:${user?.id ?? "anon"}:${viewSlot}`;
    if (trackedViewKeyRef.current === trackingKey) return;
    trackedViewKeyRef.current = trackingKey;
    void recordVideoView(video.id, user?.id).then((didIncrement) => {
      if (didIncrement) void queryClient.invalidateQueries({ queryKey: ["videos"] });
    });
  }, [video?.id, user?.id, queryClient]);

  const toggleAction = (action: keyof VideoActions, label: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: `Please sign in to ${label.toLowerCase()} videos.` });
      navigate("/login", { state: { from: `/watch/${video?.id ?? ""}` } });
      return;
    }
    actionMutation.mutate({ action, value: !actions[action] });
  };

  const handleShare = async () => {
    if (!video) return;
    const shareUrl = `${window.location.origin}/watch/${video.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: video.title, text: video.description, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied", description: "Video link copied to clipboard." });
      }
    } catch {
      toast({ title: "Share cancelled", description: "No link was shared." });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[rgba(56,139,253,0.3)] border-t-[#388BFD] animate-spin" />
          <p className="text-sm text-muted-foreground">Loading video…</p>
        </div>
      </Layout>
    );
  }

  if (!video) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(56,139,253,0.1)] border border-[rgba(56,139,253,0.2)] flex items-center justify-center">
            <Eye className="w-7 h-7 text-[#388BFD] opacity-50" />
          </div>
          <p className="text-lg text-muted-foreground">Video not found</p>
          <Link to="/">
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#388BFD 0%,#2DD48C 100%)" }}
            >
              Go Home
            </button>
          </Link>
        </div>
      </Layout>
    );
  }

  const related = getRelatedVideos(video, videos);
  const popular = getPopularVideos(videos).filter(v => v.id !== video.id).slice(0, 4);

  // ── Shared action button style
  const actionBtnBase = "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer";
  const actionBtnIdle = `${actionBtnBase} border-[rgba(56,139,253,0.22)] bg-[rgba(56,139,253,0.07)] text-[rgba(150,185,255,0.85)] hover:bg-[rgba(56,139,253,0.13)] hover:text-[#a8d4ff]`;
  const actionBtnActive = `${actionBtnBase} border-[rgba(56,139,253,0.4)] bg-[rgba(56,139,253,0.18)] text-[#a8e8ff]`;

  return (
    <Layout>
      {/* ── Page bg accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 opacity-60" style={{ background: "linear-gradient(90deg,#388BFD,#2DD48C)" }} />

      <div className="container mx-auto px-4 py-6">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(56,139,253,0.2)] bg-[rgba(56,139,253,0.07)] text-[rgba(150,185,255,0.75)] hover:text-[#a8d4ff] text-sm transition-colors mb-5"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-7">

          {/* ══ MAIN COLUMN ═══════════════════════════════════════════════ */}
          <div className="space-y-5">

            {/* Player */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative aspect-video rounded-2xl overflow-hidden bg-[#040d1a] border border-[rgba(56,139,253,0.22)]"
              style={{ boxShadow: "0 0 40px rgba(56,139,253,0.12), 0 0 80px rgba(45,212,140,0.06)" }}
            >
              <VideoPlayer
                videoUrl={video.video_url}
                thumbnailUrl={video.thumbnail_url}
                title={video.title}
                onEnded={() => setShowWatchNext(true)}
              />
              <WatchNextOverlay videos={related} show={showWatchNext} onDismiss={() => setShowWatchNext(false)} />
              {/* Gradient progress accent */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-70" style={{ background: "linear-gradient(90deg,#388BFD,#2DD48C)" }} />
            </motion.div>

            {/* Title + meta */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
              <h1 className="text-xl md:text-2xl font-display font-bold text-foreground leading-snug">{video.title}</h1>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-[#388BFD] font-medium">
                  <Eye className="w-4 h-4" /> {formatViewCount(video.view_count)} views
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" /> {video.duration}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(video.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[rgba(56,139,253,0.1)] border border-[rgba(56,139,253,0.22)] text-[#388BFD] text-xs font-medium">
                  {video.category}
                </span>
              </div>

              {/* Action bar */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleAction("liked", "Like")}
                  disabled={actionMutation.isPending}
                  className={actions.liked ? actionBtnActive : actionBtnIdle}
                >
                  <ThumbsUp className="w-4 h-4" /> {actions.liked ? "Liked" : "Like"}
                </button>
                <button
                  onClick={() => toggleAction("saved", "Save")}
                  disabled={actionMutation.isPending}
                  className={actions.saved ? actionBtnActive : actionBtnIdle}
                >
                  <Bookmark className="w-4 h-4" /> {actions.saved ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => toggleAction("favorited", "Favorite")}
                  disabled={actionMutation.isPending}
                  className={actions.favorited ? actionBtnActive : actionBtnIdle}
                >
                  <Heart className="w-4 h-4" /> {actions.favorited ? "Favourited" : "Favourite"}
                </button>
                <button onClick={handleShare} className={actionBtnIdle}>
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl border border-[rgba(56,139,253,0.14)] bg-[rgba(56,139,253,0.04)] space-y-3">
                <p className="text-sm text-foreground/85 leading-relaxed">{video.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {video.tags.map(tag => (
                    <Link
                      key={tag}
                      to={`/search?q=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[rgba(56,139,253,0.16)] bg-[rgba(56,139,253,0.06)] text-xs text-muted-foreground hover:text-[#388BFD] hover:border-[rgba(56,139,253,0.3)] hover:bg-[rgba(56,139,253,0.1)] transition-colors"
                    >
                      <Tag className="w-3 h-3" /> {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Up Next — mobile */}
            <div className="xl:hidden space-y-3">
              <h3 className="text-xs font-medium text-[rgba(100,160,255,0.6)] uppercase tracking-wider">Up next</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {related.slice(0, 6).map((v, i) => (
                  <VideoCard key={v.id} video={v} index={i} size="small" />
                ))}
              </div>
            </div>

            {/* Recommended */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-medium text-[rgba(100,160,255,0.6)] uppercase tracking-wider">Recommended</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {popular.map((v, i) => (
                  <VideoCard key={v.id} video={v} index={i} />
                ))}
              </div>
            </div>
          </div>

          {/* ══ SIDEBAR ═══════════════════════════════════════════════════ */}
          <aside className="hidden xl:block">
            <div className="sticky top-20 space-y-5">

              {/* Up Next */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-medium text-[rgba(100,160,255,0.55)] uppercase tracking-widest">Up next</h3>
                <div className="space-y-1">
                  {related.slice(0, 6).map((v, i) => (
                    <SidebarVideoCard key={v.id} video={v} index={i} />
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[rgba(56,139,253,0.1)]" />

              {/* Most Popular */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-[10px] font-medium text-[rgba(100,160,255,0.55)] uppercase tracking-widest">Most popular</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(45,212,140,0.08)] border border-[rgba(45,212,140,0.18)]">
                    <TrendingUp className="w-2.5 h-2.5 text-[#2DD48C]" />
                    <span className="text-[9px] font-medium text-[#2DD48C]">Top picks</span>
                  </span>
                </div>
                <div className="space-y-1">
                  {popular.slice(0, 3).map((v, i) => (
                    <SidebarVideoCard key={v.id} video={v} index={i} isPopular />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}

// ─── Sidebar Video Card ───────────────────────────────────────────────────────
function SidebarVideoCard({ video, index, isPopular = false }: { video: Video; index: number; isPopular?: boolean }) {
  const hasThumbnail = Boolean(video.thumbnail_url?.trim());

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/watch/${video.id}`}
        className="group flex gap-3 p-2 rounded-xl border border-transparent hover:border-[rgba(56,139,253,0.2)] hover:bg-[rgba(56,139,253,0.05)] transition-all"
      >
        {/* Thumbnail */}
        <div className={`w-[88px] shrink-0 aspect-video rounded-lg overflow-hidden border transition-colors ${
          isPopular
            ? "border-[rgba(45,212,140,0.15)] group-hover:border-[rgba(45,212,140,0.3)]"
            : "border-[rgba(56,139,253,0.12)] group-hover:border-[rgba(56,139,253,0.28)]"
        }`}>
          {hasThumbnail ? (
            <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: isPopular
                  ? "linear-gradient(135deg,rgba(45,212,140,0.2) 0%,rgba(56,139,253,0.12) 100%)"
                  : "linear-gradient(135deg,rgba(56,139,253,0.2) 0%,rgba(127,119,221,0.15) 100%)",
              }}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1 pt-0.5">
          <h4 className={`text-xs font-medium line-clamp-2 leading-snug transition-colors ${
            isPopular
              ? "text-foreground group-hover:text-[#2DD48C]"
              : "text-foreground group-hover:text-[#388BFD]"
          }`}>
            {video.title}
          </h4>
          <p className="text-[10.5px] text-muted-foreground">{formatViewCount(video.view_count)} views</p>
          <p className="text-[10.5px] text-muted-foreground">{video.duration}</p>
        </div>
      </Link>
    </motion.div>
  );
}