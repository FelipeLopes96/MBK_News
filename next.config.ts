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
