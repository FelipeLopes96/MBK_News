/**
 * Publicação via GitHub.
 *
 * Na Vercel o sistema de arquivos é somente leitura em runtime, então o painel
 * não escreve o `.md` no disco: ele commita no repositório e deixa o deploy
 * automático republicar o site. O commit é montado pela Git Data API — blob,
 * árvore, commit, ref — em vez da API de conteúdo, porque assim a matéria e a
 * imagem entram no MESMO commit. Publicar em duas chamadas separadas é o que
 * faz a capa quebrar em produção quando a segunda falha.
 */

const API = "https://api.github.com";

export type ArquivoParaCommit = {
  /** Caminho a partir da raiz do repo, ex.: "content/noticias/2026-08-14-x.md". */
  caminho: string;
  conteudo: Buffer;
};

export type DadosDoCommit = {
  sha: string;
  url: string;
};

function config() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN não definida — sem ela o painel não consegue publicar."
    );
  }

  const repo = process.env.GITHUB_REPO ?? "FelipeLopes96/MBK_News";
  const branch = process.env.GITHUB_BRANCH ?? "main";

  return { token, repo, branch };
}

async function chamar<T>(
  caminho: string,
  init?: RequestInit & { body?: string }
): Promise<T> {
  const { token } = config();

  const resposta = await fetch(`${API}${caminho}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...init?.headers,
    },
    // O cache de fetch do Next serviria SHA velho e o commit sairia em cima de
    // uma base desatualizada.
    cache: "no-store",
  });

  if (!resposta.ok) {
    const corpo = await resposta.text();
    throw new Error(
      `GitHub respondeu ${resposta.status} em ${caminho}: ${corpo.slice(0, 300)}`
    );
  }

  return resposta.json() as Promise<T>;
}

/** Requisição à API de conteúdo, que responde 404 sem ser erro. */
async function pedirConteudo(caminho: string): Promise<Response> {
  const { token, repo, branch } = config();

  return fetch(
    `${API}/repos/${repo}/contents/${encodeURI(caminho)}?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    }
  );
}

/** `true` quando o caminho já existe no branch — usado para não sobrescrever matéria publicada. */
export async function caminhoExiste(caminho: string): Promise<boolean> {
  const resposta = await pedirConteudo(caminho);

  if (resposta.status === 404) return false;
  if (resposta.ok) return true;

  const corpo = await resposta.text();
  throw new Error(
    `GitHub respondeu ${resposta.status} ao checar ${caminho}: ${corpo.slice(0, 300)}`
  );
}

/**
 * Nomes dos arquivos de um diretório do repositório.
 *
 * O painel lista as matérias por aqui, e não pelo disco, porque o disco do
 * servidor é o do último deploy: uma matéria publicada há trinta segundos ainda
 * não está lá, e sumir da lista logo depois de publicar é o tipo de coisa que
 * faz o editor publicar de novo.
 */
export async function listarArquivos(diretorio: string): Promise<string[]> {
  const resposta = await pedirConteudo(diretorio);

  // Diretório ainda não criado é lista vazia, não erro.
  if (resposta.status === 404) return [];

  if (!resposta.ok) {
    const corpo = await resposta.text();
    throw new Error(
      `GitHub respondeu ${resposta.status} ao listar ${diretorio}: ${corpo.slice(0, 300)}`
    );
  }

  const itens = (await resposta.json()) as { name: string; type: string }[];
  return itens.filter((item) => item.type === "file").map((item) => item.name);
}

/** Conteúdo de um arquivo de texto do repositório; `undefined` se não existe. */
export async function lerArquivo(caminho: string): Promise<string | undefined> {
  const resposta = await pedirConteudo(caminho);

  if (resposta.status === 404) return undefined;

  if (!resposta.ok) {
    const corpo = await resposta.text();
    throw new Error(
      `GitHub respondeu ${resposta.status} ao ler ${caminho}: ${corpo.slice(0, 300)}`
    );
  }

  const arquivo = (await resposta.json()) as {
    content?: string;
    encoding?: string;
  };

  // Acima de 1 MB a API devolve o conteúdo vazio e manda usar a API de blobs.
  // Nenhum .md chega perto disso, mas em silêncio o painel abriria o formulário
  // vazio e o editor publicaria a matéria em branco por cima da original.
  if (arquivo.encoding !== "base64" || typeof arquivo.content !== "string") {
    throw new Error(
      `GitHub devolveu ${caminho} num formato inesperado (encoding: ${arquivo.encoding}).`
    );
  }

  return Buffer.from(arquivo.content, "base64").toString("utf8");
}

/**
 * Sobe todos os arquivos num único commit no topo do branch configurado, e
 * apaga os caminhos em `apagados` no mesmo commit.
 *
 * Escrita e remoção juntas não são conveniência: renomear uma matéria é gravar
 * no caminho novo e apagar o antigo, e em dois commits o site fica um deploy
 * inteiro com a matéria duplicada em dois endereços.
 *
 * Devolve o SHA para o painel poder linkar o commit gerado.
 */
export async function commitarArquivos(
  mensagem: string,
  arquivos: ArquivoParaCommit[],
  apagados: string[] = []
): Promise<DadosDoCommit> {
  const { repo, branch } = config();

  const ref = await chamar<{ object: { sha: string } }>(
    `/repos/${repo}/git/ref/heads/${branch}`
  );
  const shaDoTopo = ref.object.sha;

  const commitDoTopo = await chamar<{ tree: { sha: string } }>(
    `/repos/${repo}/git/commits/${shaDoTopo}`
  );

  // Tudo em base64: o mesmo caminho serve para o markdown e para a imagem.
  const blobs = await Promise.all(
    arquivos.map(async (arquivo) => {
      const blob = await chamar<{ sha: string }>(`/repos/${repo}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({
          content: arquivo.conteudo.toString("base64"),
          encoding: "base64",
        }),
      });

      return { caminho: arquivo.caminho, sha: blob.sha };
    })
  );

  const arvore = await chamar<{ sha: string }>(`/repos/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: commitDoTopo.tree.sha,
      tree: [
        ...blobs.map((blob) => ({
          path: blob.caminho,
          mode: "100644",
          type: "blob",
          sha: blob.sha,
        })),
        // `sha: null` numa árvore com `base_tree` é como a Git Data API remove
        // um caminho — não existe verbo de exclusão.
        ...apagados.map((caminho) => ({
          path: caminho,
          mode: "100644",
          type: "blob",
          sha: null,
        })),
      ],
    }),
  });

  const commit = await chamar<{ sha: string; html_url: string }>(
    `/repos/${repo}/git/commits`,
    {
      method: "POST",
      body: JSON.stringify({
        message: mensagem,
        tree: arvore.sha,
        parents: [shaDoTopo],
      }),
    }
  );

  await chamar(`/repos/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    // Sem `force`: se alguém commitou no meio do caminho, o push falha em vez
    // de apagar o trabalho do outro.
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });

  return { sha: commit.sha, url: commit.html_url };
}
