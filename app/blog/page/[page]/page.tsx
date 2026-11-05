import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndex } from "@/components/BlogIndex";
import { posts } from "@/lib/content";

export const dynamicParams = false;
export function generateStaticParams() {
  return Array.from({ length: Math.ceil(posts.length / 10) - 1 }, (_, i) => ({
    page: String(i + 2),
  }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  return {
    title: `Blog - Page ${page}`,
    alternates: { canonical: `https://optometriccafe.com/blog/page/${page}/` },
  };
}
export default async function BlogPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!/^[2-9]\d*$/.test(page) || Number(page) > Math.ceil(posts.length / 10))
    notFound();
  return <BlogIndex page={Number(page)} />;
}
