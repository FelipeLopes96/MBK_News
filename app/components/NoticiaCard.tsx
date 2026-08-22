import Link from "next/link";
import Etiqueta from "@/app/components/Etiqueta";
import ImagemNoticia from "@/app/components/ImagemNoticia";
import { formatarData, rotuloDaCategoria, type Noticia } from "@/lib/noticias";

/**
 * Card de notícia em três pesos.
 *
 * `lead` abre uma listagem: ocupa a linha inteira, com a foto ao lado do texto.
 * `media` é a chamada secundária da home — sempre vertical, imagem cheia e
 * título grande. `padrao` é o card do feed, mais contido, horizontal no mobile
 * para caber mais notícia na tela.
 *
 * A hierarquia é o ponto: uma página em que todo card tem o mesmo peso não diz
 * ao leitor o que é mais importante, e é o que separa um portal de uma lista de
 * arquivos.
 */
export type VarianteDeCard = "lead" | "media" | "padrao";

type Estilo = {
  caixa: string;
  imagem: string;
  sizes: string;
  conteudo: string;
  titulo: string;
  resumo: string;
};

const estilos: Record<VarianteDeCard, Estilo> = {
  lead: {
    caixa: "flex-col sm:flex-row",
    imagem: "relative aspect-video w-full sm:w-1/2 sm:shrink-0",
    sizes: "(min-width: 640px) 50vw, 100vw",
    conteudo: "justify-center p-5 sm:gap-3 sm:p-7",
    titulo: "text-xl leading-tight sm:text-2xl",
    resumo: "line-clamp-3 sm:text-base sm:leading-7",
  },
  /**
   * `media` só é grande de sm em diante, onde as duas chamadas ficam lado a
   * lado. Empilhada no celular ela media 470px — quase o dobro do hero, de 258
   * — e a página abria com dois pseudo-heros maiores que a manchete, invertendo
   * a hierarquia. Abaixo de sm ela se comporta como o card do feed.
   */
  media: {
    caixa: "sm:flex-col",
    imagem: "relative w-1/3 shrink-0 sm:aspect-video sm:w-full",
    sizes: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 33vw",
    conteudo: "p-4 sm:gap-3 sm:p-5",
    titulo: "line-clamp-3 text-base sm:line-clamp-none sm:text-xl sm:leading-tight",
    resumo: "hidden sm:line-clamp-3 sm:block",
  },
  padrao: {
    // Abaixo de sm o card é horizontal (imagem pequena à esquerda); de sm em
    // diante o grid vira duas colunas e ele volta a ser vertical.
    caixa: "sm:flex-col",
    imagem: "relative w-1/3 shrink-0 sm:aspect-video sm:w-full",
    sizes: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 33vw",
    conteudo: "p-4 sm:gap-3 sm:p-5",
    titulo: "line-clamp-3 text-base sm:line-clamp-none sm:text-lg",
    // No card horizontal do mobile a coluna de texto é estreita: o resumo
    // dobraria a altura do card, então só aparece de sm em diante.
    resumo: "hidden sm:block",
  },
};

export default function NoticiaCard({
  noticia,
  variante = "padrao",
  preload = false,
  className = "",
}: {
  noticia: Noticia;
  variante?: VarianteDeCard;
  preload?: boolean;
  className?: string;
}) {
  const estilo = estilos[variante];

  return (
    <Link
      href={`/noticia/${noticia.slug}`}
      className={`group flex overflow-hidden rounded-lg border border-linha bg-superficie transition-colors hover:border-marca focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca ${estilo.caixa} ${className}`}
    >
      {/* No card horizontal a altura vem do estica do flex, acompanhando o
          texto ao lado. */}
      <div className={estilo.imagem}>
        <ImagemNoticia
          src={noticia.imagem?.url}
          alt={noticia.title}
          sizes={estilo.sizes}
          posicao={noticia.imagem?.posicao}
          preload={preload}
        />
      </div>

      <div
        className={`flex min-w-0 flex-1 flex-col gap-2 ${estilo.conteudo}`}
      >
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide sm:gap-3 sm:text-xs">
          <Etiqueta variante="texto">
            {rotuloDaCategoria(noticia.categoria)}
          </Etiqueta>
          <span className="text-texto-fraco/70">•</span>
          <time
            dateTime={noticia.date}
            className="truncate whitespace-nowrap text-texto-fraco"
          >
            {formatarData(noticia.date)}
          </time>
        </div>

        <h3
          className={`font-semibold leading-snug text-texto transition-colors group-hover:text-marca-clara ${estilo.titulo}`}
        >
          {noticia.title}
        </h3>

        <p className={`text-sm leading-6 text-texto-suave ${estilo.resumo}`}>
          {noticia.resumo}
        </p>
      </div>
    </Link>
  );
}
