"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { business } from "@/app/data";
import { TrackedLink } from "@/components/TrackedLink";

const groups = [
  {
    label: "Eyewear",
    links: [
      ["Prescription glasses", "/prescription-eyeglasses-beverly-hills"],
      ["Women's glasses", "/womens-prescription-glasses-beverly-hills"],
      ["Men's glasses", "/mens-prescription-eye-glasses-beverly-hills"],
      ["Children's glasses", "/childrens-prescription-glasses-beverly-hills"],
      ["Designer sunglasses", "/sunglasses-beverly-hills"],
      ["Women's sunglasses", "/womens-sunglasses-beverly-hills"],
      ["Men's sunglasses", "/mens-sunglasses-beverly-hills"],
      ["Children's sunglasses", "/childrens-sunglasses-beverly-hills"],
      [
        "Prescription sunglasses",
        "/prescription-sunglasses-vs-regular-sunglasses",
      ],
      ["Sports eyewear", "/sports-eye-glasses-and-sunglasses"],
      ["Computer glasses", "/computer-gaming-eye-glasses-beverly-hills"],
    ],
  },
  {
    label: "Optical services",
    links: [
      ["All services", "/services"],
      ["Repairs & adjustments", "/services#glasses-repair"],
      ["Our optical workshop", "/optometry-lab-beverly-hills"],
      ["Eye exams", "/optometry-services-in-beverly-hills"],
      ["Contact lenses", "/contact-lenses-beverly-hills"],
    ],
  },
  {
    label: "Our story",
    links: [
      ["About us", "/about-us"],
      ["Featured reviews", "/featured-reviews"],
      ["Journal & guides", "/blog"],
    ],
  },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  function closeMenus() {
    setOpen(false);
    root.current
      ?.querySelectorAll("details[open]")
      .forEach((detail) => detail.removeAttribute("open"));
  }
  useEffect(() => {
    closeMenus();
  }, [pathname]);
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) closeMenus();
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        const summary = (document.activeElement as HTMLElement | null)
          ?.closest("details")
          ?.querySelector("summary");
        closeMenus();
        if (summary) summary.focus();
        else if (window.innerWidth <= 1100) toggle.current?.focus();
      }
    }
    function resize() {
      if (window.innerWidth > 1100) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", resize);
    };
  }, []);
  function links(mobile = false) {
    return (
      <>
        {groups.map((group) => (
          <details
            className="nav-group"
            key={group.label}
            onToggle={(event) => {
              if (event.currentTarget.open)
                root.current
                  ?.querySelectorAll("details[open]")
                  .forEach((detail) => {
                    if (detail !== event.currentTarget)
                      detail.removeAttribute("open");
                  });
            }}
          >
            <summary>
              {group.label}
              <ChevronDown size={14} />
            </summary>
            <div className="nav-panel">
              {group.links.map(([text, href]) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={pathname === href ? "page" : undefined}
                >
                  {text}
                </Link>
              ))}
            </div>
          </details>
        ))}
        <Link
          href="/visit"
          aria-current={pathname === "/visit" ? "page" : undefined}
        >
          Visit us
        </Link>
        {mobile && (
          <TrackedLink
            className="button primary"
            href="/visit#book"
            eventName="oc_appointment_click"
            ctaText="Book a Fitting"
            ctaType="mobile_nav"
          >
            Book a Fitting <ArrowUpRight size={17} />
          </TrackedLink>
        )}
      </>
    );
  }
  return (
    <header
      className="topbar"
      ref={root}
      onClick={(event) => {
        if ((event.target as Element).closest("a")) closeMenus();
      }}
    >
      <Link className="brand" href="/" aria-label="Optometric Cafe home">
        <Image
          src="/images/original_optometric_cafe_logo.png"
          alt="Optometric Cafe"
          width={260}
          height={80}
          priority
        />
      </Link>
      <nav className="nav" aria-label="Primary navigation">
        {links()}
      </nav>
      <div className="actions">
        <TrackedLink
          className="header-phone"
          href={business.phoneHref}
          eventName="oc_phone_click"
          ctaText="Call Now"
          ctaType="header"
        >
          <Phone size={16} />
          <span>Call Now</span>
        </TrackedLink>
        <TrackedLink
          className="button primary"
          href="/visit#book"
          eventName="oc_appointment_click"
          ctaText="Book a Fitting"
          ctaType="header"
        >
          Book a Fitting <ArrowUpRight size={16} />
        </TrackedLink>
      </div>
      <button
        className="menu-toggle"
        ref={toggle}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X size={23} /> : <Menu size={23} />}
      </button>
      <nav
        id="mobile-nav"
        className="mobile-nav"
        aria-label="Mobile navigation"
        hidden={!open}
      >
        {links(true)}
      </nav>
    </header>
  );
}
