export type CategoryApiValue = "ALL" | "ENTREPRENEURSHIP" | "FASHION";

export const categories = [
  { name: "All Posts", slug: "", apiValue: "ALL" as const },
  {
    name: "Entrepreneurship Journeys",
    slug: "entrepreneurship-journeys",
    apiValue: "ENTREPRENEURSHIP" as const,
  },
  {
    name: "Fashion & Sewing",
    slug: "fashion-sewing",
    apiValue: "FASHION" as const,
  },
];

export const categoryLabel: Record<string, string> = {
  ENTREPRENEURSHIP: "Entrepreneurship Journeys",
  FASHION: "Fashion & Sewing",
};

export const categorySlugToApi = new Map<string, CategoryApiValue>(
  categories.map((category) => [category.slug, category.apiValue])
);

categorySlugToApi.set("all", "ALL");

export const categoryApiToSlug: Record<string, string> = {
  ENTREPRENEURSHIP: "entrepreneurship-journeys",
  FASHION: "fashion-sewing",
};

export const imageByCategory: Record<string, string> = {
  ENTREPRENEURSHIP: "/farmer.jpg",
  FASHION: "/linda-sewing.jpg",
};
