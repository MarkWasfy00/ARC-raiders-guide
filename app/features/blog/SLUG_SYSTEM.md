# Blog Slug System

## Overview
The blog system uses a slug format that includes the blog ID to ensure uniqueness and prevent conflicts with route names.

## Slug Format
```
{title-slug}-{blog-id-prefix}
```

**Example:**
- Title: "دليل المبتدئين للعبة"
- Blog ID: `cmjjzhicb000049n8zinl8fiu`
- Generated Slug: `dlyl-almbtdyn-llb-cmjjzhic`

## How It Works

### 1. Creating a Blog
```typescript
// Generate blog ID first
const blogId = createId(); // e.g., "cmjjzhicb000049n8zinl8fiu"

// Generate slug with blog ID
const slug = generateSlug(title, blogId); // e.g., "my-blog-title-cmjjzhic"

// Create blog with pre-generated ID and slug
await prisma.blog.create({
  data: {
    id: blogId,
    slug,
    // ... other fields
  }
});
```

### 2. Finding a Blog by Slug
```typescript
// Extract ID prefix from slug
const idPrefix = extractBlogIdFromSlug(slug); // e.g., "cmjjzhic"

// Find blog by ID prefix
const blog = await prisma.blog.findFirst({
  where: {
    id: { startsWith: idPrefix },
  },
});
```

### 3. Updating a Blog
```typescript
// When title changes, regenerate slug with same blog ID
if (data.title) {
  updateData.slug = generateSlug(data.title, blogId);
}
```

## Benefits

1. **Uniqueness Guaranteed**: Each slug is unique because it includes the blog ID
2. **No Database Checks**: No need to check for slug uniqueness during creation
3. **Prevents Route Conflicts**: Slugs won't clash with Next.js route names (like "new", "edit", etc.)
4. **Fast Lookups**: Blog can be found quickly using `startsWith` on the ID
5. **SEO Friendly**: Still maintains readable titles in the URL

## Migration from Old System

If you have existing blogs with old slug format:

1. Update each blog's slug:
   ```typescript
   const blogs = await prisma.blog.findMany();

   for (const blog of blogs) {
     const newSlug = generateSlug(blog.title, blog.id);
     await prisma.blog.update({
       where: { id: blog.id },
       data: { slug: newSlug },
     });
   }
   ```

2. Set up redirects from old slugs to new slugs if needed

## Functions

### `generateSlug(title: string, blogId: string): string`
Generates a URL-safe slug from title and blog ID.

### `extractBlogIdFromSlug(slug: string): string`
Extracts the blog ID prefix from a slug.

## URL Structure

- Blog List: `/blogs`
- Single Blog: `/blogs/{slug}` (e.g., `/blogs/my-blog-title-cmjjzhic`)
- Edit Blog: `/blogs/{slug}/edit`
- Create Blog: `/blogs/new`
