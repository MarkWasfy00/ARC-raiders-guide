"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, MessageSquare } from "lucide-react";
import type { BlogData } from "../types";

interface BlogCardProps {
  blog: BlogData;
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="block group">
      <div className="relative border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-card">
        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="aspect-video overflow-hidden relative">
            <Image
              src={blog.featuredImage}
              alt={blog.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        <div className="p-5 space-y-3 flex-1 flex flex-col">
          {/* Category Badge */}
          {blog.category && (
            <Badge
              style={{ backgroundColor: blog.category.color || undefined }}
              className="w-fit text-xs px-2.5 py-0.5 shadow-md"
            >
              {blog.category.name}
            </Badge>
          )}

          {/* Title */}
          <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {blog.title}
          </h3>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3 flex-1 leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7 border border-primary/30">
                <AvatarImage src={blog.author.image || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {blog.author.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground font-medium">
                {blog.author.username || blog.author.name}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                <Eye className="h-3.5 w-3.5 text-primary" />
                {blog.viewCount}
              </span>
              <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                {blog._count?.comments || 0}
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="text-xs text-muted-foreground">
            {blog.publishedAt
              ? formatDistanceToNow(new Date(blog.publishedAt), {
                  locale: ar,
                  addSuffix: true,
                })
              : formatDistanceToNow(new Date(blog.created_at), {
                  locale: ar,
                  addSuffix: true,
                })}
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        </div>
      </div>
    </Link>
  );
}
