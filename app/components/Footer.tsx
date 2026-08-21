import Image from "next/image";
import Link from "next/link";
import { categorias } from "@/lib/noticias";
import { NOME_DO_SITE, TAGLINE } from "@/lib/seo";

const secoes = [
  { href: "/arquivo", rotulo: "Arquivo" },
  { href: "/arsenal", rotulo: "Arsenal" },
];

export default function Footer() {
  return (
    <footer className="border-t border-linha bg-superficie">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="inline-block">
            <Image
              src="/marca/mbk-news.png"
              alt="MBK News"
              width={620}
              height={218}
              className="h-8 w-auto"
            />
          </Link>
          <p className="mt-2 text-sm text-texto-fraco">{TAGLINE}</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {/* Mesma ordem do Header: o acervo geral antes das categorias. */}
          <Link
            href="/noticias"
            className="text-texto-suave transition-colors hover:text-marca-clara"
          >
            Notícias
          </Link>
          {categorias.map((categoria) => (
            <Link
              key={categoria.slug}
              href={`/${categoria.slug}`}
              className="text-texto-suave transition-colors hover:text-marca-clara"
            >
              {categoria.rotulo}
            </Link>
          ))}
          {secoes.map((secao) => (
            <Link
              key={secao.href}
              href={secao.href}
              className="text-texto-suave transition-colors hover:text-marca-clara"
            >
              {secao.rotulo}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-linha">
        <p className="mx-auto max-w-6xl px-6 py-6 text-xs text-texto-fraco">
          © 2026 {NOME_DO_SITE}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
