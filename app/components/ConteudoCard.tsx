import Link from "next/link";
import ImagemNoticia from "@/app/components/ImagemNoticia";

/**
 * Card em grade usado pelo Arquivo, pelo Arsenal e pelas entidades do Arquivo
 * (organizações, lendas, momentos). Recebe campos soltos em vez de um tipo de
 * conteúdo específico justamente para servir a todos eles.
 */
export default function ConteudoCard({
  href,
  titulo,
  rotulo,
  resumo,
  imagem,
  preload = false,
}: {
  href: string;
  titulo: string;
  /** Linha em laranja acima do título — categoria, tipo de entidade etc. */
  rotulo: string;
  resumo?: string;
  imagem?: string;
  preload?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-[#242424] transition-colors hover:border-[#F97316] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
    >
      <div className="relative aspect-video w-full">
        <ImagemNoticia
          src={imagem}
          alt={titulo}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          preload={preload}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#F97316]">
          {rotulo}
        </span>

        <h3 className="text-lg font-semibold leading-snug text-white transition-colors group-hover:text-[#F97316]">
          {titulo}
        </h3>

        {resumo ? (
          <p className="text-sm leading-6 text-zinc-400">{resumo}</p>
        ) : null}
      </div>
    </Link>
  );
}
