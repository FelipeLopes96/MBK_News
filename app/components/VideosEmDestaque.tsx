import SectionHeader from "@/app/components/SectionHeader";
import VideoCard from "@/app/components/VideoCard";
import { rotuloDaCategoria } from "@/lib/noticias";
import { getVideosEmDestaque, paraCardDeVideo } from "@/lib/videos";

/** Quantos entram na coluna lateral da home: um em destaque e dois abaixo. */
const NA_HOME = 3;

/**
 * Módulo de vídeos da home.
 *
 * O primeiro vem com miniatura cheia, para o bloco ser reconhecido como vídeo
 * de longe; os outros entram como lista compacta, que é o que caberia numa
 * coluna estreita sem empurrar o resto da lateral para baixo.
 *
 * Sem vídeo cadastrado, o módulo não renderiza.
 */
export default function VideosEmDestaque() {
  const videos = getVideosEmDestaque(NA_HOME);

  if (videos.length === 0) {
    return null;
  }

  const [principal, ...demais] = videos.map((video) =>
    paraCardDeVideo(video, rotuloDaCategoria(video.categoria))
  );

  return (
    <section className="rounded-lg border border-linha bg-superficie p-6">
      <SectionHeader
        titulo="Vídeos"
        variante="modulo"
        acao={{ rotulo: "Ver todos", href: "/videos" }}
      />

      <div className="mt-4 flex flex-col gap-4">
        <VideoCard video={principal} />

        {demais.map((video) => (
          <VideoCard key={video.slug} video={video} variante="compacta" />
        ))}
      </div>
    </section>
  );
}
