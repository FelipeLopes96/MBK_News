import Link from "next/link";
import ImagemNoticia from "@/app/components/ImagemNoticia";
import { formatarData, rotuloDaCategoria, type Noticia } from "@/lib/noticias";

export default function NoticiaCard({
  noticia,
  preload = false,
}: {
  noticia: Noticia;
  preload?: boolean;
}) {
  return (
    <Link
      href={`/noticia/${noticia.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-[#242424] transition-colors hover:border-[#F97316] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
    >
      <div className="relative aspect-video w-full">
        <ImagemNoticia
          src={noticia.imagem}
          alt={noticia.title}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          preload={preload}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide">
          <span className="text-[#F97316]">
            {rotuloDaCategoria(noticia.categoria)}
          </span>
          <span className="text-zinc-600">•</span>
          <time dateTime={noticia.date} className="text-zinc-500">
            {formatarData(noticia.date)}
          </time>
        </div>

        <h3 className="text-lg font-semibold leading-snug text-white transition-colors group-hover:text-[#F97316]">
          {noticia.title}
        </h3>

        <p className="text-sm leading-6 text-zinc-400">{noticia.resumo}</p>
      </div>
    </Link>
  );
}
