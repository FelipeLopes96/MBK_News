import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListaDeVideos, {
  descricaoDaModalidade,
} from "@/app/components/ListaDeVideos";
import { categorias, rotuloDaCategoria } from "@/lib/noticias";
import { metadataDaPagina } from "@/lib/seo";
import { getModalidadesComVideo } from "@/lib/videos";

/**
 * Só as modalidades que têm vídeo ganham rota. Gerar as seis criaria páginas
 * vazias para o Google indexar, e o menu nem oferece as vazias.
 */
export function generateStaticParams() {
  return getModalidadesComVideo(categorias).map((categoria) => ({
    slug: categoria.slug,
  }));
}

/**
 * Endereço fora da lista acima é 404 de verdade, e não 200 com a tela de 404
 * dentro: a recusa acontece na roteagem, antes de o corpo começar a ser
 * transmitido — e depois que ele começa, o status não pode mais mudar.
 */
export const dynamicParams = false;

export async function generateMetadata(
  props: PageProps<"/videos/modalidade/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const rotulo = rotuloDaCategoria(slug);

  return metadataDaPagina({
    titulo: `Vídeos de ${rotulo}`,
    descricao: descricaoDaModalidade(rotulo),
    caminho: `/videos/modalidade/${slug}`,
  });
}

export default async function VideosDaModalidadePage(
  props: PageProps<"/videos/modalidade/[slug]">
) {
  const { slug } = await props.params;

  // Modalidade inexistente ou sem vídeo nenhum é 404, e não uma grade vazia:
  // /videos/modalidade/xadrez não é uma página do portal.
  const existe = getModalidadesComVideo(categorias).some(
    (categoria) => categoria.slug === slug
  );

  if (!existe) {
    notFound();
  }

  return <ListaDeVideos modalidade={slug} pagina={1} />;
}
