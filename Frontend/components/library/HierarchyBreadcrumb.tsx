import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface HierarchyBreadcrumbProps {
  segments: BreadcrumbSegment[];
}

/**
 * Renders a breadcrumb trail for the materials hierarchy.
 *
 * The last segment is rendered as the current page (non-link).
 * All others are rendered as links.
 */
export function HierarchyBreadcrumb({ segments }: HierarchyBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/library">Library</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          return (
            <span key={i} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast || !seg.href ? (
                  <BreadcrumbPage>{seg.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={seg.href}>{seg.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
