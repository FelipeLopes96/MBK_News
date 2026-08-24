import Link from "next/link";
import { redirect } from "next/navigation";
import { temSessao } from "@/lib/admin/sessao";
import { lerAgenda } from "@/lib/admin/eventos";
import type { Evento } from "@/lib/eventos";
import { dataDeHoje } from "@/lib/datas";
import FormularioDeEvento from "@/app/admin/eventos/FormularioDeEvento";
import ListaDaAgenda from "@/app/admin/eventos/ListaDaAgenda";

/** A agenda vem do GitHub a cada visita: depois de excluir, não pode voltar igual. */
export const dynamic = "force-dynamic";

export default async function EventosDoPainelPage() {
  if (!(await temSessao())) {
    redirect("/admin/login");
  }

  // Mesma proteção das outras telas: token vencido não pode virar stack trace.
  let agenda: Evento[];
  let erroDaAgenda = "";
  try {
    agenda = await lerAgenda();
  } catch (erro) {
    agenda = [];
    erroDaAgenda = erro instanceof Error ? erro.message : String(erro);
  }

  const hoje = dataDeHoje();

  // Do próximo para o mais distante; o que já passou desce para o fim, que é
  // onde a limpeza acontece.
  const ordenada = [...agenda].sort((a, b) => {
    const passouA = a.data < hoje;
    const passouB = b.data < hoje;
    if (passouA !== passouB) return passouA ? 1 : -1;
    return passouA ? b.data.localeCompare(a.data) : a.data.localeCompare(b.data);
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-texto">
            Próximos eventos
          </h1>
          <p className="mt-1 text-sm text-texto-fraco">
            A agenda de <code className="text-texto-suave">/eventos</code> e do
            módulo da home. Evento cuja data passou sai do site sozinho.
          </p>
        </div>

        <Link
          href="/admin"
          className="whitespace-nowrap text-sm text-texto-fraco hover:text-texto-corpo"
        >
          Nova notícia
        </Link>
      </header>

      {erroDaAgenda ? (
        <div
          role="alert"
          className="rounded-lg border border-red-900 bg-red-950/40 p-4"
        >
          <p className="font-semibold text-red-300">
            Não foi possível ler a agenda no GitHub.
          </p>
          <p className="mt-2 text-sm text-red-200">{erroDaAgenda}</p>
        </div>
      ) : (
        <>
          <FormularioDeEvento
            hoje={hoje}
            organizacoesUsadas={[
              ...new Set(agenda.map((evento) => evento.organizacao)),
            ].sort()}
          />

          <section className="mt-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-marca-clara">
              Na agenda
            </h2>

            <div className="mt-4">
              <ListaDaAgenda
                eventos={ordenada.map((evento) => ({
                  ...evento,
                  jaPassou: evento.data < hoje,
                }))}
              />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
