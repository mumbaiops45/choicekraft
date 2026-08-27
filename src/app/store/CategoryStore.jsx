"use client";

import { createContext, useContext, useMemo } from "react";
import useCategories from "../hooks/useCategories";

/**
 * Client-side category store.
 *
 * The root layout fetches categories on the server and hands them in as
 * `initialCategories`, so every client component reads the same list without
 * firing its own request. If that server fetch failed, the provider falls back
 * to loading them from the browser.
 */
const CategoryContext = createContext(null);

export function CategoryProvider({ initialCategories = [], children }) {
  const { categories, loading, error, refetch } = useCategories({
    initialData: initialCategories,
  });

  const value = useMemo(() => {
    const bySlug = new Map(categories.map((category) => [category.slug, category]));

    return {
      categories,
      loading,
      error,
      refetch,
      /** @returns {object|undefined} */
      getBySlug: (slug) => bySlug.get(slug),
      /** Everything except the given slug — "browse other categories" lists. */
      others: (slug) => categories.filter((category) => category.slug !== slug),
    };
  }, [categories, loading, error, refetch]);

  return (
    <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
  );
}

export function useCategoryStore() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategoryStore must be used inside a <CategoryProvider>");
  }
  return context;
}

export default CategoryContext;
