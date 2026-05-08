import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, X, LogIn, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isPremium, user } = useAuth();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Trending", path: "/search?sort=trending" },
    { label: "Popular", path: "/search?sort=popular" },
    { label: "New", path: "/search?sort=newest" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <span className="font-display font-bold text-xl text-foreground hidden sm:block">
            Vault<span className="text-primary">TV</span>
          </span>
        </Link>

        {/* Nav links - desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <AnimatePresence>
            {searchOpen ? (
              <motion.form
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSearch}
                className="overflow-hidden"
              >
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full h-9 px-3 rounded-lg bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none border border-border focus:border-primary/50"
                  onBlur={() => !searchQuery && setSearchOpen(false)}
                />
              </motion.form>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="text-muted-foreground hover:text-foreground">
                <Search className="w-5 h-5" />
              </Button>
            )}
          </AnimatePresence>

          {/* Premium button for non-premium users */}
          {user && !isPremium && (
            <Link to="/premium" className="hidden sm:block">
              <Button 
                variant="premium" 
                size="sm" 
                className="gap-1 animate-pulse border-2 border-primary"
              >
                <Crown className="w-4 h-4" /> Join Premium
              </Button>
            </Link>
          )}

          {/* View Premium Content button for premium users */}
          {user && isPremium && (
            <Link to="/premium-content" className="hidden sm:block">
              <Button 
                variant="premium" 
                size="sm" 
                className="gap-1 border-2 border-primary"
              >
                <Crown className="w-4 h-4" /> Watch Premium
              </Button>
            </Link>
          )}

          {/* Premium sign-in for non-logged-in users */}
          {!user && (
            <Link to="/login?redirect=premium" className="hidden sm:block">
              <Button 
                variant="premium" 
                size="sm" 
                className="gap-1 animate-pulse border-2 border-primary"
              >
                <Crown className="w-4 h-4" /> Premium
              </Button>
            </Link>
          )}

          <Link to="/login" className={!user ? "hidden sm:block" : "hidden"}>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <LogIn className="w-4 h-4 mr-1" /> Sign In
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin" className="hidden sm:block">
              <Button variant="premium" size="sm">Admin</Button>
            </Link>
          )}

          {/* Mobile menu */}
          <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass-strong border-t border-border overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenu(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              
              {user && !isPremium && (
                <Link to="/premium" onClick={() => setMobileMenu(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10">
                  <Crown className="w-4 h-4 mr-1 inline" /> Join Premium
                </Link>
              )}
              
              {user && isPremium && (
                <Link to="/premium-content" onClick={() => setMobileMenu(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10">
                  <Crown className="w-4 h-4 mr-1 inline" /> Watch Premium
                </Link>
              )}
              
              {!user && (
                <Link to="/login?redirect=premium" onClick={() => setMobileMenu(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10">
                  <Crown className="w-4 h-4 mr-1 inline" /> Premium
                </Link>
              )}
              
              {!user && (
                <Link to="/login" onClick={() => setMobileMenu(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary">
                  Sign In
                </Link>
              )}
              
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenu(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium text-primary">
                  Admin Panel
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
