import { GenericBreadcrumb, BreadcrumbSegment } from "@/components/navigation/GenericBreadcrumb";

interface HierarchyBreadcrumbProps {
  segments: BreadcrumbSegment[];
}

export function HierarchyBreadcrumb({ segments }: HierarchyBreadcrumbProps) {
  return <GenericBreadcrumb initial={{ label: "Library", href: "/library" }} segments={segments} />;
}

export default HierarchyBreadcrumb;
