"use client";

import { useState } from "react";
import ConteudoCard from "@/app/components/ConteudoCard";
import type { CardDeEntidade } from "@/lib/entidades";

export type FiltroDeOrganizacao = { slug: string; rotulo: string };

const TODAS = "todas";

/**
 * Grade de cards com filtro por organização.
 *
 * O filtro é do cliente e não da URL de propósito: a página segue estática e a
 * troca é instantânea, sem navegação. Uma entidade ligada a duas organizações
 * aparece nos dois filtros, mas nunca duas vezes na mesma tela.
 */
export default function GradeFiltravel({
  cards,
  filtros,
  rotuloDeTodas = "Todas",
  contagem,
}: {
  cards: CardDeEntidade[];
  filtros: FiltroDeOrganizacao[];
  /** Texto da primeira pastilha, que limpa o filtro. */
  rotuloDeTodas?: string;
  /** Singular e plural do que está listado, para a linha de contagem. */
  contagem: { singular: string; plural: string };
}) {
  const [ativo, setAtivo] = useState(TODAS);

  const visiveis =
    ativo === TODAS
      ? cards
      : cards.filter((card) => card.organizacoes.includes(ativo));

  // Sem pelo menos duas organizações não há o que filtrar: as pastilhas só
  // ocupariam espaço dizendo o que a grade toda já diz.
  const vaiFiltrar = filtros.length > 1;

  const pastilhas: FiltroDeOrganizacao[] = [
    { slug: TODAS, rotulo: rotuloDeTodas },
    ...filtros,
  ];

  const total = visiveis.length;
  const nomeDoTotal = total === 1 ? contagem.singular : contagem.plural;

  return (
    <div className="mt-8">
      {vaiFiltrar ? (
        <div className="border-b border-linha pb-5">
          <div
            role="group"
            aria-label="Filtrar por organização"
            className="flex flex-wrap gap-2"
          >
            {pastilhas.map((pastilha) => {
              const selecionada = pastilha.slug === ativo;

              return (
                <button
                  key={pastilha.slug}
                  type="button"
                  onClick={() => setAtivo(pastilha.slug)}
                  aria-pressed={selecionada}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca ${
                    selecionada
                      ? "border-marca bg-marca text-texto"
                      : "border-linha bg-superficie text-texto-corpo hover:border-linha-forte hover:text-texto"
                  }`}
                >
                  {pastilha.rotulo}
                </button>
              );
            })}
          </div>

          {/* Quem usa leitor de tela ouve o resultado do filtro; quem não usa
              tem a mesma informação escrita. */}
          <p aria-live="polite" className="mt-3 text-xs text-texto-fraco">
            {total} {nomeDoTotal}
          </p>
        </div>
      ) : null}

      <div
        className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${
          vaiFiltrar ? "mt-8" : ""
        }`}
      >
        {visiveis.map((card, indice) => (
          <ConteudoCard
            key={card.slug}
            href={card.href}
            titulo={card.nome}
            rotulo={card.rotulo}
            resumo={card.resumo}
            imagem={card.imagem?.url}
            posicaoDaImagem={card.imagem?.posicao}
            preload={indice === 0}
          />
        ))}
      </div>
    </div>
  );
}
