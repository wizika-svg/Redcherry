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

  // ─── Shared Premium Styles ──────────────────────────────────────────────
  const labelCls = "text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]";
  const pageBg = "min-h-screen bg-[#0a0f1a]";

  if (!user) {
    return (
      <Layout>
        <div className="fixed inset-0 flex items-center justify-center px-4 overflow-hidden bg-[#0a0f1a]">
          {/* Ambient background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#388BFD] opacity-[0.03] blur-[120px] pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-sm w-full space-y-8 relative z-10"
          >
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-[rgba(56,139,253,0.05)] border border-[rgba(56,139,253,0.15)] flex items-center justify-center transition-all group-hover:border-[rgba(56,139,253,0.3)] shadow-2xl">
                  <Crown className="w-10 h-10 text-[#388BFD]" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-[#0a0f1a] border border-[rgba(56,139,253,0.3)] shadow-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#388BFD]" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className={labelCls}>Restricted Access</p>
              <h1 className="font-display text-4xl font-bold text-white tracking-tight">Premium Eroctichq</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Unlock our most exclusive collection of high-bitrate, premium cinematic experiences.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <button
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-bold text-white uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #388BFD 0%, #2DD48C 100%)" }}
                onClick={() => navigate("/login?redirect=premium-content")}
              >
                <Zap className="w-4 h-4 fill-current" />
                Sign In to Unlock
              </button>
              
              <p className="text-[11px] text-muted-foreground font-medium">
                New to the platform?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-[#2DD48C] hover:text-[#388BFD] transition-colors font-bold uppercase tracking-wider ml-1"
                >
                  Join the Elite
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
        <div className="fixed inset-0 flex items-center justify-center px-4 bg-[#0a0f1a]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,140,0.05)_0%,transparent_70%)]" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md w-full space-y-8 relative z-10 p-8 rounded-3xl bg-[rgba(14,26,46,0.6)] border border-[rgba(45,212,140,0.15)] backdrop-blur-xl shadow-2xl"
          >
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[rgba(45,212,140,0.08)] flex items-center justify-center border border-[rgba(45,212,140,0.2)]">
                  <Lock className="w-8 h-8 text-[#2DD48C]" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-lg bg-[#2DD48C] border-4 border-[#0a0f1a] flex items-center justify-center shadow-lg">
                  <Crown className="w-3.5 h-3.5 text-[#0a0f1a]" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className={labelCls}>Upgrade Required</p>
              <h1 className="font-display text-3xl font-bold text-white tracking-tight">Level Up Your View</h1>
              <p className="text-muted-foreground text-sm">
                Access the rarest exclusive videos by joining our premium circle.
              </p>
            </div>

            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-5 space-y-4">
              {[
                { title: "Elite Content", desc: "Access the hidden master-file Eroctichq." },
                { title: "Pure Stream", desc: "zero-latency, ad-free industrial hosting." }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(45,212,140,0.1)] flex items-center justify-center shrink-0 border border-[rgba(45,212,140,0.1)]">
                    <ShieldCheck className="w-4 h-4 text-[#2DD48C]" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[11px] uppercase tracking-widest text-white">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-2">
              <button
                className="w-full py-4 rounded-xl text-xs font-bold text-[#0a0f1a] uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #2DD48C 0%, #388BFD 100%)" }}
                onClick={() => navigate("/premium")}
              >
                Go Premium Now
              </button>
              <div className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2DD48C] animate-pulse" />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  {premiumVideos.length} Exclusive files available
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`${pageBg} min-h-screen`}>
        {/* Header - Industrial Hero */}
        <div className="relative overflow-hidden pt-20 pb-12 px-6">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[rgba(56,139,253,0.3)] to-transparent" />
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-[rgba(56,139,253,0.08)] border border-[rgba(56,139,253,0.2)] flex items-center justify-center shadow-[0_0_30px_rgba(56,139,253,0.05)]">
                <Crown className="w-8 h-8 text-[#388BFD]" />
              </div>
              <div className="space-y-1">
                <p className={labelCls}>Verified Member Access</p>
                <h1 className="font-display text-5xl font-bold text-white tracking-tighter">Premium Archive</h1>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 space-y-16 py-12">
          {premiumVideos.length > 0 ? (
            <div className="relative">
              <VideoSection
                title={`${premiumVideos.length} Exclusive Selections`}
                icon={<Zap className="w-5 h-5 text-[#2DD48C]" />}
                videos={premiumVideos}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 rounded-3xl border border-dashed border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)]"
            >
              <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-white uppercase tracking-widest">Archive Empty</h2>
              <p className="text-xs text-muted-foreground mt-2">New premium data-streams are currently being processed.</p>
            </motion.div>
          )}
        </div>

        {/* Footer - Minimalist Branding */}
        <footer className="border-t border-[rgba(255,255,255,0.05)] mt-24 py-16 bg-[#080c14]">
          <div className="container mx-auto px-6 text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[rgba(56,139,253,0.1)] flex items-center justify-center border border-[rgba(56,139,253,0.2)]">
                <div className="w-2.5 h-2.5 bg-[#388BFD] rounded-sm rotate-45" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tighter">
                Eroctichq<span className="text-[#388BFD]">TV</span>
              </span>
            </div>
            <p className={labelCls}>Encrypted & Curated Premium Streaming</p>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default PremiumContent;