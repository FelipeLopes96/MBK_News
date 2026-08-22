import Image from "next/image";
import Link from "next/link";
import Etiqueta from "@/app/components/Etiqueta";
import { formatarData } from "@/lib/datas";
import type { CardDeVideo } from "@/lib/videos";

/**
 * Card de vídeo.
 *
 * Leva o leitor para a página do vídeo dentro do portal, não para o YouTube: é
 * ali que ficam a descrição, os vídeos relacionados e as matérias ligadas a
 * ele. O selo de play e a duração sobre a miniatura são o que fazem o card ser
 * lido como vídeo à primeira vista, e não como notícia.
 */
export default function VideoCard({
  video,
  variante = "padrao",
  preload = false,
}: {
  video: CardDeVideo;
  /** `destaque` é o vídeo principal da biblioteca — miniatura e título maiores. */
  variante?: "destaque" | "padrao" | "compacta";
  preload?: boolean;
}) {
  const destaque = variante === "destaque";
  const compacta = variante === "compacta";

  return (
    <Link
      href={`/videos/${video.slug}`}
      className={`group flex overflow-hidden rounded-lg border border-linha bg-superficie transition-colors hover:border-marca focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca ${
        compacta ? "gap-3 p-3" : "flex-col"
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden ${
          compacta ? "w-32 rounded-md" : "w-full"
        } ${video.formato === "short" && !compacta ? "aspect-[4/5]" : "aspect-video"}`}
      >
        <Image
          src={video.thumbnail}
          alt=""
          fill
          sizes={
            compacta
              ? "128px"
              : destaque
                ? "(min-width: 1024px) 768px, 100vw"
                : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          }
          // A miniatura oficial do YouTube vem em 4:3 com tarjas em cima e
          // embaixo; o corte as descarta e sobra o quadro de dentro.
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          preload={preload}
        />

        {/* Selo de play: é o que diz "isto é vídeo" antes de qualquer texto. */}
        <span
          className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-fundo/70 transition-colors group-hover:bg-marca/90 ${
            compacta ? "h-8 w-8" : destaque ? "h-16 w-16" : "h-12 w-12"
          }`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`ml-0.5 text-texto ${compacta ? "h-4 w-4" : destaque ? "h-7 w-7" : "h-5 w-5"}`}
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>

        {video.duracao ? (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-fundo/85 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-texto">
            {video.duracao}
          </span>
        ) : null}
      </div>

      <div
        className={`flex min-w-0 flex-1 flex-col gap-2 ${
          compacta ? "" : destaque ? "p-5 sm:p-6" : "p-4 sm:p-5"
        }`}
      >
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide sm:gap-3 sm:text-xs">
          <Etiqueta variante="texto">{video.rotulo}</Etiqueta>
          {video.publicadoEm && !compacta ? (
            <>
              <span className="text-texto-fraco/70">•</span>
              <time
                dateTime={video.publicadoEm}
                className="truncate whitespace-nowrap text-texto-fraco"
              >
                {formatarData(video.publicadoEm)}
              </time>
            </>
          ) : null}
        </div>

        <h3
          className={`font-semibold leading-snug text-texto transition-colors group-hover:text-marca-clara ${
            compacta
              ? "line-clamp-3 text-sm"
              : destaque
                ? "text-xl leading-tight sm:text-2xl"
                : "line-clamp-3 text-base"
          }`}
        >
          {video.title}
        </h3>

        {video.canal && !compacta ? (
          <p className="text-xs text-texto-fraco">{video.canal}</p>
        ) : null}
      </div>
    </Link>
  );
}
