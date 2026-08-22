"use client";

import Image from "next/image";
import { useState } from "react";
import type { FormatoDoVideo } from "@/lib/youtube";

/**
 * Player incorporado, com fachada.
 *
 * O iframe do YouTube custa perto de um megabyte de JavaScript e começa a
 * rastrear no carregamento. Enquanto ninguém clica, o que está na página é a
 * miniatura com um botão de play; o iframe entra no clique, já tocando. O vídeo
 * não é baixado nem hospedado — é o embed oficial, no domínio de privacidade
 * reforçada do YouTube.
 */
export default function VideoEmbed({
  videoId,
  titulo,
  thumbnail,
  formato,
  urlDoEmbed,
}: {
  videoId: string;
  titulo: string;
  thumbnail: string;
  formato: FormatoDoVideo;
  /** Montada no servidor por `lib/youtube.ts`. */
  urlDoEmbed: string;
}) {
  const [tocando, setTocando] = useState(false);
  const vertical = formato === "short";

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-linha bg-superficie ${
        vertical ? "mx-auto aspect-[9/16] max-w-sm" : "aspect-video"
      }`}
    >
      {tocando ? (
        <iframe
          // O id no `key` garante iframe novo se o vídeo da página mudar.
          key={videoId}
          src={urlDoEmbed}
          title={titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setTocando(true)}
          aria-label={`Assistir: ${titulo}`}
          className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-marca"
        >
          <Image
            src={thumbnail}
            alt=""
            fill
            sizes={vertical ? "(min-width: 640px) 384px, 100vw" : "(min-width: 1024px) 768px, 100vw"}
            // A miniatura oficial vem em 4:3 com tarjas; o corte come as tarjas
            // e sobra o quadro de dentro.
            className="object-cover"
            preload
          />

          <span className="absolute inset-0 bg-fundo/30 transition-colors group-hover:bg-fundo/10" />

          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-marca/90 shadow-lg transition-transform group-hover:scale-105 sm:h-20 sm:w-20">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ml-1 h-7 w-7 text-texto sm:h-9 sm:w-9"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
