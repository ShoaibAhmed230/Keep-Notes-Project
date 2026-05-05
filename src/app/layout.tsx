import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "FlowNotes — Premium Financial Tracker & Notes",
    template: "%s | FlowNotes",
  },
  description: "FlowNotes is a sleek, Indigo-themed financial tracking application. Manage your monthly earnings, track expenses in real-time, and keep your thoughts organized with our premium note-taking interface.",
  keywords: ["financial tracker", "expense manager", "monthly earnings tracker", "notes app", "budgeting tool", "flow notes"],
  authors: [{ name: "Shoaib Ahmed" }],
  creator: "Shoaib Ahmed",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://flow-notes-tracker.vercel.app",
    title: "FlowNotes — Premium Financial Tracker & Notes",
    description: "Real-time expense tracking meets premium note-taking. Manage your finances with ease in a stunning dark-themed interface.",
    siteName: "FlowNotes",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FlowNotes Financial Tracker Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowNotes — Premium Financial Tracker & Notes",
    description: "Track earnings and expenses in real-time with a sleek indigo dark theme.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0f172a]">
        {children}
      </body>
    </html>
  );
}
