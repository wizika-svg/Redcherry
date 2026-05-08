import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Zap } from "lucide-react";
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full mx-4"
        >
          <div className="relative p-4 rounded-xl bg-gradient-to-r from-primary/20 via-purple-900/20 to-primary/20 border border-primary/30 shadow-2xl backdrop-blur-sm">
            {/* Background glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-purple-900/10 blur-xl -z-10" />

            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 p-1 hover:bg-black/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="pr-6 space-y-3">
              {/* Header */}
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Unlock Premium Content</h3>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                🔥 Access the <span className="text-primary font-semibold">rarest and craziest videos</span> on the platform. Exclusive content you won't find anywhere else.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Exclusive Videos</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Ad-Free</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">4K Quality</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Download</span>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleUpgradeClick}
                variant="premium"
                className="w-full h-9 text-sm font-semibold gap-1.5"
              >
                <Crown className="w-4 h-4" />
                {user ? "Upgrade Now" : "Sign In & Upgrade"}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
