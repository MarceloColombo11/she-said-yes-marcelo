import type { Metadata } from "next";

export const SHARE_IMAGE_PATH = "/images/monograma-share.jpeg";

type ShareOpenGraphInput = {
  siteName: string;
  title: string;
  description: string;
  imageAlt: string;
};

/** Next replaces `openGraph` per segment, so every page must repeat the image. */
export function shareOpenGraph({
  siteName,
  title,
  description,
  imageAlt,
}: ShareOpenGraphInput): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    locale: "pt_BR",
    siteName,
    title,
    description,
    images: [{ url: SHARE_IMAGE_PATH, width: 1136, height: 1600, alt: imageAlt }],
  };
}
