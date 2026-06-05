export const business = {
  name: "Optometric Cafe",
  url: "https://optometriccafe.com",
  phoneDisplay: "(310) 888-2848",
  phoneHref: "tel:+13108882848",
  email: "info@optometriccafe.com",
  emailHref: "mailto:info@optometriccafe.com",
  address: "277 South Beverly Dr., Beverly Hills, CA 90212",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=277%20South%20Beverly%20Dr%2C%20Beverly%20Hills%2C%20CA%2090212",
  gtmId: "GTM-WGHNXHX9",
};

export const hours = [
  ["Mon-Thu", "10:00 a.m. - 5:30 p.m."],
  ["Fri", "10:00 a.m. - 5:00 p.m."],
  ["Sat", "11:00 a.m. - 2:00 p.m."],
  ["Sun", "Closed"],
] as const;

export const services = [
  {
    id: "glasses-repair",
    title: "Glasses Repair",
    summary:
      "Frame adjustments, urgent fixes, screw replacements, tightening, cleaning, and practical advice when a repair is not worth forcing.",
  },
  {
    id: "prescription-eyeglasses",
    title: "Prescription Eyeglasses",
    summary:
      "Owner-led lens and frame matching for everyday wear, progressive lenses, high prescriptions, and detailed fit needs.",
  },
  {
    id: "designer-eyewear",
    title: "Designer Eyewear",
    summary:
      "A Beverly Hills edit of optical frames and sunglasses chosen for proportion, comfort, finish, and longevity.",
  },
  {
    id: "prescription-sunglasses",
    title: "Prescription Sunglasses",
    summary:
      "Sun lenses made for driving, travel, outdoor wear, and polished daily use without compromising prescription clarity.",
  },
  {
    id: "childrens-glasses",
    title: "Children's Glasses",
    summary:
      "Durable, comfortable frames fit with patience so kids can actually wear their glasses through real days.",
  },
  {
    id: "eye-exams",
    title: "Eye Exams",
    summary:
      "An optometrist is available by appointment for eye exams. Morteza Talebi is the owner and expert optician, not a doctor.",
  },
] as const;

export const reviews = [
  {
    name: "Taylor Sample",
    quote: "Very friendly and incredibly knowledgeable! Definitely returning.",
  },
  {
    name: "Victoria Green",
    quote:
      "Morteza honestly explained that a scratch could not be buffed out, then tightened and cleaned LV sunglasses at no charge.",
  },
  {
    name: "Davyd G",
    quote:
      "Morteza was so helpful, kind and knowledgeable. Great customer service and high quality service here.",
  },
  {
    name: "Aashika Duvoor",
    quote:
      "Very kind and generous owners. Helped me out when I was traveling on vacation.",
  },
  {
    name: "Matt",
    quote:
      "In and out very quickly and efficiently. Took 5 minutes to fix my sunglasses.",
  },
  {
    name: "Polina Durneva",
    quote:
      "Attentive, thoughtful care for a high prescription. Pricier, but worth it.",
  },
  {
    name: "Nick Jones",
    quote:
      "A customer for decades. Morteza and Mostafa go above and beyond.",
  },
  {
    name: "Joel Villalpando",
    quote: "Morteza went above and beyond for a repair need.",
  },
] as const;

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Optician"],
    "@id": `${business.url}/#localbusiness`,
    name: business.name,
    url: business.url,
    telephone: "+1-310-888-2848",
    email: business.email,
    image: `${business.url}/images/optometric-cafe-showroom-prescription-sunglasses-beverly-hills.jpg`,
    logo: `${business.url}/images/original_optometric_cafe_logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "277 South Beverly Dr.",
      addressLocality: "Beverly Hills",
      addressRegion: "CA",
      postalCode: "90212",
      addressCountry: "US",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "10:00",
        closes: "17:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        opens: "10:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "11:00",
        closes: "14:00",
      },
    ],
    founder: {
      "@type": "Person",
      name: "Morteza Talebi",
      jobTitle: "Owner and expert optician",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Optical services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title,
          description: service.summary,
          areaServed: "Beverly Hills, CA",
        },
      })),
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${business.url}/#website`,
    name: business.name,
    url: business.url,
    publisher: {
      "@id": `${business.url}/#localbusiness`,
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${business.url}${item.path}`,
    })),
  };
}
