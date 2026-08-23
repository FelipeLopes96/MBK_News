import Link from "next/link";
import { redirect } from "next/navigation";
import { temSessao } from "@/lib/admin/sessao";
import { listarMaterias } from "@/lib/admin/materias";
import { rotuloDaCategoria } from "@/lib/noticias";
import ListaDeMaterias from "@/app/admin/materias/ListaDeMaterias";

/**
 * A lista sai do GitHub a cada visita, então nada de cache: depois de excluir
 * uma matéria, voltar para cá tem de mostrar a lista sem ela.
 */
export const dynamic = "force-dynamic";

export default async function MateriasPage() {
  // O `proxy.ts` já barra na borda; repetimos aqui para a página nunca
  // renderizar sem sessão caso o matcher mude.
  if (!(await temSessao())) {
    redirect("/admin/login");
  }

  /**
   * A lista depende do GitHub. Token vencido ou API fora do ar derrubariam a
   * página inteira com stack trace — e o editor não teria como saber que o
   * problema é a credencial, nem chegar ao formulário de publicar.
   */
  let materias;
  try {
    materias = await listarMaterias();
  } catch (erro) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-texto">
          Matérias publicadas
        </h1>
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-900 bg-red-950/40 p-4"
        >
          <p className="font-semibold text-red-300">
            Não foi possível ler as matérias no GitHub.
          </p>
          <p className="mt-2 text-sm text-red-200">
            {erro instanceof Error ? erro.message : String(erro)}
          </p>
        </div>
        <Link
          href="/admin"
          className="mt-6 inline-block text-sm text-texto-fraco hover:text-texto-corpo"
        >
          ← Nova notícia
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-texto">
            Matérias publicadas
          </h1>
          <p className="mt-1 text-sm text-texto-fraco">
            {materias.length === 1
              ? "1 matéria no repositório."
              : `${materias.length} matérias no repositório.`}{" "}
            Corrigir ou excluir cria um commit, e a Vercel republica em seguida.
          </p>
        </div>

        <Link
          href="/admin"
          className="whitespace-nowrap rounded-md bg-marca px-4 py-2 text-sm font-semibold text-texto hover:opacity-90"
        >
          Nova notícia
        </Link>
      </header>

      <ListaDeMaterias
        materias={materias.map((materia) => ({
          ...materia,
          rotuloDaCategoria: materia.categoria
            ? rotuloDaCategoria(materia.categoria)
            : "",
        }))}
      />
    </main>
  );
}
