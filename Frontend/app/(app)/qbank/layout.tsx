import type { Metadata } from "next";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: {
    template: "%s | QBank – Axonelix",
    default: "QBank – Axonelix",
  },
};

export default function QBankLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col max-w-full min-h-screen overflow-hidden">
      <header className="flex items-center gap-2 px-4 border-b h-12 shrink-0">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <span className="font-medium text-muted-foreground text-sm">QBank</span>
      </header>
      <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto">{children}</main>
    </div>
  );
}
