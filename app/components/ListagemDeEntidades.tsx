import Breadcrumbs, { type Migalha } from "@/app/components/Breadcrumbs";
import GradeDeEntidades from "@/app/components/GradeDeEntidades";
import GradeFiltravel from "@/app/components/GradeFiltravel";
import Header from "@/app/components/Header";
import NavDoArquivo from "@/app/components/NavDoArquivo";
import {
  organizacoesPresentes,
  paraCardDeEntidade,
  type Entidade,
} from "@/lib/entidades";

/**
 * Página de listagem de entidades do Arquivo — organizações, lendas, momentos.
 * Mesma largura, espaçamento e grade das páginas /arquivo e /arsenal.
 */
export default function ListagemDeEntidades({
  trilha,
  titulo,
  descricao,
  entidades,
  mensagemVazia,
  filtroPorOrganizacao,
}: {
  trilha: Migalha[];
  titulo: string;
  descricao: string;
  entidades: Entidade[];
  mensagemVazia: string;
  /**
   * Liga o filtro por organização acima da grade. O singular e o plural são do
   * que está listado ("lenda"/"lendas"), usados na linha de contagem.
   */
  filtroPorOrganizacao?: { singular: string; plural: string };
}) {
  return (
    <div className="flex flex-1 flex-col bg-[#1A1A1A]">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Breadcrumbs trilha={trilha} />

        <NavDoArquivo />

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">
          {titulo}
        </h1>
        <p className="mt-2 text-zinc-400">{descricao}</p>

        {entidades.length === 0 ? (
          <p className="mt-8 text-zinc-400">{mensagemVazia}</p>
        ) : filtroPorOrganizacao ? (
          // O mapeamento acontece aqui, no servidor: a grade filtrável é
          // Client Component e não pode ler o disco para resolver os rótulos.
          <GradeFiltravel
            cards={entidades.map((entidade) => paraCardDeEntidade(entidade))}
            filtros={organizacoesPresentes(entidades)}
            contagem={filtroPorOrganizacao}
          />
        ) : (
          <div className="mt-8">
            <GradeDeEntidades entidades={entidades} preloadPrimeiro />
          </div>
        )}
      </main>
    </div>
  );
}
