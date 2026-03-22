import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* 1. Home - Hero + Countdown */}
        <section id="home" className="min-h-screen">
          <div className="relative min-h-screen flex flex-col items-center justify-center bg-olive/10">
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
              <h1
                className="text-6xl md:text-8xl font-light text-brown mb-4"
                style={{ fontFamily: "var(--font-hello-paris)" }}
              >
                S & M
              </h1>
              <p className="text-olive text-lg md:text-xl mb-2">
                28 · 11 · 2026
              </p>
              <p className="text-brown font-medium mb-12">16:30</p>
              <CountdownTimer />
            </div>
          </div>
        </section>

        {/* 2. Presentes */}
        <section id="presentes" className="py-20 px-4 bg-cream">
          <GiftsSection presents={presentesData} />
        </section>

        {/* 3. Local */}
        <section id="local" className="py-20 px-4 bg-cream/80">
          <LocationSection />
        </section>

        {/* 4. Confirmação */}
        <section id="confirmacao" className="py-20 px-4 bg-cream">
          <RsvpSection />
        </section>

        {/* 5. Sobre Nós */}
        <section id="sobre-nos" className="py-20 px-4 bg-cream/80">
          <AboutSection />
        </section>

        {/* 6. Padrinhos */}
        <section id="padrinhos" className="py-20 px-4 bg-cream">
          <HonorSection
            title="Padrinhos"
            subtitle="As pessoas que caminham conosco"
            data={padrinhosData}
          />
        </section>

        {/* 7. Convidados de Honra */}
        <section id="convidados-honra" className="py-20 px-4 bg-cream/80">
          <HonorSection
            title="Convidados de Honra"
            subtitle="Especiais para nós"
            data={convidadosHonraData}
          />
        </section>

        {/* 8. Damas de Honra */}
        <section id="damas" className="py-20 px-4 bg-cream">
          <HonorSection
            title="Damas de Honra"
            subtitle="Nossas queridas damas"
            data={damasData}
          />
        </section>

        {/* 9. Programação */}
        <section id="programacao" className="py-20 px-4 bg-cream/80">
          <TimelineSection events={programacaoData} />
        </section>

        {/* 10. Suba sua Foto */}
        <section id="fotos" className="py-20 px-4 bg-cream">
          <PhotoUploadSection />
        </section>
      </main>
      <Footer />
    </>
  );
}
