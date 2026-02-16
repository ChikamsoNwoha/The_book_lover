import { Link } from "react-router-dom";
import { categories } from "../lib/categories";

type CategoryTabsProps = {
  activeSlug: string;
  onSelect?: (slug: string) => void;
  linkBase?: string;
  align?: "left" | "center";
  className?: string;
};

const normalizeSlug = (slug: string) => (slug === "all" ? "" : slug);

export default function CategoryTabs({
  activeSlug,
  onSelect,
  linkBase = "/",
  align = "left",
  className = "",
}: CategoryTabsProps) {
  const normalizedActive = normalizeSlug(activeSlug);
  const justify = align === "center" ? "justify-center" : "justify-start";

  return (
    <nav
      className={`flex flex-wrap gap-8 ${justify} text-[15px] font-['Raleway'] font-normal not-italic normal-case tracking-normal leading-[1.4em] text-gray-500 ${className}`}
      style={{ fontFamily: "'Raleway', sans-serif", fontVariant: "normal" }}
    >
      {categories.map((category) => {
        const isActive = normalizedActive === category.slug;
        const baseStyles =
          "pb-2 transition-colors duration-200 cursor-pointer no-underline";
        const activeStyles =
          "text-[color:var(--accent-brown)]";
        const inactiveStyles =
          "hover:text-[color:var(--accent-brown)]";

        if (onSelect) {
          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => onSelect(category.slug)}
              className={`${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
            >
              {category.name}
            </button>
          );
        }

        const href = category.slug
          ? `${linkBase}?category=${category.slug}`
          : linkBase;

        return (
          <Link
            key={category.slug}
            to={href}
            className={`${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}
