import type { Guide, GuideCategory, GuideTag, User } from "@/lib/generated/prisma/client";

// Guide with relations
export interface GuideData extends Guide {
  author: {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
  };
  category: GuideCategory | null;
  tags: GuideTag[];
}

// Input types for creating/updating guides
export interface CreateGuideInput {
  title: string;
  content: string;
  description?: string;
  featuredImage?: string;
  categoryId?: string;
  tags?: string[];
  published?: boolean;
}

export interface UpdateGuideInput extends Partial<CreateGuideInput> {}

// Response type for guide actions
export interface GuideResponse {
  success: boolean;
  data?: GuideData;
  error?: {
    message: string;
  };
}
