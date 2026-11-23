import { ArrowUpRight } from "lucide-react";
import profiles from "@/data/business-profiles.json";

export function ReviewProfiles() {
  return (
    <div className="review-profile-bar">
      <p>Selected five-star reviews</p>
    <nav className="review-profile-links" aria-label="Review profiles">
      <a href={profiles.googleBusinessUrl} target="_blank" rel="noopener noreferrer" data-review-source="google" aria-label="Open Optometric Cafe on Google Maps">
        <img src="/images/review-brands/GoogleMaps_Logo_DarkGray.svg" alt="Google Maps" width={100} height={18} />
        <ArrowUpRight size={16} aria-hidden="true" />
      </a>
      <a href={profiles.socialLinks.find((profile) => profile.name === "Yelp")!.url} target="_blank" rel="noopener noreferrer" data-review-source="yelp">
        Find us on Yelp <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </nav>
    </div>
  );
}
