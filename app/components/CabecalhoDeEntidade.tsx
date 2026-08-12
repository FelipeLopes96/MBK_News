import type { ReactNode } from "react";
import Breadcrumbs, { type Migalha } from "@/app/components/Breadcrumbs";
import CreditoDeImagem from "@/app/components/CreditoDeImagem";
import ImagemNoticia from "@/app/components/ImagemNoticia";
import type { ImagemComCredito } from "@/lib/conteudo";

/**
 * Topo das páginas de entidade do Arquivo: trilha, imagem de capa com crédito,
 * rótulo do tipo, título e resumo. Segue a mesma grade de leitura do
 * LeituraDeArtigo para que as páginas novas pareçam parte do mesmo Arquivo.
 */
export default function CabecalhoDeEntidade({
  trilha,
  rotulo,
  titulo,
  nomeSecundario,
  subtitulo,
  resumo,
  imagem,
  metadados,
}: {
  trilha: Migalha[];
  /** Linha laranja acima do título — ex.: "Organização", "Lenda". */
  rotulo: string;
  titulo: string;
  /** Nome completo/oficial, em linha discreta logo abaixo do título. */
  nomeSecundario?: string;
  /** Linha logo abaixo do título — ex.: apelido ou frase de apresentação. */
  subtitulo?: string;
  resumo?: string;
  imagem?: ImagemComCredito;
  /** Conteúdo extra sob o resumo, ex.: link para a organização. */
  metadados?: ReactNode;
}) {
  return (
    <header>
      <Breadcrumbs trilha={trilha} />

      {imagem ? (
        <>
          <div className="mt-6 relative aspect-video w-full overflow-hidden rounded-lg">
            <ImagemNoticia
              src={imagem.url}
              alt={titulo}
              sizes="(min-width: 768px) 768px, 100vw"
              preload
            />
          </div>
          <CreditoDeImagem imagem={imagem} />
        </>
      ) : null}

      <span className="mt-8 block text-xs font-semibold uppercase tracking-wide text-[#F97316]">
        {rotulo}
      </span>

      <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
        {titulo}
      </h1>

      {nomeSecundario && nomeSecundario !== titulo ? (
        <p className="mt-1.5 text-sm font-medium text-zinc-500">
          {nomeSecundario}
        </p>
      ) : null}

      {subtitulo ? (
        <p className="mt-2 text-lg text-zinc-400">{subtitulo}</p>
      ) : null}

      {resumo ? (
        <p className="mt-4 text-lg leading-8 text-zinc-300">{resumo}</p>
      ) : null}

      {metadados}
    </header>
  );
}
