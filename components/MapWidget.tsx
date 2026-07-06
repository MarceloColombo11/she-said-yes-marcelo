"use client";

const EMBED_URL =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.400967922347!2d-48.700594124541496!3d-27.45677367632704!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9527530be692af6f%3A0x7a1b1042588b0df!2sMirante%20Garden!5e0!3m2!1sen!2sbr!4v1774201165659!5m2!1sen!2sbr";

export function MapWidget() {
    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-olive/20 h-[280px] md:h-[350px] lg:h-[450px]">
                <iframe
                    src={EMBED_URL}
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
