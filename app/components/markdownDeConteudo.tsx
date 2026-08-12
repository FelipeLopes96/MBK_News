import Image from "next/image";
import type { Components } from "react-markdown";

/**
 * Componentes usados pelo react-markdown no corpo das matérias.
 *
 * Imagens escritas no .md — ![alt](/noticias/arquivo.jpg "legenda opcional") —
 * passam pelo next/image em vez de virar um <img> cru, e o `title` do Markdown
 * vira a legenda embaixo da foto.
 */
export const componentesDeMarkdown: Components = {
  // Uma imagem sozinha na linha é um parágrafo com um único filho no Markdown.
  // Como trocamos a imagem por um <figure>, o <p> em volta seria HTML inválido
  // e quebraria a hidratação — então desembrulhamos esse caso.
  p({ node, children }) {
    const filhos = node?.children ?? [];
    const soUmaImagem =
      filhos.length === 1 &&
      filhos[0].type === "element" &&
      filhos[0].tagName === "img";

    return soUmaImagem ? <>{children}</> : <p>{children}</p>;
  },

  img({ src, alt, title }) {
    if (typeof src !== "string" || !src) {
      return null;
    }

    return (
      <figure className="my-8">
        <Image
          src={src}
          alt={alt ?? ""}
          // Proporção declarada só para reservar espaço antes do carregamento;
          // `h-auto` faz o render final seguir a proporção real do arquivo.
          width={1600}
          height={900}
          sizes="(min-width: 768px) 768px, 100vw"
          className="h-auto w-full rounded-lg"
        />
        {title ? (
          <figcaption className="mt-3 text-center text-sm leading-6 text-zinc-500">
            {title}
          </figcaption>
        ) : null}
      </figure>
    );
  },
};
