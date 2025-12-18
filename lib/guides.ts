import { Guide } from "@/types";

const guideTopics = [
  {
    title: "Beginner Tips",
    description: "Everything you need to get started with movement, combat, and survival basics.",
    content:
      "Start by mastering movement and situational awareness. Keep your pack light, know two extractions at all times, and do not pick fights you do not need.",
  },
  {
    title: "Advanced Strategies",
    description: "Route planning, economy management, and squad coordination for higher-tier runs.",
    content:
      "Upgrade your routes by chaining high-yield POIs with safe extraction paths. Divide squad roles between scout, support, and carrier to stay efficient.",
  },
  {
    title: "Loot Farming",
    description: "High value farming loops and what to prioritize for steady profits.",
    content:
      "Focus on value-to-weight items and plan extractions that avoid hot zones. Cache keys and route knowledge are your best multipliers.",
  },
  {
    title: "PvP Guide",
    description: "Positioning, timing, and comms to win more PvP engagements.",
    content:
      "Engage on your terms. Use sound to bait pushes, pre-aim common lanes, and always have a disengage route before you take a fight.",
  },
  {
    title: "Quest Walkthrough",
    description: "Step-by-step breakdowns so you never get stuck on progression.",
    content:
      "Group quests by location, bring only what you need, and finish tasks on the edge of the map first to reduce risk on extraction.",
  },
  {
    title: "Hideout Building",
    description: "Resource priorities to speed up hideout upgrades without wasting materials.",
    content:
      "Rush utility modules that unlock storage and crafting. Track every component you bring in so you are not over-farming low value parts.",
  },
];

const guideImages = [
  "https://cdn.metaforge.app/arc-raiders/guides/beginner.webp",
  "https://cdn.metaforge.app/arc-raiders/guides/loadouts.webp",
  "https://cdn.metaforge.app/arc-raiders/guides/loot.webp",
  "https://cdn.metaforge.app/arc-raiders/guides/pvp.webp",
  "https://cdn.metaforge.app/arc-raiders/guides/quests.webp",
  "https://cdn.metaforge.app/arc-raiders/guides/trading.webp",
  "https://cdn.metaforge.app/arc-raiders/guides/hideout.webp",
  "https://cdn.metaforge.app/arc-raiders/guides/weapons.webp",
  "https://cdn.metaforge.app/arc-raiders/guides/dam.webp",
  "https://cdn.metaforge.app/arc-raiders/guides/arcs.webp",
  "https://cdn.metaforge.app/arc-raiders/guides/skills.webp",
  "https://cdn.metaforge.app/arc-raiders/guides/events.webp",
];

export const guides: Guide[] = Array.from({ length: 88 }, (_, index) => {
  const topic = guideTopics[index % guideTopics.length];
  const image = guideImages[index % guideImages.length];

  return {
    id: `guide-${index + 1}`,
    title: `Guide ${index + 1}: ${topic.title}`,
    description: topic.description,
    image,
    created_at: new Date(Date.now() - index * 86_400_000).toISOString(),
    content: topic.content,
  };
});

export function getGuideById(id: string) {
  return guides.find((guide) => guide.id === id);
}
