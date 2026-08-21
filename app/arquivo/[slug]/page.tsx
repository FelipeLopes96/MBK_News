import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LeituraDeArtigo from "@/app/components/LeituraDeArtigo";
import { getPorSlug, getTodos, rotuloDaCategoria } from "@/lib/arquivo";
import { metadataDaPagina, NOME_DO_SITE } from "@/lib/seo";

export function generateStaticParams() {
  return getTodos().map((artigo) => ({ slug: artigo.slug }));
}

export async function generateMetadata(
  props: PageProps<"/arquivo/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const artigo = getPorSlug(slug);

  if (!artigo) {
    return { title: `Artigo não encontrado | ${NOME_DO_SITE}` };
  }

  return metadataDaPagina({
    titulo: artigo.title,
    descricao: artigo.resumo,
    caminho: `/arquivo/${artigo.slug}`,
    imagem: artigo.imagem,
    tipo: "article",
  });
}

export default async function ArtigoPage(props: PageProps<"/arquivo/[slug]">) {
  const { slug } = await props.params;
  const artigo = getPorSlug(slug);

  if (!artigo) {
    notFound();
  }

  return (
    <LeituraDeArtigo
      item={artigo}
      rotuloCategoria={rotuloDaCategoria(artigo.categoria)}
      voltarHref="/arquivo"
      voltarRotulo="Voltar para o Arquivo"
    />
  );
}
