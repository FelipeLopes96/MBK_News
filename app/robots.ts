import type { MetadataRoute } from "next";
import { urlDoSite } from "@/lib/seo";

/**
 * O portal inteiro é indexável, com duas exceções: o painel editorial, que é
 * interno, e a página de busca, que é resultado e não conteúdo — deixá-la
 * aberta encheria o índice do buscador de URLs com `?q=`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/busca"],
    },
    sitemap: new URL("/sitemap.xml", urlDoSite).toString(),
  };
}
