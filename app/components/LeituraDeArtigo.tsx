import type { ReactNode } from "react";
import Link from "next/link";
import Markdown from "react-markdown";
import Header from "@/app/components/Header";
import ImagemNoticia from "@/app/components/ImagemNoticia";
import NewsletterForm from "@/app/components/NewsletterForm";
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
    <div className="flex flex-1 flex-col bg-[#1A1A1A]">
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
          <span className="rounded bg-[#F97316] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#1A1A1A]">
            {rotuloCategoria}
          </span>
          <time
            dateTime={item.date}
            className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            {formatarData(item.date)}
          </time>
        </div>

        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          {item.title}
        </h1>

        {aviso}

        <div className="prose prose-invert mt-8 max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white prose-p:text-lg prose-p:leading-8 prose-p:text-zinc-300 prose-a:text-[#F97316] prose-blockquote:border-l-[#F97316] prose-blockquote:text-zinc-400 prose-strong:text-white prose-li:text-lg prose-li:leading-8 prose-li:text-zinc-300">
          <Markdown>{item.conteudo}</Markdown>
        </div>

        <div className="mt-12">
          <NewsletterForm />
        </div>

        <Link
          href={voltarHref}
          className="mt-12 inline-block text-sm font-medium text-[#F97316] hover:underline"
        >
          ← {voltarRotulo}
        </Link>
      </article>
    </div>
  );
}
