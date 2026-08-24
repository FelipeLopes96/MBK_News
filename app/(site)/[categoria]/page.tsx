import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListaDeCategoria from "@/app/components/ListaDeCategoria";
import { buscarCategoria, categorias } from "@/lib/noticias";
import { metadataDaPagina, NOME_DO_SITE } from "@/lib/seo";

export function generateStaticParams() {
  return categorias.map((categoria) => ({ categoria: categoria.slug }));
}

/**
 * Endereço fora da lista acima é 404 de verdade, e não 200 com a tela de 404
 * dentro: a recusa acontece na roteagem, antes de o corpo começar a ser
 * transmitido — e depois que ele começa, o status não pode mais mudar.
 */
export const dynamicParams = false;

export async function generateMetadata(
  props: PageProps<"/[categoria]">
): Promise<Metadata> {
  const { categoria: slug } = await props.params;
  const categoria = buscarCategoria(slug);

  if (!categoria) {
    return { title: `Categoria não encontrada | ${NOME_DO_SITE}` };
  }

  return metadataDaPagina({
    titulo: categoria.rotulo,
    descricao: `Últimas notícias, análises e bastidores de ${categoria.rotulo} no ${NOME_DO_SITE}.`,
    caminho: `/${categoria.slug}`,
  });
}

export default async function CategoriaPage(props: PageProps<"/[categoria]">) {
  const { categoria: slug } = await props.params;
  const categoria = buscarCategoria(slug);

  if (!categoria) {
    notFound();
  }

  return <ListaDeCategoria categoria={categoria} pagina={1} />;
}
