import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!isSupabaseConfigured || !supabase) {
      setFeedback({
        type: "error",
        message: "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env.",
      });
      return;
    }

    if (!email.trim() || !password.trim()) {
      setFeedback({ type: "error", message: "Please enter your email and password." });
      return;
    }

    if (isSignup && !ageConfirmed) {
      setFeedback({ type: "error", message: "Please confirm you are 18+ to create an account." });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { age_confirmed: ageConfirmed },
          },
        });

        if (error) throw error;

        if (data.session) {
          navigate(redirectTo);
          return;
        }

        setFeedback({
          type: "success",
          message: "Account created. Check your email to confirm your account, then sign in.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        navigate(redirectTo);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed. Please try again.";
      setFeedback({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-900/10 to-background" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-primary/10 blur-[150px]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center space-y-6 p-12"
        >
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <span className="font-display font-bold text-3xl text-foreground">Vault<span className="text-primary">TV</span></span>
          </Link>
          <p className="text-xl text-muted-foreground max-w-sm">Premium content. Unlimited streaming. Join the experience.</p>
        </motion.div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <span className="font-display font-bold text-xl text-foreground">Vault<span className="text-primary">TV</span></span>
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSignup ? "Join the premium streaming experience" : "Sign in to continue watching"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/50 transition-colors text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/50 transition-colors text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Age gate */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={e => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border accent-primary"
              />
              <span className="text-sm text-muted-foreground">
                I confirm that I am 18 years of age or older and agree to the Terms of Service
              </span>
            </label>

            {feedback && (
              <p className={`text-sm ${feedback.type === "error" ? "text-destructive" : "text-primary"}`}>
                {feedback.message}
              </p>
            )}

            <Button
              variant="premium"
              className="w-full h-11 gap-2"
              disabled={isSubmitting || (isSignup && !ageConfirmed)}
            >
              {isSubmitting ? "Please wait..." : isSignup ? "Create Account" : "Sign In"} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => setIsSignup(!isSignup)} className="text-primary hover:underline font-medium">
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
