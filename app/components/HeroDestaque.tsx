import Link from "next/link";
import Etiqueta from "@/app/components/Etiqueta";
import ImagemNoticia from "@/app/components/ImagemNoticia";
import { formatarData, rotuloDaCategoria, type Noticia } from "@/lib/noticias";

/**
 * Manchete principal da home.
 *
 * O texto fica sobre a foto, não abaixo dela: é o que faz a chamada principal
 * pesar mais que qualquer card da página sem precisar de moldura nem de cor
 * extra. A condensada aparece aqui — em manchete grande ela dá o tom de veículo
 * esportivo, e nos cards seria só ruído.
 */
export default function HeroDestaque({
  noticia,
  className = "",
}: {
  noticia: Noticia;
  className?: string;
}) {
  return (
    <Link
      href={`/noticia/${noticia.slug}`}
      className={`group relative block overflow-hidden rounded-xl border border-linha focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca ${className}`}
    >
      {/* min-h no mobile: garante altura para o texto sobreposto mesmo em telas
          estreitas, onde só a proporção deixaria a imagem baixa demais. */}
      <div className="relative aspect-[16/9] min-h-64 w-full sm:aspect-[2/1] sm:min-h-0">
        <ImagemNoticia
          src={noticia.imagem?.url}
          alt={noticia.title}
          sizes="(min-width: 1024px) 66vw, 100vw"
          posicao={noticia.imagem?.posicao}
          preload
        />

        {/* Duas camadas: o gradiente de baixo sustenta o texto e o véu inteiro
            tira o brilho da foto, para o título não competir com ela. */}
        <div className="absolute inset-0 bg-gradient-to-t from-fundo via-fundo/80 to-transparent" />
        <div className="absolute inset-0 bg-fundo/10 transition-colors group-hover:bg-fundo/0" />
      </div>

      {/* No mobile o texto sobreposto precisa caber na altura da imagem: por isso
          padding, tipografia e resumo mais curtos que no desktop. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 p-5 sm:gap-3 sm:p-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Etiqueta>{rotuloDaCategoria(noticia.categoria)}</Etiqueta>
          <time
            dateTime={noticia.date}
            className="text-[10px] font-semibold uppercase tracking-wide text-texto-suave sm:text-xs"
          >
            {formatarData(noticia.date)}
          </time>
          <span aria-hidden="true" className="text-texto-fraco/70">
            •
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-texto-suave sm:text-xs">
            {noticia.autor}
          </span>
        </div>

        {/*
          O texto fica sobre a foto e cresce para cima. Sem teto de linhas, uma
          manchete longa numa tela estreita sobe por cima da imagem inteira e
          acaba cortada pelo `overflow-hidden` do quadro. De sm em diante há
          largura para a manchete respirar e o teto sai.
        */}
        <h2 className="line-clamp-3 font-manchete text-3xl font-bold leading-[1.05] text-texto transition-colors group-hover:text-marca-clara sm:line-clamp-none sm:text-5xl">
          {noticia.title}
        </h2>

        {/* O olho, quando a matéria tem um; senão o resumo faz esse papel. */}
        <p className="line-clamp-2 max-w-2xl text-sm leading-6 text-texto-corpo sm:line-clamp-3 sm:text-base sm:leading-7">
          {noticia.subtitulo ?? noticia.resumo}
        </p>
      </div>
    </Link>
  );
}
