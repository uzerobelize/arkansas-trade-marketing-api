/**
 * Homepage single: content and section-visibility toggles for the blog
 * homepage (`/`).
 *
 * Every major homepage section is independently toggleable from the admin
 * without editing React. The editable copy (hero title, subtitle,
 * newsletter heading) also lives here so a non-developer can change the
 * homepage voice without a code push.
 */
import { defineSingle, text, textarea, checkbox, number, richText} from "nextly/config";

export const Homepage = defineSingle({
  slug: "homepage",
  access: {
    read: "anyone",
  },
  label: { singular: "Homepage" },
  fields: [
    textarea({ name: "heroTagline" }),
    text({ name: "heroHeadline", required: true }),
    textarea({ name: "heroSubheadline" }),
    text({ name: "heroCtaButtonText" }),

    checkbox({ name: "showFeaturedPost", defaultValue: true }),
    text({ name: "featuredSectionTitle", defaultValue: "Featured" }),
    checkbox({ name: "showLatestPosts", defaultValue: true }),
    text({ name: "latestSectionTitle", defaultValue: "Latest" }),
    number({ name: "latestPostsCount", defaultValue: 3 }),
    checkbox({ name: "showCategoryStrip", defaultValue: true }),
    checkbox({ name: "showNewsletterCta", defaultValue: true }),
    text({
      name: "newsletterHeading",
      defaultValue: "Get new posts in your inbox",
    }),
    text({
      name: "newsletterSubheading",
      defaultValue: "No spam. Unsubscribe anytime.",
    }),
  ],
});
