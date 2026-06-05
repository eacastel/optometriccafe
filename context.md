  Current Live Server

  - Site: https://optometriccafe.com
  - Server: Lightsail Ubuntu, 512 MB RAM
  - Live webroot: /var/www/optometriccafe
  - WordPress/Divi live site is still active.
  - Staging vhosts were disabled after the server hit memory pressure.
  - Do not run Next.js builds, npm installs, or dev servers on this box.

  Important Recent Incident

  - I started scaffolding a Next.js app on the live server.
  - The server is too small for that workload.
  - It caused high load, swap usage, PHP-FPM timeouts, and Cloudflare 524/503
    errors.
  - I killed the npm/create-next processes, disabled staging Apache vhosts,
    restarted PHP-FPM/Apache, and live came back up.

  Safe Current State

  - No npm, create-next-app, or next process running.
  - Apache enabled vhosts only:
      - /etc/apache2/sites-enabled/optometriccafe.conf
      - /etc/apache2/sites-enabled/optometriccafe-le-ssl.conf
  - Staging configs exist but are disabled:
      - /etc/apache2/sites-available/optometriccafe-staging.conf
      - /etc/apache2/sites-available/optometriccafe-staging-le-ssl.conf

  Staging Info

  - Staging URL was: https://staging.optometriccafe.com
  - Basic Auth:
      - User: staging
      - Password: DAij+LTbIzSuNDig
  - Staging webroot: /var/www/optometriccafe-staging
  - Staging DB tables prefix: wp_stage
  - Live DB tables prefix: wp_optcc
  - Staging is currently disabled at Apache level.

  Backups / Docs

  - Main project notes:
      - /home/ubuntu/optometriccafe-seo-roadmap.md
  - Backups directory:
      - /home/ubuntu/site-backups/
  - Staging setup backups:
      - /home/ubuntu/site-backups/staging-setup-20260604/
  - Important full backups:
      - /home/ubuntu/site-backups/optometriccafe-files-20260526-161405.tar.gz
      - /home/ubuntu/site-backups/optometriccafe-db-20260526-161811.sql.gz
      - /home/ubuntu/site-backups/optometriccafe-files-20260526-181447-post-
        rescue.tar.gz
      - /home/ubuntu/site-backups/optometriccafe-db-20260526-181512-post-
        rescue.sql.gz

  Design Direction Chosen

  - We liked the fourth visual direction:
      - airy Beverly Hills optical atelier
      - boutique-hotel polish, but brighter and warmer
      - not dark, not stuffy, not beige
      - real shop imagery
      - family-owned, personal, expert
      - black/charcoal text, warm ivory/stone backgrounds, exact Optometric orange
        accents
      - use actual logo and actual shop/glasses images

  Next.js Plan

  - Build off-server, ideally on localhost and then Vercel.
  - Use Next.js App Router, TypeScript, Vercel-ready.
  - Start with 3 screens/pages:
      1. Homepage
      2. Services
      3. Visit / Contact
  - Use real assets from the current site.
  - Do not use Divi.
  - Do not depend on WordPress as runtime for the new site unless intentionally
    using it as a temporary content source.

  Best Real Assets Found
  Logo:

  - /var/www/optometriccafe/wp-content/uploads/2022/05/
    original_optometric_cafe_logo.png
  - /var/www/optometriccafe/wp-content/uploads/2019/01/optometric-logo.png

  Shop / hero / brand:

  - /var/www/optometriccafe/wp-content/uploads/2019/01/home45.jpg
  - /var/www/optometriccafe/wp-content/uploads/2025/08/hero-1.mp4
  - /var/www/optometriccafe/wp-content/uploads/2025/08/hero.mp4
  - /var/www/optometriccafe/wp-content/uploads/2025/08/optometric-cafe-family.jpg
  - /var/www/optometriccafe/wp-content/uploads/2025/08/optometric-cafe-family-
    beverly-hills-optometrist.jpg
  - /var/www/optometriccafe/wp-content/uploads/2025/08/optometric-cafe-showroom-
    prescription-sunglasses-beverly-hills.jpg
  - /var/www/optometriccafe/wp-content/uploads/2025/08/customer-trying-two-pairs-
    of-glasses-optometric-cafe-beverly-hills.jpg

  Workshop / service:

  - /var/www/optometriccafe/wp-content/uploads/2025/08/expert-in-house-lens-
    crafting-beverly-hills.jpg
  - /var/www/optometriccafe/wp-content/uploads/2019/01/optometric-cafe-lab.png

  Glasses/product:

  - /var/www/optometriccafe/wp-content/uploads/2025/08/designer-sunglasses-beverly-
    hills.jpg
  - /var/www/optometriccafe/wp-content/uploads/2025/08/prescription-sunglasses-
    beverly-hills.jpg
  - /var/www/optometriccafe/wp-content/uploads/2025/08/womens-sunglasses-selection-
    optometric-cafe-beverly-hills.jpg
  - /var/www/optometriccafe/wp-content/uploads/2025/08/mens-prescription-beverly-
    hills.jpg
  - /var/www/optometriccafe/wp-content/uploads/2025/08/mens-prescription-
    sunglasses-beverly-hills.jpg

  Reviews:

  - /var/www/optometriccafe/wp-content/uploads/2025/08/optometric-cafe-reviews.jpg

  Primary Messaging

  - Family-owned since 2005
  - Owner-led eyewear fittings by Morteza Talebi
  - Morteza is not a doctor; he is the owner and expert optician/fitter.
  - Optometrist available by appointment for eye exams.
  - In-house lens workshop
  - Complex prescriptions
  - Glasses repair and adjustments
  - Prescription glasses
  - Designer frames and sunglasses
  - Children’s glasses
  - Beverly Hills location

  Primary CTA Priority

  1. Book a Fitting
  2. Call Now
  3. Eye exams / optometry is tertiary

  Business Info

  - Name: Optometric Cafe
  - Address: 277 South Beverly Dr., Beverly Hills, CA 90212
  - Phone: (310) 888-2848
  - Email: info@optometriccafe.com
  - Hours:
      - Monday-Thursday: 10 a.m. to 5:30 p.m.
      - Friday: 10 a.m. to 5:00 p.m.
      - Saturday: 11 a.m. to 2 p.m.
      - Sunday: Closed

  Reviews To Use

  - Taylor Sample: “Very friendly and incredibly knowledgeable! Definitely
    returning”
  - Victoria Green: long review about Morteza honestly explaining he could not buff
    a scratch, tightening and cleaning LV sunglasses at no charge.
  - Davyd G: “Morteza was so helpful, kind and knowledgeable. Great customer
    service and high quality stuff service here.”
  - Aashika Duvoor: “Very kind and generous owners. Helped me out with when I was
    traveling on vacation.”
  - Andres Rosales: “Excellent service: was given contacts in an emergency”
  - Matt: “In and out very quickly and efficiently! Took 5 minutes to fix my
    sunglasses”
  - kika guirguis: “The absolute best customer service he fixed my client Dior
    glasses in 30 mins…”
  - Polina Durneva: high prescription, attentive thoughtful care, pricier but worth
    it.
  - Nick Jones: customer for decades, Morteza and Mostafa go above and beyond.
  - Joel Villalpando: Morteza went above and beyond for a repair need.

  Tracking

  - GTM ID: GTM-WGHNXHX9
  - Existing event strategy:
      - oc_phone_click
      - oc_email_click
      - oc_directions_click
      - oc_appointment_click
      - oc_review_click
      - oc_service_cta_click
  - Data layer variables:
      - cta_text
      - cta_type
      - link_url
      - page_path

  Important SEO Pages From Current Site

  - /glasses-repair-adjustment-beverly-hills/
  - /prescription-eyeglasses-beverly-hills/
  - /optometry-services-in-beverly-hills/
  - /contact-us/
  - /featured-reviews/
  - /beverly-hills-eyewear-boutique/
  - /eye-exam-beverly-hills-what-to-expect/
  - /designer-eyewear-beverly-hills-great-fit/
  - /prescription-sunglasses-vs-regular-sunglasses/
  - /kids-prescription-glasses-fit-durability-comfort/

  Migration Cautions

  - Preserve important URLs where possible.
  - If changing URLs, create explicit 301 redirect map.
  - Add schema:
      - LocalBusiness / Optician-style business
      - BreadcrumbList
      - WebSite
      - Review snippets only if policy-compliant and visible on page
      - FAQ where appropriate
  - Keep current WordPress live until Vercel site is fully reviewed.
  - Do not point DNS to Vercel until redirects, analytics, forms, sitemap, robots,
    schema, and Search Console are ready.
