import { NewsGuideCard } from "./NewsGuideCard";
import { NewsGuideData } from "../types";
import { guides } from "@/lib/guides";

export function NewsGuidesGrid() {
  // Reuse the first twelve guides for the home News & Guides rail
  const articles: NewsGuideData[] = guides.slice(0, 12).map((guide) => ({
    id: guide.id,
    title: guide.title,
    description: guide.description,
    imageUrl: guide.image || "/images/news/beginners-guide.jpg",
    href: `/guides/${guide.id}`,
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {articles.map((article) => (
        <NewsGuideCard key={article.id} article={article} />
      ))}
    </div>
  );
}
