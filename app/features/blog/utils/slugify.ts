/**
 * Generate a URL-safe slug from a title and blog ID
 * Format: "blog-title-abc12345" where abc12345 is first 8 chars of blog ID
 * This ensures uniqueness without database checks
 *
 * @param title - Blog title
 * @param blogId - Blog ID (cuid)
 * @returns URL-safe unique slug
 */
export function generateSlug(title: string, blogId: string): string {
  const baseSlug = title
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove any characters that aren't alphanumeric, Arabic, or hyphens
    .replace(/[^\u0600-\u06FFa-z0-9\-]/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

  // Append first 8 characters of blog ID to ensure uniqueness
  const idSuffix = blogId.substring(0, 8);
  const slug = baseSlug ? `${baseSlug}-${idSuffix}` : `blog-${idSuffix}`;

  return slug;
}

/**
 * Extract blog ID prefix from slug
 * The slug format is "title-abc12345" where abc12345 is first 8 chars of ID
 *
 * @param slug - Blog slug
 * @returns ID prefix (first 8 chars of blog ID)
 */
export function extractBlogIdFromSlug(slug: string): string {
  const parts = slug.split('-');
  return parts[parts.length - 1];
}
