import { Crown, Lock, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { VideoSection } from "@/components/VideoSection";
import { Button } from "@/components/ui/button";
import { fetchVideos } from "@/lib/videos-service";
import { useAuth } from "@/hooks/use-auth";

const PremiumContent = () => {
  const navigate = useNavigate();
  const { user, isPremium, isAdmin } = useAuth();
  const { data: videos = [] } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

  // Filter to only premium videos
  const premiumVideos = videos.filter(v => v.is_premium);

  // Show all premium videos to premium users and admins
  const canAccessPremium = isPremium || isAdmin;

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md space-y-6"
          >
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                  <Lock className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold text-foreground">Premium Content</h1>
              <p className="text-muted-foreground">Sign in to access exclusive premium videos</p>
            </div>

            <div className="space-y-3 pt-4">
              <Button
                variant="premium"
                className="w-full gap-2"
                onClick={() => navigate("/login?redirect=premium-content")}
              >
                <Crown className="w-4 h-4" />
                Sign In
              </Button>
              <p className="text-xs text-muted-foreground">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-primary hover:underline font-semibold"
                >
                  Create one
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (!canAccessPremium) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md space-y-6"
          >
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border-2 border-border">
                  <Lock className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold text-foreground">Unlock Premium</h1>
              <p className="text-muted-foreground">
                Access the rarest and craziest exclusive videos by upgrading to premium
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-semibold text-sm text-foreground">Exclusive Content</p>
                  <p className="text-xs text-muted-foreground">Access premium videos not available to regular users</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-semibold text-sm text-foreground">Ad-Free Streaming</p>
                  <p className="text-xs text-muted-foreground">Watch without interruptions</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Button
                variant="premium"
                className="w-full gap-2"
                onClick={() => navigate("/premium")}
              >
                <Crown className="w-4 h-4" />
                Upgrade Now
              </Button>
              <p className="text-xs text-muted-foreground">
                {premiumVideos.length} exclusive {premiumVideos.length === 1 ? "video" : "videos"} waiting
              </p>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="relative overflow-hidden py-12 px-4">
        <div className="absolute inset-0 gradient-primary opacity-10 blur-3xl" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-4xl font-bold text-foreground">Premium Content</h1>
                <p className="text-muted-foreground">Exclusive videos for premium members</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-12 py-12">
        {premiumVideos.length > 0 ? (
          <VideoSection
            title={`${premiumVideos.length} Premium ${premiumVideos.length === 1 ? "Video" : "Videos"}`}
            icon={<Crown className="w-6 h-6 text-primary" />}
            videos={premiumVideos}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 space-y-4"
          >
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No Premium Content Yet</h2>
              <p className="text-muted-foreground">Check back soon for exclusive premium videos</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-12">
        <div className="container mx-auto px-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="font-display font-bold text-foreground">
              Vault<span className="text-primary">TV</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Premium content. Unlimited streaming.</p>
        </div>
      </footer>
    </Layout>
  );
};

export default PremiumContent;
