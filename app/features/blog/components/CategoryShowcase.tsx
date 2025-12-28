"use client";

import { FileText } from "lucide-react";
import type { BlogCategory } from "@/lib/generated/prisma/client";

interface CategoryShowcaseProps {
  categories: BlogCategory[];
  onSelectCategory: (categoryId: string | null) => void;
  selectedCategory: string | null;
  categoryCounts: Record<string, number>;
}

export function CategoryShowcase({
  categories,
  onSelectCategory,
  selectedCategory,
  categoryCounts,
}: CategoryShowcaseProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {/* All Categories Card */}
      <button
        onClick={() => onSelectCategory(null)}
        className={`
          relative overflow-hidden rounded-xl p-6 border-2 transition-all duration-300 group
          ${
            selectedCategory === null
              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
              : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
          }
        `}
      >
        <div className="flex flex-col items-center text-center space-y-3">
          <div
            className={`
            p-3 rounded-lg transition-all duration-300
            ${
              selectedCategory === null
                ? "bg-primary/20"
                : "bg-muted group-hover:bg-primary/10"
            }
          `}
          >
            <FileText
              className={`h-6 w-6 ${
                selectedCategory === null
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-primary"
              }`}
            />
          </div>
          <div>
            <p
              className={`font-bold text-sm ${
                selectedCategory === null ? "text-primary" : "text-foreground"
              }`}
            >
              الكل
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {Object.values(categoryCounts).reduce((a, b) => a + b, 0)} مقالة
            </p>
          </div>
        </div>
      </button>

      {/* Category Cards */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`
            relative overflow-hidden rounded-xl p-6 border-2 transition-all duration-300 group
            ${
              selectedCategory === category.id
                ? "shadow-lg"
                : "border-border bg-card hover:bg-card/80"
            }
          `}
          style={{
            borderColor:
              selectedCategory === category.id
                ? category.color || undefined
                : undefined,
            backgroundColor:
              selectedCategory === category.id
                ? `${category.color}10`
                : undefined,
            boxShadow:
              selectedCategory === category.id
                ? `0 10px 30px ${category.color}20`
                : undefined,
          }}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Icon/Color Indicator */}
            <div
              className="p-3 rounded-lg transition-all duration-300"
              style={{
                backgroundColor:
                  selectedCategory === category.id
                    ? `${category.color}30`
                    : `${category.color}10`,
              }}
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: category.color || "#888" }}
              />
            </div>

            {/* Category Info */}
            <div>
              <p
                className="font-bold text-sm"
                style={{
                  color:
                    selectedCategory === category.id
                      ? category.color || undefined
                      : undefined,
                }}
              >
                {category.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {categoryCounts[category.id] || 0} مقالة
              </p>
            </div>
          </div>

          {/* Hover Glow Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div
              className="absolute inset-0 blur-xl"
              style={{
                background: `radial-gradient(circle at center, ${category.color}15, transparent 70%)`,
              }}
            />
          </div>
        </button>
      ))}
    </div>
  );
}
