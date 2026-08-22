export type Pastilha = { slug: string; rotulo: string };

/**
 * Fileira de pastilhas de filtro, com a contagem do resultado embaixo.
 *
 * Compartilhada pelo Arquivo (filtra por organização) e pela biblioteca de
 * vídeos (por modalidade). Eram duas telas com a mesma função, e a segunda a ser
 * escrita já ia divergir da primeira no padding e na cor do estado ativo.
 *
 * Não traz `"use client"`: quem escolhe é sempre um componente de cliente, que
 * passa o `aoEscolher` — este aqui só desenha.
 */
export default function FiltroDePastilhas({
  pastilhas,
  ativo,
  aoEscolher,
  rotuloDoGrupo,
  contagem,
}: {
  pastilhas: Pastilha[];
  ativo: string;
  aoEscolher: (slug: string) => void;
  /** Descreve o grupo para leitor de tela — ex.: "Filtrar por modalidade". */
  rotuloDoGrupo: string;
  /** Linha de resultado — ex.: "4 vídeos". Vazia, a linha não aparece. */
  contagem: string;
}) {
  return (
    <div>
      <div role="group" aria-label={rotuloDoGrupo} className="flex flex-wrap gap-2">
        {pastilhas.map((pastilha) => {
          const selecionada = pastilha.slug === ativo;

          return (
            <button
              key={pastilha.slug}
              type="button"
              onClick={() => aoEscolher(pastilha.slug)}
              aria-pressed={selecionada}
              // 44px de altura no celular; de sm em diante a pastilha volta ao
              // tamanho compacto que a fileira pede.
              className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca sm:min-h-9 ${
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

      {/* Quem usa leitor de tela ouve o resultado do filtro; quem não usa tem a
          mesma informação escrita. Com dois grupos de pastilhas, a contagem sai
          uma vez só — embaixo do último. */}
      {contagem ? (
        <p aria-live="polite" className="mt-3 text-xs text-texto-fraco">
          {contagem}
        </p>
      ) : null}
    </div>
  );
}
