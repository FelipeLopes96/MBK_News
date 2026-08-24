"use client";

import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import {
  buscarDadosDoYouTube,
  publicarVideo,
  type EstadoDoVideo,
} from "@/app/admin/acoesDeVideo";
import { gerarSlug } from "@/lib/admin/slug";
import { extrairVideoId, urlDaMiniatura } from "@/lib/youtube";

/**
 * Cadastro de vídeo do YouTube.
 *
 * Todos os campos são controlados, como no formulário de matéria: quando a
 * publicação falha, o React remontaria os não controlados e o editor perderia o
 * que digitou.
 *
 * O botão "Buscar dados do YouTube" existe porque copiar título e canal à mão de
 * uma aba para outra é onde nasce o erro de digitação no nome do atleta — e o
 * YouTube sabe responder isso sozinho.
 */

type Opcao = { slug: string; rotulo: string };

type Props = {
  categorias: Opcao[];
  organizacoes: Opcao[];
  hoje: string;
};

const estadoInicial: EstadoDoVideo = { erros: [] };

const campo =
  "w-full rounded-md border border-linha-forte bg-fundo px-3 py-2 text-texto outline-none focus:border-marca";
const rotulo = "text-sm font-semibold text-texto-corpo";
const dica = "text-xs text-texto-fraco";

export default function FormularioDeVideo({
  categorias,
  organizacoes,
  hoje,
}: Props) {
  const [estado, acao, enviando] = useActionState(
    publicarVideo,
    estadoInicial
  );

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [canal, setCanal] = useState("");
  const [duracao, setDuracao] = useState("");
  const [categoria, setCategoria] = useState(categorias[0]?.slug ?? "");
  const [publicadoEm, setPublicadoEm] = useState(hoje);
  const [orgsEscolhidas, setOrgsEscolhidas] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [destaque, setDestaque] = useState(false);

  const [erroDaBusca, setErroDaBusca] = useState("");
  const [buscando, iniciarBusca] = useTransition();
  /**
   * `useActionState` não tem reset. Sem isto, "Cadastrar outro" não teria como
   * voltar ao formulário: navegar para a própria rota é navegação suave, o
   * componente não remonta e o aviso de sucesso continuaria na tela.
   */
  const [sucessoDispensado, setSucessoDispensado] = useState("");

  // O mesmo extrator que o servidor usa, para a prévia acompanhar a digitação.
  const identificado = extrairVideoId(url);
  const slugFinal = gerarSlug(slug || title);

  function trocarTitulo(valor: string) {
    setTitle(valor);
    if (!slugManual) setSlug(gerarSlug(valor));
  }

  function buscar() {
    setErroDaBusca("");

    iniciarBusca(async () => {
      const dados = await buscarDadosDoYouTube(url);

      if (dados.erro) {
        setErroDaBusca(dados.erro);
        return;
      }

      // Só preenche o que voltou: campo que o editor já ajustou à mão não é
      // sobrescrito por vazio.
      if (dados.title) trocarTitulo(dados.title);
      if (dados.canal) setCanal(dados.canal);
      if (dados.duracao) setDuracao(dados.duracao);
      if (dados.publicadoEm) setPublicadoEm(dados.publicadoEm);
    });
  }

  function alternarOrganizacao(slugDaOrg: string) {
    setOrgsEscolhidas((atuais) =>
      atuais.includes(slugDaOrg)
        ? atuais.filter((item) => item !== slugDaOrg)
        : [...atuais, slugDaOrg]
    );
  }

  function limpar() {
    setUrl("");
    setTitle("");
    setSlug("");
    setSlugManual(false);
    setDescricao("");
    setCanal("");
    setDuracao("");
    setCategoria(categorias[0]?.slug ?? "");
    setPublicadoEm(hoje);
    setOrgsEscolhidas([]);
    setTags("");
    setDestaque(false);
    setErroDaBusca("");
  }

  if (estado.sucesso && estado.sucesso.slug !== sucessoDispensado) {
    return (
      <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-6">
        <h2 className="text-lg font-bold text-emerald-300">Vídeo cadastrado</h2>
        <p className="mt-2 text-sm text-texto-corpo">
          O commit foi criado em{" "}
          <code className="text-texto-suave">{estado.sucesso.caminho}</code>. A
          Vercel republica o site sozinha — em cerca de um minuto o vídeo estará
          em{" "}
          <code className="text-texto-suave">/videos/{estado.sucesso.slug}</code>
          .
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
            Cadastrar outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={acao} className="flex flex-col gap-6">
      {estado.erros.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-red-900 bg-red-950/40 p-4"
        >
          <p className="font-semibold text-red-300">
            O vídeo não foi cadastrado:
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm text-red-200">
            {estado.erros.map((erro) => (
              <li key={erro}>{erro}</li>
            ))}
          </ul>
        </div>
      )}

      <label className="flex flex-col gap-2">
        <span className={rotulo}>URL do vídeo</span>
        <input
          name="url"
          value={url}
          onChange={(evento) => setUrl(evento.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className={campo}
        />
        <span className={dica}>
          Aceita o endereço da página, youtu.be e Shorts. O <code>&t=</code> e a
          playlist na URL não incomodam.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={buscar}
          disabled={buscando || !identificado}
          className="rounded-md border border-linha-forte px-4 py-2 text-sm text-texto-corpo hover:border-marca disabled:opacity-50"
        >
          {buscando ? "Buscando..." : "Buscar dados do YouTube"}
        </button>

        {identificado ? (
          <span className={dica}>
            Vídeo <code>{identificado.id}</code>
            {identificado.formato === "short" ? " — Shorts (vertical)" : ""}
          </span>
        ) : url.trim() ? (
          <span className="text-xs font-semibold text-amber-400">
            Ainda não reconheci um vídeo do YouTube nessa URL.
          </span>
        ) : null}
      </div>

      {erroDaBusca && (
        <p role="alert" className="text-sm text-red-300">
          {erroDaBusca}
        </p>
      )}

      {identificado && (
        <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-md border border-linha">
          <Image
            src={urlDaMiniatura(identificado.id)}
            alt="Miniatura do vídeo"
            fill
            sizes="384px"
            className="object-cover"
          />
        </div>
      )}

      <label className="flex flex-col gap-2">
        <span className={rotulo}>Título</span>
        <input
          name="title"
          value={title}
          onChange={(evento) => trocarTitulo(evento.target.value)}
          className={campo}
        />
      </label>

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
              ? `/videos/${slugFinal}`
              : "Preenchido a partir do título."}
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className={rotulo}>Publicado em</span>
          <input
            type="date"
            name="publicadoEm"
            value={publicadoEm}
            onChange={(evento) => setPublicadoEm(evento.target.value)}
            className={campo}
          />
          <span className={dica}>
            A data do vídeo no YouTube, não a de hoje — é ela que ordena a
            biblioteca.
          </span>
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className={rotulo}>Descrição</span>
        <textarea
          name="descricao"
          value={descricao}
          onChange={(evento) => setDescricao(evento.target.value)}
          rows={3}
          className={campo}
        />
        <span className={dica}>Opcional. Uma ou duas frases.</span>
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className={rotulo}>Canal</span>
          <input
            name="canal"
            value={canal}
            onChange={(evento) => setCanal(evento.target.value)}
            className={campo}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={rotulo}>Duração</span>
          <input
            name="duracao"
            value={duracao}
            onChange={(evento) => setDuracao(evento.target.value)}
            placeholder="7:31"
            className={campo}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={rotulo}>Modalidade</span>
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
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className={rotulo}>Organizações</legend>
        <p className={dica}>
          Liga o vídeo ao hub da organização no Arquivo. Pode marcar mais de uma.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {organizacoes.map((organizacao) => (
            <label
              key={organizacao.slug}
              className="flex items-center gap-2 text-sm text-texto-corpo"
            >
              <input
                type="checkbox"
                name="organizacoes"
                value={organizacao.slug}
                checked={orgsEscolhidas.includes(organizacao.slug)}
                onChange={() => alternarOrganizacao(organizacao.slug)}
                className="size-4 shrink-0 accent-marca"
              />
              {organizacao.rotulo}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className={rotulo}>Tags</span>
        <input
          name="tags"
          value={tags}
          onChange={(evento) => setTags(evento.target.value)}
          placeholder="Fernando Nonato, WGP Kickboxing 31"
          className={campo}
        />
        <span className={dica}>
          Separadas por vírgula. É por elas que o vídeo aparece na página da
          lenda citada.
        </span>
      </label>

      {/* Mesma regra do destaque da matéria: o que a marcação faz precisa estar
          escrito, senão a opção passa batida. */}
      <label
        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
          destaque
            ? "border-marca bg-marca/10"
            : "border-linha-forte bg-superficie hover:bg-superficie-alta"
        }`}
      >
        <input
          type="checkbox"
          name="destaque"
          checked={destaque}
          onChange={(evento) => setDestaque(evento.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-marca"
        />
        <span>
          <span
            className={`block text-sm font-bold ${
              destaque ? "text-marca-clara" : "text-texto"
            }`}
          >
            Vídeo em destaque
          </span>
          <span className={`mt-1 block ${dica}`}>
            Abre a biblioteca no card grande e entra no módulo de vídeos da home.
            Sem nenhum marcado, os três mais recentes ocupam esse lugar.
          </span>
        </span>
      </label>

      <div className="sticky bottom-0 -mx-6 flex items-center gap-4 border-t border-linha bg-fundo/95 px-6 py-4 backdrop-blur">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-marca px-6 py-2.5 font-semibold text-texto transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {enviando ? "Cadastrando..." : "Cadastrar vídeo"}
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
