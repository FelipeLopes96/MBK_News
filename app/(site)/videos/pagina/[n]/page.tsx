import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ListaDeVideos, {
  DESCRICAO_DA_BIBLIOTECA,
} from "@/app/components/ListaDeVideos";
import { metadataDaPagina } from "@/lib/seo";
import { getTotalDePaginasDaBiblioteca } from "@/lib/videos";

/** A página 1 é canônica em /videos, então só pré-renderizamos da 2 em diante. */
export function generateStaticParams() {
  const total = getTotalDePaginasDaBiblioteca();
  return Array.from({ length: Math.max(0, total - 1) }, (_, indice) => ({
    n: String(indice + 2),
  }));
}

export async function generateMetadata(
  props: PageProps<"/videos/pagina/[n]">
): Promise<Metadata> {
  const { n } = await props.params;

  return metadataDaPagina({
    titulo: `Vídeos, página ${n}`,
    descricao: DESCRICAO_DA_BIBLIOTECA,
    caminho: `/videos/pagina/${n}`,
  });
}

export default async function VideosPaginadosPage(
  props: PageProps<"/videos/pagina/[n]">
) {
  const { n } = await props.params;
  const pagina = Number(n);

  if (!Number.isInteger(pagina) || pagina < 1) {
    notFound();
  }

  // Evita conteúdo duplicado: /videos/pagina/1 é a própria /videos.
  if (pagina === 1) {
    redirect("/videos");
  }

  if (pagina > getTotalDePaginasDaBiblioteca()) {
    notFound();
  }

  return <ListaDeVideos pagina={pagina} />;
}
