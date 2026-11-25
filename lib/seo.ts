import type { Metadata } from "next";

export const SITE_URL = "https://artforhouse.by";
export const SITE_NAME = "Art For House";
export const ARTIST_NAME = "Анна Побитко";
export const DEFAULT_SOCIAL_IMAGE = "/images/hero-bg.jpg";

export function publicImageUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const image = value.trim();
  if (image.startsWith("/") && !image.startsWith("//")) return image;

  try {
    const url = new URL(image);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
};

export function createPageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
}: PageMetadataOptions): Metadata {
  const socialImage = publicImageUrl(image) ?? DEFAULT_SOCIAL_IMAGE;
  const common = {
    title,
    description,
    url: new URL(path, SITE_URL).toString(),
    siteName: SITE_NAME,
    locale: "ru_RU",
    images: [{ url: socialImage, alt: "Art For House — картины и живопись" }],
  };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph:
      type === "article"
        ? { ...common, type: "article" as const, publishedTime }
        : { ...common, type: "website" as const },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export function jsonLdStringify(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
