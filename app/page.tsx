import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FallingLeaves } from "@/components/FallingLeaves";
import Monograma from "@/components/monograma";
import { CountdownTimer } from "@/components/CountdownTimer";
import { GiftsSection } from "@/components/GiftsSection";
import { LocationSection } from "@/components/LocationSection";
import { RsvpSection } from "@/components/RsvpSection";
import { AboutSection } from "@/components/AboutSection";
import { HonorSection } from "@/components/HonorSection";
import { TimelineSection } from "@/components/TimelineSection";
import { PhotoUploadSection } from "@/components/PhotoUploadSection";
import { HeroBackground } from "@/components/HeroBackground";
import { getPublicSiteContent } from "@/lib/content/public";
import { formatDateDots, formatTime, localToDate } from "@/lib/calendar";

export const revalidate = 60;

export default async function Home() {
    const content = await getPublicSiteContent();
    const { evento, secoes } = content;

    return (
        <>
            <Navbar initials={content.rodape.iniciais} />
            <main id="main" className="pt-20 md:pt-16">
                {/* 1. Home - Hero + Countdown */}
                <section id="home" className="min-h-[100dvh]">
                    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-olive/10 overflow-hidden">
                        <HeroBackground images={content.heroImageUrls} />
                        <div className="absolute inset-0 bg-cream/60" />
                        <FallingLeaves />
                        <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12 text-center sm:py-16 md:py-20">
                            <Monograma
                                className="mb-4 h-56 w-auto object-contain sm:h-72 md:h-[36rem]"
                                ariaHidden
                            />
                            <p className="text-olive text-lg md:text-xl mb-2">
                                {formatDateDots(evento.inicio)}
                            </p>
                            <p className="font-heading text-brown font-medium mb-12">
                                {formatTime(evento.inicio)}
                            </p>
                            <CountdownTimer
                                target={localToDate(evento.inicio).toISOString()}
                            />
                        </div>
                    </div>
                </section>

                {/* 2. Sobre Nós */}
                <section
                    id="sobre-nos"
                    className="py-12 md:py-16 lg:py-20 px-4 bg-cream"
                >
                    <AboutSection content={content.sobreNos} />
                </section>

                {/* 3. Padrinhos */}
                {content.padrinhos.length > 0 && (
                    <section
                        id="padrinhos"
                        className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                    >
                        <HonorSection
                            title={secoes.padrinhosTitulo}
                            subtitle={secoes.padrinhosSubtitulo}
                            data={content.padrinhos}
                            collapsibleText
                        />
                    </section>
                )}

                {/* 4. Convidados de Honra */}
                {content.honra.length > 0 && (
                    <section
                        id="convidados-honra"
                        className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                    >
                        <HonorSection
                            title={secoes.honraTitulo}
                            subtitle={secoes.honraSubtitulo}
                            data={content.honra}
                            collapsibleText
                        />
                    </section>
                )}

                {/* 5. Damas de Honra */}
                {content.damas.length > 0 && (
                    <section
                        id="damas"
                        className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                    >
                        <HonorSection
                            title={secoes.damasTitulo}
                            subtitle={secoes.damasSubtitulo}
                            data={content.damas}
                            collapsibleText
                        />
                    </section>
                )}

                {/* 6. Local */}
                <section
                    id="local"
                    className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                >
                    <LocationSection
                        title={secoes.localTitulo}
                        subtitle={secoes.localSubtitulo}
                        evento={evento}
                    />
                </section>

                {/* 7. Confirmação */}
                <section
                    id="confirmacao"
                    className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                >
                    <RsvpSection texts={content.rsvp} />
                </section>

                {/* 8. Programação */}
                <section
                    id="programacao"
                    className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                >
                    <TimelineSection
                        title={secoes.programacaoTitulo}
                        subtitle={secoes.programacaoSubtitulo}
                        events={content.programacao}
                    />
                </section>

                {/* 9. Presentes */}
                <section
                    id="presentes"
                    className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                >
                    <GiftsSection
                        title={secoes.presentesTitulo}
                        subtitle={secoes.presentesSubtitulo}
                        presents={content.gifts}
                    />
                </section>

                {/* 10. Suba sua Foto */}
                <section
                    id="fotos"
                    className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                >
                    <PhotoUploadSection
                        title={secoes.fotosTitulo}
                        subtitle={secoes.fotosSubtitulo}
                    />
                </section>
            </main>
            <Footer
                initials={content.rodape.iniciais}
                dateLine={formatDateDots(evento.inicio)}
                signature={content.rodape.assinatura}
            />
        </>
    );
}
