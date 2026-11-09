import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { posts, dateLabel, type ContentItem } from "@/lib/content";

export function PostList({ entries }: { entries: ContentItem[] }) {
  return (
    <div className="content-shell blog-list">
      {entries.map((post) => (
        <article className="content-card" key={post.slug}>
          {post.featuredImage && (
            <Link href={post.path} tabIndex={-1} aria-hidden="true">
              <Image
                className="blog-thumbnail"
                src={post.featuredImage}
                alt=""
                width={600}
                height={360}
                loading="lazy"
                sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 400px"
              />
            </Link>
          )}
          <p className="content-type">
            <time dateTime={post.date}>{dateLabel(post.date)}</time>
          </p>
          <h2>
            <Link href={post.path}>{post.title}</Link>
          </h2>
          <p>{post.description || `${post.plainText.slice(0, 180)}...`}</p>
          <Link className="text-link" href={post.path}>
            Read article
          </Link>
        </article>
      ))}
    </div>
  );
}

export function BlogIndex({ page = 1 }: { page?: number }) {
  const count = Math.ceil(posts.length / 10);
  return (
    <main id="main-content">
      <section className="content-hero">
        <p className="eyebrow">Optometric Cafe blog</p>
        <h1>Journal &amp; guides</h1>
        <p className="lead">
          A closer look at eyewear, lenses, and finding your fit.
        </p>
        <form className="site-search" action="/search/" role="search">
          <label className="sr-only" htmlFor="blog-search">
            Search articles and services
          </label>
          <input
            id="blog-search"
            name="q"
            type="search"
            placeholder="Search articles and services"
            required
          />
          <button type="submit" aria-label="Search" title="Search">
            <Search size={20} />
          </button>
        </form>
      </section>
      <PostList entries={posts.slice((page - 1) * 10, page * 10)} />
      <nav aria-label="Blog pages" className="pagination">
        {Array.from({ length: count }, (_, i) => (
          <Link
            key={i}
            href={i === 0 ? "/blog/" : `/blog/page/${i + 1}/`}
            aria-current={page === i + 1 ? "page" : undefined}
          >
            {i + 1}
          </Link>
        ))}
      </nav>
    </main>
  );
}
