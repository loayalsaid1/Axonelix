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

interface GenericBreadcrumbProps {
  initial?: BreadcrumbSegment;
  segments: BreadcrumbSegment[];
}

export function GenericBreadcrumb({ initial, segments }: GenericBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {initial ? (
          <BreadcrumbItem>
            {initial.href ? (
              <BreadcrumbLink asChild>
                <Link href={initial.href}>{initial.label}</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{initial.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ) : null}

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

export default GenericBreadcrumb;
