/**
 * Normalizes text by converting to lowercase and removing accents
 * @param text - The text to normalize
 * @returns Normalized text
 */
export function normalizeText(text: string): string {
  if (!text) return text;
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
