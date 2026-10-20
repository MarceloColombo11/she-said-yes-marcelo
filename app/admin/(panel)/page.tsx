import Link from "next/link";
import { ADMIN_AREAS } from "@/components/admin/admin-areas";

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Painel</h1>
        <p className="mt-2 text-olive/75">
          Escolham uma área para atualizar o site. O que for salvo aparece para
          os convidados em até um minuto.
        </p>
      </div>
      <ul className="space-y-3">
        {ADMIN_AREAS.map((area) => (
          <li key={area.href}>
            <Link
              href={area.href}
              className="flex min-h-14 items-center justify-between gap-4 border border-sage/30 px-4 py-3 font-heading text-xl hover:border-sage"
            >
              {area.label}
              <span className="text-right text-sm font-sans text-olive/60">
                {area.hint}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
