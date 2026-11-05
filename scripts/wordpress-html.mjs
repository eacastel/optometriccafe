// WordPress's Cloudflare protection decodes these public email addresses in the browser.
// Decode at import time so retiring that script cannot leave broken contact links.
export function correctPublishedHours($, path) {
  if (path !== "/contact-us/") return;
  $("*")
    .contents()
    .each((_, node) => {
      if (node.type === "text")
        node.data = node.data.replace(
          "11:00 AM \u2013 3:00 PM",
          "11:00 AM \u2013 2:00 PM",
        );
    });
}

export function decodeEmailProtection($) {
  const decode = (value) => {
    if (!/^(?:[0-9a-f]{2})+$/i.test(value || ""))
      throw new Error("Invalid Cloudflare email encoding");
    const bytes = Buffer.from(value, "hex");
    return Buffer.from(
      bytes.subarray(1).map((byte) => byte ^ bytes[0]),
    ).toString("utf8");
  };
  $("[data-cfemail]").each((_, node) => {
    const el = $(node);
    const email = decode(el.attr("data-cfemail"));
    if (!email.includes("@")) throw new Error("Invalid decoded email");
    el.text(email).removeAttr("data-cfemail");
  });
  $('a[href*="/cdn-cgi/l/email-protection"]').each((_, node) => {
    const el = $(node);
    const encoded = el.attr("href").split("#")[1];
    const email = encoded ? decode(encoded) : el.text().trim();
    if (!email.includes("@")) throw new Error("Unresolved protected email");
    el.attr("href", `mailto:${email}`);
  });
}
