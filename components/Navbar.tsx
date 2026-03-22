"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
    { href: "#home", label: "Home" },
    { href: "#presentes", label: "Presentes" },
    { href: "#local", label: "Local" },
    { href: "#confirmacao", label: "Confirmação" },
    { href: "#sobre-nos", label: "Sobre Nós" },
    { href: "#padrinhos", label: "Padrinhos" },
    { href: "#convidados-honra", label: "Convidados de Honra" },
    { href: "#damas", label: "Damas de Honra" },
    { href: "#programacao", label: "Programação" },
    { href: "#fotos", label: "Suba sua Foto" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLinkClick = () => {
        setIsOpen(false);
    };

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-cream/95 backdrop-blur-md shadow-sm"
                    : "bg-cream/70 backdrop-blur-sm",
            )}
        >
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    href="#home"
                    className="font-heading text-xl font-semibold text-brown"
                    aria-label="Ir para início"
                    style={{ fontFamily: "var(--font-hello-paris)" }}
                >
                    S & M
                </Link>

                {/* Desktop */}
                <div className="hidden lg:flex items-center gap-6">
                    {NAV_LINKS.slice(1).map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-olive hover:text-sage transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Mobile */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-olive"
                        aria-label="Abrir menu"
                        onClick={() => setIsOpen(true)}
                    >
                        <Menu className="size-6" />
                    </Button>
                    <SheetContent
                        side="right"
                        className="w-[280px] sm:w-[320px]"
                    >
                        <div className="flex flex-col gap-4 pt-8">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={handleLinkClick}
                                    className="text-olive hover:text-sage font-medium transition-colors py-2"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </header>
    );
}
