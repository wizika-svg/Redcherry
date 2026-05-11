import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  Film,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { VideoCard } from "@/components/VideoCard";
import {
  categories,
  getVideosByCategory,
  getPopularVideos,
  getTrendingVideos,
  getRecentVideos,
} from "@/lib/mock-data";
import { fetchVideos } from "@/lib/videos-service";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const sortParam = searchParams.get("sort") || "popular";

  const [query, setQuery] = useState(queryParam);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState(sortParam);

  const { data: videos = [] } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

  const filteredVideos = useMemo(() => {
    let vids = getVideosByCategory(videos, category);

    if (query.trim()) {
      const q = query.toLowerCase();
      vids = vids.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q)) ||
          v.category.toLowerCase().includes(q),
      );
    }

    switch (sort) {
      case "popular":
        return getPopularVideos(vids);
      case "trending":
        return getTrendingVideos(vids).length
          ? getTrendingVideos(vids)
          : getPopularVideos(vids);
      case "newest":
        return getRecentVideos(vids);
      default:
        return vids;
    }
  }, [videos, query, category, sort]);

  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "trending", label: "Trending" },
    { value: "newest", label: "Newest" },
  ];

  // ─── Shared Premium Styles ──────────────────────────────────────────────
  const glassInput =
    "w-full h-12 pl-12 pr-4 rounded-xl bg-[rgba(56,139,253,0.03)] text-foreground placeholder:text-muted-foreground outline-none border border-[rgba(56,139,253,0.15)] focus:border-[rgba(56,139,253,0.4)] focus:bg-[rgba(56,139,253,0.06)] transition-all text-sm shadow-inner";
  const labelCls =
    "text-xs font-medium text-muted-foreground uppercase tracking-widest";

  return (
    <Layout>
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="container mx-auto px-5 py-10 space-y-10">
          {/* ── Header Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-white to-[rgba(255,255,255,0.5)] bg-clip-text text-transparent">
                Discover Content
              </h1>
              <p className="text-muted-foreground text-sm max-w-lg">
                Browse through our premium library of curated video experiences.
              </p>
            </div>

            {/* Search input - Premium Glass style */}
            <div className="relative max-w-2xl group">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(56,139,253,0.5)] group-focus-within:text-[#388BFD] transition-colors" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search videos, tags, or creators..."
                className={glassInput}
              />
              <div className="absolute inset-0 rounded-xl bg-[#388BFD] opacity-0 blur-xl group-focus-within:opacity-[0.03] transition-opacity -z-10" />
            </div>

            {/* Categories - Sleek Pills */}
            <div className="space-y-3">
              <p className={labelCls}>Categories</p>
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`shrink-0 px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all border ${
                      category === cat
                        ? "bg-[rgba(56,139,253,0.12)] border-[rgba(56,139,253,0.4)] text-[#388BFD] shadow-[0_0_15px_rgba(56,139,253,0.1)]"
                        : "bg-transparent border-[rgba(255,255,255,0.05)] text-muted-foreground hover:border-[rgba(255,255,255,0.15)] hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort - Minimalist Tabs */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                  Sort by
                </span>
              </div>
              <div className="flex gap-1">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all uppercase tracking-widest ${
                      sort === opt.value
                        ? "text-[#388BFD] bg-[rgba(56,139,253,0.08)]"
                        : "text-muted-foreground/60 hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Results Grid ── */}
          <div className="relative">
            {filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map((video, i) => (
                  <VideoCard key={video.id} video={video} index={i} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-[rgba(56,139,253,0.15)] bg-[rgba(56,139,253,0.02)]"
              >
                <div className="w-20 h-20 rounded-2xl bg-[rgba(56,139,253,0.05)] flex items-center justify-center mb-6 border border-[rgba(56,139,253,0.1)]">
                  <Film className="w-8 h-8 text-[rgba(56,139,253,0.3)]" />
                </div>
                <h3 className="text-xl font-display font-medium text-foreground">
                  No matches found
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs text-center">
                  We couldn't find any videos matching your current search or
                  filters.
                </p>
                <button
                  onClick={() => {
                    setQuery("");
                    setCategory("All");
                  }}
                  className="mt-8 px-6 py-2 rounded-full border border-[rgba(56,139,253,0.3)] bg-[rgba(56,139,253,0.08)] text-[#388BFD] text-xs font-bold hover:bg-[rgba(56,139,253,0.15)] transition-all"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
