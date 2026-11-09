import Link from "next/link";

export function OpticalNextSteps({ slug }: { slug: string }) {
  if (slug === "optometry-lab-beverly-hills")
    return (
      <section
        className="content-shell optical-next-steps"
        aria-labelledby="optical-next-heading"
      >
        <h2 id="optical-next-heading">From the workshop to your next pair.</h2>
        <p>
          Explore{" "}
          <Link href="/prescription-eyeglasses-beverly-hills/">
            prescription glasses and personal frame fittings
          </Link>
          , or bring a favorite pair for{" "}
          <Link href="/glasses-repair-adjustment-beverly-hills/">
            glasses repair and adjustment
          </Link>
          . Morteza can assess the frames and talk through the next step with
          you.
        </p>
        <Link className="text-link" href="/contact-us/">
          Talk to us about your glasses
        </Link>
      </section>
    );
  if (slug === "about-us")
    return (
      <section
        className="content-shell optical-next-steps"
        aria-labelledby="optical-next-heading"
      >
        <h2 id="optical-next-heading">
          Personal attention for the glasses you need.
        </h2>
        <p>
          Learn how we approach{" "}
          <Link href="/high-prescription-glasses-beverly-hills/">
            high-prescription glasses and frame fit
          </Link>
          , explore{" "}
          <Link href="/replacement-lenses-existing-frames-beverly-hills/">
            new lenses for suitable existing frames
          </Link>
          , or ask about{" "}
          <Link href="/glasses-repair-adjustment-beverly-hills/">
            repairs and adjustments
          </Link>
          . Your fitting starts with the prescription, the frame, and the way
          you wear your glasses.
        </p>
      </section>
    );
  return null;
}
