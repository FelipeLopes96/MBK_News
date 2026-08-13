import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ListaDeCategoria from "@/app/components/ListaDeCategoria";
import { buscarCategoria, categorias, getTotalDePaginas } from "@/lib/noticias";

/**
 * A página 1 é canônica em /categoria, então só pré-renderizamos daqui pra frente.
 * Categorias com uma única página não geram nenhuma rota aqui.
 */
export function generateStaticParams() {
  return categorias.flatMap((categoria) => {
    const total = getTotalDePaginas(categoria.slug);
    return Array.from({ length: Math.max(0, total - 1) }, (_, indice) => ({
      categoria: categoria.slug,
      n: String(indice + 2),
    }));
  });
}

export async function generateMetadata(
  props: PageProps<"/[categoria]/pagina/[n]">
): Promise<Metadata> {
  const { categoria: slug, n } = await props.params;
  const categoria = buscarCategoria(slug);

  if (!categoria) {
    return { title: "Categoria não encontrada | O Corner" };
  }

  return {
    title: `${categoria.rotulo}, página ${n} | O Corner`,
    description: `Últimas notícias, análises e bastidores de ${categoria.rotulo} no O Corner.`,
  };
}

export default async function CategoriaPaginadaPage(
  props: PageProps<"/[categoria]/pagina/[n]">
) {
  const { categoria: slug, n } = await props.params;
  const categoria = buscarCategoria(slug);

  if (!categoria) {
    notFound();
  }

  const pagina = Number(n);

  if (!Number.isInteger(pagina) || pagina < 1) {
    notFound();
  }

  // Evita conteúdo duplicado: /categoria/pagina/1 é a própria /categoria.
  if (pagina === 1) {
    redirect(`/${categoria.slug}`);
  }

  if (pagina > getTotalDePaginas(categoria.slug)) {
    notFound();
  }

  return <ListaDeCategoria categoria={categoria} pagina={pagina} />;
}
