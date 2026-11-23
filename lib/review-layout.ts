import { load } from "cheerio";

type Profiles = { googleBusinessUrl: string; socialLinks: { name: string; url: string }[] };
type Additions = { confirmedLegacyGoogleAuthors: string[]; reviews: { author: string; rating: number; quote: string; excerpt: boolean; date: string | null }[] };

export function layoutReviewTiles(html: string, profiles: Profiles, additions?: Additions) {
  const $ = load(html, null, false);
  const reviews = $(".reviews").first();
  if (!reviews.length) return html;
  reviews.addClass("review-tiles");
  if (additions?.reviews.length) {
    const added = $("<div>").addClass("review-additions").attr("data-added-reviews", "");
    for (const review of additions.reviews.filter((review) => review.rating === 5 && review.quote.trim())) {
      const card = $("<div>").addClass("review-card").attr("data-added-author", review.author);
      card.append($("<p>").text(`“${review.quote}”`));
      card.append('<div class="review-stars">★★★★★</div>');
      const date = review.date ? `, ${new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(review.date))}` : "";
      card.append($("<p>").append($("<em>").text(`– ${review.author}, Google review${date}`)));
      if (review.excerpt) card.append('<small class="review-excerpt">Excerpt</small>');
      added.append(card);
    }
    reviews.append(added);
  }
  $(".review-card").each((_, node) => {
    const card = $(node).addClass("review-tile");
    const attribution = card.find("em").last();
    const label = attribution.text();
    const confirmedGoogle = additions?.confirmedLegacyGoogleAuthors.some((author) => label.includes(`– ${author},`));
    const source = /Yelp review/i.test(label) ? "yelp" : /Google review/i.test(label) || confirmedGoogle ? "google" : "archive";
    const url = source === "yelp"
      ? profiles.socialLinks.find((profile) => profile.name === "Yelp")?.url
      : profiles.googleBusinessUrl;
    card.attr("data-review-platform", source);
    const stars = card.find(".review-stars").first();
    const originalStars = stars.text();
    stars.empty().attr("role", "img").attr("aria-label", "5 out of 5 stars")
      .append($("<span>").addClass("sr-only").text(originalStars))
      .append('<span class="google-star-icons" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>');
    if (url && attribution.length) {
      const link = $("<a>").addClass("review-source-link").attr({
        href: url, target: "_blank", rel: "noopener noreferrer",
        "data-review-source": source === "yelp" ? "yelp" : "google",
        "aria-label": source === "yelp" ? "Open Optometric Cafe on Yelp" : "Open Optometric Cafe on Google Maps",
      });
      attribution.wrap(link);
      if (source !== "archive") {
        const badge = $("<img>").addClass("review-source-mark").attr({
          src: source === "google" ? "/images/review-brands/GoogleMaps_Logo_DarkGray.svg" : "/images/review-brands/yelp-favicon.svg",
          alt: source === "google" ? "Google Maps" : "Yelp", loading: "lazy", decoding: "async",
          width: source === "google" ? "100" : "20", height: source === "google" ? "18" : "20",
        });
        attribution.closest("a").append(badge);
      }
    }
  });
  // Keep the original family photo without placing a large image ahead of the reviews.
  const family = $('img[src="/wp-content/uploads/2025/08/optometric-cafe-reviews.jpg"]');
  if (family.length) family.addClass("review-family-photo").insertAfter(reviews);
  return $.html();
}
