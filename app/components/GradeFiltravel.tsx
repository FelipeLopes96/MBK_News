"use client";

import { useState } from "react";
import ConteudoCard from "@/app/components/ConteudoCard";
import FiltroDePastilhas, {
  type Pastilha,
} from "@/app/components/FiltroDePastilhas";
import type { CardDeEntidade } from "@/lib/entidades";

export type FiltroDeOrganizacao = Pastilha;

const TODAS = "todas";

/**
 * Grade de cards do Arquivo, com filtro por organização e por modalidade.
 *
 * Os filtros são do cliente e não da URL de propósito: a página segue estática
 * e a troca é instantânea, sem navegação. As duas dimensões se somam — escolher
 * "PRIDE" e "MMA" mostra quem é das duas coisas, não a união delas, que é o que
 * se espera de um acervo.
 *
 * Uma entidade ligada a duas organizações aparece nos dois filtros, mas nunca
 * duas vezes na mesma tela.
 */
export default function GradeFiltravel({
  cards,
  filtros,
  modalidades = [],
  rotuloDeTodas = "Todas",
  contagem,
}: {
  cards: CardDeEntidade[];
  filtros: FiltroDeOrganizacao[];
  /** Modalidades presentes, já separadas e ordenadas. */
  modalidades?: string[];
  /** Texto da primeira pastilha de organização, que limpa o filtro. */
  rotuloDeTodas?: string;
  /** Singular e plural do que está listado, para a linha de contagem. */
  contagem: { singular: string; plural: string };
}) {
  const [organizacao, setOrganizacao] = useState(TODAS);
  const [modalidade, setModalidade] = useState(TODAS);

  const visiveis = cards.filter((card) => {
    const daOrganizacao =
      organizacao === TODAS || card.organizacoes.includes(organizacao);
    const daModalidade =
      modalidade === TODAS || card.modalidades.includes(modalidade);

    return daOrganizacao && daModalidade;
  });

  // Sem pelo menos duas opções não há o que filtrar: as pastilhas só ocupariam
  // espaço dizendo o que a grade toda já diz.
  const filtrarPorOrganizacao = filtros.length > 1;
  const filtrarPorModalidade = modalidades.length > 1;
  const vaiFiltrar = filtrarPorOrganizacao || filtrarPorModalidade;

  const total = visiveis.length;
  const nomeDoTotal = total === 1 ? contagem.singular : contagem.plural;

  return (
    <div className="mt-8">
      {vaiFiltrar ? (
        <div className="flex flex-col gap-4 border-b border-linha pb-5">
          {filtrarPorOrganizacao ? (
            <FiltroDePastilhas
              pastilhas={[{ slug: TODAS, rotulo: rotuloDeTodas }, ...filtros]}
              ativo={organizacao}
              aoEscolher={setOrganizacao}
              rotuloDoGrupo="Filtrar por organização"
              // A contagem sai uma vez só, embaixo do último grupo.
              contagem={filtrarPorModalidade ? "" : `${total} ${nomeDoTotal}`}
            />
          ) : null}

          {filtrarPorModalidade ? (
            <FiltroDePastilhas
              pastilhas={[
                { slug: TODAS, rotulo: "Todas as modalidades" },
                ...modalidades.map((nome) => ({ slug: nome, rotulo: nome })),
              ]}
              ativo={modalidade}
              aoEscolher={setModalidade}
              rotuloDoGrupo="Filtrar por modalidade"
              contagem={`${total} ${nomeDoTotal}`}
            />
          ) : null}
        </div>
      ) : null}

      {total === 0 ? (
        <p className="mt-8 text-texto-suave">
          Nenhum resultado para esta combinação de filtros.
        </p>
      ) : (
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
      )}
    </div>
  );
}
