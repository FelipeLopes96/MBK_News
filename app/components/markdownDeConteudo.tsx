import Image from "next/image";
import type { Components } from "react-markdown";
import CreditoDeImagem from "@/app/components/CreditoDeImagem";
import { lerLegendaDaImagem } from "@/lib/imagensNoCorpo";

/**
 * Componentes usados pelo react-markdown no corpo das matérias.
 *
 * Imagens escritas no .md — ![alt](/noticias/arquivo.jpg "legenda opcional") —
 * passam pelo next/image em vez de virar um <img> cru, e o `title` do Markdown
 * vira a legenda embaixo da foto.
 *
 * O `title` também aceita a fonte da imagem e o aviso de IA depois de barras
 * verticais: ![alt](/noticias/foto.jpg "legenda|https://origem|ia"). A legenda
 * fica na figcaption e o resto vira a linha de crédito, igual à foto de capa.
 * O formato é montado e lido em `lib/imagensNoCorpo.ts` — o painel escreve
 * essas linhas sozinho, a partir do que o editor preencheu.
 */
/**
 * Tipografia do texto longo — matéria, artigo do Arquivo, história de entidade.
 *
 * É uma constante única de propósito: antes esta lista de classes estava
 * copiada literalmente em cinco lugares e já havia divergido entre eles. A
 * prévia do painel também renderiza por aqui — se divergir, deixa de valer como
 * prévia. O espaçamento externo fica no chamador: é posição na página, não
 * tipografia.
 */
export const classeDoCorpoDaMateria =
  "prose prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-texto prose-p:text-lg prose-p:leading-8 prose-p:text-texto-corpo prose-a:text-marca-clara prose-a:decoration-marca/50 prose-blockquote:border-l-marca prose-blockquote:text-texto-suave prose-strong:text-texto prose-li:text-lg prose-li:leading-8 prose-li:text-texto-corpo";

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

    const { legenda, fonte, geradaPorIA } = lerLegendaDaImagem(title);

    return (
      <figure className="my-8">
        {src.startsWith("blob:") ? (
          // Arquivo ainda só no navegador, na prévia do painel: o next/image
          // otimiza pela URL e não tem como buscar uma blob. Aqui interessa
          // conferir o enquadramento, não o formato servido.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt ?? ""} className="h-auto w-full rounded-lg" />
        ) : (
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
        )}
        {legenda ? (
          <figcaption className="mt-3 text-center text-sm leading-6 text-texto-fraco">
            {legenda}
          </figcaption>
        ) : null}
        {/* Sem fonte, a linha ainda sai quando a imagem é de IA: o aviso vale por
            si, porque diz ao leitor que aquilo não é registro do que aconteceu. */}
        {fonte || geradaPorIA ? (
          <div className="text-center">
            <CreditoDeImagem imagem={{ url: src, fonte, geradaPorIA }} />
          </div>
        ) : null}
      </figure>
    );
  },
};
