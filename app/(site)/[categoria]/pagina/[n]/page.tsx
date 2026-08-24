import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ListaDeCategoria from "@/app/components/ListaDeCategoria";
import { buscarCategoria, categorias, getTotalDePaginas } from "@/lib/noticias";
import { metadataDaPagina, NOME_DO_SITE } from "@/lib/seo";

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

/**
 * Endereço fora da lista acima é 404 de verdade, e não 200 com a tela de 404
 * dentro: a recusa acontece na roteagem, antes de o corpo começar a ser
 * transmitido — e depois que ele começa, o status não pode mais mudar.
 */
export const dynamicParams = false;

export async function generateMetadata(
  props: PageProps<"/[categoria]/pagina/[n]">
): Promise<Metadata> {
  const { categoria: slug, n } = await props.params;
  const categoria = buscarCategoria(slug);

  if (!categoria) {
    return { title: `Categoria não encontrada | ${NOME_DO_SITE}` };
  }

  return metadataDaPagina({
    titulo: `${categoria.rotulo}, página ${n}`,
    descricao: `Últimas notícias, análises e bastidores de ${categoria.rotulo} no ${NOME_DO_SITE}.`,
    caminho: `/${categoria.slug}/pagina/${n}`,
  });
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
