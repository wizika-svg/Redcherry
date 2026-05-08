export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  category: string;
  tags: string[];
  view_count: number;
  duration: string;
  featured: boolean;
  trending: boolean;
  is_premium: boolean;
  created_at: string;
}

export const categories = [
  "All", "Action", "Drama", "Comedy", "Thriller", "Sci-Fi", "Romance", "Documentary", "Horror", "Animation"
];

export const mockVideos: Video[] = [
  {
    id: "1", title: "Neon Horizons", description: "A breathtaking journey through futuristic cityscapes and neon-lit streets.", thumbnail_url: "", video_url: "",
    category: "Sci-Fi", tags: ["cinematic", "futuristic", "neon"], view_count: 245832, duration: "12:34", featured: true, trending: true, created_at: "2026-03-20"
  },
  {
    id: "2", title: "Midnight Echoes", description: "Dark atmospheric thriller set in rain-soaked alleys.", thumbnail_url: "", video_url: "",
    category: "Thriller", tags: ["dark", "atmospheric", "noir"], view_count: 189421, duration: "8:17", featured: false, trending: true, created_at: "2026-03-22"
  },
  {
    id: "3", title: "Golden Hour", description: "Stunning sunset cinematography across world landmarks.", thumbnail_url: "", video_url: "",
    category: "Documentary", tags: ["nature", "cinematic", "travel"], view_count: 312045, duration: "15:42", featured: true, trending: false, created_at: "2026-03-18"
  },
  {
    id: "4", title: "Velocity", description: "High-octane racing through impossible terrains.", thumbnail_url: "", video_url: "",
    category: "Action", tags: ["action", "racing", "adrenaline"], view_count: 421300, duration: "10:08", featured: false, trending: true, created_at: "2026-03-24"
  },
  {
    id: "5", title: "Whisper of Stars", description: "A poetic exploration of deep space and human connection.", thumbnail_url: "", video_url: "",
    category: "Sci-Fi", tags: ["space", "emotional", "cinematic"], view_count: 156780, duration: "18:55", featured: true, trending: false, created_at: "2026-03-15"
  },
  {
    id: "6", title: "Urban Legends", description: "Exploring the most mysterious urban myths across cultures.", thumbnail_url: "", video_url: "",
    category: "Documentary", tags: ["mystery", "urban", "culture"], view_count: 98230, duration: "22:10", featured: false, trending: false, created_at: "2026-03-21"
  },
  {
    id: "7", title: "Crimson Tide", description: "An intense drama of survival on the open seas.", thumbnail_url: "", video_url: "",
    category: "Drama", tags: ["ocean", "survival", "drama"], view_count: 276540, duration: "14:33", featured: false, trending: true, created_at: "2026-03-23"
  },
  {
    id: "8", title: "Laugh Factory", description: "Non-stop comedy sketches from rising stars.", thumbnail_url: "", video_url: "",
    category: "Comedy", tags: ["comedy", "sketches", "funny"], view_count: 534120, duration: "25:00", featured: true, trending: true, created_at: "2026-03-25"
  },
  {
    id: "9", title: "Shadow Protocol", description: "Elite operatives navigate a web of international conspiracy.", thumbnail_url: "", video_url: "",
    category: "Action", tags: ["spy", "action", "conspiracy"], view_count: 187650, duration: "16:45", featured: false, trending: false, created_at: "2026-03-19"
  },
  {
    id: "10", title: "Eternal Garden", description: "A romantic tale woven through seasons of change.", thumbnail_url: "", video_url: "",
    category: "Romance", tags: ["romance", "seasons", "emotional"], view_count: 143290, duration: "11:20", featured: false, trending: false, created_at: "2026-03-17"
  },
  {
    id: "11", title: "Digital Revolt", description: "When AI gains consciousness, humanity faces its greatest test.", thumbnail_url: "", video_url: "",
    category: "Sci-Fi", tags: ["AI", "dystopia", "technology"], view_count: 398100, duration: "19:30", featured: true, trending: true, created_at: "2026-03-24"
  },
  {
    id: "12", title: "The Last Frontier", description: "Documentary about the uncharted depths of Earth's oceans.", thumbnail_url: "", video_url: "",
    category: "Documentary", tags: ["ocean", "exploration", "nature"], view_count: 267890, duration: "28:15", featured: false, trending: false, created_at: "2026-03-16"
  },
];

export function formatViewCount(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
  if (count >= 1000) return (count / 1000).toFixed(1) + "K";
  return count.toString();
}

export function getPopularVideos(videos: Video[]): Video[] {
  return [...videos].sort((a, b) => b.view_count - a.view_count);
}

export function getTrendingVideos(videos: Video[]): Video[] {
  return videos.filter(v => v.trending);
}

export function getFeaturedVideos(videos: Video[]): Video[] {
  return videos.filter(v => v.featured);
}

export function getRecentVideos(videos: Video[]): Video[] {
  return [...videos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getRelatedVideos(video: Video, allVideos: Video[]): Video[] {
  return allVideos
    .filter(v => v.id !== video.id)
    .map(v => ({
      ...v,
      score:
        (v.category === video.category ? 3 : 0) +
        v.tags.filter(t => video.tags.includes(t)).length * 2 +
        (v.trending ? 1 : 0) +
        Math.log10(v.view_count + 1) * 0.5,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

export function getVideosByCategory(videos: Video[], category: string): Video[] {
  if (category === "All") return videos;
  return videos.filter(v => v.category === category);
}
