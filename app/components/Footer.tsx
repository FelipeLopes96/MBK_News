import Image from "next/image";
import Link from "next/link";
import Container from "@/app/components/Container";
import { secoesDoArquivo } from "@/lib/navegacao";
import { categorias } from "@/lib/noticias";
import { NOME_DO_SITE, TAGLINE } from "@/lib/seo";

const secoes = [
  { href: "/noticias", rotulo: "Todas as notícias" },
  { href: "/arquivo", rotulo: "Arquivo" },
  { href: "/arsenal", rotulo: "Arsenal" },
  { href: "/busca", rotulo: "Busca" },
];

const classeDoLink =
  "text-sm text-texto-suave transition-colors hover:text-marca-clara";

function Coluna({
  titulo,
  itens,
}: {
  titulo: string;
  itens: { href: string; rotulo: string }[];
}) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-texto-fraco">
        {titulo}
      </h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {itens.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={classeDoLink}>
              {item.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const modalidades = categorias.map((categoria) => ({
    href: `/${categoria.slug}`,
    rotulo: categoria.rotulo,
  }));

  return (
    <footer className="border-t border-linha bg-superficie">
      <Container className="grid grid-cols-2 gap-10 lg:grid-cols-4">
        <div className="col-span-2">
          <Link href="/" className="inline-block">
            <Image
              src="/marca/mbk-news.png"
              alt={NOME_DO_SITE}
              width={620}
              height={218}
              className="h-8 w-auto"
            />
          </Link>

          <p className="mt-3 text-sm text-texto-suave">{TAGLINE}</p>

          {/*
            A origem da marca aparece aqui, e não no cabeçalho: a MBK é de onde
            o veículo nasceu, mas quem abre o portal precisa encontrar um
            veículo de jornalismo, não a página de uma academia.
          */}
          <p className="mt-6 max-w-sm text-xs leading-5 text-texto-fraco">
            O {NOME_DO_SITE} nasceu no ecossistema da MBK e é editorialmente
            independente. Cobertura de MMA, boxe, muay thai, jiu-jitsu,
            kickboxing e wrestling.
          </p>
        </div>

        <Coluna titulo="Modalidades" itens={modalidades} />

        <div className="flex flex-col gap-10">
          <Coluna titulo="Seções" itens={secoes} />
          <Coluna titulo="Arquivo" itens={secoesDoArquivo} />
        </div>
      </Container>

      <div className="border-t border-linha">
        <Container espacamento="compacto">
          <p className="text-xs text-texto-fraco">
            © 2026 {NOME_DO_SITE}. Todos os direitos reservados.
          </p>
        </Container>
      </div>
    </footer>
  );
}
