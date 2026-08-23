"use client";

import Markdown, {
  defaultUrlTransform,
  type UrlTransform,
} from "react-markdown";
import BlocoDeFontes from "@/app/components/BlocoDeFontes";
import CreditoDeImagem from "@/app/components/CreditoDeImagem";
import {
  classeDoCorpoDaMateria,
  componentesDeMarkdown,
} from "@/app/components/markdownDeConteudo";
// Só o tipo, que o TypeScript apaga na compilação: `lib/conteudo` lê disco e
// não pode atravessar para o navegador. Antes esta prévia redeclarava o formato
// da capa à mão, e a cópia já ficou para trás quando a imagem ganhou campo novo.
import type { Fonte, ImagemComCredito } from "@/lib/conteudo";

/**
 * Como a matéria vai sair em /noticia/[slug], montada com os mesmos
 * componentes da página real — react-markdown com `componentesDeMarkdown` e a
 * tipografia de `classeDoCorpoDaMateria`.
 *
 * A ordem dos blocos acompanha a da página: categoria, título, assinatura e
 * data, capa com crédito, corpo, fontes. Se as duas divergirem, a prévia deixa
 * de valer como prévia.
 */

type Props = {
  title: string;
  date: string;
  categoria: string;
  corpo: string;
  fontes: Fonte[];
  /** Assinatura da matéria, como sairá publicada. */
  autor: string;
  capa?: ImagemComCredito;
};

// Espelha `classeDaPosicao` de ImagemNoticia — o Tailwind só gera as classes
// que encontra escritas por extenso no código.
const classeDaPosicao: Record<string, string> = {
  centro: "object-center",
  topo: "object-top",
  base: "object-bottom",
  esquerda: "object-left",
  direita: "object-right",
};

/**
 * `formatarData` vive em lib/noticias.ts, que lê o disco — importar aqui
 * arrastaria `node:fs` para o bundle do navegador. O formato é o mesmo.
 */
const formatador = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatar(data: string): string {
  const quando = new Date(data);
  return Number.isNaN(quando.getTime()) ? "" : formatador.format(quando);
}

/**
 * As fotos do meio do texto ainda são arquivos no navegador, e o react-markdown
 * apaga endereço de protocolo que não conhece — `blob:` sai como string vazia e
 * a prévia perderia justamente a imagem que o editor quer conferir. A liberação
 * vale só aqui: nas páginas do site o corpo vem do repositório, onde blob URL
 * não existe e continuaria sendo coisa para descartar.
 */
const permitirBlob: UrlTransform = (url) =>
  url.startsWith("blob:") ? url : defaultUrlTransform(url);

export default function PreviaDaMateria({
  title,
  date,
  categoria,
  corpo,
  fontes,
  autor,
  capa,
}: Props) {
  return (
    <div className="rounded-lg border border-linha bg-fundo p-6 sm:p-8">
      <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-texto-fraco/70">
        Prévia — não é a página publicada
      </p>

      {/* Manchete antes da foto, como na página real. */}
      <span className="inline-block rounded bg-marca px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-texto">
        {categoria}
      </span>

      <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-texto sm:text-4xl">
        {title || "Sem título"}
      </h1>

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-linha pt-4 text-xs font-semibold uppercase tracking-wide">
        <span className="text-texto-corpo">{autor}</span>
        <span aria-hidden="true" className="text-texto-fraco/70">
          •
        </span>
        <span className="text-texto-fraco">{formatar(date)}</span>
      </div>

      {capa ? (
        <figure className="mt-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            {/* A capa ainda é um arquivo local no navegador (blob URL), que o
                next/image não otimiza — aqui só interessa o enquadramento. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capa.url}
              alt={title}
              className={`size-full object-cover ${classeDaPosicao[capa.posicao ?? ""] ?? ""}`}
            />
          </div>
          <figcaption>
            <CreditoDeImagem imagem={capa} />
          </figcaption>
        </figure>
      ) : (
        <div className="mt-8 flex aspect-video w-full items-center justify-center rounded-lg bg-superficie-alta">
          <span className="text-xs font-semibold uppercase tracking-widest text-texto-fraco/70">
            Sem capa
          </span>
        </div>
      )}

      {corpo.trim() ? (
        <div className={`mt-8 ${classeDoCorpoDaMateria}`}>
          <Markdown components={componentesDeMarkdown} urlTransform={permitirBlob}>
            {corpo}
          </Markdown>
        </div>
      ) : (
        <p className="mt-8 text-sm italic text-texto-fraco/70">
          O corpo da matéria ainda está vazio.
        </p>
      )}

      <BlocoDeFontes fontes={fontes} />
    </div>
  );
}
