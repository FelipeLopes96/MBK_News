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

/** `true` quando o caminho já existe no branch — usado para não sobrescrever matéria publicada. */
export async function caminhoExiste(caminho: string): Promise<boolean> {
  const { token, repo, branch } = config();

  const resposta = await fetch(
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

  if (resposta.status === 404) return false;
  if (resposta.ok) return true;

  const corpo = await resposta.text();
  throw new Error(
    `GitHub respondeu ${resposta.status} ao checar ${caminho}: ${corpo.slice(0, 300)}`
  );
}

/**
 * Sobe todos os arquivos num único commit no topo do branch configurado.
 * Devolve o SHA para o painel poder linkar o commit gerado.
 */
export async function commitarArquivos(
  mensagem: string,
  arquivos: ArquivoParaCommit[]
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
      tree: blobs.map((blob) => ({
        path: blob.caminho,
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      })),
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
