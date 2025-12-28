"use server";

import { prisma } from "@/lib/prisma";
import type { BlogCategory } from "@/lib/generated/prisma/client";
import type { CategoryWithCount, CategoryResponse } from "../types";

/**
 * Get all blog categories
 */
export async function getCategories(): Promise<BlogCategory[]> {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * Get categories with blog counts
 */
export async function getCategoriesWithCount(): Promise<CategoryWithCount[]> {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: { blogs: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories with count:", error);
    return [];
  }
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  try {
    const category = await prisma.blogCategory.findUnique({
      where: { slug },
    });

    return category;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}
