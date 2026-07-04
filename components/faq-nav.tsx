"use client";

import { useEffect, useState } from "react";
import type { FaqCategory } from "@/lib/content/faq";

export function FaqNav({ categories }: { categories: FaqCategory[] }) {
  const [active, setActive] = useState(categories[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: [0, 0.2, 0.6] },
    );

    categories.forEach((category) => {
      const element = document.getElementById(category.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [categories]);

  return (
    <nav className="sticky top-24 hidden h-fit border-t border-ash pt-3 text-sm lg:block" aria-label="FAQ Themen">
      {categories.map((category) => (
        <a
          key={category.id}
          href={`#${category.id}`}
          className={`block rounded-md px-3 py-2 ${
            active === category.id ? "bg-mist font-medium text-ink" : "text-slate hover:bg-mist hover:text-ink"
          }`}
        >
          {category.title}
        </a>
      ))}
    </nav>
  );
}
