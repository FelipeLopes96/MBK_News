"use client";

import { useState } from "react";
import FiltroDePastilhas, {
  type Pastilha,
} from "@/app/components/FiltroDePastilhas";
import VideoCard from "@/app/components/VideoCard";
import type { CardDeVideo } from "@/lib/videos";

const TODAS = "todas";

/**
 * Grade da biblioteca de vídeos, com filtro por modalidade.
 *
 * O filtro é do cliente e não da URL, como no Arquivo: a página segue estática
 * e a troca é instantânea. A busca por texto não fica aqui — vídeo entra no
 * índice da busca do portal, junto com matéria e acervo, e um segundo campo de
 * busca dentro da seção só competiria com o do cabeçalho.
 */
export default function BibliotecaDeVideos({
  videos,
  filtros,
}: {
  videos: CardDeVideo[];
  /** Modalidades presentes na biblioteca, na ordem da navegação. */
  filtros: Pastilha[];
}) {
  const [ativo, setAtivo] = useState(TODAS);

  const visiveis =
    ativo === TODAS
      ? videos
      : videos.filter((video) => video.categoria === ativo);

  // Com uma modalidade só não há o que filtrar: as pastilhas apenas repetiriam
  // o que a grade inteira já diz.
  const vaiFiltrar = filtros.length > 1;

  return (
    <div className="mt-8">
      {vaiFiltrar ? (
        <div className="border-b border-linha pb-5">
          <FiltroDePastilhas
            pastilhas={[{ slug: TODAS, rotulo: "Todos" }, ...filtros]}
            ativo={ativo}
            aoEscolher={setAtivo}
            rotuloDoGrupo="Filtrar por modalidade"
            contagem={`${visiveis.length} ${visiveis.length === 1 ? "vídeo" : "vídeos"}`}
          />
        </div>
      ) : null}

      <div
        className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${
          vaiFiltrar ? "mt-8" : ""
        }`}
      >
        {visiveis.map((video) => (
          <VideoCard key={video.slug} video={video} />
        ))}
      </div>
    </div>
  );
}
