import Image from "next/image";
import type { PosicaoDaImagem } from "@/lib/conteudo";
import { NOME_DO_SITE } from "@/lib/seo";

type Props = {
  src?: string;
  alt: string;
  /** Repassado ao next/image para escolher a melhor resolução. */
  sizes: string;
  preload?: boolean;
  className?: string;
  /** Parte da foto preservada no corte. Ausente, o corte é centralizado. */
  posicao?: PosicaoDaImagem;
};

// Escritas por extenso porque o Tailwind só gera as classes que encontra no
// código — montar `object-${posicao}` deixaria todas de fora do CSS final.
const classeDaPosicao: Record<PosicaoDaImagem, string> = {
  centro: "object-center",
  topo: "object-top",
  base: "object-bottom",
  esquerda: "object-left",
  direita: "object-right",
};

/**
 * Imagem de notícia com fallback: quando o frontmatter não traz `imagem`,
 * renderiza um bloco cinza no lugar em vez de quebrar o layout.
 */
export default function ImagemNoticia({
  src,
  alt,
  sizes,
  preload = false,
  className = "",
  posicao,
}: Props) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 flex items-center justify-center bg-superficie-alta ${className}`}
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-texto-fraco">
          {NOME_DO_SITE}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      className={`object-cover ${posicao ? classeDaPosicao[posicao] : ""} ${className}`}
    />
  );
}
