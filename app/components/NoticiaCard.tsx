import Link from "next/link";
import Etiqueta from "@/app/components/Etiqueta";
import ImagemNoticia from "@/app/components/ImagemNoticia";
import { formatarData, rotuloDaCategoria, type Noticia } from "@/lib/noticias";

/**
 * Card de notícia em dois pesos.
 *
 * `media` é a chamada secundária logo abaixo do hero: sempre vertical, imagem
 * cheia e título grande. `padrao` é o card do feed — mais contido, e horizontal
 * no mobile para caber mais notícia na tela.
 *
 * A hierarquia é o ponto: uma home em que todo card tem o mesmo peso não diz
 * ao leitor o que é mais importante, e é isso que separa um portal de uma
 * lista de arquivos.
 */
export type VarianteDeCard = "media" | "padrao";

export default function NoticiaCard({
  noticia,
  variante = "padrao",
  preload = false,
  className = "",
}: {
  noticia: Noticia;
  variante?: VarianteDeCard;
  preload?: boolean;
  className?: string;
}) {
  const media = variante === "media";

  return (
    <Link
      href={`/noticia/${noticia.slug}`}
      className={`group flex overflow-hidden rounded-lg border border-linha bg-superficie transition-colors hover:border-marca focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca ${
        media ? "flex-col" : "sm:flex-col"
      } ${className}`}
    >
      {/* No card horizontal a altura vem do estica do flex, acompanhando o
          texto ao lado. */}
      <div
        className={
          media
            ? "relative aspect-video w-full"
            : "relative w-1/3 shrink-0 sm:aspect-video sm:w-full"
        }
      >
        <ImagemNoticia
          src={noticia.imagem?.url}
          alt={noticia.title}
          sizes={
            media
              ? "(min-width: 1024px) 33vw, 100vw"
              : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 33vw"
          }
          posicao={noticia.imagem?.posicao}
          preload={preload}
        />
      </div>

      <div
        className={`flex min-w-0 flex-1 flex-col gap-2 ${
          media ? "p-5 sm:gap-3" : "p-4 sm:gap-3 sm:p-5"
        }`}
      >
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide sm:gap-3 sm:text-xs">
          <Etiqueta variante="texto">
            {rotuloDaCategoria(noticia.categoria)}
          </Etiqueta>
          <span className="text-texto-fraco/70">•</span>
          <time
            dateTime={noticia.date}
            className="truncate whitespace-nowrap text-texto-fraco"
          >
            {formatarData(noticia.date)}
          </time>
        </div>

        <h3
          className={`font-semibold leading-snug text-texto transition-colors group-hover:text-marca-clara ${
            media
              ? "text-xl leading-tight"
              : "line-clamp-3 text-base sm:line-clamp-none sm:text-lg"
          }`}
        >
          {noticia.title}
        </h3>

        {/* No card horizontal do mobile a coluna de texto é estreita: o resumo
            dobraria a altura do card, então ele só aparece de sm em diante. */}
        <p
          className={`text-sm leading-6 text-texto-suave ${
            media ? "line-clamp-3" : "hidden sm:block"
          }`}
        >
          {noticia.resumo}
        </p>
      </div>
    </Link>
  );
}
