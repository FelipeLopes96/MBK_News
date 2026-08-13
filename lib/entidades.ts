import {
  carregarBrutos,
  normalizarFontes,
  normalizarImagem,
  normalizarLista,
  normalizarOrganizacoes,
  normalizarValorQualificado,
  slugDoArquivo,
  textoOpcional,
  type ArquivoBruto,
  type Fonte,
  type ImagemComCredito,
  type ValorQualificado,
} from "@/lib/conteudo";

/**
 * As entidades do Arquivo — organizações, lendas e momentos históricos.
 *
 * Cada entidade é um .md em content/organizacoes, content/lendas ou
 * content/momentos: o frontmatter guarda os campos estruturados e os
 * relacionamentos, e o corpo do arquivo guarda o texto longo (a história).
 *
 * Os relacionamentos são resolvidos sempre por slug de organização, nunca
 * dentro de componente: cadastrar um .md novo já o faz aparecer nas listagens
 * e no hub da organização correspondente, sem tocar em código.
 */

export type TipoDeEntidade = "organizacao" | "lenda" | "momento";

/** Campos comuns às três entidades. */
type Base = {
  slug: string;
  /** Nome da organização/lenda ou título do momento. */
  nome: string;
  tipo: TipoDeEntidade;
  resumo?: string;
  imagem?: ImagemComCredito;
  fontes: Fonte[];
  /**
   * Nota do editor: a voz do veículo sobre como a matéria foi apurada — vínculo
   * pessoal com o personagem, método, limites da apuração. Não é parte do
   * texto jornalístico e é exibida como nota, no fim da página.
   */
  notaDoEditor?: string;
  /** Corpo do .md, ainda em Markdown — a história/conteúdo da entidade. */
  conteudo: string;
};

export type Organizacao = Base & {
  tipo: "organizacao";
  /** Ex.: "Ultimate Fighting Championship". Usado como subtítulo do hub. */
  nomeCompleto?: string;
  /** Frase de apresentação, exibida como subtítulo quando existir. */
  tagline?: string;
  /**
   * Artigo usado ao citar a organização — "Lenda **do** PRIDE", "Lenda **da**
   * KSW". Quando ausente, assume "do".
   */
  artigo?: string;
  /** Modalidade principal — ex.: "MMA", "Kickboxing". */
  modalidade?: string;
  /** Ano de fundação. */
  fundacao?: string;
  /** Ano de encerramento, para organizações extintas. */
  encerramento?: string;
  /** Período de atividade — ex.: "1993–2007", em alternativa aos anos soltos. */
  periodo?: string;
  /** Situação atual — ex.: "Em atividade", "Extinta". */
  status?: string;
  pais?: string;
  /** Cidade-sede. */
  sede?: string;
  /** Grupo controlador atual. */
  proprietario?: string;
  /** Título da seção de história, quando a matéria tem o seu próprio. */
  tituloDaHistoria?: string;
  /** Texto de legado, exibido depois da história. */
  legado?: string;
  /**
   * Outros slugs que apontam para esta organização. Existe porque um conteúdo
   * pode vir marcado como "one-championship" enquanto a rota é /one.
   */
  aliases: string[];
};

/** Luta marcante de uma lenda. Só `titulo` é obrigatório. */
export type GrandeLuta = {
  titulo: string;
  evento?: string;
  ano?: string;
  resultado?: string;
};

/**
 * Título conquistado por uma lenda. `qualificacao` existe porque boa parte dos
 * títulos do kickboxing e do Muay Thai não tem registro público consolidado:
 * quando a única fonte é o próprio atleta, o título é publicado com essa
 * ressalva ao lado, em vez de entrar na página como dado oficial.
 */
export type TituloDeLenda = {
  titulo: string;
  /** Onde foi conquistado — ex.: "Rússia". */
  local?: string;
  qualificacao?: string;
};

export type Lenda = Base & {
  tipo: "lenda";
  apelido?: string;
  /** Slugs das organizações às quais a lenda está ligada. */
  organizacoes: string[];
  /** Modalidade — ex.: "MMA", "Kickboxing / Muay Thai". */
  modalidade?: string;
  /** Categoria de peso — ex.: "Peso-pesado". */
  categoria?: string;
  /** Período de atividade — ex.: "2000–2012". */
  periodo?: string;
  /** Cartel — ex.: "40-6 (1 NC)". Atribuído quando não há registro oficial. */
  cartel?: ValorQualificado;
  /** Estreia profissional, quando a data é conhecida ou estimada. */
  primeiraLutaProfissional?: ValorQualificado;
  titulos: TituloDeLenda[];
  grandesLutas: GrandeLuta[];
  /** Título da seção de história, quando a matéria tem o seu próprio. */
  tituloDaHistoria?: string;
  /** Texto de legado, exibido depois da história. */
  legado?: string;
};

export type Momento = Base & {
  tipo: "momento";
  /** Slugs das organizações ligadas ao momento. */
  organizacoes: string[];
  /** Data ISO (AAAA-MM-DD) ou apenas o ano, quando só isso se sabe. */
  data?: string;
  local?: string;
};

export type Entidade = Organizacao | Lenda | Momento;

const PASTA_ORGANIZACOES = "organizacoes";
const PASTA_LENDAS = "lendas";
const PASTA_MOMENTOS = "momentos";

function slugDe(bruto: ArquivoBruto): string {
  return String(bruto.data.slug ?? bruto.data.id ?? slugDoArquivo(bruto.arquivo));
}

/** `nome` para organizações e lendas; `title`/`titulo` para momentos. */
function nomeDe(bruto: ArquivoBruto): string {
  const { data } = bruto;
  return String(
    data.nome ?? data.name ?? data.titulo ?? data.title ?? slugDe(bruto)
  );
}

function base(bruto: ArquivoBruto, tipo: TipoDeEntidade): Base {
  const { data, conteudo } = bruto;

  return {
    slug: slugDe(bruto),
    nome: nomeDe(bruto),
    tipo,
    resumo: textoOpcional(data.resumo ?? data.summary ?? data.description),
    imagem: normalizarImagem(data.imagem ?? data.image),
    fontes: normalizarFontes(data.fontes ?? data.sources),
    notaDoEditor: textoOpcional(data.notaDoEditor ?? data.editorNote),
    conteudo,
  };
}

/** Aceita "Fedor x Cro Cop" ou { titulo, evento, ano, resultado }. */
function normalizarGrandesLutas(valor: unknown): GrandeLuta[] {
  const lista = Array.isArray(valor) ? valor : [valor];

  return lista.flatMap((item): GrandeLuta[] => {
    if (typeof item === "string") {
      const titulo = item.trim();
      return titulo ? [{ titulo }] : [];
    }

    if (item && typeof item === "object") {
      const campos = item as Record<string, unknown>;
      const titulo = textoOpcional(campos.titulo ?? campos.title ?? campos.luta);
      if (!titulo) return [];

      return [
        {
          titulo,
          evento: textoOpcional(campos.evento ?? campos.event),
          ano: textoOpcional(campos.ano ?? campos.year),
          resultado: textoOpcional(campos.resultado ?? campos.result),
        },
      ];
    }

    return [];
  });
}

/** Aceita "Campeão Mundial" ou { titulo, local, qualificacao }. */
function normalizarTitulos(valor: unknown): TituloDeLenda[] {
  const lista = Array.isArray(valor) ? valor : [valor];

  return lista.flatMap((item): TituloDeLenda[] => {
    if (typeof item === "string") {
      const titulo = item.trim();
      return titulo ? [{ titulo }] : [];
    }

    if (item && typeof item === "object") {
      const campos = item as Record<string, unknown>;
      const titulo = textoOpcional(campos.titulo ?? campos.title);
      if (!titulo) return [];

      return [
        {
          titulo,
          local: textoOpcional(campos.local ?? campos.location),
          qualificacao: textoOpcional(
            campos.qualificacao ?? campos.qualification
          ),
        },
      ];
    }

    return [];
  });
}

function lerOrganizacoes(): Organizacao[] {
  return carregarBrutos(PASTA_ORGANIZACOES)
    .map((bruto) => {
      const { data } = bruto;

      return {
        ...base(bruto, "organizacao"),
        tipo: "organizacao",
        nomeCompleto: textoOpcional(data.nomeCompleto ?? data.fullName),
        tagline: textoOpcional(data.tagline),
        artigo: textoOpcional(data.artigo),
        modalidade: textoOpcional(data.modalidade ?? data.sport),
        fundacao: textoOpcional(data.fundacao ?? data.founded),
        encerramento: textoOpcional(data.encerramento ?? data.ended),
        periodo: textoOpcional(data.periodo ?? data.period),
        status: textoOpcional(data.status),
        pais: textoOpcional(data.pais ?? data.country),
        sede: textoOpcional(data.sede ?? data.headquarters),
        proprietario: textoOpcional(data.proprietario ?? data.currentOwner),
        tituloDaHistoria: textoOpcional(data.tituloDaHistoria),
        legado: textoOpcional(data.legado ?? data.legacy),
        aliases: normalizarLista(data.aliases),
      } satisfies Organizacao;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

function lerLendas(): Lenda[] {
  return carregarBrutos(PASTA_LENDAS)
    .map((bruto) => {
      const { data } = bruto;

      return {
        ...base(bruto, "lenda"),
        tipo: "lenda",
        apelido: textoOpcional(data.apelido ?? data.nickname),
        organizacoes: normalizarOrganizacoes(data),
        modalidade: textoOpcional(data.modalidade ?? data.sport),
        categoria: textoOpcional(data.categoria ?? data.category),
        periodo: textoOpcional(data.periodo ?? data.period),
        cartel: normalizarValorQualificado(data.cartel ?? data.record),
        primeiraLutaProfissional: normalizarValorQualificado(
          data.primeiraLutaProfissional ?? data.professionalCareerStart
        ),
        titulos: normalizarTitulos(data.titulos ?? data.titles),
        grandesLutas: normalizarGrandesLutas(data.grandesLutas ?? data.keyFights),
        tituloDaHistoria: textoOpcional(data.tituloDaHistoria),
        legado: textoOpcional(data.legado ?? data.legacy),
      } satisfies Lenda;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

function lerMomentos(): Momento[] {
  return carregarBrutos(PASTA_MOMENTOS)
    .map((bruto) => {
      const { data } = bruto;

      return {
        ...base(bruto, "momento"),
        tipo: "momento",
        organizacoes: normalizarOrganizacoes(data),
        data: textoOpcional(data.data ?? data.date),
        local: textoOpcional(data.local ?? data.venue),
      } satisfies Momento;
    })
    // Mais antigos primeiro: em conteúdo histórico a ordem cronológica é a que
    // conta a história na sequência certa.
    .sort((a, b) => (a.data ?? "").localeCompare(b.data ?? ""));
}

export function getOrganizacoes(): Organizacao[] {
  return lerOrganizacoes();
}

export function getLendas(): Lenda[] {
  return lerLendas();
}

export function getMomentos(): Momento[] {
  return lerMomentos();
}

/** Resolve por slug ou por qualquer um dos aliases da organização. */
export function getOrganizacao(slug: string): Organizacao | undefined {
  const procurado = slug.trim().toLowerCase();

  return getOrganizacoes().find(
    (organizacao) =>
      organizacao.slug.toLowerCase() === procurado ||
      organizacao.aliases.some((alias) => alias.toLowerCase() === procurado)
  );
}

export function getLenda(slug: string): Lenda | undefined {
  return getLendas().find((lenda) => lenda.slug === slug);
}

export function getMomento(slug: string): Momento | undefined {
  return getMomentos().find((momento) => momento.slug === slug);
}

/**
 * Uma referência a organização casa quando aponta para o slug canônico ou para
 * qualquer alias — é isso que faz `one` e `one-championship` serem a mesma coisa.
 */
export function referenciaOrganizacao(
  referencias: string[],
  organizacao: Organizacao
): boolean {
  const aceitos = new Set(
    [organizacao.slug, ...organizacao.aliases].map((valor) => valor.toLowerCase())
  );

  return referencias.some((referencia) =>
    aceitos.has(referencia.trim().toLowerCase())
  );
}

export function getLendasDaOrganizacao(organizacao: Organizacao): Lenda[] {
  return getLendas().filter((lenda) =>
    referenciaOrganizacao(lenda.organizacoes, organizacao)
  );
}

export function getMomentosDaOrganizacao(organizacao: Organizacao): Momento[] {
  return getMomentos().filter((momento) =>
    referenciaOrganizacao(momento.organizacoes, organizacao)
  );
}

/** Nome de exibição de uma organização a partir de um slug/alias solto. */
export function nomeDaOrganizacao(slug: string): string {
  return getOrganizacao(slug)?.nome ?? slug;
}

/** Prefixo de rota por tipo de entidade. */
const rotaDoTipo: Record<TipoDeEntidade, string> = {
  organizacao: "/arquivo/organizacoes",
  lenda: "/arquivo/lendas",
  momento: "/arquivo/momentos",
};

/**
 * Versão enxuta de uma entidade, pronta para um card.
 *
 * Existe porque a grade filtrável roda no cliente: `Entidade` carrega o corpo
 * inteiro do .md e depende de `getOrganizacao` (que lê o disco), então o que
 * cruza a fronteira é esta forma — sem o texto e com o rótulo já resolvido.
 */
export type CardDeEntidade = {
  slug: string;
  href: string;
  nome: string;
  rotulo: string;
  resumo?: string;
  imagem?: ImagemComCredito;
  /** Slugs canônicos das organizações, que é o que o filtro compara. */
  organizacoes: string[];
};

/** Slugs canônicos das organizações citadas por uma entidade. */
function organizacoesCanonicas(entidade: Entidade): string[] {
  if (entidade.tipo === "organizacao") {
    return [entidade.slug];
  }

  return entidade.organizacoes
    .map((referencia) => getOrganizacao(referencia)?.slug)
    .filter((slug): slug is string => slug !== undefined);
}

export function paraCardDeEntidade(
  entidade: Entidade,
  opcoes?: { comOrganizacao?: boolean }
): CardDeEntidade {
  return {
    slug: entidade.slug,
    href: `${rotaDoTipo[entidade.tipo]}/${entidade.slug}`,
    nome: entidade.nome,
    rotulo: rotuloDaEntidade(entidade, opcoes),
    resumo: entidade.resumo,
    imagem: entidade.imagem,
    organizacoes: organizacoesCanonicas(entidade),
  };
}

/**
 * Organizações que aparecem entre as entidades recebidas, na ordem em que estão
 * cadastradas. Serve de fonte para os filtros: só entra organização que tem
 * pelo menos uma entidade, então nenhum filtro leva a uma grade vazia.
 */
export function organizacoesPresentes(
  entidades: Entidade[]
): { slug: string; rotulo: string }[] {
  const presentes = new Set(entidades.flatMap(organizacoesCanonicas));

  return getOrganizacoes()
    .filter((organizacao) => presentes.has(organizacao.slug))
    .map((organizacao) => ({
      slug: organizacao.slug,
      rotulo: organizacao.nome,
    }));
}

/** Rótulo curto usado nos cards, por tipo de entidade. */
export const rotuloDoTipo: Record<TipoDeEntidade, string> = {
  organizacao: "Organização",
  lenda: "Lenda",
  momento: "Momento histórico",
};

/**
 * Rótulo de lenda com a organização a que ela pertence — "Lenda do PRIDE".
 * Com mais de uma, cita todas: "Lenda do UFC e do ONE Championship". Sem
 * organização cadastrada, volta a ser só "Lenda".
 */
export function rotuloDeLenda(lenda: Lenda): string {
  const citacoes = lenda.organizacoes
    .map((referencia) => getOrganizacao(referencia))
    .filter((organizacao) => organizacao !== undefined)
    .map((organizacao) => `${organizacao.artigo ?? "do"} ${organizacao.nome}`);

  if (citacoes.length === 0) {
    return rotuloDoTipo.lenda;
  }

  return `Lenda ${citacoes.join(" e ")}`;
}

/** Rótulo de card de qualquer entidade, já com a organização quando faz sentido. */
export function rotuloDaEntidade(
  entidade: Entidade,
  { comOrganizacao = true }: { comOrganizacao?: boolean } = {}
): string {
  if (entidade.tipo === "lenda" && comOrganizacao) {
    return rotuloDeLenda(entidade);
  }

  return rotuloDoTipo[entidade.tipo];
}
