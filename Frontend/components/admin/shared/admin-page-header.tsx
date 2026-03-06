import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ReactNode } from 'react';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  actionLabel,
  onAction,
  icon = <Plus className="h-4 w-4" />,
  children,
  className = "mb-8"
}: AdminPageHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${className}`}>
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
  );
}
