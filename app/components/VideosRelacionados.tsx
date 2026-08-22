import SectionHeader from "@/app/components/SectionHeader";
import VideoCard from "@/app/components/VideoCard";
import { rotuloDaCategoria } from "@/lib/noticias";
import { getVideosDaNoticia, paraCardDeVideo } from "@/lib/videos";

/**
 * "Vídeos relacionados" no fim de uma matéria.
 *
 * A relação é declarada dentro do vídeo, no campo `noticias` — então publicar
 * um vídeo apontando para a matéria já o faz aparecer aqui, sem editar o `.md`
 * da matéria. Sem vídeo ligado, o bloco não existe.
 */
export default function VideosRelacionados({
  slugDaNoticia,
}: {
  slugDaNoticia: string;
}) {
  const videos = getVideosDaNoticia(slugDaNoticia);

  if (videos.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <SectionHeader titulo="Vídeos relacionados" />

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {videos.map((video) => (
          <VideoCard
            key={video.slug}
            video={paraCardDeVideo(video, rotuloDaCategoria(video.categoria))}
          />
        ))}
      </div>
    </section>
  );
}
