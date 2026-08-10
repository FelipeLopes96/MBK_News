export default function AvisoDeAfiliados() {
  return (
    <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-zinc-500">
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="mt-0.5 h-4 w-4 shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm1-11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-2 3a1 1 0 0 1 2 0v3a1 1 0 1 1-2 0v-3Z"
          clipRule="evenodd"
        />
      </svg>
      Este artigo contém links de afiliados. Comprando através deles, você apoia
      O Corner sem custo adicional.
    </p>
  );
}
