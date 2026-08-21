import Link from "next/link";
import Etiqueta from "@/app/components/Etiqueta";
import ImagemNoticia from "@/app/components/ImagemNoticia";
import { formatarData, rotuloDaCategoria, type Noticia } from "@/lib/noticias";

export default function NoticiaCard({
  noticia,
  preload = false,
  className = "",
}: {
  noticia: Noticia;
  preload?: boolean;
  /** Classes extras no card — a home usa para ordená-lo dentro do grid. */
  className?: string;
}) {
  return (
    // Abaixo de sm o card é horizontal (imagem pequena à esquerda) para caber
    // mais notícia na tela; de sm em diante o grid vira 2 colunas e o card
    // volta a ser vertical.
    <Link
      href={`/noticia/${noticia.slug}`}
      className={`group flex overflow-hidden rounded-lg border border-linha bg-superficie transition-colors hover:border-marca focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca sm:flex-col ${className}`}
    >
      {/* No mobile a altura vem do estica do flex, acompanhando o texto ao lado. */}
      <div className="relative w-1/3 shrink-0 sm:aspect-video sm:w-full">
        <ImagemNoticia
          src={noticia.imagem?.url}
          alt={noticia.title}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 33vw"
          posicao={noticia.imagem?.posicao}
          preload={preload}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:gap-3 sm:p-5">
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

        <h3 className="line-clamp-3 text-base font-semibold leading-snug text-texto transition-colors group-hover:text-marca-clara sm:line-clamp-none sm:text-lg">
          {noticia.title}
        </h3>

        {/* No card horizontal do mobile a coluna de texto é estreita: o resumo
            dobraria a altura do card, então ele só aparece de sm em diante. */}
        <p className="hidden text-sm leading-6 text-texto-suave sm:block">
          {noticia.resumo}
        </p>
      </div>
    </Link>
  );
}
