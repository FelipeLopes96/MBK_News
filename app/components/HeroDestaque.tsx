import Link from "next/link";
import ImagemNoticia from "@/app/components/ImagemNoticia";
import { formatarData, rotuloDaCategoria, type Noticia } from "@/lib/noticias";

export default function HeroDestaque({
  noticia,
  className = "",
}: {
  noticia: Noticia;
  /** Classes extras — a home usa para posicionar o hero no grid. */
  className?: string;
}) {
  return (
    <Link
      href={`/noticia/${noticia.slug}`}
      className={`group relative block overflow-hidden rounded-xl border border-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316] ${className}`}
    >
      {/* min-h no mobile: garante altura para o texto sobreposto mesmo em telas
          estreitas, onde só a proporção deixaria a imagem baixa demais. */}
      <div className="relative aspect-[16/9] min-h-52 w-full sm:aspect-[2/1] sm:min-h-0">
        <ImagemNoticia
          src={noticia.imagem}
          alt={noticia.title}
          sizes="(min-width: 1024px) 66vw, 100vw"
          preload
        />

        {/* Overlay em gradiente para o texto ficar legível sobre a imagem. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/70 to-transparent" />
      </div>

      {/* No mobile o texto sobreposto precisa caber na altura da imagem: por isso
          padding, tipografia e resumo mais curtos que no desktop. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 sm:gap-3 sm:p-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="rounded bg-[#F97316] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1A1A1A] sm:px-2.5 sm:py-1 sm:text-xs">
            {rotuloDaCategoria(noticia.categoria)}
          </span>
          <time
            dateTime={noticia.date}
            className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 sm:text-xs"
          >
            {formatarData(noticia.date)}
          </time>
        </div>

        <h2 className="line-clamp-3 text-xl font-bold leading-tight tracking-tight text-white transition-colors group-hover:text-[#F97316] sm:line-clamp-none sm:text-4xl">
          {noticia.title}
        </h2>

        <p className="line-clamp-2 max-w-2xl text-sm leading-6 text-zinc-300 sm:line-clamp-none sm:text-base sm:leading-7">
          {noticia.resumo}
        </p>
      </div>
    </Link>
  );
}
