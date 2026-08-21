import type { ReactNode } from "react";
import Link from "next/link";
import Markdown from "react-markdown";
import Etiqueta from "@/app/components/Etiqueta";
import Header from "@/app/components/Header";
import ImagemNoticia from "@/app/components/ImagemNoticia";
import {
  classeDoCorpoDaMateria,
  componentesDeMarkdown,
} from "@/app/components/markdownDeConteudo";
import { formatarData, type ItemDeConteudo } from "@/lib/conteudo";

/** Layout de leitura compartilhado pelas seções Arquivo e Arsenal. */
export default function LeituraDeArtigo({
  item,
  rotuloCategoria,
  voltarHref,
  voltarRotulo,
  aviso,
}: {
  item: ItemDeConteudo;
  rotuloCategoria: string;
  voltarHref: string;
  voltarRotulo: string;
  /** Conteúdo opcional entre o título e o corpo (ex.: aviso de afiliados). */
  aviso?: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-fundo">
      <Header />

      <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <ImagemNoticia
            src={item.imagem}
            alt={item.title}
            sizes="(min-width: 768px) 768px, 100vw"
            preload
          />
        </div>

        <div className="mt-8 flex items-center gap-3">
          <Etiqueta>{rotuloCategoria}</Etiqueta>
          <time
            dateTime={item.date}
            className="text-xs font-semibold uppercase tracking-wide text-texto-fraco"
          >
            {formatarData(item.date)}
          </time>
        </div>

        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-texto sm:text-4xl">
          {item.title}
        </h1>

        {aviso}

        <div className={`mt-8 ${classeDoCorpoDaMateria}`}>
          <Markdown components={componentesDeMarkdown}>{item.conteudo}</Markdown>
        </div>

        <Link
          href={voltarHref}
          className="mt-12 inline-block text-sm font-medium text-marca-clara hover:underline"
        >
          ← {voltarRotulo}
        </Link>
      </article>
    </div>
  );
}
