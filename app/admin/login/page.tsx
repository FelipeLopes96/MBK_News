import FormularioDeLogin from "@/app/admin/login/FormularioDeLogin";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-extrabold tracking-tight text-texto">
        Painel editorial
      </h1>
      <p className="mt-2 mb-8 text-sm text-texto-fraco">
        Acesso restrito à redação do MBK News.
      </p>

      <FormularioDeLogin />
    </main>
  );
}
