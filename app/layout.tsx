import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

// Display: a wonky, characterful serif — editorial heritage with warmth.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
  variable: "--font-display",
});

// Body: a clean, slightly humanist grotesque.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body",
});

// Labels & data: mono for that scoreboard / dataset feel.
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Rally — Find a hitting partner near you",
  description:
    "Rally matches you with local tennis players at your level. Set your availability, get matched, and book a court. Most players are hitting within 24 hours.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${hanken.variable} ${spaceMono.variable}`}
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
