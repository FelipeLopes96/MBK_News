import type { Metadata } from "next";
import BibliotecaDeVideos from "@/app/components/BibliotecaDeVideos";
import Container from "@/app/components/Container";
import SectionHeader from "@/app/components/SectionHeader";
import TituloDaPagina from "@/app/components/TituloDaPagina";
import VideoCard from "@/app/components/VideoCard";
import { categorias, rotuloDaCategoria } from "@/lib/noticias";
import { metadataDaPagina } from "@/lib/seo";
import {
  getTodosOsVideos,
  getVideosEmDestaque,
  paraCardDeVideo,
} from "@/lib/videos";

export const metadata: Metadata = metadataDaPagina({
  titulo: "Vídeos",
  descricao:
    "Entrevistas, coletivas, análises e cobertura em vídeo do MBK News: MMA, boxe, muay thai, jiu-jitsu, kickboxing e wrestling.",
  caminho: "/videos",
});

export default function VideosPage() {
  const todos = getTodosOsVideos();
  const [principal] = getVideosEmDestaque(1);

  // O destaque abre a página, então sai da grade abaixo — apareceria duas vezes.
  const naGrade = todos
    .filter((video) => video.slug !== principal?.slug)
    .map((video) => paraCardDeVideo(video, rotuloDaCategoria(video.categoria)));

  /**
   * Só as modalidades que têm vídeo, e na ordem da navegação: assim nenhuma
   * pastilha leva a uma grade vazia.
   */
  const presentes = new Set(naGrade.map((video) => video.categoria));
  const filtros = categorias
    .filter((categoria) => presentes.has(categoria.slug))
    .map((categoria) => ({ slug: categoria.slug, rotulo: categoria.rotulo }));

  return (
    <Container>
      <TituloDaPagina
        titulo="Vídeos"
        descricao="Entrevistas, coletivas, análises e cobertura em vídeo."
      />

      {todos.length === 0 ? (
        // Mesmo tratamento do Arsenal sem review: a seção existe e diz que está
        // em preparação, em vez de mostrar uma grade vazia.
        <div className="mt-16 flex flex-col items-center justify-center rounded-lg border border-linha px-6 py-20 text-center">
          <p className="font-manchete text-2xl font-bold uppercase tracking-wide text-texto">
            Em breve
          </p>
          <p className="mt-3 max-w-md text-texto-suave">
            A biblioteca de vídeos do MBK News está sendo montada. Volte em
            breve para conferir.
          </p>
        </div>
      ) : (
        <>
          {principal ? (
            <section className="mt-8">
              <SectionHeader titulo="Em destaque" />
              <div className="mt-6">
                <VideoCard
                  video={paraCardDeVideo(
                    principal,
                    rotuloDaCategoria(principal.categoria)
                  )}
                  variante="destaque"
                  preload
                />
              </div>
            </section>
          ) : null}

          {naGrade.length > 0 ? (
            <section className="mt-12">
              <SectionHeader titulo="Todos os vídeos" />
              <BibliotecaDeVideos videos={naGrade} filtros={filtros} />
            </section>
          ) : null}
        </>
      )}
    </Container>
  );
}
