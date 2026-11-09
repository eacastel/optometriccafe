import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts } from "@/lib/content";
import { PostList } from "@/components/BlogIndex";

export const dynamicParams = false;
export function generateStaticParams() {
  return [
    ...new Set(posts.map((item) => item.author?.slug).filter(Boolean)),
  ].map((author) => ({ author }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ author: string }>;
}): Promise<Metadata> {
  const { author } = await params;
  const title = `${posts.find((item) => item.author?.slug === author)?.author?.name || "Author"} - Articles | Optometric Cafe`;
  const canonical = `https://optometriccafe.com/author/${author}/`;
  return {
    title: { absolute: title },
    alternates: { canonical },
    openGraph: { title, url: canonical, type: "website" },
    twitter: { title },
    robots: { index: false, follow: true },
  };
}
export default async function AuthorPage({
  params,
}: {
  params: Promise<{ author: string }>;
}) {
  const { author } = await params;
  const entries = posts.filter((post) => post.author?.slug === author);
  if (!entries.length) notFound();
  return (
    <main id="main-content">
      <section className="content-hero">
        <p className="eyebrow">Articles by</p>
        <h1>{entries[0].author?.name}</h1>
      </section>
      <PostList entries={entries} />
    </main>
  );
}
