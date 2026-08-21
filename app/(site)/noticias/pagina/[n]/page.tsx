import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ListaDeNoticias, {
  DESCRICAO_DO_ACERVO,
} from "@/app/components/ListaDeNoticias";
import { getTotalDePaginasGeral } from "@/lib/noticias";
import { metadataDaPagina } from "@/lib/seo";

/**
 * A página 1 é canônica em /noticias, então só pré-renderizamos da 2 em diante.
 * Com uma única página de acervo, nenhuma rota é gerada aqui.
 */
export function generateStaticParams() {
  const total = getTotalDePaginasGeral();
  return Array.from({ length: Math.max(0, total - 1) }, (_, indice) => ({
    n: String(indice + 2),
  }));
}

export async function generateMetadata(
  props: PageProps<"/noticias/pagina/[n]">
): Promise<Metadata> {
  const { n } = await props.params;

  return metadataDaPagina({
    titulo: `Todas as Notícias, página ${n}`,
    descricao: DESCRICAO_DO_ACERVO,
    caminho: `/noticias/pagina/${n}`,
  });
}

export default async function NoticiasPaginadasPage(
  props: PageProps<"/noticias/pagina/[n]">
) {
  const { n } = await props.params;
  const pagina = Number(n);

  if (!Number.isInteger(pagina) || pagina < 1) {
    notFound();
  }

  // Evita conteúdo duplicado: /noticias/pagina/1 é a própria /noticias.
  if (pagina === 1) {
    redirect("/noticias");
  }

  if (pagina > getTotalDePaginasGeral()) {
    notFound();
  }

  return <ListaDeNoticias pagina={pagina} />;
}
