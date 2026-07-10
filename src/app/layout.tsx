import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Threadline — Visual Project Management",
  description:
    "Organize your projects as visual dependency graphs. Collaborate in real-time, track progress, and ship faster.",
  icons: {
    icon: "/icon.svg",
  },
};

// Inline script to prevent FOUC - sets dark class before paint
const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme') || 'dark';
    var dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&family=Outfit:wght@600;700;800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen antialiased">
          <ThemeProvider>
            {children}
          </ThemeProvider>
          <Toaster position="bottom-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
