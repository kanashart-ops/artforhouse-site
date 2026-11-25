/**
 * Safe HTML subset for user/remote supplied articles.
 * Input HTML is never copied into the output: every text segment is escaped
 * and all tags and safe attributes are reconstructed from an allowlist.
 */
const ALLOWED_TAGS = new Set([
  "p", "div", "span", "h2", "h3", "h4", "h5",
  "strong", "b", "em", "i", "u", "s", "br", "hr",
  "ul", "ol", "li", "blockquote", "pre", "code",
  "figure", "figcaption", "a", "img",
  "table", "thead", "tbody", "tr", "td", "th",
]);
const VOID_TAGS = new Set(["br", "hr", "img"]);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function attribute(attrs: string, name: string): string | null {
  const rx = new RegExp(
    "(?:^|\\s)" + name + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s\"'=<>\\x60]+))",
    "i"
  );
  const m = attrs.match(rx);
  return m ? (m[1] ?? m[2] ?? m[3] ?? "") : null;
}

function safeUrl(value: string | null, image: boolean): string | null {
  if (!value) return null;
  const url = value.trim();
  if (!url || /[\u0000-\u0020\u007f]/.test(url)) return null;
  if (/^https?:\/\/[^/\s]+/i.test(url)) return url;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (!image && (/^mailto:[^\s]+$/i.test(url) || /^tel:[+0-9-]+$/.test(url) || /^#[\w-]+$/.test(url))) return url;
  return null;
}

export function sanitizeArticleHtml(input: string): string {
  // Remove active content entirely when it has a paired container.
  const html = input
    .replace(/<!--[^]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|form|svg|math)\b[^>]*>[^]*?<\/\s*\1\s*>/gi, "");
  const tags = /<\s*(\/?)\s*([a-z][a-z0-9]*)\b([^<>]*)>/gi;

  let result = "";
  let cursor = 0;
  for (const match of html.matchAll(tags)) {
    const index = match.index ?? cursor;
    result += escapeHtml(html.slice(cursor, index));
    cursor = index + match[0].length;

    const tag = match[2].toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) continue;
    if (match[1]) {
      if (!VOID_TAGS.has(tag)) result += `</${tag}>`;
      continue;
    }

    const attrs = match[3];
    if (tag === "a") {
      const href = safeUrl(attribute(attrs, "href"), false);
      result += href
        ? `<a href="${escapeHtml(href)}" rel="noopener noreferrer">`
        : "<a>";
    } else if (tag === "img") {
      const src = safeUrl(attribute(attrs, "src"), true);
      if (src) {
        const alt = attribute(attrs, "alt") ?? "";
        result += `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">`;
      }
    } else {
      result += `<${tag}>`;
    }
  }
  return result + escapeHtml(html.slice(cursor));
}
