import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/app/components/Footer";
import { NOME_DO_SITE, urlDoSite } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const descricaoDoSite =
  "Notícias, análises e bastidores de MMA, boxe, jiu-jitsu e muay thai. O Corner é a referência digital em esportes de combate.";

/**
 * Defaults herdados por todas as páginas: `metadataBase` resolve os canonical
 * relativos e as URLs de Open Graph, e o bloco `openGraph` vale para as páginas
 * que não declaram o seu.
 */
export const metadata: Metadata = {
  metadataBase: new URL(urlDoSite),
  title: `${NOME_DO_SITE} | A referência digital em esportes de combate`,
  description: descricaoDoSite,
  openGraph: {
    siteName: NOME_DO_SITE,
    locale: "pt_BR",
    type: "website",
    title: `${NOME_DO_SITE} | A referência digital em esportes de combate`,
    description: descricaoDoSite,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#1A1A1A] text-white">
        {children}
        <Footer />
      </body>
    </html>
  );
}
