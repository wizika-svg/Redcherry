import { TrendingUp, Flame, Clock, Star, Sparkles, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/HeroSection";
import { VideoSection } from "@/components/VideoSection";
import { getFeaturedVideos, getTrendingVideos, getPopularVideos, getRecentVideos } from "@/lib/mock-data";
import { fetchVideos } from "@/lib/videos-service";

const Index = () => {
  const { data: videos = [] } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

  const featured = getFeaturedVideos(videos);
  const trending = getTrendingVideos(videos);
  const popular = getPopularVideos(videos);
  const recent = getRecentVideos(videos);
  const trendingSection = trending.length ? trending : popular;
  const popularSection = popular.length ? popular : recent;
  const recentSection = recent.length ? recent : popular;
  const featuredSection = featured.length ? featured : popular;
  const recommendedSection = [...(popular.length ? popular : videos)]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);
  const topWeekSection = popular.length ? popular : trendingSection;
  const heroVideo = featured[0] || popular[0];

  return (
    <Layout>
      {heroVideo && <HeroSection video={heroVideo} />}

      <div className="container mx-auto px-4 space-y-12 py-12">
        <VideoSection
          title="Trending Now"
          icon={<TrendingUp className="w-6 h-6 text-trending" />}
          videos={trendingSection.slice(0, 4)}
          linkTo="/search?sort=trending"
        />
        <VideoSection
          title="Most Popular"
          icon={<Flame className="w-6 h-6 text-popular" />}
          videos={popularSection.slice(0, 8)}
          linkTo="/search?sort=popular"
        />
        <VideoSection
          title="Recently Added"
          icon={<Clock className="w-6 h-6 text-primary" />}
          videos={recentSection.slice(0, 4)}
          linkTo="/search?sort=newest"
        />
        <VideoSection
          title="Featured Picks"
          icon={<Star className="w-6 h-6 text-trending" />}
          videos={featuredSection.slice(0, 4)}
          columns={2}
        />
        <VideoSection
          title="Recommended For You"
          icon={<Sparkles className="w-6 h-6 text-primary" />}
          videos={recommendedSection}
        />
        <VideoSection
          title="Top This Week"
          icon={<Eye className="w-6 h-6 text-badge-new" />}
          videos={topWeekSection.slice(0, 4)}
          columns={4}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-12">
        <div className="container mx-auto px-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <span className="font-display font-bold text-foreground">Eroctichq<span className="text-primary">TV</span></span>
          </div>
          <p className="text-sm text-muted-foreground">Premium content. Unlimited streaming.</p>
          <p className="text-xs text-muted-foreground/50">© 2026 EroctichqTV. All rights reserved.</p>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;
