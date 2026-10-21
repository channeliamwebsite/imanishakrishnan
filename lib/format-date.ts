const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/**
 * "2024-03-12" → "12 Mar 2024"; a year on its own ("2024") stays "2024". Shared by server and
 * client components (it must not live in a "use client" module).
 */
export const formatDate = (iso?: string) =>
  iso && /^\d{4}$/.test(iso.trim())
    ? iso.trim()
    : iso && !Number.isNaN(Date.parse(iso))
      ? dateFormat.format(new Date(iso))
      : undefined;
