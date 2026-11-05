import { ArrowUpRight, MapPin } from "lucide-react";
import profiles from "@/data/business-profiles.json";
import { TrackedLink } from "@/components/TrackedLink";

export function BusinessLinks() {
  return (
    <div className="business-links">
      <TrackedLink
        href={profiles.googleBusinessUrl}
        target="_blank"
        rel="noopener noreferrer"
        eventName="oc_review_click"
        ctaText="View Google business listing"
        ctaType="business_profile"
      >
        <MapPin size={17} aria-hidden="true" /> Find us on Google{" "}
        <ArrowUpRight size={14} aria-hidden="true" />
      </TrackedLink>
      <nav aria-label="Social profiles" className="social-links">
        {profiles.socialLinks.map((profile) => {
          return (
            <a
              key={profile.name}
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Optometric Cafe on ${profile.name}`}
              title={`Optometric Cafe on ${profile.name}`}
            >
              {profile.name}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          );
        })}
      </nav>
    </div>
  );
}

export function GoogleMap() {
  return (
    <div className="map-panel">
      <iframe
        title="Optometric Cafe at 277 South Beverly Drive, Beverly Hills"
        src={profiles.mapEmbedUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
