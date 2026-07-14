import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Threadline",
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
    <ClerkProvider
      appearance={{
        options: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
        elements: {
          footer: { display: "none" },
          footerAction: { display: "none" },
          footerPages: { display: "none" },
        },
      }}
    >
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
            href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&family=Outfit:wght@600;700;800&family=Playfair+Display:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&family=Sora:wght@200;300;400;500;600;700;800&family=Poppins:wght@200;300;400;500;600;700;800;900&family=Manrope:wght@200;300;400;500;600;700;800&family=DM+Sans:wght@200;300;400;500;600;700;800;900&family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&family=Bricolage+Grotesque:wght@200;300;400;500;600;700;800&family=Instrument+Serif&family=Cormorant+Garamond:wght@300;400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Fraunces:wght@100;200;300;400;500;600;700;800;900&family=Cabinet+Grotesk:wght@100;200;300;400;500;600;700;800;900&family=Geist:wght@100;200;300;400;500;600;700;800;900&family=Urbanist:wght@100;200;300;400;500;600;700;800;900&family=Figtree:wght@300;400;500;600;700;800;900&family=Onest:wght@100;200;300;400;500;600;700;800;900&family=Montserrat:wght@100;200;300;400;500;600;700;800;900&family=Raleway:wght@100;200;300;400;500;600;700;800;900&family=Lora:wght@400;500;600;700&family=Crimson+Pro:wght@200;300;400;500;600;700;800;900&family=Source+Serif+4:wght@200;300;400;500;600;700;800;900&family=Archivo:wght@100;200;300;400;500;600;700;800;900&family=Work+Sans:wght@100;200;300;400;500;600;700;800;900&family=Nunito:wght@200;300;400;500;600;700;800;900&family=Jost:wght@100;200;300;400;500;600;700;800;900&family=Karla:wght@200;300;400;500;600;700;800&family=Rubik:wght@300;400;500;600;700;800;900&family=Libre+Franklin:wght@100;200;300;400;500;600;700;800;900&family=IBM+Plex+Sans:wght@100;200;300;400;500;600;700&family=Lexend:wght@100;200;300;400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&f[]=clash-display@200,300,400,500,600,700&f[]=satoshi@400,500,700,900&f[]=cabinet-grotesk@400,500,700,800&f[]=clash-grotesk@200,300,400,500,600,700&f[]=synonym@200,300,400,500,600,700&f[]=zodiak@200,300,400,500,600,700,800&display=swap"
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
