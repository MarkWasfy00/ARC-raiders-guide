/**
 * Generate excerpt from HTML content
 * Strips HTML tags and truncates to specified length
 *
 * @param htmlContent - HTML content from blog
 * @param maxLength - Maximum character length for excerpt (default: 200)
 * @returns Plain text excerpt with ellipsis
 */
export function generateExcerpt(htmlContent: string, maxLength: number = 200): string {
  // Strip HTML tags
  const text = htmlContent
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Truncate to maxLength
  if (text.length <= maxLength) {
    return text;
  }

  // Find last space before maxLength to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}
