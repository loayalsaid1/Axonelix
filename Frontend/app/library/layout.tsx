import type { Metadata } from "next";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { LibrarySidebar } from "@/components/library/LibrarySidebar";

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
    <div className="flex h-full min-h-screen">
      <LibrarySidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar with sidebar trigger (for mobile) */}
        <header className="flex items-center gap-2 px-4 border-border border-b h-14 shrink-0">
          <SidebarTrigger className="md:hidden -ml-1" />
          <Separator
            orientation="vertical"
            className="md:hidden mr-2 h-4 data-[orientation=vertical]:h-4"
          />
          {/* Breadcrumb injected per-page via slot pattern — children render their own */}
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
