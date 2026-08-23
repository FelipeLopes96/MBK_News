/**
 * Imagens no meio da matéria.
 *
 * No instante em que o editor decide onde a foto entra, o painel ainda não sabe
 * o nome do arquivo: o caminho depende do slug, e o slug pode mudar depois. Por
 * isso o corpo guarda um marcador — [imagem:1] — e a publicação troca cada
 * marcador pelo Markdown com o caminho definitivo.
 *
 * Escrever e ler o Markdown vivem juntos aqui de propósito: o formulário escreve
 * para a prévia, `lib/admin/publicacao.ts` escreve para o commit e
 * `app/components/markdownDeConteudo.tsx` lê para renderizar. Com o formato
 * copiado nos três, o primeiro ajuste deixaria dois desatualizados.
 *
 * Módulo sem dependência alguma: o formulário do painel é um Client Component e
 * importa isto sem arrastar `node:fs` para o bundle do navegador.
 */

const MARCADOR = /\[imagem:(\d+)\]/g;

/** Markdown não tem campo para legenda: ela viaja no `title`, junto da fonte. */
const SEPARADOR = "|";

/** Terceiro campo do `title`, quando presente. */
const MARCA_DE_IA = "ia";

export type LegendaDaImagem = {
  legenda: string;
  /** Crédito ou origem. Quando é URL, vira link na linha de crédito. */
  fonte: string;
  geradaPorIA: boolean;
};

export function marcadorDaImagem(numero: number): string {
  return `[imagem:${numero}]`;
}

/**
 * Os números citados no corpo, na ordem em que aparecem. Repetições entram: a
 * mesma foto pode ser usada duas vezes na matéria.
 */
export function marcadoresNoCorpo(corpo: string): number[] {
  return [...corpo.matchAll(MARCADOR)].map((achado) => Number(achado[1]));
}

/**
 * Troca cada marcador pelo que `substituir` devolver. Devolver `null` deixa o
 * marcador intacto — é assim que a renumeração ignora número que não é dela.
 */
export function trocarMarcadores(
  corpo: string,
  substituir: (numero: number) => string | null
): string {
  return corpo.replace(
    MARCADOR,
    (marcador, numero) => substituir(Number(numero)) ?? marcador
  );
}

/**
 * Apagar a imagem 2 de três faz a 3 virar 2, e o [imagem:3] que ficou no texto
 * passaria a apontar para foto que não existe. Uma passada só: em duas, o 3 que
 * acabou de virar 2 seria decrementado de novo.
 */
export function renumerarMarcadores(corpo: string, removido: number): string {
  const semALinha = corpo.replace(
    // Come a linha inteira quando o marcador estava sozinho nela, e mais a linha
    // em branco que separava a foto do parágrafo seguinte: só a linha do
    // marcador deixaria duas em branco emendadas no lugar dela.
    new RegExp(`^[ \\t]*\\[imagem:${removido}\\][ \\t]*\\n?\\n?`, "gm"),
    ""
  );

  return trocarMarcadores(semALinha, (numero) => {
    if (numero === removido) return "";
    return numero > removido ? marcadorDaImagem(numero - 1) : null;
  });
}

/**
 * Um campo do `title`, pronto para entrar na linha. O `title` vai entre aspas
 * duplas, então barra invertida e aspas dentro da legenda precisam de escape ou
 * fechariam o campo no meio da frase. A barra vertical some porque é ela que
 * separa legenda, fonte e o aviso de IA — escapá-la exigiria um dialeto próprio
 * para ganhar um caractere que legenda de foto não usa.
 *
 * A limpeza é por campo e antes de juntar: aplicada no título já montado, ela
 * comeria os separadores junto com as barras da legenda.
 */
function limparCampo(texto: string): string {
  return texto.trim().replace(/\|/g, "/").replace(/([\\"])/g, "\\$1");
}

/** No texto alternativo o risco são os colchetes, que fecham o `![...]`. */
function escaparAlt(texto: string): string {
  return texto.replace(/([\\[\]])/g, "\\$1");
}

export function markdownDaImagem(
  url: string,
  alt: string,
  legenda: LegendaDaImagem
): string {
  const partes = [
    limparCampo(legenda.legenda),
    limparCampo(legenda.fonte),
    legenda.geradaPorIA ? MARCA_DE_IA : "",
  ];

  // Campo vazio no fim não precisa de lugar. No meio, precisa: "|Getty" é fonte
  // sem legenda, e sem o vazio na frente a fonte seria lida como legenda.
  while (partes.length > 0 && !partes[partes.length - 1]) {
    partes.pop();
  }

  const titulo = partes.join(SEPARADOR);
  const destino = titulo ? `${url} "${titulo}"` : url;

  return `![${escaparAlt(alt)}](${destino})`;
}

/** O caminho de volta, na hora de renderizar. */
export function lerLegendaDaImagem(title: string | undefined): LegendaDaImagem {
  const [legenda = "", fonte = "", ia = ""] = (title ?? "")
    .split(SEPARADOR)
    .map((parte) => parte.trim());

  return { legenda, fonte, geradaPorIA: ia.toLowerCase() === MARCA_DE_IA };
}
