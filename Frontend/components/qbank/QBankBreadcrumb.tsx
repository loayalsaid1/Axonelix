import { GenericBreadcrumb, BreadcrumbSegment } from "@/components/navigation/GenericBreadcrumb";

interface QBankBreadcrumbProps {
  segments: BreadcrumbSegment[];
}

export function QBankBreadcrumb({ segments }: QBankBreadcrumbProps) {
  return <GenericBreadcrumb initial={{ label: "Qbank", href: "/qbank" }} segments={segments} />;
}

export default QBankBreadcrumb;
