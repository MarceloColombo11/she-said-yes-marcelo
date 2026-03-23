import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Monograma from "@/components/monograma";
import { CountdownTimer } from "@/components/CountdownTimer";
import { GiftsSection } from "@/components/GiftsSection";
import { LocationSection } from "@/components/LocationSection";
import { RsvpSection } from "@/components/RsvpSection";
import { AboutSection } from "@/components/AboutSection";
import { HonorSection } from "@/components/HonorSection";
import { TimelineSection } from "@/components/TimelineSection";
import { PhotoUploadSection } from "@/components/PhotoUploadSection";

import presentesData from "@/data/presentes.json";
import padrinhosData from "@/data/padrinhos.json";
import damasData from "@/data/damas.json";
import convidadosHonraData from "@/data/convidados-honra.json";
import programacaoData from "@/data/programacao.json";
import sobreNosData from "@/data/sobre-nos.json";

export default function Home() {
    return (
        <>
            <Navbar />
            <main id="main" className="pt-20 md:pt-16">
                {/* 1. Home - Hero + Countdown */}
                <section id="home" className="min-h-[100dvh]">
                    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-olive/10">
                        {/* Hero background - substituir por imagem real do casal */}
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                            style={{
                                backgroundImage:
                                    "url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80)",
                            }}
                        />
                        <div className="absolute inset-0 bg-cream/60" />
                        <div className="relative z-10 flex flex-col items-center justify-center px-4 py-20 text-center">
                            <Monograma
                                className="h-96 md:h-[36rem] w-auto mb-4 object-contain"
                                ariaHidden
                            />
                            <p className="text-olive text-lg md:text-xl mb-2">
                                28 · 11 · 2026
                            </p>
                            <p className="font-heading text-brown font-medium mb-12">
                                16:30
                            </p>
                            <CountdownTimer />
                        </div>
                    </div>
                </section>

                {/* 2. Presentes */}
                <section
                    id="presentes"
                    className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                >
                    <GiftsSection
                        presents={presentesData.map(
                            ({ chavePix: _chavePix, ...p }) => p
                        )}
                    />
                </section>

                {/* 3. Local */}
                <section
                    id="local"
                    className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                >
                    <LocationSection />
                </section>

                {/* 4. Confirmação */}
                <section
                    id="confirmacao"
                    className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                >
                    <RsvpSection />
                </section>

                {/* 5. Sobre Nós */}
                <section
                    id="sobre-nos"
                    className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                >
                    <AboutSection content={sobreNosData} />
                </section>

                {/* 6. Padrinhos */}
                <section
                    id="padrinhos"
                    className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                >
                    <HonorSection
                        title="Padrinhos"
                        subtitle="As pessoas que caminham conosco"
                        data={padrinhosData}
                    />
                </section>

                {/* 7. Convidados de Honra */}
                <section
                    id="convidados-honra"
                    className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                >
                    <HonorSection
                        title="Convidados de Honra"
                        subtitle="Especiais para nós"
                        data={convidadosHonraData}
                    />
                </section>

                {/* 8. Damas de Honra */}
                <section
                    id="damas"
                    className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                >
                    <HonorSection
                        title="Damas de Honra"
                        subtitle="Nossas queridas damas"
                        data={damasData}
                    />
                </section>

                {/* 9. Programação */}
                <section
                    id="programacao"
                    className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                >
                    <TimelineSection events={programacaoData} />
                </section>

                {/* 10. Suba sua Foto */}
                <section
                    id="fotos"
                    className="py-16 md:py-20 lg:py-24 px-4 bg-cream"
                >
                    <PhotoUploadSection />
                </section>
            </main>
            <Footer />
        </>
    );
}
