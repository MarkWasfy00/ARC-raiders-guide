import type { Blog, BlogCategory, BlogComment, User } from "@/lib/generated/prisma/client";

// API Response Types
export interface BlogResponse {
  success: boolean;
  data?: BlogData;
  error?: {
    message: string;
    field?: string;
  };
}

export interface CommentResponse {
  success: boolean;
  data?: CommentData;
  error?: {
    message: string;
    field?: string;
  };
}

export interface CategoryResponse {
  success: boolean;
  data?: BlogCategory[];
  error?: {
    message: string;
  };
}

// Blog with relations
export interface BlogData extends Blog {
  author: Pick<User, "id" | "username" | "name" | "image">;
  category?: BlogCategory | null;
  _count?: {
    comments: number;
  };
  tags?: { tag: string }[];
}

// Form Input Types
export interface CreateBlogInput {
  title: string;
  content: string;  // HTML from editor
  excerpt?: string;
  featuredImage?: string;  // MinIO URL
  categoryId?: string;
  tags?: string[];
  published?: boolean;
}

export interface UpdateBlogInput extends Partial<CreateBlogInput> {}

// Comment Types
export interface CommentData extends BlogComment {
  user: Pick<User, "id" | "username" | "name" | "image">;
  replies?: CommentData[];
}

// Category with blog count
export interface CategoryWithCount extends BlogCategory {
  _count?: {
    blogs: number;
  };
}
