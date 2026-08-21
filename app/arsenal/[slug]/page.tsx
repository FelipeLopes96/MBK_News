import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AvisoDeAfiliados from "@/app/components/AvisoDeAfiliados";
import LeituraDeArtigo from "@/app/components/LeituraDeArtigo";
import { getPorSlug, getTodos, rotuloDaCategoria } from "@/lib/arsenal";
import { metadataDaPagina, NOME_DO_SITE } from "@/lib/seo";

export function generateStaticParams() {
  return getTodos().map((review) => ({ slug: review.slug }));
}

export async function generateMetadata(
  props: PageProps<"/arsenal/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const review = getPorSlug(slug);

  if (!review) {
    return { title: `Análise não encontrada | ${NOME_DO_SITE}` };
  }

  return metadataDaPagina({
    titulo: review.title,
    descricao: review.resumo,
    caminho: `/arsenal/${review.slug}`,
    imagem: review.imagem,
    tipo: "article",
  });
}

export default async function ReviewPage(props: PageProps<"/arsenal/[slug]">) {
  const { slug } = await props.params;
  const review = getPorSlug(slug);

  if (!review) {
    notFound();
  }

  return (
    <LeituraDeArtigo
      item={review}
      rotuloCategoria={rotuloDaCategoria(review.categoria)}
      voltarHref="/arsenal"
      voltarRotulo="Voltar para o Arsenal"
      aviso={<AvisoDeAfiliados />}
    />
  );
}
