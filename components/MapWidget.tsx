"use client";

export function MapWidget({ embedUrl }: { embedUrl: string }) {
    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-olive/20 h-[280px] md:h-[350px] lg:h-[450px]">
                <iframe
                    src={embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Local do casamento no mapa"
                    className="block h-full w-full"
                />
            </div>
        </div>
    );
}
