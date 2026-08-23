"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { publicarNoticia, type EstadoDaPublicacao } from "@/app/admin/acoes";
import { gerarSlug } from "@/lib/admin/slug";
import PreviaDaMateria from "@/app/admin/PreviaDaMateria";
import type { PosicaoDaImagem } from "@/lib/conteudo";
// `lib/seo` não lê disco, então a constante pode atravessar para o navegador.
import { REDACAO } from "@/lib/seo";

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
  "w-full rounded-md border border-linha-forte bg-fundo px-3 py-2 text-texto outline-none focus:border-marca";
const rotulo = "text-sm font-semibold text-texto-corpo";
const dica = "text-xs text-texto-fraco";

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
  const [imagemGeradaPorIA, setImagemGeradaPorIA] = useState(false);
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
        <p className="mt-2 text-sm text-texto-corpo">
          O commit foi criado em{" "}
          <code className="text-texto-suave">{estado.sucesso.caminho}</code>. A
          Vercel republica o site sozinha — em cerca de um minuto a matéria
          estará em{" "}
          <code className="text-texto-suave">/noticia/{estado.sucesso.slug}</code>.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={estado.sucesso.urlDoCommit}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-linha-forte px-4 py-2 text-sm text-texto-corpo hover:border-marca"
          >
            Ver o commit
          </a>
          <button
            type="button"
            onClick={() => {
              limpar();
              setSucessoDispensado(estado.sucesso!.slug);
            }}
            className="rounded-md bg-marca px-4 py-2 text-sm font-semibold text-texto hover:opacity-90"
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

      <div className="flex gap-1 self-start rounded-md border border-linha p-1">
        {(["escrever", "previa"] as const).map((opcao) => (
          <button
            key={opcao}
            type="button"
            onClick={() => setModo(opcao)}
            aria-pressed={modo === opcao}
            className={`rounded px-4 py-1.5 text-sm font-semibold transition-colors ${
              modo === opcao
                ? "bg-marca text-texto"
                : "text-texto-suave hover:text-texto"
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
        <h2 className="text-sm font-bold uppercase tracking-widest text-marca-clara">
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

        {/* `grid-cols-1` explícito: a coluna implícita é `auto` e adota a
            largura mínima de conteúdo dos campos, que num celular estreito
            passa da viewport e estoura a página. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              className="size-4 accent-marca"
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
        <h2 className="text-sm font-bold uppercase tracking-widest text-marca-clara">
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
            className={`${campo} file:mr-3 file:rounded file:border-0 file:bg-superficie-alta file:px-3 file:py-1 file:text-texto-corpo`}
          />
          <span className={dica}>
            Até 6 MB. Sobe junto com a matéria, no mesmo commit.
          </span>
        </label>

        {previa && (
          <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md border border-linha">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        {/* Capa de IA precisa ir ao ar rotulada: a linha de crédito troca
            "Foto" por "Imagem gerada por IA", para o leitor não tomar a
            ilustração por registro do que aconteceu. */}
        <label className="mt-4 flex items-start gap-3">
          <input
            type="checkbox"
            name="imagemGeradaPorIA"
            checked={imagemGeradaPorIA}
            onChange={(evento) => setImagemGeradaPorIA(evento.target.checked)}
            className="mt-0.5 size-4 accent-marca"
          />
          <span>
            <span className={rotulo}>Imagem gerada por IA</span>
            <span className={`block ${dica}`}>
              A matéria sai com “Imagem gerada por IA” no lugar de “Foto”.
            </span>
          </span>
        </label>

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
        <h2 className="text-sm font-bold uppercase tracking-widest text-marca-clara">
          Fontes da apuração
        </h2>

        {/*
          `minmax(0,…)` e não `1fr_2fr`: um `fr` sozinho tem mínimo `auto`, e o
          mínimo de um `input` não é zero — é a largura do `size` padrão, perto
          de 175px. Dois campos assim mais o botão não cabem nos 592px de um sm,
          e as trilhas empurrariam o formulário para fora da tela.
        */}
        {fontes.map((fonte, indice) => (
          <div
            key={indice}
            className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]"
          >
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
              className="rounded-md border border-linha-forte px-3 py-2 text-sm text-texto-suave hover:border-red-800 hover:text-red-300"
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
          className="self-start rounded-md border border-linha-forte px-4 py-2 text-sm text-texto-corpo hover:border-marca"
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
          // A matéria sai assinada pela redação; o painel não pede autor.
          autor={REDACAO}
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
                  geradaPorIA: imagemGeradaPorIA,
                }
              : undefined
          }
        />
      )}

      <div className="sticky bottom-0 -mx-6 flex items-center gap-4 border-t border-linha bg-fundo/95 px-6 py-4 backdrop-blur">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-marca px-6 py-2.5 font-semibold text-texto transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {enviando ? "Publicando..." : "Publicar"}
        </button>
        <button
          type="button"
          onClick={limpar}
          disabled={enviando}
          className="text-sm text-texto-fraco hover:text-texto-corpo disabled:opacity-50"
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
