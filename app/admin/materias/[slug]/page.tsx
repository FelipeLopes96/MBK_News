import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { temSessao } from "@/lib/admin/sessao";
import { carregarMateria } from "@/lib/admin/materias";
import { categorias } from "@/lib/noticias";
import { dataDeHoje, POSICOES_DA_IMAGEM } from "@/lib/admin/publicacao";
import { normalizarFontes, normalizarImagem } from "@/lib/conteudo";
import FormularioDeNoticia, {
  type ValoresIniciais,
} from "@/app/admin/FormularioDeNoticia";

/** Vem do GitHub a cada visita: o formulário não pode abrir com texto vencido. */
export const dynamic = "force-dynamic";

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

export default async function EditarMateriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await temSessao())) {
    redirect("/admin/login");
  }

  const { slug } = await params;

  // Mesmo motivo da lista: sem tratar, token vencido vira stack trace e o editor
  // não descobre que o problema é a credencial.
  let materia;
  try {
    materia = await carregarMateria(slug);
  } catch (erro) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-texto">
          Corrigir matéria
        </h1>
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-900 bg-red-950/40 p-4"
        >
          <p className="font-semibold text-red-300">
            Não foi possível ler a matéria no GitHub.
          </p>
          <p className="mt-2 text-sm text-red-200">
            {erro instanceof Error ? erro.message : String(erro)}
          </p>
        </div>
        <Link
          href="/admin/materias"
          className="mt-6 inline-block text-sm text-texto-fraco hover:text-texto-corpo"
        >
          ← Matérias publicadas
        </Link>
      </main>
    );
  }

  if (!materia) {
    notFound();
  }

  const { frontmatter, corpo } = materia;
  const imagem = normalizarImagem(frontmatter.imagem);

  const inicial: ValoresIniciais = {
    title: texto(frontmatter.title),
    // O slug do arquivo é a verdade: o campo do frontmatter pode ter ficado para
    // trás de um rename feito à mão, e é o nome do arquivo que vira a URL.
    slug,
    date: texto(frontmatter.date),
    categoria: texto(frontmatter.categoria),
    resumo: texto(frontmatter.resumo),
    corpo,
    destaque: frontmatter.destaque === true,
    imagemUrl: imagem?.url ?? "",
    imagemPosicao: imagem?.posicao ?? "",
    imagemCredito: imagem?.credito ?? "",
    imagemFonte: imagem?.fonte ?? "",
    imagemLicenca: imagem?.licenca ?? "",
    imagemGeradaPorIA: imagem?.geradaPorIA === true,
    fontes: normalizarFontes(frontmatter.fontes).map((fonte) => ({
      rotulo: fonte.rotulo,
      url: fonte.url ?? "",
    })),
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-10">
        <Link
          href="/admin/materias"
          className="text-sm text-texto-fraco hover:text-texto-corpo"
        >
          ← Matérias publicadas
        </Link>

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-texto">
          Corrigir matéria
        </h1>
        <p className="mt-1 text-sm text-texto-fraco">
          Atualizar grava por cima de{" "}
          <code className="text-texto-suave">{materia.caminho}</code> num commit
          novo. Os campos que o formulário não mostra — tags e organizações —
          ficam como estão.
        </p>
      </header>

      <FormularioDeNoticia
        categorias={categorias}
        posicoes={POSICOES_DA_IMAGEM}
        hoje={dataDeHoje()}
        inicial={inicial}
        slugOriginal={slug}
      />
    </main>
  );
}
