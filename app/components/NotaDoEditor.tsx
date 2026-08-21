/**
 * Nota do editor, no fim da página: a voz do veículo sobre a apuração — como a
 * matéria foi feita, que vínculo existe com o personagem.
 *
 * Fica deliberadamente discreta — corpo menor, cor mais baixa, filete lateral —
 * para que o leitor a reconheça como nota editorial e não a confunda com o
 * texto jornalístico.
 */
export default function NotaDoEditor({
  nota,
  titulo = "Nota do editor",
}: {
  nota?: string;
  titulo?: string;
}) {
  if (!nota) {
    return null;
  }

  return (
    <aside className="mt-12 rounded-r-lg border-l-2 border-linha-forte bg-superficie-alta px-5 py-4">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-texto-fraco">
        {titulo}
      </h2>
      <p className="mt-2 text-sm leading-6 text-texto-suave">{nota}</p>
    </aside>
  );
}
