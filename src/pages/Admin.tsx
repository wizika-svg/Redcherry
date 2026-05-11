import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Upload,
  Film,
  Tags,
  Settings,
  BarChart3,
  TrendingUp,
  Eye,
  Clock,
  Plus,
  Trash2,
  Star,
  ChevronLeft,
  Menu,
  X,
  Crown,
  Check,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatViewCount } from "@/lib/mock-data";
import { deleteVideo, deleteVideos, fetchVideos } from "@/lib/videos-service";
import { toast } from "@/components/ui/use-toast";
import {
  fetchPendingPremiumRequests,
  approvePremiumRequest,
  rejectPremiumRequest,
  PremiumUpgradeRequest,
} from "@/lib/premium-service";

const adminNav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: Film, label: "Videos", path: "/admin/videos" },
  { icon: Upload, label: "Upload", path: "/admin/upload" },
  { icon: Tags, label: "Categories", path: "/admin/categories" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: Crown, label: "Premium Requests", path: "/admin/premium" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

// ─── Glass palette tokens ───────────────────────────────────────────────────
const glassBlue = {
  bg: "bg-[rgba(56,139,253,0.08)]",
  border: "border-[rgba(56,139,253,0.22)]",
  activeBg: "bg-[rgba(56,139,253,0.18)]",
  activeText: "text-[#6fc3ff]",
  activeBorder: "border-[rgba(56,139,253,0.32)]",
  badge:
    "bg-[rgba(56,139,253,0.12)] text-[#388BFD] border-[rgba(56,139,253,0.25)]",
};
const glassGreen = {
  bg: "bg-[rgba(45,212,140,0.08)]",
  border: "border-[rgba(45,212,140,0.22)]",
  activeBg: "bg-[rgba(45,212,140,0.16)]",
  activeText: "text-[#5ffabe]",
  activeBorder: "border-[rgba(45,212,140,0.30)]",
  badge:
    "bg-[rgba(45,212,140,0.12)] text-[#0d8c5a] border-[rgba(45,212,140,0.25)]",
};
// ────────────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const currentPath = location.pathname;

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

  const { data: premiumRequests = [], isLoading: isLoadingPremium } = useQuery({
    queryKey: ["premium-requests"],
    queryFn: fetchPendingPremiumRequests,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVideo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast({
        title: "Video deleted",
        description: "The video has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to delete this video.",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: deleteVideos,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["videos"] });
      setSelectedIds([]);
      toast({
        title: "Videos deleted",
        description: "Selected videos have been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Bulk delete failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to delete selected videos.",
        variant: "destructive",
      });
    },
  });

  const approvePremiumMutation = useMutation({
    mutationFn: approvePremiumRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["premium-requests"] });
      toast({
        title: "User approved",
        description: "Premium access has been granted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Approval failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to approve this request.",
        variant: "destructive",
      });
    },
  });

  const rejectPremiumMutation = useMutation({
    mutationFn: rejectPremiumRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["premium-requests"] });
      toast({
        title: "Request rejected",
        description: "The premium request has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Rejection failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to reject this request.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => videos.some((video) => video.id === id)),
    );
  }, [videos]);

  const videosByCategory = useMemo(() => {
    return videos.reduce<Record<string, typeof videos>>((acc, video) => {
      const key = video.category || "Uncategorized";
      if (!acc[key]) acc[key] = [];
      acc[key].push(video);
      return acc;
    }, {});
  }, [videos]);

  const sortedCategories = useMemo(
    () =>
      Object.entries(videosByCategory).sort(
        (a, b) => b[1].length - a[1].length,
      ),
    [videosByCategory],
  );

  const rankedVideos = useMemo(
    () => [...videos].sort((a, b) => b.view_count - a.view_count),
    [videos],
  );

  const pageTitle =
    currentPath === "/admin/categories"
      ? "Categories"
      : currentPath === "/admin/analytics"
        ? "Analytics"
        : currentPath === "/admin/videos"
          ? "Videos"
          : currentPath === "/admin/premium"
            ? "Premium Requests"
            : currentPath === "/admin/users"
              ? "Users"
              : currentPath === "/admin/settings"
                ? "Settings"
                : "Dashboard";

  const pageDescription =
    currentPath === "/admin/categories"
      ? "Browse videos grouped by category"
      : currentPath === "/admin/analytics"
        ? "View ranking from highest views to lowest"
        : currentPath === "/admin/videos"
          ? "Manage your uploaded videos"
          : currentPath === "/admin/premium"
            ? "Review and approve premium upgrade requests"
            : currentPath === "/admin/users"
              ? "Overview of all users and premium subscriptions"
              : currentPath === "/admin/settings"
                ? "Account and panel settings"
                : "Manage your content and analytics";

  const handleDelete = (videoId: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteMutation.mutate(videoId);
  };

  const toggleSelectVideo = (videoId: string) => {
    setSelectedIds((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId],
    );
  };

  const toggleSelectAll = () => {
    if (!videos.length) return;
    setSelectedIds((prev) =>
      prev.length === videos.length ? [] : videos.map((v) => v.id),
    );
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;
    if (
      !window.confirm(
        `Delete ${selectedIds.length} selected video(s)? This cannot be undone.`,
      )
    )
      return;
    bulkDeleteMutation.mutate(selectedIds);
  };

  const totalViews = videos.reduce((sum, v) => sum + v.view_count, 0);
  const trendingCount = videos.filter((v) => v.trending).length;
  const featuredCount = videos.filter((v) => v.featured).length;

  const stats = [
    {
      icon: Film,
      label: "Total Videos",
      value: videos.length.toString(),
      colorClass: "text-[#388BFD]",
      cardBg: "bg-[rgba(56,139,253,0.07)]",
      cardBorder: "border-[rgba(56,139,253,0.2)]",
    },
    {
      icon: Eye,
      label: "Total Views",
      value: formatViewCount(totalViews),
      colorClass: "text-[#2DD48C]",
      cardBg: "bg-[rgba(45,212,140,0.07)]",
      cardBorder: "border-[rgba(45,212,140,0.2)]",
    },
    {
      icon: TrendingUp,
      label: "Trending",
      value: trendingCount.toString(),
      colorClass: "text-[#EF9F27]",
      cardBg: "bg-[rgba(239,159,39,0.07)]",
      cardBorder: "border-[rgba(239,159,39,0.2)]",
    },
    {
      icon: Star,
      label: "Featured",
      value: featuredCount.toString(),
      colorClass: "text-[#7F77DD]",
      cardBg: "bg-[rgba(127,119,221,0.07)]",
      cardBorder: "border-[rgba(127,119,221,0.2)]",
    },
  ];

  // Shared nav link renderer
  const NavLink = ({ item }: { item: (typeof adminNav)[0] }) => {
    const isPremium = item.path === "/admin/premium";
    const isActive = currentPath === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setMobileNav(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
          isActive && isPremium
            ? `${glassGreen.activeBg} ${glassGreen.activeText} ${glassGreen.activeBorder}`
            : isActive
              ? `${glassBlue.activeBg} ${glassBlue.activeText} ${glassBlue.activeBorder}`
              : "border-transparent text-[rgba(200,220,255,0.75)] hover:text-[#b8d8ff] hover:bg-[rgba(56,139,253,0.1)]"
        }`}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        {item.label}
        {isPremium && (
          <span
            className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${glassGreen.activeBg} ${glassGreen.activeText}`}
          >
            New
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Sidebar desktop ── */}
      <aside className="hidden lg:flex w-60 flex-col flex-shrink-0 border-r border-[rgba(56,139,253,0.15)] bg-[rgba(14,26,46,0.97)]">
        {/* Logo */}
        <div className="p-5 border-b border-[rgba(56,139,253,0.14)]">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#388BFD 0%,#2DD48C 100%)",
              }}
            >
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div>
              <span className="font-display font-bold text-[15px] text-[#e8f2ff]">
                Vault<span className="text-[#2DD48C]">TV</span>
              </span>
              <p className="text-[10px] tracking-widest text-[rgba(150,185,255,0.45)] uppercase">
                Admin Panel
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {adminNav.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[rgba(56,139,253,0.1)]">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-[rgba(150,185,255,0.55)] hover:text-[#a8d4ff]"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Site
            </Button>
          </Link>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-[rgba(56,139,253,0.18)] bg-[rgba(14,26,46,0.95)] backdrop-blur-md flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-[rgba(200,220,255,0.8)]"
            onClick={() => setMobileNav(!mobileNav)}
          >
            {mobileNav ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
          <span className="font-display font-bold text-[rgba(220,235,255,0.9)]">
            Admin
          </span>
        </div>
        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            className="text-[rgba(200,220,255,0.7)]"
          >
            Site
          </Button>
        </Link>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileNav && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileNav(false)}
        >
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            className="w-60 h-full bg-[rgba(14,26,46,0.98)] border-r border-[rgba(56,139,253,0.16)] p-3 space-y-0.5 pt-16"
            onClick={(e) => e.stopPropagation()}
          >
            {adminNav.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </motion.div>
        </div>
      )}

      {/* ── Main ── */}
      <main className="flex-1 pt-14 lg:pt-0 overflow-auto">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                {pageTitle}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {pageDescription}
              </p>
            </div>
            <Link to="/admin/upload">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg,#388BFD 0%,#2DD48C 100%)",
                }}
              >
                <Plus className="w-4 h-4" /> Upload Video
              </button>
            </Link>
          </motion.div>

          {isLoading ? (
            <div
              className={`p-6 rounded-xl ${glassBlue.bg} border ${glassBlue.border} text-sm text-muted-foreground`}
            >
              Loading videos…
            </div>
          ) : currentPath === "/admin/premium" ? (
            <PremiumRequestsTable
              requests={premiumRequests}
              isLoading={isLoadingPremium}
              onApprove={(id) => approvePremiumMutation.mutate(id)}
              onReject={(id) => rejectPremiumMutation.mutate(id)}
              isProcessing={
                approvePremiumMutation.isPending ||
                rejectPremiumMutation.isPending
              }
            />
          ) : currentPath === "/admin/categories" ? (
            <div className="space-y-5">
              {sortedCategories.length === 0 ? (
                <div
                  className={`p-6 rounded-xl ${glassBlue.bg} border ${glassBlue.border} text-sm text-muted-foreground`}
                >
                  No videos yet.
                </div>
              ) : (
                sortedCategories.map(([categoryName, categoryVideos]) => (
                  <div
                    key={categoryName}
                    className={`rounded-xl border ${glassBlue.border} overflow-hidden bg-card`}
                  >
                    <div
                      className={`px-4 py-3 border-b ${glassBlue.border} ${glassBlue.bg} flex items-center justify-between`}
                    >
                      <h3 className="font-display font-semibold text-foreground">
                        {categoryName}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {categoryVideos.length} video(s)
                      </span>
                    </div>
                    <div className="divide-y divide-border/60">
                      {categoryVideos.map((video) => (
                        <div
                          key={video.id}
                          className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-[rgba(56,139,253,0.04)] transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {video.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatViewCount(video.view_count)} views ·{" "}
                              {video.duration}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            disabled={
                              deleteMutation.isPending ||
                              bulkDeleteMutation.isPending
                            }
                            onClick={() => handleDelete(video.id, video.title)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : currentPath === "/admin/analytics" ? (
            <div
              className={`rounded-xl border ${glassBlue.border} overflow-hidden bg-card`}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`${glassBlue.bg}`}>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                        Rank
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                        Video
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                        Category
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                        Views
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                        Uploaded
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(56,139,253,0.08)]">
                    {rankedVideos.map((video, index) => (
                      <tr
                        key={video.id}
                        className="hover:bg-[rgba(56,139,253,0.04)] transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-display font-bold text-[#388BFD]">
                          #{index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {video.title}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">
                          {video.category}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {formatViewCount(video.view_count)}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                          {new Date(video.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : currentPath === "/admin/settings" ? (
            <div
              className={`p-6 rounded-xl ${glassBlue.bg} border ${glassBlue.border} text-sm text-muted-foreground`}
            >
              Settings are coming soon.
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`p-5 rounded-xl border ${stat.cardBorder} ${stat.cardBg} hover:border-opacity-60 transition-all`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.colorClass} mb-3`} />
                    <p className="text-2xl font-display font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              <VideosTable
                videos={videos}
                isDeleting={
                  deleteMutation.isPending || bulkDeleteMutation.isPending
                }
                onDelete={handleDelete}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelectVideo}
                onToggleSelectAll={toggleSelectAll}
                onBulkDelete={handleBulkDelete}
              />

              {/* Bottom cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div
                  className={`p-5 rounded-xl border ${glassBlue.border} ${glassBlue.bg} space-y-4`}
                >
                  <h3 className="text-xs font-semibold text-[#388BFD] uppercase tracking-wider">
                    Most Viewed
                  </h3>
                  {rankedVideos.slice(0, 5).map((v, i) => (
                    <div key={v.id} className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm font-display font-bold text-[#388BFD] opacity-70">
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {v.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatViewCount(v.view_count)} views
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className={`p-5 rounded-xl border ${glassGreen.border} ${glassGreen.bg} space-y-4`}
                >
                  <h3 className="text-xs font-semibold text-[#2DD48C] uppercase tracking-wider">
                    Recent Uploads
                  </h3>
                  {[...videos]
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime(),
                    )
                    .slice(0, 5)
                    .map((v) => (
                      <div key={v.id} className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-[#2DD48C] opacity-60 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {v.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(v.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Videos Table ────────────────────────────────────────────────────────────
function VideosTable({
  videos,
  onDelete,
  isDeleting,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onBulkDelete,
}: {
  videos: Awaited<ReturnType<typeof fetchVideos>>;
  onDelete: (videoId: string, title: string) => void;
  isDeleting: boolean;
  selectedIds: string[];
  onToggleSelect: (videoId: string) => void;
  onToggleSelectAll: () => void;
  onBulkDelete: () => void;
}) {
  const allSelected = videos.length > 0 && selectedIds.length === videos.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold text-foreground">
          All Videos
        </h2>
        <button
          disabled={!selectedIds.length || isDeleting}
          onClick={onBulkDelete}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-destructive/30 text-destructive/80 bg-destructive/5 hover:bg-destructive/10 disabled:opacity-40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Selected (
          {selectedIds.length})
        </button>
      </div>

      <div className="rounded-xl border border-[rgba(56,139,253,0.18)] overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[rgba(56,139,253,0.07)] border-b border-[rgba(56,139,253,0.14)]">
                <th className="text-left px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    className="w-4 h-4 rounded accent-[#388BFD]"
                    aria-label="Select all videos"
                  />
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Video
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                  Category
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Views
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(56,139,253,0.07)]">
              {videos.map((video) => (
                <tr
                  key={video.id}
                  className="hover:bg-[rgba(56,139,253,0.04)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(video.id)}
                      onChange={() => onToggleSelect(video.id)}
                      className="w-4 h-4 rounded accent-[#388BFD]"
                      aria-label={`Select ${video.title}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 h-9 rounded-md shrink-0 overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(135deg,rgba(56,139,253,0.2) 0%,rgba(45,212,140,0.15) 100%)",
                        }}
                      >
                        {video.thumbnail_url && (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                          {video.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {video.duration}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {video.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">
                      {formatViewCount(video.view_count)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex gap-1.5 flex-wrap">
                      {video.trending && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[rgba(239,159,39,0.12)] text-[#9a6010] border border-[rgba(239,159,39,0.25)]">
                          Trending
                        </span>
                      )}
                      {video.featured && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[rgba(56,139,253,0.12)] text-[#388BFD] border border-[rgba(56,139,253,0.25)]">
                          Featured
                        </span>
                      )}
                      {!video.trending && !video.featured && (
                        <span className="text-xs text-muted-foreground">
                          Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      disabled={isDeleting}
                      onClick={() => onDelete(video.id, video.title)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Premium Requests Table ──────────────────────────────────────────────────
function PremiumRequestsTable({
  requests,
  isLoading,
  isProcessing,
  onApprove,
  onReject,
}: {
  requests: PremiumUpgradeRequest[];
  isLoading: boolean;
  isProcessing: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-xl bg-[rgba(56,139,253,0.07)] border border-[rgba(56,139,253,0.2)] text-sm text-muted-foreground">
        Loading premium requests…
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-[rgba(45,212,140,0.06)] border border-[rgba(45,212,140,0.2)] text-sm text-muted-foreground text-center">
        No pending premium upgrade requests.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-display font-semibold text-foreground">
        Pending Requests ({requests.length})
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((request) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border border-[rgba(45,212,140,0.22)] bg-[rgba(45,212,140,0.05)] hover:border-[rgba(45,212,140,0.35)] transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground">
                    {request.email}
                  </p>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[rgba(45,212,140,0.12)] text-[#0d8c5a] border border-[rgba(45,212,140,0.25)]">
                    {request.premium_plan}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Applied on {new Date(request.created_at).toLocaleDateString()}
                </p>
                {request.payment_receipt_url && (
                  <a
                    href={request.payment_receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#388BFD] hover:underline inline-block"
                  >
                    View Payment Receipt →
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReject(request.id)}
                  disabled={isProcessing}
                  className="text-destructive hover:text-destructive border border-destructive/20 hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Reject
                </Button>
                <button
                  onClick={() => onApprove(request.id)}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(135deg,#388BFD 0%,#2DD48C 100%)",
                  }}
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
