/**
 * YouTube: só o que é preciso para incorporar.
 *
 * Nada de baixar ou hospedar vídeo de terceiro — o que este módulo faz é tirar
 * o identificador da URL que o editor colou e montar os endereços oficiais de
 * embed, miniatura e página do vídeo.
 *
 * Sem dependências de propósito: o formulário do painel é Client Component e
 * precisa extrair o mesmo id que o servidor vai gravar, para mostrar a prévia
 * enquanto se digita.
 */

/** Shorts são verticais: o embed e o card mudam de proporção por causa disso. */
export type FormatoDoVideo = "padrao" | "short";

export type VideoIdentificado = {
  id: string;
  formato: FormatoDoVideo;
};

/** 11 caracteres do alfabeto de ids do YouTube. */
const ID = /^[\w-]{11}$/;

/**
 * Aceita as formas que aparecem quando alguém copia um link do YouTube:
 *
 *   youtube.com/watch?v=ID          (com ou sem &list=, &t=)
 *   youtu.be/ID
 *   youtube.com/shorts/ID
 *   youtube.com/embed/ID
 *   youtube.com/live/ID
 *
 * Também aceita o id cru, para o caso de já vir extraído. Devolve `undefined`
 * quando não reconhece — quem chama decide o que fazer, e assim uma URL
 * estranha vira erro de validação em vez de embed quebrado no ar.
 */
export function extrairVideoId(entrada: string): VideoIdentificado | undefined {
  const texto = entrada.trim();
  if (!texto) return undefined;

  if (ID.test(texto)) {
    return { id: texto, formato: "padrao" };
  }

  let url: URL;
  try {
    // Aceita link colado sem protocolo — "youtu.be/ID".
    url = new URL(/^https?:\/\//i.test(texto) ? texto : `https://${texto}`);
  } catch {
    return undefined;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const partes = url.pathname.split("/").filter(Boolean);

  // youtu.be/ID — o id é o caminho inteiro.
  if (host === "youtu.be") {
    return identificar(partes[0], "padrao");
  }

  if (
    host !== "youtube.com" &&
    host !== "m.youtube.com" &&
    host !== "youtube-nocookie.com"
  ) {
    return undefined;
  }

  if (url.pathname === "/watch") {
    return identificar(url.searchParams.get("v"), "padrao");
  }

  const [secao, valor] = partes;

  if (secao === "shorts") {
    return identificar(valor, "short");
  }

  if (secao === "embed" || secao === "live" || secao === "v") {
    return identificar(valor, "padrao");
  }

  return undefined;
}

function identificar(
  valor: string | null | undefined,
  formato: FormatoDoVideo
): VideoIdentificado | undefined {
  const id = valor?.trim();
  return id && ID.test(id) ? { id, formato } : undefined;
}

/**
 * Endereço do player. `youtube-nocookie.com` é o domínio de privacidade
 * reforçada do próprio YouTube: o embed só passa a rastrear depois do play.
 */
export function urlDoEmbed(id: string): string {
  const parametros = new URLSearchParams({
    // O iframe só entra na página depois do clique, então já começa tocando.
    autoplay: "1",
    // Sem vídeos de outros canais no fim: a sugestão tira o leitor do portal.
    rel: "0",
  });

  return `https://www.youtube-nocookie.com/embed/${id}?${parametros}`;
}

/** Página do vídeo no YouTube, para o crédito da fonte. */
export function urlDeAssistir(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/**
 * Miniatura oficial.
 *
 * `hqdefault` é a única que existe para todo vídeo — `maxresdefault` só aparece
 * quando o upload foi em 720p ou mais, e a diferença é uma imagem quebrada no
 * card. Ela vem em 4:3 com tarjas em cima e embaixo; o card corta as tarjas com
 * `object-cover`, sobrando o quadro 16:9 de dentro.
 */
export function urlDaMiniatura(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
