"use client";

import { useState } from "react";
import Image from "next/image";
import { isSiteMediaUrl } from "@/lib/site-media";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export interface HonorPerson {
    nome: string;
    foto: string;
    texto: string;
    fotoZoom?: number;
    /** object-position CSS (ex.: "center 35%"). */
    fotoObjectPosition?: string;
    fotoOffsetY?: number;
}

function ArchPortrait({ person }: { person: HonorPerson }) {
    const [imgError, setImgError] = useState(false);
    const hasPhoto = Boolean(person.foto) && !imgError;

    return (
        <div className="rounded-t-full border border-brown/30 p-1.5 transition-colors group-hover:border-brown/60 sm:p-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-sage/15">
                {hasPhoto ? (
                    <Image
                        src={person.foto}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 45vw, 240px"
                        className="object-cover"
                        style={{
                            objectPosition:
                                person.fotoObjectPosition ?? "center 30%",
                        }}
                        unoptimized={isSiteMediaUrl(person.foto)}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <span
                        className="absolute inset-0 flex items-center justify-center font-heading text-4xl italic text-sage"
                        aria-hidden
                    >
                        {person.nome.charAt(0)}
                    </span>
                )}
            </div>
        </div>
    );
}

function HonorLetter({
    person,
    assinatura,
    onOpenChange,
}: {
    person: HonorPerson | null;
    assinatura: string;
    onOpenChange: (open: boolean) => void;
}) {
    const paragrafos = person
        ? person.texto
              .split(/\n+/)
              .map((p) => p.trim())
              .filter(Boolean)
        : [];

    return (
        <Dialog open={person !== null} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton
                className="max-h-[92dvh] max-w-[min(94vw,58rem)] gap-0 overflow-y-auto bg-cream p-0 sm:max-w-[min(94vw,58rem)] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:overflow-hidden"
            >
                {person && (
                    <>
                        {person.foto && (
                            <div className="relative flex items-center justify-center bg-olive/10 p-4 md:p-6">
                                <Image
                                    src={person.foto}
                                    alt={person.nome}
                                    width={720}
                                    height={900}
                                    sizes="(max-width: 768px) 94vw, 26rem"
                                    unoptimized={isSiteMediaUrl(person.foto)}
                                    className="max-h-[42dvh] w-auto max-w-full object-contain shadow-[0_12px_30px_-18px_rgba(61,23,0,0.7)] md:max-h-[80dvh]"
                                />
                            </div>
                        )}
                        <article className="px-6 py-8 sm:px-10 md:max-h-[92dvh] md:overflow-y-auto md:py-12">
                            <DialogHeader className="gap-0">
                                <DialogTitle className="font-heading text-2xl leading-snug font-normal italic text-brown sm:text-3xl">
                                    Para {person.nome},
                                </DialogTitle>
                                <DialogDescription className="sr-only">
                                    Carta de Suelen e Marcelo para {person.nome}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-6 max-w-[34rem] space-y-4 text-[0.95rem] leading-7 text-pretty text-olive">
                                {paragrafos.map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>
                            <p className="mt-10 text-right font-heading text-xl italic text-brown">
                                {assinatura}
                            </p>
                        </article>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

interface HonorSectionProps {
    title: string;
    subtitle?: string;
    data: HonorPerson[];
    assinatura: string;
}

export function HonorSection({
    title,
    subtitle,
    data,
    assinatura,
}: HonorSectionProps) {
    const [aberto, setAberto] = useState<HonorPerson | null>(null);

    return (
        <section className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
                <h2 className="font-heading text-3xl font-semibold text-brown md:text-4xl">
                    {title}
                </h2>
                {subtitle && <p className="mt-4 text-olive">{subtitle}</p>}
            </div>

            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-12 sm:gap-x-10 sm:gap-y-14">
                {data.map((person) => (
                    <li
                        key={person.nome}
                        className="w-[calc(50%-0.625rem)] max-w-60 sm:w-52 md:w-60"
                    >
                        <button
                            type="button"
                            onClick={() => setAberto(person)}
                            className="group block w-full cursor-pointer text-center focus-visible:outline-none"
                            aria-label={`Ler a carta para ${person.nome}`}
                        >
                            <span className="block rounded-t-full group-focus-visible:ring-2 group-focus-visible:ring-sage group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-cream">
                                <ArchPortrait person={person} />
                            </span>
                            <span className="mt-4 block font-heading text-base leading-snug font-medium italic text-balance text-brown sm:text-lg">
                                {person.nome}
                            </span>
                            <span className="mt-1 inline-block text-sm text-sage underline decoration-sage/40 underline-offset-4 transition-colors group-hover:text-olive group-hover:decoration-olive">
                                Ler carta
                            </span>
                        </button>
                    </li>
                ))}
            </ul>

            <HonorLetter
                person={aberto}
                assinatura={assinatura}
                onOpenChange={(open) => {
                    if (!open) setAberto(null);
                }}
            />
        </section>
    );
}
