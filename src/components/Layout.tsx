import { Header } from "./Header";
import { PremiumPromoBanner } from "./PremiumPromoBanner";

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

export function Layout({ children, hideHeader }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {!hideHeader && <Header />}
      <PremiumPromoBanner />
      <main className={hideHeader ? "" : "pt-16"}>
        {children}
      </main>
    </div>
  );
}
