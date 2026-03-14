"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Library } from "lucide-react";
import React from "react";

export function LibraryLayoutWrapper({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  // 📱 MOBILE VIEW: No Resizable Panels. Replaced natively with a clean column layout.
  if (isMobile) {
    return (
      <div className="flex flex-col h-full min-h-screen overflow-hidden">
        <header className="flex items-center gap-2 px-4 border-border border-b h-14 shrink-0">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 -ml-2">
                <Library className="size-4" />
                <span className="sr-only">Toggle Library Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="p-0 ">
              <SheetTitle className="sr-only">Library Navigation</SheetTitle>
              {/* SERVER COMPONENT RENDERED HERE */}
              {sidebar}
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    );
  }

  // 💻 DESKTOP VIEW: Uses Resizable Panels safely
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full min-h-screen">
      <ResizablePanel defaultSize={"300px"} minSize={250}>
        {/* SERVER COMPONENT RENDERED HERE */}
        {sidebar}
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel minSize={50}>
        <div className="flex flex-col h-full overflow-hidden">
          <header className="flex items-center gap-2 px-4 border-border border-b h-14 shrink-0">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
