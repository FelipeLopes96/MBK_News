import Image from "next/image";

type Props = {
  src?: string;
  alt: string;
  /** Repassado ao next/image para escolher a melhor resolução. */
  sizes: string;
  preload?: boolean;
  className?: string;
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
}: Props) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 flex items-center justify-center bg-zinc-800 ${className}`}
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
          O Corner
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
      className={`object-cover ${className}`}
    />
  );
}
