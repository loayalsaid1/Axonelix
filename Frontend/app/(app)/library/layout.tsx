import type { Metadata } from "next";
import { LibrarySidebar } from "@/components/library/LibrarySidebar";
import { LibraryLayoutWrapper } from "./LibraryLayoutWrapper";

export const metadata: Metadata = {
  title: {
    template: "%s | Library – Axonelix",
    default: "Library – Axonelix",
  },
};

/**
 * Library layout.
 *
 * The LibrarySidebar is rendered once here so it persists across all
 * library sub-routes without unmounting (no re-fetch on navigation).
 * The sidebar itself uses Suspense streaming for the tree data.
 */
export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LibraryLayoutWrapper sidebar={<LibrarySidebar />}>
      {children}
    </LibraryLayoutWrapper>
  );
}
