"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { publicarNoticia, type EstadoDaPublicacao } from "@/app/admin/acoes";
import { gerarSlug } from "@/lib/admin/slug";
import PreviaDaMateria from "@/app/admin/PreviaDaMateria";
import type { PosicaoDaImagem } from "@/lib/conteudo";

/**
 * Todos os campos são controlados de propósito: quando a publicação falha, o
 * React remontaria os campos não controlados e o editor perderia a matéria
 * inteira. Com o estado em mãos, o erro custa um clique, não um retrabalho.
 *
 * As categorias e as posições chegam por prop porque vivem em `lib/noticias.ts`
 * e `lib/conteudo.ts`, que leem o disco — importar aqui arrastaria `node:fs`
 * para o bundle do navegador.
 */

type Opcao = { slug: string; rotulo: string };

type Props = {
  categorias: Opcao[];
  posicoes: string[];
  hoje: string;
};

const estadoInicial: EstadoDaPublicacao = { erros: [] };

const campo =
  "w-full rounded-md border border-zinc-700 bg-[#1A1A1A] px-3 py-2 text-white outline-none focus:border-[#F97316]";
const rotulo = "text-sm font-semibold text-zinc-300";
const dica = "text-xs text-zinc-500";

// Espelham `classeDaPosicao` de ImagemNoticia — o Tailwind só gera as classes
// que encontra escritas por extenso no código.
const classeDaPosicao: Record<string, string> = {
  centro: "object-center",
  topo: "object-top",
  base: "object-bottom",
  esquerda: "object-left",
  direita: "object-right",
};

export default function FormularioDeNoticia({
  categorias,
  posicoes,
  hoje,
}: Props) {
  const [estado, acao, enviando] = useActionState(
    publicarNoticia,
    estadoInicial
  );

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [date, setDate] = useState(hoje);
  const [categoria, setCategoria] = useState(categorias[0]?.slug ?? "");
  const [resumo, setResumo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [destaque, setDestaque] = useState(false);

  const [imagemUrl, setImagemUrl] = useState("");
  const [imagemPosicao, setImagemPosicao] = useState("");
  const [imagemCredito, setImagemCredito] = useState("");
  const [imagemFonte, setImagemFonte] = useState("");
  const [imagemLicenca, setImagemLicenca] = useState("");
  const [previa, setPrevia] = useState("");

  const [fontes, setFontes] = useState([{ rotulo: "", url: "" }]);
  /**
   * `useActionState` não tem reset: guardamos o slug da publicação cuja tela de
   * sucesso o editor já dispensou. Comparar durante a renderização evita o
   * efeito que apagaria o aviso da publicação seguinte.
   */
  const [sucessoDispensado, setSucessoDispensado] = useState("");
  const [modo, setModo] = useState<"escrever" | "previa">("escrever");

  // Input de arquivo não aceita `value`; para limpá-lo depois de publicar só
  // pela referência ao elemento.
  const inputDaImagem = useRef<HTMLInputElement>(null);

  function trocarTitulo(valor: string) {
    setTitle(valor);
    if (!slugManual) {
      setSlug(gerarSlug(valor));
    }
  }

  function escolherImagem(arquivo: File | undefined) {
    setPrevia((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return arquivo ? URL.createObjectURL(arquivo) : "";
    });
  }

  function atualizarFonte(indice: number, qual: "rotulo" | "url", valor: string) {
    setFontes((atuais) =>
      atuais.map((fonte, i) => (i === indice ? { ...fonte, [qual]: valor } : fonte))
    );
  }

  function limpar() {
    setTitle("");
    setSlug("");
    setSlugManual(false);
    setDate(hoje);
    setResumo("");
    setCorpo("");
    setDestaque(false);
    setImagemUrl("");
    setImagemPosicao("");
    setImagemCredito("");
    setImagemFonte("");
    setImagemLicenca("");
    setFontes([{ rotulo: "", url: "" }]);
    escolherImagem(undefined);
    if (inputDaImagem.current) inputDaImagem.current.value = "";
  }

  // Solta a blob URL da prévia quando o componente sai de cena.
  useEffect(() => {
    return () => {
      if (previa) URL.revokeObjectURL(previa);
    };
  }, [previa]);

  const slugFinal = gerarSlug(slug || title);

  // A prévia mostra o arquivo escolhido agora; sem upload, cai na URL digitada.
  const capaDaPrevia = previa || imagemUrl.trim();
  const fontesDaPrevia = fontes
    .filter((fonte) => fonte.rotulo.trim())
    .map((fonte) => ({
      rotulo: fonte.rotulo.trim(),
      url: fonte.url.trim() || undefined,
    }));

  if (estado.sucesso && estado.sucesso.slug !== sucessoDispensado) {
    return (
      <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-6">
        <h2 className="text-lg font-bold text-emerald-300">Matéria publicada</h2>
        <p className="mt-2 text-sm text-zinc-300">
          O commit foi criado em{" "}
          <code className="text-zinc-400">{estado.sucesso.caminho}</code>. A
          Vercel republica o site sozinha — em cerca de um minuto a matéria
          estará em{" "}
          <code className="text-zinc-400">/noticia/{estado.sucesso.slug}</code>.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={estado.sucesso.urlDoCommit}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-[#F97316]"
          >
            Ver o commit
          </a>
          <button
            type="button"
            onClick={() => {
              limpar();
              setSucessoDispensado(estado.sucesso!.slug);
            }}
            className="rounded-md bg-[#F97316] px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
          >
            Escrever outra
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={acao} className="flex flex-col gap-10">
      {estado.erros.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-red-900 bg-red-950/40 p-4"
        >
          <p className="font-semibold text-red-300">
            A matéria não foi publicada:
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm text-red-200">
            {estado.erros.map((erro) => (
              <li key={erro}>{erro}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-1 self-start rounded-md border border-zinc-800 p-1">
        {(["escrever", "previa"] as const).map((opcao) => (
          <button
            key={opcao}
            type="button"
            onClick={() => setModo(opcao)}
            aria-pressed={modo === opcao}
            className={`rounded px-4 py-1.5 text-sm font-semibold transition-colors ${
              modo === opcao
                ? "bg-[#F97316] text-black"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {opcao === "escrever" ? "Escrever" : "Prévia"}
          </button>
        ))}
      </div>

      {/*
        Os campos são escondidos por CSS em vez de desmontados: o input de
        arquivo é o único não controlado, e desmontá-lo perderia a capa
        escolhida sem o editor perceber — o formulário seria enviado sem imagem.
      */}
      <div className={modo === "escrever" ? "flex flex-col gap-10" : "hidden"}>
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#F97316]">
          A matéria
        </h2>

        <label className="flex flex-col gap-2">
          <span className={rotulo}>Título</span>
          <input
            name="title"
            value={title}
            onChange={(evento) => trocarTitulo(evento.target.value)}
            className={campo}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={rotulo}>Slug</span>
            <input
              name="slug"
              value={slug}
              onChange={(evento) => {
                setSlugManual(true);
                setSlug(evento.target.value);
              }}
              className={campo}
            />
            <span className={dica}>
              {slugFinal
                ? `content/noticias/${date}-${slugFinal}.md`
                : "Preenchido a partir do título."}
            </span>
          </label>

          <label className="flex flex-col gap-2">
            <span className={rotulo}>Data</span>
            <input
              type="date"
              name="date"
              value={date}
              onChange={(evento) => setDate(evento.target.value)}
              className={campo}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={rotulo}>Categoria</span>
            <select
              name="categoria"
              value={categoria}
              onChange={(evento) => setCategoria(evento.target.value)}
              className={campo}
            >
              {categorias.map((opcao) => (
                <option key={opcao.slug} value={opcao.slug}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 self-end pb-2">
            <input
              type="checkbox"
              name="destaque"
              checked={destaque}
              onChange={(evento) => setDestaque(evento.target.checked)}
              className="size-4 accent-[#F97316]"
            />
            <span className={rotulo}>Manchete da home</span>
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className={rotulo}>Resumo</span>
          <textarea
            name="resumo"
            value={resumo}
            onChange={(evento) => setResumo(evento.target.value)}
            rows={3}
            className={campo}
          />
          <span className={dica}>
            Aparece nos cards e na busca do Google. Uma ou duas frases.
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className={rotulo}>Corpo da matéria</span>
          <textarea
            name="corpo"
            value={corpo}
            onChange={(evento) => setCorpo(evento.target.value)}
            rows={18}
            className={`${campo} font-mono text-sm leading-relaxed`}
          />
          <span className={dica}>
            Markdown: <code>## Subtítulo</code>, <code>**negrito**</code>,{" "}
            <code>[link](url)</code>. Não repita o título aqui.
          </span>
        </label>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#F97316]">
          A capa
        </h2>

        <label className="flex flex-col gap-2">
          <span className={rotulo}>Imagem</span>
          <input
            ref={inputDaImagem}
            type="file"
            name="imagem"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={(evento) => escolherImagem(evento.target.files?.[0])}
            className={`${campo} file:mr-3 file:rounded file:border-0 file:bg-zinc-800 file:px-3 file:py-1 file:text-zinc-300`}
          />
          <span className={dica}>
            Até 6 MB. Sobe junto com a matéria, no mesmo commit.
          </span>
        </label>

        {previa && (
          <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md border border-zinc-800">
            {/* Prévia local do arquivo escolhido: `next/image` não serve para
                blob URL, e aqui só queremos conferir o enquadramento. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previa}
              alt="Prévia da capa"
              className={`size-full object-cover ${classeDaPosicao[imagemPosicao] ?? ""}`}
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={rotulo}>Corte</span>
            <select
              name="imagemPosicao"
              value={imagemPosicao}
              onChange={(evento) => setImagemPosicao(evento.target.value)}
              className={campo}
            >
              <option value="">Centralizado</option>
              {posicoes.map((posicao) => (
                <option key={posicao} value={posicao}>
                  {posicao}
                </option>
              ))}
            </select>
            <span className={dica}>
              Use <code>topo</code> quando a foto é vertical e o corte central
              decepa a cabeça.
            </span>
          </label>

          <label className="flex flex-col gap-2">
            <span className={rotulo}>Crédito</span>
            <input
              name="imagemCredito"
              value={imagemCredito}
              onChange={(evento) => setImagemCredito(evento.target.value)}
              placeholder="Fotógrafo ou agência"
              className={campo}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className={rotulo}>Onde foi obtida</span>
            <input
              name="imagemFonte"
              value={imagemFonte}
              onChange={(evento) => setImagemFonte(evento.target.value)}
              placeholder="UFC, ESPN, site oficial..."
              className={campo}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className={rotulo}>Licença</span>
            <input
              name="imagemLicenca"
              value={imagemLicenca}
              onChange={(evento) => setImagemLicenca(evento.target.value)}
              placeholder="Getty Images, CC BY 2.0, Divulgação..."
              className={campo}
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className={rotulo}>Ou URL de uma imagem já hospedada</span>
          <input
            name="imagemUrl"
            value={imagemUrl}
            onChange={(evento) => setImagemUrl(evento.target.value)}
            placeholder="/noticias/arquivo-existente.webp"
            className={campo}
          />
          <span className={dica}>
            Ignorado quando você envia um arquivo acima.
          </span>
        </label>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#F97316]">
          Fontes da apuração
        </h2>

        {fontes.map((fonte, indice) => (
          <div key={indice} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
            <input
              name="fonteRotulo"
              value={fonte.rotulo}
              onChange={(evento) =>
                atualizarFonte(indice, "rotulo", evento.target.value)
              }
              placeholder="Veículo"
              className={campo}
            />
            <input
              name="fonteUrl"
              value={fonte.url}
              onChange={(evento) =>
                atualizarFonte(indice, "url", evento.target.value)
              }
              placeholder="https://... (opcional)"
              className={campo}
            />
            <button
              type="button"
              onClick={() =>
                setFontes((atuais) =>
                  atuais.length === 1
                    ? [{ rotulo: "", url: "" }]
                    : atuais.filter((_, i) => i !== indice)
                )
              }
              className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:border-red-800 hover:text-red-300"
            >
              Remover
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setFontes((atuais) => [...atuais, { rotulo: "", url: "" }])
          }
          className="self-start rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-[#F97316]"
        >
          Adicionar fonte
        </button>
      </section>
      </div>

      {modo === "previa" && (
        <PreviaDaMateria
          title={title}
          date={date}
          categoria={
            categorias.find((opcao) => opcao.slug === categoria)?.rotulo ??
            categoria
          }
          corpo={corpo}
          fontes={fontesDaPrevia}
          capa={
            capaDaPrevia
              ? {
                  url: capaDaPrevia,
                  posicao: (imagemPosicao || undefined) as
                    | PosicaoDaImagem
                    | undefined,
                  credito: imagemCredito.trim() || undefined,
                  fonte: imagemFonte.trim() || undefined,
                  licenca: imagemLicenca.trim() || undefined,
                }
              : undefined
          }
        />
      )}

      <div className="sticky bottom-0 -mx-6 flex items-center gap-4 border-t border-zinc-800 bg-[#141414]/95 px-6 py-4 backdrop-blur">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-[#F97316] px-6 py-2.5 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {enviando ? "Publicando..." : "Publicar"}
        </button>
        <button
          type="button"
          onClick={limpar}
          disabled={enviando}
          className="text-sm text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
