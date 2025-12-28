"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, MessageSquare, Calendar } from "lucide-react";
import type { BlogData } from "../types";

interface FeaturedBlogCardProps {
  blog: BlogData;
}

export function FeaturedBlogCard({ blog }: FeaturedBlogCardProps) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="block group">
      <div className="relative h-[500px] rounded-2xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-2xl">
        {/* Background Image with Overlay */}
        {blog.featuredImage && (
          <>
            <Image
              src={blog.featuredImage}
              alt={blog.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
          </>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          {/* Category Badge */}
          {blog.category && (
            <Badge
              style={{ backgroundColor: blog.category.color || undefined }}
              className="w-fit mb-4 text-sm px-3 py-1"
            >
              {blog.category.name}
            </Badge>
          )}

          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4 line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {blog.title}
          </h2>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-muted-foreground text-lg mb-6 line-clamp-2 max-w-3xl">
              {blog.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Author */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/50">
                <AvatarImage src={blog.author.image || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {blog.author.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {blog.author.username || blog.author.name}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {blog.publishedAt
                    ? formatDistanceToNow(new Date(blog.publishedAt), {
                        locale: ar,
                        addSuffix: true,
                      })
                    : formatDistanceToNow(new Date(blog.created_at), {
                        locale: ar,
                        addSuffix: true,
                      })}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Eye className="h-4 w-4 text-primary" />
                <span>{blog.viewCount}</span>
              </span>
              <span className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span>{blog._count?.comments || 0}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
        </div>
      </div>
    </Link>
  );
}
