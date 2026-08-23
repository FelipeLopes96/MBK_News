import Link from "next/link";
import { redirect } from "next/navigation";
import { temSessao } from "@/lib/admin/sessao";
import { categorias } from "@/lib/noticias";
import { dataDeHoje, POSICOES_DA_IMAGEM } from "@/lib/admin/publicacao";
import FormularioDeNoticia from "@/app/admin/FormularioDeNoticia";
import { sair } from "@/app/admin/acoes";

export default async function AdminPage() {
  // O `proxy.ts` já barra na borda; repetimos aqui para a página nunca
  // renderizar sem sessão caso o matcher mude.
  if (!(await temSessao())) {
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-texto">
            Nova notícia
          </h1>
          <p className="mt-1 text-sm text-texto-fraco">
            Publicar cria um commit no repositório. A Vercel republica o site em
            seguida.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="/admin/materias"
            className="whitespace-nowrap rounded-md border border-linha-forte px-4 py-2 text-sm text-texto-corpo hover:border-marca"
          >
            Matérias publicadas
          </Link>

          <form action={sair}>
            <button
              type="submit"
              className="whitespace-nowrap text-sm text-texto-fraco hover:text-texto-corpo"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <FormularioDeNoticia
        categorias={categorias}
        posicoes={POSICOES_DA_IMAGEM}
        hoje={dataDeHoje()}
      />
    </main>
  );
}
