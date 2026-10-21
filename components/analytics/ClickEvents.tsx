"use client";

import { useEffect } from "react";

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

/** Where on the page the link sits, for GTM reports. */
const placement = (el: Element) => (el.closest("header") ? "header" : el.closest("footer") ? "footer" : "content");

/**
 * Pushes click events to GTM's dataLayer (never replacing it) with one delegated listener:
 *   contact_click  — "Connect"/"Contact" links, links to #contact, mailto: and tel:
 *   outbound_click — links to other domains (YouTube, LinkedIn, channeliam.com, articles…)
 * Configure GA4 event tags on these in Google Tag Manager. Public site layout only.
 */
export function ClickEvents() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const href = link.getAttribute("href") ?? "";
      const text = (link.getAttribute("aria-label") || link.textContent || "").trim().replace(/\s+/g, " ").slice(0, 100);
      const w = window as DataLayerWindow;
      const push = (event: Record<string, unknown>) => (w.dataLayer = w.dataLayer || []).push(event);

      const isContact = /^(mailto:|tel:)/i.test(href) || /#contact$/i.test(href) || /^(connect|contact)\b/i.test(text);
      if (isContact) {
        push({ event: "contact_click", link_url: link.href, link_text: text, link_placement: placement(link) });
        return;
      }
      let url: URL;
      try {
        url = new URL(link.href);
      } catch {
        return;
      }
      if (/^https?:$/.test(url.protocol) && url.host !== window.location.host) {
        push({ event: "outbound_click", link_url: url.href, link_domain: url.hostname, link_text: text, link_placement: placement(link) });
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
