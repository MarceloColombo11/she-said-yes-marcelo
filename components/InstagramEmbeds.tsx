"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const INSTAGRAM_POSTS = [
  "https://www.instagram.com/p/DV9nJsJjyuz/",
  "https://www.instagram.com/p/DUnyY8aDmBc/",
  "https://www.instagram.com/p/DOenlvvj5Nz/",
];

export function InstagramEmbeds() {
  useEffect(() => {
    const processEmbeds = () => {
      if (typeof window !== "undefined" && window.instgrm) {
        window.instgrm.Embeds.process();
      }
    };

    if (document.querySelector(".instagram-media") && window.instgrm) {
      processEmbeds();
    }
  }, []);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {INSTAGRAM_POSTS.map((url) => (
          <div key={url} className="flex justify-center">
            <blockquote
              className="instagram-media min-w-0 max-w-full"
              data-instgrm-captioned
              data-instgrm-permalink={url}
              data-instgrm-version="14"
              style={{
                background: "#FFF",
                border: 0,
                borderRadius: "3px",
                boxShadow:
                  "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
                margin: 1,
                minWidth: "min(326px, 100%)",
                maxWidth: 540,
                padding: 0,
                width: "99.375%",
              }}
            />
          </div>
        ))}
      </div>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.instgrm) {
            window.instgrm.Embeds.process();
          }
        }}
      />
    </>
  );
}
