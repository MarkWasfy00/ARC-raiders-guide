"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GuideCategory } from "@/lib/generated/prisma/client";

interface CategorySelectorProps {
  categories: GuideCategory[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
}

export function CategorySelector({ categories, selectedCategoryId, onSelect }: CategorySelectorProps) {
  return (
    <Select value={selectedCategoryId || "none"} onValueChange={(value) => onSelect(value === "none" ? "" : value)}>
      <SelectTrigger>
        <SelectValue placeholder="اختر التصنيف" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">بدون تصنيف</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
