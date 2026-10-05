import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Layers - Personal Style & Wardrobe Management",
  description: "Organize your wardrobe, track your outfits, and discover your personal style with Layers - the intelligent wardrobe management app.",
  openGraph: {
    title: "Layers - Personal Style & Wardrobe Management",
    description: "Organize your wardrobe, track your outfits, and discover your personal style with Layers - the intelligent wardrobe management app.",
    url: "/",
    siteName: "Layers",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Layers app preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Layers - Personal Style & Wardrobe Management",
    description: "Organize your wardrobe, track your outfits, and discover your personal style with Layers - the intelligent wardrobe management app.",
    images: ["/opengraph-image.png"],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
