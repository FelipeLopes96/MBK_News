import Link from "next/link";
import ImagemNoticia from "@/app/components/ImagemNoticia";
import { formatarData, rotuloDaCategoria, type Noticia } from "@/lib/noticias";

export default function HeroDestaque({ noticia }: { noticia: Noticia }) {
  return (
    <Link
      href={`/noticia/${noticia.slug}`}
      className="group relative block overflow-hidden rounded-xl border border-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
    >
      <div className="relative aspect-[16/10] w-full sm:aspect-[2/1]">
        <ImagemNoticia
          src={noticia.imagem}
          alt={noticia.title}
          sizes="(min-width: 1024px) 66vw, 100vw"
          preload
        />

        {/* Overlay em gradiente para o texto ficar legível sobre a imagem. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/70 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="rounded bg-[#F97316] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#1A1A1A]">
            {rotuloDaCategoria(noticia.categoria)}
          </span>
          <time
            dateTime={noticia.date}
            className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
          >
            {formatarData(noticia.date)}
          </time>
        </div>

        <h2 className="text-2xl font-bold leading-tight tracking-tight text-white transition-colors group-hover:text-[#F97316] sm:text-4xl">
          {noticia.title}
        </h2>

        <p className="max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base sm:leading-7">
          {noticia.resumo}
        </p>
      </div>
    </Link>
  );
}
