import ConteudoCard from "@/app/components/ConteudoCard";
import { rotuloDaEntidade, type Entidade } from "@/lib/entidades";

/** Prefixo de rota por tipo de entidade — usado para montar os links. */
const baseHrefPorTipo: Record<Entidade["tipo"], string> = {
  organizacao: "/arquivo/organizacoes",
  lenda: "/arquivo/lendas",
  momento: "/arquivo/momentos",
};

/**
 * Grade de cards de entidades, na mesma grade responsiva usada pelo Arquivo e
 * pelo Arsenal. Serve tanto às listagens quanto aos blocos de relacionados
 * dentro do hub de uma organização.
 */
export default function GradeDeEntidades({
  entidades,
  preloadPrimeiro = false,
  comOrganizacao = true,
}: {
  entidades: Entidade[];
  /** Prioriza o carregamento da primeira imagem (use só acima da dobra). */
  preloadPrimeiro?: boolean;
  /**
   * Cita a organização no rótulo da lenda. Desligue dentro do hub de uma
   * organização, onde o título da seção já diz de quem se trata.
   */
  comOrganizacao?: boolean;
}) {
  if (entidades.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {entidades.map((entidade, indice) => (
        <ConteudoCard
          key={`${entidade.tipo}-${entidade.slug}`}
          href={`${baseHrefPorTipo[entidade.tipo]}/${entidade.slug}`}
          titulo={entidade.nome}
          rotulo={rotuloDaEntidade(entidade, { comOrganizacao })}
          resumo={entidade.resumo}
          imagem={entidade.imagem?.url}
          posicaoDaImagem={entidade.imagem?.posicao}
          preload={preloadPrimeiro && indice === 0}
        />
      ))}
    </div>
  );
}
