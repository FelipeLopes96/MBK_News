import type { MetadataRoute } from "next";
import { NOME_DO_SITE, TAGLINE } from "@/lib/seo";

/**
 * Manifesto do app. Serve para quando o leitor salva o portal na tela inicial
 * do celular: sem ele, o atalho sai com nome de URL e fundo branco.
 *
 * Os ícones são os mesmos do site, derivados do badge oficial da marca.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${NOME_DO_SITE} — ${TAGLINE}`,
    short_name: NOME_DO_SITE,
    description:
      "Jornalismo independente de esportes de combate: MMA, boxe, muay thai, jiu-jitsu, kickboxing e wrestling.",
    start_url: "/",
    display: "standalone",
    lang: "pt-BR",
    // Mesmo fundo do site: a tela de abertura não pode piscar branco antes de
    // o portal aparecer.
    background_color: "#0b0f14",
    theme_color: "#0b0f14",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
