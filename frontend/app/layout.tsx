import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E4RTH – Planetary Crisis Platform",
  description:
    "An integrated digital platform tackling the Triple Planetary Crisis through geospatial data, AI, and community engagement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
