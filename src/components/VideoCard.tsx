import { motion } from "framer-motion";
import { Eye, Clock, TrendingUp, Star, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Video, formatViewCount } from "@/lib/mock-data";

interface VideoCardProps {
  video: Video;
  index?: number;
  size?: "default" | "large" | "small";
}

const thumbnailColors = [
  "from-primary/30 via-purple-900/40 to-blue-900/30",
  "from-rose-900/40 via-primary/20 to-orange-900/30",
  "from-blue-900/40 via-cyan-900/30 to-primary/20",
  "from-emerald-900/30 via-teal-900/30 to-primary/20",
  "from-violet-900/40 via-primary/30 to-pink-900/30",
  "from-amber-900/30 via-orange-900/30 to-primary/20",
];

export function VideoCard({ video, index = 0, size = "default" }: VideoCardProps) {
  const colorGradient = thumbnailColors[parseInt(video.id) % thumbnailColors.length];
  const isLarge = size === "large";
  const hasThumbnail = Boolean(video.thumbnail_url?.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/watch/${video.id}`} className="group block">
        <div className={`relative overflow-hidden rounded-xl ${isLarge ? "aspect-[16/9]" : "aspect-video"} bg-card border border-border/30 transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/10 group-hover:scale-[1.02]`}>
          {/* Thumbnail / fallback */}
          {hasThumbnail ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${colorGradient}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-xl shadow-primary/30">
              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>

          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground">
            {video.duration}
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {video.is_premium && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md gradient-primary text-xs font-semibold text-primary-foreground">
                <Crown className="w-3 h-3" /> Premium
              </span>
            )}
            {video.trending && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-trending/90 text-xs font-semibold text-background">
                <TrendingUp className="w-3 h-3" /> Trending
              </span>
            )}
            {video.featured && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md gradient-primary text-xs font-semibold text-primary-foreground">
                <Star className="w-3 h-3" /> Featured
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <h3 className={`font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 ${isLarge ? "text-lg" : "text-sm"}`}>
            {video.title}
          </h3>
          {size !== "small" && (
            <p className="text-xs text-muted-foreground line-clamp-1">{video.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatViewCount(video.view_count)} views
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {video.duration}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
