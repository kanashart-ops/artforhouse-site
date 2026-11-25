/**
 * The Next.js image optimizer is only enabled for local assets and Vercel Blob
 * public URLs. Other URLs still render unchanged without a 400 proxy response.
 */
export function canOptimizeArtworkImage(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) {
    return true;
  }

  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/i.test(url.hostname)
    );
  } catch {
    return false;
  }
}
