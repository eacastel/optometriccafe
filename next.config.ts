import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/gunnar-gaming-computer-eye-glasses",
        destination: "/computer-gaming-eye-glasses/",
        permanent: true,
      },
      {
        source: "/optometry-los-angeles",
        destination: "/optometry-services-in-beverly-hills/",
        permanent: true,
      },
      {
        source: "/sunglasses",
        destination: "/sunglasses-beverly-hills/",
        permanent: true,
      },
      {
        source: "/womens-sunglasses",
        destination: "/womens-sunglasses-beverly-hills/",
        permanent: true,
      },
      {
        source: "/mens-sunglasses",
        destination: "/mens-sunglasses-beverly-hills/",
        permanent: true,
      },
      {
        source: "/childrens-sunglasses",
        destination: "/childrens-sunglasses-beverly-hills/",
        permanent: true,
      },
      {
        source: "/prescription-glasses",
        destination: "/prescription-eyeglasses-beverly-hills/",
        permanent: true,
      },
      {
        source: "/womens-prescription-glasses",
        destination: "/womens-prescription-glasses-beverly-hills/",
        permanent: true,
      },
      {
        source: "/mens-prescription-eye-glasses",
        destination: "/mens-prescription-eye-glasses-beverly-hills/",
        permanent: true,
      },
      {
        source: "/childrens-prescription-glasses",
        destination: "/childrens-prescription-glasses-beverly-hills/",
        permanent: true,
      },
      {
        source: "/computer-gaming-eye-glasses",
        destination: "/computer-gaming-eye-glasses-beverly-hills/",
        permanent: true,
      },
      {
        source: "/contact-lenses",
        destination: "/contact-lenses-beverly-hills/",
        permanent: true,
      },
      {
        source: "/optometry-lab",
        destination: "/optometry-lab-beverly-hills/",
        permanent: true,
      },
      {
        source: "/mens-prescription-glasses-beverly-hills",
        destination: "/mens-prescription-eye-glasses-beverly-hills/",
        permanent: true,
      },
      {
        source: "/computer-glasses-beverly-hills",
        destination: "/computer-gaming-eye-glasses-beverly-hills/",
        permanent: true,
      },
      {
        source: "/eyeglasses-beverly-hills",
        destination: "/prescription-eyeglasses-beverly-hills/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
