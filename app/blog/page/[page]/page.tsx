import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndex } from "@/components/BlogIndex";
import { posts, findItem, contentMetadata } from "@/lib/content";

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
  const metadata = contentMetadata(findItem("blog")!);
  const title = `Blog - Page ${page} | Optometric Cafe`;
  const canonical = `https://optometriccafe.com/blog/page/${page}/`;
  return {
    ...metadata,
    title: { absolute: title },
    alternates: { canonical },
    openGraph: { ...metadata.openGraph, title, url: canonical },
    twitter: { ...metadata.twitter, title },
  };
}
export default async function BlogPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!/^[1-9]\d*$/.test(page) || Number(page) < 2 || Number(page) > Math.ceil(posts.length / 10))
    notFound();
  return <BlogIndex page={Number(page)} />;
}
