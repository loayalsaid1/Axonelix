/**
 * Layout for the quiz session route.
 *
 * The session interface is full-screen (its own top bar) so we bypass the
 * standard QBank header by providing a bare layout here.  This file sits at
 * (app)/qbank/session/ which takes precedence over the parent qbank/layout.tsx
 * for routes under /qbank/session/...
 */
export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {children}
    </div>
  );
}
