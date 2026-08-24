import Link from "next/link";
import { redirect } from "next/navigation";
import { temSessao } from "@/lib/admin/sessao";
import { dataDeHoje } from "@/lib/admin/publicacao";
import {
  listarVideosDoRepositorio,
  type VideoNoPainel,
} from "@/lib/admin/videos";
import { getOrganizacoes } from "@/lib/entidades";
import { categorias, rotuloDaCategoria } from "@/lib/noticias";
import FormularioDeVideo from "@/app/admin/videos/FormularioDeVideo";
import ListaDeVideosDoPainel from "@/app/admin/videos/ListaDeVideosDoPainel";

/** A lista vem do GitHub a cada visita: depois de excluir, ela não pode voltar igual. */
export const dynamic = "force-dynamic";

export default async function VideosDoPainelPage() {
  if (!(await temSessao())) {
    redirect("/admin/login");
  }

  // Mesma proteção das matérias: token vencido não pode virar stack trace.
  let videos: VideoNoPainel[];
  let erroDaLista = "";
  try {
    videos = await listarVideosDoRepositorio();
  } catch (erro) {
    videos = [];
    erroDaLista = erro instanceof Error ? erro.message : String(erro);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-texto">
            Novo vídeo
          </h1>
          <p className="mt-1 text-sm text-texto-fraco">
            O vídeo continua hospedado no YouTube. O que se cadastra aqui é o
            endereço dele e os dados do card.
          </p>
        </div>

        <Link
          href="/admin"
          className="whitespace-nowrap text-sm text-texto-fraco hover:text-texto-corpo"
        >
          Nova notícia
        </Link>
      </header>

      <FormularioDeVideo
        categorias={categorias}
        organizacoes={getOrganizacoes().map((organizacao) => ({
          slug: organizacao.slug,
          rotulo: organizacao.nome,
        }))}
        hoje={dataDeHoje()}
      />

      <section className="mt-16">
        <h2 className="text-sm font-bold uppercase tracking-widest text-marca-clara">
          Vídeos cadastrados
        </h2>

        <div className="mt-4">
          {erroDaLista ? (
            <div
              role="alert"
              className="rounded-lg border border-red-900 bg-red-950/40 p-4"
            >
              <p className="font-semibold text-red-300">
                Não foi possível ler os vídeos no GitHub.
              </p>
              <p className="mt-2 text-sm text-red-200">{erroDaLista}</p>
            </div>
          ) : (
            <ListaDeVideosDoPainel
              videos={videos.map((video) => ({
                slug: video.slug,
                title: video.title,
                publicadoEm: video.publicadoEm,
                destaque: video.destaque,
                rotuloDaCategoria: video.categoria
                  ? rotuloDaCategoria(video.categoria)
                  : "",
              }))}
            />
          )}
        </div>
      </section>
    </main>
  );
}
