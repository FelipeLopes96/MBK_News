import type { Metadata } from "next";

/**
 * Domínio público do site, usado para canonical e Open Graph.
 *
 * O default é o domínio de produção: se a variável faltar na Vercel, as URLs
 * absolutas saem certas em vez de apontar para localhost. Defina
 * NEXT_PUBLIC_SITE_URL apenas para apontar para outro ambiente.
 */
export const urlDoSite =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mbknews.vercel.app";

export const NOME_DO_SITE = "MBK News";

/** Assinatura da marca, usada no título padrão e no cabeçalho. */
export const TAGLINE = "Jornalismo de esportes de combate";

/** Assinatura padrão das matérias sem autor declarado no frontmatter. */
export const REDACAO = "Redação MBK News";

/**
 * Monta o metadata de uma página seguindo o padrão do site: título com sufixo,
 * canonical relativo (resolvido a partir de `metadataBase` no layout raiz) e
 * Open Graph. Os campos não informados caem no default do layout raiz.
 */
export function metadataDaPagina({
  titulo,
  descricao,
  caminho,
  imagem,
  tipo = "website",
}: {
  titulo: string;
  descricao?: string;
  /** Caminho absoluto no site, ex.: "/arquivo/lendas/royce-gracie". */
  caminho: string;
  /** URL da imagem de destaque, quando existir. */
  imagem?: string;
  tipo?: "website" | "article";
}): Metadata {
  const tituloCompleto = `${titulo} | ${NOME_DO_SITE}`;

  return {
    title: tituloCompleto,
    description: descricao,
    alternates: { canonical: caminho },
    openGraph: {
      title: tituloCompleto,
      description: descricao,
      url: caminho,
      type: tipo,
      siteName: NOME_DO_SITE,
      locale: "pt_BR",
      ...(imagem ? { images: [{ url: imagem }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: tituloCompleto,
      description: descricao,
      ...(imagem ? { images: [imagem] } : {}),
    },
  };
}
