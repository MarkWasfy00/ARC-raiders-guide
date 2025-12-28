"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BlogCategory } from "@/lib/generated/prisma/client";

interface CategorySelectorProps {
  categories: BlogCategory[];
  selectedCategoryId?: string;
  onSelect: (categoryId: string) => void;
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
}: CategorySelectorProps) {
  const handleChange = (value: string) => {
    // Convert "none" back to empty string for the form
    onSelect(value === "none" ? "" : value);
  };

  return (
    <Select
      value={selectedCategoryId || "none"}
      onValueChange={handleChange}
    >
      <SelectTrigger dir="rtl">
        <SelectValue placeholder="اختر تصنيفاً" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">بدون تصنيف</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <div className="flex items-center gap-2">
              {category.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              )}
              <span>{category.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
