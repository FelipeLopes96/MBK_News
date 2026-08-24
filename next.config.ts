import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // O padrão de 1 MB por Server Action barraria a capa da matéria: o painel
    // manda as imagens no mesmo POST do formulário — a capa e as fotos do meio
    // do texto, quantas o editor usar.
    //
    // Folga proposital sobre o teto de 20 MB que `validar` aplica à soma dos
    // arquivos: o limite conta o corpo HTTP cru, com os cabeçalhos de cada parte
    // do multipart. Sem a folga, o envio no limite morreria no framework, que
    // responde com erro de rede em vez de dizer qual foto pesou.
    serverActions: { bodySizeLimit: "22mb" },
  },
  /*
   * O painel é a única rota que lê `content/noticias` fora do build: a lista de
   * matérias mostra título e categoria a partir do disco. As páginas do site são
   * estáticas e levam esse conteúdo embutido, então o rastreamento do Next não
   * tem por que incluir os .md no bundle da função — e sem eles a lista sairia
   * vazia só em produção.
   */
  outputFileTracingIncludes: {
    "/admin/**": ["./content/noticias/**/*"],
  },
  /*
   * A página 1 é canônica na raiz da seção, então /noticias/pagina/1 e
   * /mma/pagina/1 não são endereços do site — e agora que as rotas paginadas
   * declaram `dynamicParams = false`, a página 1 ficaria de fora da lista
   * gerada e responderia 404.
   *
   * Redirect aqui e não na página: o `redirects` é conferido antes do sistema
   * de arquivos, então sai um 308 de verdade. Dentro da página o desvio
   * aconteceria com o corpo já sendo transmitido, e aí o status não muda mais —
   * é o mesmo motivo que fazia o 404 sair como 200. O `redirect` que sobrou nas
   * páginas é rede: se um dia a página 1 voltar para a lista gerada, ela
   * continua não duplicando a raiz.
   */
  redirects() {
    return [
      // Pega /noticias/pagina/1, /videos/pagina/1 e /<modalidade>/pagina/1.
      { source: "/:secao/pagina/1", destination: "/:secao", permanent: true },
      {
        source: "/videos/modalidade/:slug/pagina/1",
        destination: "/videos/modalidade/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        // Miniaturas dos vídeos. Vêm do YouTube porque a alternativa seria
        // baixar e versionar uma imagem por vídeo cadastrado.
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/vi/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
