import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';
import Link from 'next/link';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  backHref?: string;
  backLabel?: string;
}

export function AdminPageHeader({
  title,
  description,
  actionLabel,
  onAction,
  icon = <Plus className="h-4 w-4" />,
  children,
  className = "mb-8",
  backHref,
  backLabel = "Back"
}: AdminPageHeaderProps) {
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {backHref && (
        <Link
          href={backHref}
          className="flex items-center gap-2 text-sm font-medium shover:text-primary/80 transition-colors w-fit group"
        >
          <div className="p-1 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          {backLabel}
        </Link>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          {children}
          {actionLabel && onAction && (
            <Button onClick={onAction} className="gap-2">
              {icon}
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
