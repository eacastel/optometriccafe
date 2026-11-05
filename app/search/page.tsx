import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { items } from "@/lib/content";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = ((await searchParams).q || "").trim().slice(0, 200);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = terms.length
    ? items.filter(
        (item) =>
          !item.robots.includes("noindex") &&
          terms.every((term) =>
            `${item.title} ${item.plainText}`.toLowerCase().includes(term),
          ),
      )
    : [];
  return (
    <main id="main-content">
      <section className="content-hero">
        <h1>Search</h1>
        <form className="site-search" action="/search/" role="search">
          <label className="sr-only" htmlFor="query">
            Search articles and services
          </label>
          <input
            id="query"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search articles and services"
            required
          />
          <button type="submit" aria-label="Search" title="Search">
            <Search size={20} />
          </button>
        </form>
      </section>
      <section className="content-shell search-results">
        {query && (
          <p>
            {matches.length} {matches.length === 1 ? "result" : "results"} for
            &quot;{query}&quot;
          </p>
        )}
        {matches.map((item) => (
          <article className="content-card" key={item.id}>
            <h2>
              <Link href={item.path}>
                {item.title === "Home" ? "Optometric Cafe" : item.title}
              </Link>
            </h2>
            <p>{item.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
