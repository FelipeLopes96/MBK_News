import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // O padrão de 1 MB por Server Action barraria a capa da matéria: o painel
    // manda a imagem no mesmo POST do formulário.
    serverActions: { bodySizeLimit: "8mb" },
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
    ],
  },
};

export default nextConfig;
