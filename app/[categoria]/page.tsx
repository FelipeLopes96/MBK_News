import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListaDeCategoria from "@/app/components/ListaDeCategoria";
import { buscarCategoria, categorias } from "@/lib/noticias";

export function generateStaticParams() {
  return categorias.map((categoria) => ({ categoria: categoria.slug }));
}

export async function generateMetadata(
  props: PageProps<"/[categoria]">
): Promise<Metadata> {
  const { categoria: slug } = await props.params;
  const categoria = buscarCategoria(slug);

  if (!categoria) {
    return { title: "Categoria não encontrada | O Corner" };
  }

  return {
    title: `${categoria.rotulo} | O Corner`,
    description: `Últimas notícias, análises e bastidores de ${categoria.rotulo} no O Corner.`,
  };
}

export default async function CategoriaPage(props: PageProps<"/[categoria]">) {
  const { categoria: slug } = await props.params;
  const categoria = buscarCategoria(slug);

  if (!categoria) {
    notFound();
  }

  return <ListaDeCategoria categoria={categoria} pagina={1} />;
}
