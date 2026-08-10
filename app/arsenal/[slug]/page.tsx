import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AvisoDeAfiliados from "@/app/components/AvisoDeAfiliados";
import LeituraDeArtigo from "@/app/components/LeituraDeArtigo";
import { getPorSlug, getTodos, rotuloDaCategoria } from "@/lib/arsenal";

export function generateStaticParams() {
  return getTodos().map((review) => ({ slug: review.slug }));
}

export async function generateMetadata(
  props: PageProps<"/arsenal/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const review = getPorSlug(slug);

  if (!review) {
    return { title: "Análise não encontrada | O Corner" };
  }

  return {
    title: `${review.title} | O Corner`,
    description: review.resumo,
  };
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
