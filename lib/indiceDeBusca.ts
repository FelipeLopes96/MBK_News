import * as arquivo from "@/lib/arquivo";
import * as arsenal from "@/lib/arsenal";
import { normalizar, type ItemDoIndice, type TipoDeResultado } from "@/lib/busca";
import {
  getLendas,
  getMomentos,
  getOrganizacoes,
  rotuloDaEntidade,
  type Entidade,
} from "@/lib/entidades";
import {
  getTodasNoticias,
  rotuloDaCategoria as rotuloDeNoticia,
} from "@/lib/noticias";
import { getTodosOsVideos } from "@/lib/videos";

/**
 * Montagem do índice de busca. Lê o conteúdo, então roda só no servidor/build.
 *
 * O site é estático e não há banco: o índice é montado no build e entregue
 * inteiro à página /busca, que filtra no cliente — busca sem backend e sem ida
 * ao servidor a cada tecla.
 *
 * O custo é o índice viajando com a página. Hoje são algumas dezenas de itens,
 * alguns kB. Passando da ordem de mil, o caminho é paginar o índice ou trocar
 * por busca no servidor; não é um problema deste tamanho de acervo.
 */

function montar(
  item: Omit<ItemDoIndice, "chave"> & { extra?: string[] }
): ItemDoIndice {
  const { extra = [], ...campos } = item;

  return {
    ...campos,
    chave: normalizar(
      [campos.titulo, campos.resumo ?? "", campos.rotulo, ...extra].join(" ")
    ),
  };
}

const tipoDaEntidade: Record<Entidade["tipo"], TipoDeResultado> = {
  organizacao: "organizacao",
  lenda: "lenda",
  momento: "momento",
};

const rotaDaEntidade: Record<Entidade["tipo"], string> = {
  organizacao: "/arquivo/organizacoes",
  lenda: "/arquivo/lendas",
  momento: "/arquivo/momentos",
};

/**
 * O que entra na chave além do que o card mostra.
 *
 * Organização é conhecida tanto pela sigla quanto pelo nome inteiro — quem
 * digita "Legacy Fighting Alliance" tem de achar a LFA, e quem digita "PRIDE
 * Fighting Championships" tem de achar o PRIDE. Atleta de esporte de combate é
 * procurado pelo apelido antes do nome de registro.
 */
function chaveExtra(entidade: Entidade): string[] {
  if (entidade.tipo === "organizacao") {
    return [entidade.nomeCompleto ?? "", ...entidade.aliases];
  }

  if (entidade.tipo === "lenda") {
    return [entidade.apelido ?? ""];
  }

  return [];
}

function entidadeNoIndice(entidade: Entidade): ItemDoIndice {
  return montar({
    titulo: entidade.nome,
    href: `${rotaDaEntidade[entidade.tipo]}/${entidade.slug}`,
    rotulo: rotuloDaEntidade(entidade),
    tipo: tipoDaEntidade[entidade.tipo],
    resumo: entidade.resumo,
    extra: chaveExtra(entidade),
  });
}

export function getIndiceDeBusca(): ItemDoIndice[] {
  const noticias = getTodasNoticias().map((noticia) =>
    montar({
      titulo: noticia.title,
      href: `/noticia/${noticia.slug}`,
      rotulo: rotuloDeNoticia(noticia.categoria),
      tipo: "noticia",
      resumo: noticia.resumo,
      data: noticia.date,
      extra: [...noticia.tags, ...noticia.organizacoes],
    })
  );

  // Vídeo entra no mesmo índice das matérias em vez de ganhar busca própria
  // dentro da seção: quem procura um atleta quer achar o que existe sobre ele,
  // não escolher antes em que formato.
  const videos = getTodosOsVideos().map((video) =>
    montar({
      titulo: video.title,
      href: `/videos/${video.slug}`,
      rotulo: `Vídeo · ${rotuloDeNoticia(video.categoria)}`,
      tipo: "video",
      resumo: video.descricao,
      data: video.publicadoEm,
      extra: [video.canal ?? "", ...video.tags, ...video.organizacoes],
    })
  );

  const artigos = arquivo.getTodos().map((artigo) =>
    montar({
      titulo: artigo.title,
      href: `/arquivo/${artigo.slug}`,
      rotulo: arquivo.rotuloDaCategoria(artigo.categoria),
      tipo: "arquivo",
      resumo: artigo.resumo,
      data: artigo.date,
      extra: artigo.organizacoes,
    })
  );

  const reviews = arsenal.getTodos().map((review) =>
    montar({
      titulo: review.title,
      href: `/arsenal/${review.slug}`,
      rotulo: arsenal.rotuloDaCategoria(review.categoria),
      tipo: "arsenal",
      resumo: review.resumo,
      data: review.date,
    })
  );

  const entidades = [
    ...getOrganizacoes(),
    ...getLendas(),
    ...getMomentos(),
  ].map(entidadeNoIndice);

  // Com data primeiro, da mais recente para a mais antiga; as entidades do
  // Arquivo, que são atemporais, fecham a lista em ordem alfabética.
  return [
    ...noticias,
    ...videos,
    ...artigos,
    ...reviews,
    ...entidades,
  ].sort((a, b) => {
    if (a.data && b.data) return b.data.localeCompare(a.data);
    if (a.data) return -1;
    if (b.data) return 1;
    return a.titulo.localeCompare(b.titulo, "pt-BR");
  });
}
