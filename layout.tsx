import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enrique's Host Stand",
  description: "Restaurant host stand starter app",
  applicationName: "Enrique's",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}