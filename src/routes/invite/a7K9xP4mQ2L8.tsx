import { createFileRoute } from "@tanstack/react-router";
import { weddingConfig } from "@/config/wedding";
import { NoorInvitation } from "@/invitation/noor/NoorInvitation";

const invitePath = "/invite/a7K9xP4mQ2L8";
const { siteUrl, shareImage } = weddingConfig.seo;
const shareMeta = siteUrl
  ? [
      { property: "og:url", content: `${siteUrl}${invitePath}` },
      { property: "og:image", content: `${siteUrl}${shareImage}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: weddingConfig.couple.displayName },
      { name: "twitter:image", content: `${siteUrl}${shareImage}` },
    ]
  : [];

export const Route = createFileRoute("/invite/a7K9xP4mQ2L8")({
  head: () => ({
    meta: [
      { title: weddingConfig.seo.title },
      { name: "description", content: weddingConfig.seo.description },
      { property: "og:title", content: weddingConfig.seo.title },
      { property: "og:description", content: weddingConfig.seo.ogDescription },
      { property: "og:type", content: "website" },
      ...shareMeta,
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#06150e" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
    links: ["door-left", "door-right", "seal"].map((name) => ({
      rel: "preload",
      as: "image",
      href: `/images/noor/${name}.webp`,
      type: "image/webp",
    })),
  }),
  component: NoorInvitation,
});
