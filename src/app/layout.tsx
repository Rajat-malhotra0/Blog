import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anonymous Blog",
  description: "A platform for anonymous blogging",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* This script removes browser extension attributes before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function cleanupAttributes() {
                  document.querySelectorAll('[bis_skin_checked]').forEach(el => {
                    el.removeAttribute('bis_skin_checked');
                  });
                  
                  const body = document.body;
                  if (body && body.hasAttribute('bis_register')) {
                    body.removeAttribute('bis_register');
                  }
                }
                
                // Run immediately
                cleanupAttributes();
                
                // Also run after a small delay to catch late additions
                setTimeout(cleanupAttributes, 0);
                
                // Observe for changes
                const observer = new MutationObserver(cleanupAttributes);
                observer.observe(document.documentElement, { 
                  attributes: true, 
                  childList: true, 
                  subtree: true 
                });
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}