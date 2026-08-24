import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ListaDeVideos, {
  descricaoDaModalidade,
} from "@/app/components/ListaDeVideos";
import { categorias, rotuloDaCategoria } from "@/lib/noticias";
import { metadataDaPagina } from "@/lib/seo";
import {
  getModalidadesComVideo,
  getTotalDePaginasDaBiblioteca,
} from "@/lib/videos";

/**
 * Uma entrada por modalidade e por página, da 2 em diante — a 1 é canônica em
 * /videos/modalidade/x. Num acervo pequeno nenhuma modalidade passa de uma
 * página e isto não gera rota alguma.
 */
export function generateStaticParams() {
  return getModalidadesComVideo(categorias).flatMap((categoria) => {
    const total = getTotalDePaginasDaBiblioteca(categoria.slug);

    return Array.from({ length: Math.max(0, total - 1) }, (_, indice) => ({
      slug: categoria.slug,
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
  props: PageProps<"/videos/modalidade/[slug]/pagina/[n]">
): Promise<Metadata> {
  const { slug, n } = await props.params;
  const rotulo = rotuloDaCategoria(slug);

  return metadataDaPagina({
    titulo: `Vídeos de ${rotulo}, página ${n}`,
    descricao: descricaoDaModalidade(rotulo),
    caminho: `/videos/modalidade/${slug}/pagina/${n}`,
  });
}

export default async function VideosDaModalidadePaginadosPage(
  props: PageProps<"/videos/modalidade/[slug]/pagina/[n]">
) {
  const { slug, n } = await props.params;
  const pagina = Number(n);

  const existe = getModalidadesComVideo(categorias).some(
    (categoria) => categoria.slug === slug
  );

  if (!existe || !Number.isInteger(pagina) || pagina < 1) {
    notFound();
  }

  // Evita conteúdo duplicado com a página 1 da modalidade.
  if (pagina === 1) {
    redirect(`/videos/modalidade/${slug}`);
  }

  if (pagina > getTotalDePaginasDaBiblioteca(slug)) {
    notFound();
  }

  return <ListaDeVideos modalidade={slug} pagina={pagina} />;
}
