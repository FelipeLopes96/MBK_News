import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Footer from "@/app/components/Footer";
import { NOME_DO_SITE, TAGLINE, urlDoSite } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/**
 * Condensada das manchetes grandes. Não é fonte variável, então os pesos vêm
 * declarados — só os dois que o site usa, para não carregar arquivo morto.
 */
const manchete = Barlow_Condensed({
  variable: "--font-manchete",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const descricaoDoSite =
  "Jornalismo independente de esportes de combate: MMA, UFC, ONE, PFL, Bellator, boxe, muay thai, jiu-jitsu, kickboxing e wrestling.";

/**
 * Defaults herdados por todas as páginas: `metadataBase` resolve os canonical
 * relativos e as URLs de Open Graph, e o bloco `openGraph` vale para as páginas
 * que não declaram o seu.
 */
export const metadata: Metadata = {
  metadataBase: new URL(urlDoSite),
  title: `${NOME_DO_SITE} | ${TAGLINE}`,
  description: descricaoDoSite,
  openGraph: {
    siteName: NOME_DO_SITE,
    locale: "pt_BR",
    type: "website",
    title: `${NOME_DO_SITE} | ${TAGLINE}`,
    description: descricaoDoSite,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${manchete.variable} h-full antialiased`}
    >
      {/* Fundo e cor de texto vêm do `@layer base` do globals.css. */}
      <body className="flex min-h-full flex-col">
        {children}
        <Footer />
        {/* Web Analytics da Vercel. Fica no layout raiz para valer em todas as
            rotas; o script só é injetado em produção. */}
        <Analytics />
      </body>
    </html>
  );
}
