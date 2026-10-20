"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ADMIN_AREAS } from "@/components/admin/admin-areas";


export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh overflow-x-hidden bg-white text-olive">
      <header className="border-b border-sage/30 bg-[#f7f4ef]">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-heading text-2xl font-semibold tracking-wide text-olive">
              Suelen & Marcelo
            </p>
            <p className="mt-1 text-sm text-olive/70">Área dos noivos</p>
          </div>
          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              className="h-11 min-h-11 border-sage/60 text-olive"
            >
              Sair
            </Button>
          </form>
        </div>
        <nav
          aria-label="Áreas do painel"
          className="mx-auto flex max-w-2xl flex-wrap gap-x-6 gap-y-2 px-4 pb-4"
        >
          <Link
            href="/admin"
            className={cn(
              "inline-flex min-h-11 items-center font-heading text-lg",
              pathname === "/admin"
                ? "border-b-2 border-sage text-olive"
                : "text-olive/70 hover:text-olive",
            )}
          >
            Início
          </Link>
          {ADMIN_AREAS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex min-h-11 items-center font-heading text-lg",
                  active
                    ? "border-b-2 border-sage text-olive"
                    : "text-olive/70 hover:text-olive",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-2xl px-4 py-8">{children}</main>
    </div>
  );
}
