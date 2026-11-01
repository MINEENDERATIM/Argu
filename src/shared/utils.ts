export function sanitizeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

export function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  try {
    return new URL(url, window.location.href).toString();
  } catch {
    return url;
  }
}

export function truncateText(value: string, maxLength = 12000): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3).trim()}...`;
}

export function uniqueBy<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
