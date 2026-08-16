import type { Metadata } from "next";
import { ProjectHulkStoryPage } from "@/components/story/project-hulk-story-page";

export const metadata: Metadata = {
  title: "The story behind Project Hulk",
  description: "Too much data, no context, and the fitness app that got built trying to fix that.",
};

export default function StoryPage() {
  return <ProjectHulkStoryPage />;
}
