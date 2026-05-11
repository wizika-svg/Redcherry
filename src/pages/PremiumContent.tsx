import { Crown, Lock, Sparkles, Zap, ShieldCheck } from "lucide-react";
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

  // ─── Not Logged In Access Screen ──────────────────────────────────────
  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#0a0f1a] flex items-center justify-center px-4 py-8 overflow-auto z-50">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#388BFD]/5 via-transparent to-[#2DD48C]/5 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#388BFD] opacity-5 blur-[150px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 max-w-lg w-full text-center space-y-10"
          >
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl bg-[#388BFD]/10 border border-[#388BFD]/20 flex items-center justify-center">
                  <Crown className="w-14 h-14 text-[#388BFD]" />
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-xl bg-[#0a0f1a] border-2 border-[#388BFD]/30 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#388BFD]" />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-bold text-[#2DD48C] uppercase tracking-[0.3em] mb-3">Premium Access</p>
                <h1 className="font-display text-5xl font-bold text-white leading-tight">
                  Unlock Excellence
                </h1>
              </div>
              <p className="text-base text-gray-300 leading-relaxed">
                Access the rarest and craziest videos on the platform. Exclusive content curated for those who demand the highest quality.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4 pt-4">
              <button
                className="w-full py-5 px-6 rounded-xl text-sm font-bold text-white uppercase tracking-widest transition-all duration-300 hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg, #388BFD 0%, #2DD48C 100%)" }}
                onClick={() => navigate("/login?redirect=premium-content")}
              >
                <span className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Sign In to Access
                </span>
              </button>

              <p className="text-xs text-gray-400 font-medium">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-[#2DD48C] font-bold hover:text-[#388BFD] transition-colors"
                >
                  Create one now
                </button>
              </p>
            </div>
          </motion.div>
        </div>
    );
  }

  // ─── Premium Access Required Screen ──────────────────────────────────
  if (!canAccessPremium) {
    return (
      <div className="fixed inset-0 bg-[#0a0f1a] flex items-center justify-center px-4 py-8 overflow-auto z-50">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2DD48C]/5 via-transparent to-[#388BFD]/5 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,140,0.08)_0%,transparent_70%)]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 max-w-lg w-full text-center space-y-10 p-10 rounded-3xl bg-[rgba(14,26,46,0.5)] border border-[#2DD48C]/20 backdrop-blur-2xl"
          >
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#2DD48C]/10 border border-[#2DD48C]/20 flex items-center justify-center">
                  <Lock className="w-12 h-12 text-[#2DD48C]" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-lg bg-[#2DD48C] border-3 border-[#0a0f1a] flex items-center justify-center shadow-lg">
                  <Crown className="w-5 h-5 text-[#0a0f1a]" />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-bold text-[#2DD48C] uppercase tracking-[0.3em] mb-3">Upgrade Required</p>
                <h1 className="font-display text-4xl font-bold text-white leading-tight">
                  Unlock Excellence
                </h1>
              </div>
              <p className="text-base text-gray-300 leading-relaxed">
                Access the rarest and craziest videos on the platform. Exclusive content curated for those who demand the highest quality.
              </p>
            </div>

            {/* Features Grid */}
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 space-y-4">
              {[
                { title: "Exclusive Videos", desc: "Rarest premium content" },
                { title: "Ad-Free Streaming", desc: "Uninterrupted viewing" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#2DD48C]/10 border border-[#2DD48C]/20 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#2DD48C]" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-white">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              className="w-full py-5 px-6 rounded-xl text-sm font-bold text-[#0a0f1a] uppercase tracking-widest transition-all duration-300 hover:brightness-110 active:scale-95"
              style={{ background: "linear-gradient(135deg, #2DD48C 0%, #388BFD 100%)" }}
              onClick={() => navigate("/premium")}
            >
              Go Premium Now
            </button>
          </motion.div>
        </div>
    );
  }

  // ─── Premium Content Display ─────────────────────────────────────────
  return (
    <Layout>
      <div className="min-h-screen bg-[#0a0f1a]">
        {/* Header */}
        <div className="relative overflow-hidden pt-24 pb-16 px-6 border-b border-[rgba(255,255,255,0.05)]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#388BFD]/5 to-transparent pointer-events-none" />

          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#388BFD]/10 border border-[#388BFD]/20 flex items-center justify-center">
                <Crown className="w-8 h-8 text-[#388BFD]" />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#2DD48C] uppercase tracking-[0.2em]">Verified Member</p>
                <h1 className="font-display text-4xl font-bold text-white">Premium Archive</h1>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="container mx-auto px-6 py-16 space-y-12">
          {premiumVideos.length > 0 ? (
            <VideoSection
              title={`${premiumVideos.length} Exclusive Videos`}
              icon={<Zap className="w-6 h-6 text-[#2DD48C]" />}
              videos={premiumVideos}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 space-y-6"
            >
              <Sparkles className="w-12 h-12 text-gray-600 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Archive Empty</h2>
                <p className="text-sm text-gray-400 mt-3">No premium content available yet</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-[rgba(255,255,255,0.05)] py-12 bg-[#080c14]">
          <div className="container mx-auto px-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#388BFD]/10 border border-[#388BFD]/20 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#388BFD] rounded-sm" />
              </div>
              <span className="font-display font-bold text-white">
                Vault<span className="text-[#388BFD]">TV</span>
              </span>
            </div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Premium Exclusive Streaming</p>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default PremiumContent;