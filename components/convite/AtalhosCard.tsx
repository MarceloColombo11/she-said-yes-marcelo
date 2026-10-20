import Link from "next/link";
import { Camera, Gift } from "lucide-react";

const ATALHOS = [
  {
    href: "/#fotos",
    title: "Suba suas fotos",
    text: "Fotos e vídeos da festa, direto do celular",
    Icon: Camera,
  },
  {
    href: "/#presentes",
    title: "Lista de presentes",
    text: "Se quiser nos presentear",
    Icon: Gift,
  },
];

export function AtalhosCard({ title }: { title: string }) {
  return (
    <section aria-labelledby="atalhos-titulo">
      <h2
        id="atalhos-titulo"
        className="text-center font-heading text-xl font-semibold text-brown"
      >
        {title}
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {ATALHOS.map(({ href, title: label, text, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-olive/15 bg-white/70 p-4 text-center transition-colors hover:bg-sage/10 active:scale-[0.98]"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-sage/15 text-sage">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="font-medium text-brown">{label}</span>
            <span className="text-xs leading-snug text-olive">{text}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
