"use client";

import { useState, useMemo } from "react";
import { BlogCard } from "./BlogCard";
import { CategoryShowcase } from "./CategoryShowcase";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { BlogData } from "../types";
import type { BlogCategory } from "@/lib/generated/prisma/client";

interface BlogListProps {
  initialBlogs: BlogData[];
  categories: BlogCategory[];
  showCategoryShowcase?: boolean;
}

export function BlogList({
  initialBlogs,
  categories,
  showCategoryShowcase = false,
}: BlogListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialBlogs.forEach((blog) => {
      if (blog.categoryId) {
        counts[blog.categoryId] = (counts[blog.categoryId] || 0) + 1;
      }
    });
    return counts;
  }, [initialBlogs]);

  const filteredBlogs = useMemo(() => {
    let filtered = initialBlogs;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(term) ||
          blog.excerpt?.toLowerCase().includes(term) ||
          blog.author.username?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((blog) => blog.categoryId === selectedCategory);
    }

    return filtered;
  }, [initialBlogs, searchTerm, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Category Showcase */}
      {showCategoryShowcase && categories.length > 0 && (
        <div className="animate-fade-in">
          <CategoryShowcase
            categories={categories}
            onSelectCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
            categoryCounts={categoryCounts}
          />
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-2xl animate-slide-up">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="ابحث عن المقالات، الكتّاب، المواضيع..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-12 h-12 text-base bg-card border-border/50 focus:border-primary/50 transition-all"
          dir="rtl"
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredBlogs.length === 0
            ? "لا توجد نتائج"
            : `${filteredBlogs.length} ${
                filteredBlogs.length === 1 ? "مقالة" : "مقالات"
              }`}
        </p>
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-sm text-primary hover:underline"
          >
            إزالة الفلتر
          </button>
        )}
      </div>

      {/* Blog Grid */}
      {filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredBlogs.map((blog, index) => (
            <div
              key={blog.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <BlogCard blog={blog} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 animate-fade-in">
          <div className="inline-block p-4 rounded-full bg-muted/50 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg text-muted-foreground">لا توجد مقالات تطابق بحثك</p>
          <p className="text-sm text-muted-foreground mt-2">
            جرب استخدام كلمات مفتاحية مختلفة
          </p>
        </div>
      )}
    </div>
  );
}
