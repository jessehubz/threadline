import { SiteFooter } from "@/components/site-footer";
import { SitePageHeader } from "@/components/site-page-header";
import { FloatingThemeToggle } from "@/components/floating-theme-toggle";

export default function SitePagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base)",
      }}
    >
      <FloatingThemeToggle />
      <SitePageHeader />
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "40px 28px 60px",
        }}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
