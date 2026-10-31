import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeGro — Track today. Grow tomorrow!",
  description: "WeGro: Personal fitness, nutrition, and workout tracker. Track today. Grow tomorrow!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('wegro_theme');
                if (t && ['purple', 'red', 'orange', 'blue', 'yellow'].includes(t)) {
                  document.documentElement.setAttribute('data-theme', t);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#f4f4f5]">
        {children}
      </body>
    </html>
  );
}
