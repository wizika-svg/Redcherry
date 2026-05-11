import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export function PremiumPromoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();

  useEffect(() => {
    if (isPremium || !isVisible) return;
    
    // Auto-hide after 8 seconds
    const timer = setTimeout(() => setIsVisible(false), 8000);
    return () => clearTimeout(timer);
  }, [isPremium, isVisible]);

  if (isPremium || !isVisible) return null;

  const handleUpgradeClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/premium");
    }
  };

  // ─── Design Tokens ──────────────────────────────────────────────────────
  const labelCls = "text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-screen flex justify-center px-4"
        >
          <div className="relative overflow-hidden p-5 rounded-2xl bg-[#0a0f1a]/80 border border-[rgba(45,212,140,0.2)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            
            {/* Minimalist Accents */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[rgba(45,212,140,0.5)] to-transparent" />
            <div className="absolute -inset-x-20 -top-20 h-40 bg-[#2DD48C] opacity-[0.03] blur-[80px] -z-10" />

            {/* Close button - Industrial style */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-3 right-3 p-1.5 hover:bg-[rgba(255,255,255,0.05)] rounded-md border border-transparent hover:border-[rgba(255,255,255,0.1)] transition-all"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(45,212,140,0.1)] border border-[rgba(45,212,140,0.2)] flex items-center justify-center">
                  <Crown className="w-5 h-5 text-[#2DD48C]" />
                </div>
                <div>
                  <p className={labelCls}>Premium Access</p>
                  <h3 className="text-lg font-display font-bold text-white tracking-tight">Unlock Excellence</h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[rgba(255,255,255,0.6)] leading-relaxed font-medium">
                Access the <span className="text-[#2DD48C]">rarest and craziest videos</span> on the platform. Exclusive content curated for those who demand the highest quality.
              </p>

              {/* Features - Sleek Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {[
                  "Exclusive Library", 
                  "Pure Ad-Free", 
                  "Ultrawide 4K", 
                  "Offline Save"
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[rgba(45,212,140,0.1)] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-[#2DD48C]" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button - Emerald Gradient */}
              <button
                onClick={handleUpgradeClick}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-[#0a0f1a] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #2DD48C 0%, #388BFD 100%)" }}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                {user ? "Upgrade to Pro" : "Join the Elite"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}