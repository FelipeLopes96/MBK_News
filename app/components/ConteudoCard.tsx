import Link from "next/link";
import ImagemNoticia from "@/app/components/ImagemNoticia";
import type { ItemDeConteudo } from "@/lib/conteudo";

export default function ConteudoCard({
  item,
  href,
  rotuloCategoria,
  preload = false,
}: {
  item: ItemDeConteudo;
  href: string;
  rotuloCategoria: string;
  preload?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-[#242424] transition-colors hover:border-[#F97316] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
    >
      <div className="relative aspect-video w-full">
        <ImagemNoticia
          src={item.imagem}
          alt={item.title}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          preload={preload}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#F97316]">
          {rotuloCategoria}
        </span>

        <h3 className="text-lg font-semibold leading-snug text-white transition-colors group-hover:text-[#F97316]">
          {item.title}
        </h3>

        <p className="text-sm leading-6 text-zinc-400">{item.resumo}</p>
      </div>
    </Link>
  );
}
