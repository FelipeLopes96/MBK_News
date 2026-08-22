import Link from "next/link";

/**
 * Tags da matéria.
 *
 * Cada tag leva para a busca do portal com o termo já preenchido, em vez de ser
 * texto decorativo. Não criei rota `/tag/[slug]`: o índice de busca já inclui as
 * tags na chave, então o resultado é o mesmo — sem uma segunda listagem para
 * manter, e sem dezenas de páginas quase vazias no sitemap.
 */
export default function TagsDaMateria({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-bold uppercase tracking-widest text-texto-fraco">
        Tags
      </span>

      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/busca?q=${encodeURIComponent(tag)}`}
          className="rounded-full border border-linha bg-superficie px-3 py-1 text-xs font-medium text-texto-corpo transition-colors hover:border-marca hover:text-marca-clara focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
