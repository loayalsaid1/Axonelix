import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AdminEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AdminEmptyState({
  title,
  description,
  actionLabel,
  onAction
}: AdminEmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-12 bg-muted/30 border-dashed border-2">
      <CardHeader className="w-full p-0">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className=" mx-auto mt-2 text-base">
          {description}
        </CardDescription>
      </CardHeader>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6 gap-2" variant="outline">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
