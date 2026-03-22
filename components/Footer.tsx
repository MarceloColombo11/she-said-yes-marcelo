import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-olive/20 bg-cream py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Link
                        href="#home"
                        className="font-heading text-2xl font-semibold text-brown"
                        style={{ fontFamily: "var(--font-hello-paris)" }}
                    >
                        S & M
                    </Link>
                    <p className="text-sm text-olive/80">28 · 11 · 2026</p>
                    <p className="text-xs text-olive/60">
                        Suelen & Marcelo — Com amor, para sempre
                    </p>
                </div>
            </div>
        </footer>
    );
}
