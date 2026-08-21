import Link from "next/link";
import Etiqueta from "@/app/components/Etiqueta";
import ImagemNoticia from "@/app/components/ImagemNoticia";
import type { PosicaoDaImagem } from "@/lib/conteudo";

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
  posicaoDaImagem,
}: {
  href: string;
  titulo: string;
  /** Linha em laranja acima do título — categoria, tipo de entidade etc. */
  rotulo: string;
  resumo?: string;
  imagem?: string;
  preload?: boolean;
  /** Enquadramento do corte, para as fotos que não sobrevivem ao corte central. */
  posicaoDaImagem?: PosicaoDaImagem;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-lg border border-linha bg-superficie transition-colors hover:border-marca focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
    >
      <div className="relative aspect-video w-full">
        <ImagemNoticia
          src={imagem}
          alt={titulo}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          preload={preload}
          posicao={posicaoDaImagem}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <Etiqueta variante="texto">{rotulo}</Etiqueta>

        <h3 className="text-lg font-semibold leading-snug text-texto transition-colors group-hover:text-marca-clara">
          {titulo}
        </h3>

        {resumo ? (
          <p className="text-sm leading-6 text-texto-suave">{resumo}</p>
        ) : null}
      </div>
    </Link>
  );
}
