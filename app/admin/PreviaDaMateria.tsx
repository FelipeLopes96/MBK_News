"use client";

import Markdown from "react-markdown";
import BlocoDeFontes from "@/app/components/BlocoDeFontes";
import CreditoDeImagem from "@/app/components/CreditoDeImagem";
import {
  classeDoCorpoDaMateria,
  componentesDeMarkdown,
} from "@/app/components/markdownDeConteudo";
import type { Fonte, PosicaoDaImagem } from "@/lib/conteudo";

/**
 * Como a matéria vai sair em /noticia/[slug], montada com os mesmos
 * componentes da página real — react-markdown com `componentesDeMarkdown` e a
 * tipografia de `classeDoCorpoDaMateria`. A ordem dos blocos acompanha a da
 * página: capa, crédito, categoria e data, título, corpo, fontes.
 */

type Props = {
  title: string;
  date: string;
  categoria: string;
  corpo: string;
  fontes: Fonte[];
  capa?: {
    url: string;
    posicao?: PosicaoDaImagem;
    credito?: string;
    fonte?: string;
    licenca?: string;
  };
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

export default function PreviaDaMateria({
  title,
  date,
  categoria,
  corpo,
  fontes,
  capa,
}: Props) {
  return (
    <div className="rounded-lg border border-linha bg-fundo p-6 sm:p-8">
      <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-texto-fraco/70">
        Prévia — não é a página publicada
      </p>

      {capa ? (
        <>
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
          <CreditoDeImagem imagem={capa} />
        </>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-superficie-alta">
          <span className="text-xs font-semibold uppercase tracking-widest text-texto-fraco/70">
            Sem capa
          </span>
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <span className="rounded bg-marca px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-texto">
          {categoria}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-texto-fraco">
          {formatar(date)}
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-texto sm:text-4xl">
        {title || "Sem título"}
      </h1>

      {corpo.trim() ? (
        <div className={`mt-8 ${classeDoCorpoDaMateria}`}>
          <Markdown components={componentesDeMarkdown}>{corpo}</Markdown>
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
