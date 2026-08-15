import type { Metadata } from "next";
import { ProjectHulkStoryPage } from "@/components/story/project-hulk-story-page";

export const metadata: Metadata = {
  title: "The story behind Project Hulk",
  description:
    "Why I built a personal fitness journal, the AI bake-off that nearly broke it, and the decisions I'd defend at a dinner party.",
};

export default function StoryPage() {
  return <ProjectHulkStoryPage />;
}
