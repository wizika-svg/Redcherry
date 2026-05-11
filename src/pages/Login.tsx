import { useState } from "react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  
  const redirectFromQuery = searchParams.get("redirect");
  const redirectFromPath = params?.redirect;
  let rawRedirect = (redirectFromQuery || redirectFromPath) || "/";
  if (!rawRedirect.startsWith("/")) rawRedirect = `/${rawRedirect}`;
  const redirectTo = decodeURIComponent(rawRedirect);

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

  // ─── Design Tokens ──────────────────────────────────────────────────────
  const labelCls = "text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]";
  const inputBg = "bg-[#0a0f1a] border-[rgba(255,255,255,0.05)] focus:border-[rgba(45,212,140,0.4)]";

  return (
    <div className="min-h-screen bg-[#06090f] flex text-white font-sans selection:bg-[#2DD48C]/30">
      {/* Left side - Industrial Branding */}
      <div className="hidden lg:flex flex-[1.2] relative overflow-hidden items-center justify-center border-r border-[rgba(255,255,255,0.05)] bg-[#080c14]">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#388BFD] opacity-[0.04] blur-[140px]" />
        
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 space-y-10 p-20"
        >
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(45,212,140,0.1)] border border-[rgba(45,212,140,0.2)] flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              <div className="w-4 h-4 bg-[#2DD48C] rounded-sm rotate-45 shadow-[0_0_20px_rgba(45,212,140,0.5)]" />
            </div>
            <span className="font-display font-bold text-5xl tracking-tighter">
              Eroctichq<span className="text-[#388BFD]">TV</span>
            </span>
          </Link>
          
          <div className="space-y-6 max-w-md">
            <h2 className="text-3xl font-display font-bold leading-tight">
              Access the most exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2DD48C] to-[#388BFD]">data-streams</span> in high definition.
            </h2>
            <div className="flex gap-4 items-center opacity-60">
              <ShieldCheck className="w-5 h-5 text-[#2DD48C]" />
              <p className="text-sm font-medium tracking-wide uppercase">Industrial Grade Encryption</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#06090f]">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm space-y-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-4">
             <Link to="/" className="inline-flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[rgba(45,212,140,0.1)] border border-[rgba(45,212,140,0.2)] flex items-center justify-center">
                  <div className="w-3 h-3 bg-[#2DD48C] rounded-sm rotate-45" />
                </div>
                <span className="font-display font-bold text-2xl text-white">Eroctichq<span className="text-[#388BFD]">TV</span></span>
              </Link>
          </div>

          <div className="space-y-2">
            <p className={labelCls}>{isSignup ? "New Node Registration" : "Authentication Required"}</p>
            <h1 className="text-4xl font-display font-bold text-white tracking-tight leading-none">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className={labelCls}>Terminal Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className={`w-full h-14 pl-12 pr-4 rounded-xl text-white placeholder:text-muted-foreground outline-none border transition-all duration-300 text-sm font-medium ${inputBg}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Access Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full h-14 pl-12 pr-12 rounded-xl text-white placeholder:text-muted-foreground outline-none border transition-all duration-300 text-sm font-medium ${inputBg}`}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#2DD48C] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Age gate - Sleek styling */}
            <label className="flex items-start gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] cursor-pointer group hover:bg-[rgba(255,255,255,0.04)] transition-all">
              <div className="relative flex items-center h-5">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={e => setAgeConfirmed(e.target.checked)}
                  className="w-5 h-5 rounded border-[rgba(255,255,255,0.2)] bg-[#0a0f1a] accent-[#2DD48C] transition-all cursor-pointer"
                />
              </div>
              <span className="text-[11px] leading-relaxed text-muted-foreground font-medium uppercase tracking-wider">
                I verify that I am <span className="text-white font-bold">18+</span> and consent to the data processing terms.
              </span>
            </label>

            {feedback && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className={`p-3 rounded-lg border text-xs font-bold uppercase tracking-widest text-center ${
                  feedback.type === "error" 
                    ? "bg-destructive/10 border-destructive/20 text-destructive" 
                    : "bg-[#2DD48C]/10 border-[#2DD48C]/20 text-[#2DD48C]"
                }`}
              >
                {feedback.message}
              </motion.div>
            )}

            <button
              disabled={isSubmitting || (isSignup && !ageConfirmed)}
              className="w-full h-14 flex items-center justify-center gap-3 rounded-xl text-xs font-bold text-[#06090f] uppercase tracking-[0.2em] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed group"
              style={{ background: "linear-gradient(135deg, #2DD48C 0%, #388BFD 100%)" }}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-[#06090f]/30 border-t-[#06090f] rounded-full animate-spin" />
              ) : (
                <>
                  {isSignup ? "Initialize Account" : "Access Terminal"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
              {isSignup ? "Already registered?" : "Don't have access yet?"}{" "}
              <button 
                onClick={() => setIsSignup(!isSignup)} 
                className="text-[#2DD48C] hover:text-[#388BFD] transition-colors ml-2"
              >
                {isSignup ? "Sign In" : "Register Now"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}