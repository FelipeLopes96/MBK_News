import Image from "next/image";
import Link from "next/link";
import { categorias } from "@/lib/noticias";

const secoes = [
  { href: "/arquivo", rotulo: "Arquivo" },
  { href: "/arsenal", rotulo: "Arsenal" },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#111111]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="O Corner"
              width={181}
              height={47}
              className="h-7 w-auto"
            />
          </Link>
          <p className="mt-2 text-sm text-zinc-500">
            A referência digital em esportes de combate.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {/* Mesma ordem do Header: o acervo geral antes das categorias. */}
          <Link
            href="/noticias"
            className="text-zinc-400 transition-colors hover:text-[#F97316]"
          >
            Notícias
          </Link>
          {categorias.map((categoria) => (
            <Link
              key={categoria.slug}
              href={`/${categoria.slug}`}
              className="text-zinc-400 transition-colors hover:text-[#F97316]"
            >
              {categoria.rotulo}
            </Link>
          ))}
          {secoes.map((secao) => (
            <Link
              key={secao.href}
              href={secao.href}
              className="text-zinc-400 transition-colors hover:text-[#F97316]"
            >
              {secao.rotulo}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-zinc-800">
        <p className="mx-auto max-w-6xl px-6 py-6 text-xs text-zinc-500">
          © 2026 O Corner. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
