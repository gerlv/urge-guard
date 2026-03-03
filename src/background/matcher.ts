/**
 * URL pattern matching — converts user-friendly site patterns into a single RegExp.
 */

function patternToRegExp(pattern: string): string {
  // Strip leading www. — subdomain matching already covers it
  const stripped = pattern.replace(/^www\./, "");

  // Tokenize into wildcard operators and literal segments, then map each
  const body = stripped
    .split(/(\*\+|\*{2,}|\*)/)
    .map((tok) => {
      if (tok === "*+") return ".+";
      if (/^\*{2,}$/.test(tok)) return ".*";
      if (tok === "*") return "[^/]*";
      // Literal: escape regex metacharacters, percent-encode non-ASCII
      return tok
        .replace(/[.|?+^$()[\]{}\\]/g, "\\$&")
        .replace(/[\u0080-\uFFFF]/g, encodeURIComponent);
    })
    .join("");

  // Prepend optional subdomain match
  return "([^/]*\\.)?" + body;
}

export interface CompiledMatcher {
  blockRe: RegExp | null;
  allowRe: RegExp | null;
}

/**
 * Compile newline-separated site patterns into block/allow RegExps.
 * Lines starting with + are allow-exceptions. Lines starting with # are comments.
 */
export function compileSiteList(sites: string): CompiledMatcher {
  if (!sites.trim()) return { blockRe: null, allowRe: null };

  const lines = sites.split(/\s+/).filter((l) => l && !l.startsWith("#"));
  const allowLines = lines.filter((l) => l.startsWith("+"));
  const blockLines = lines.filter((l) => !l.startsWith("+"));

  const buildRe = (items: string[], strip = 0): RegExp | null => {
    if (items.length === 0) return null;
    const alt = items.map((p) => patternToRegExp(p.substring(strip))).join("|");
    return new RegExp(`^https?://+([\\w:]+@)?(${alt})`, "i");
  };

  return {
    blockRe: buildRe(blockLines),
    allowRe: buildRe(allowLines, 1),
  };
}

/** Test whether a URL should be blocked. */
export function shouldBlock(url: string, matcher: CompiledMatcher): boolean {
  if (!matcher.blockRe) return false;
  if (!matcher.blockRe.test(url)) return false;
  if (matcher.allowRe && matcher.allowRe.test(url)) return false;
  return true;
}
