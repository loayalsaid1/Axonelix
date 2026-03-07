import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AdminResourceCardProps {
  title: string;
  description?: string;
  href: string;
  date?: string;
  badge?: ReactNode;
  order?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function AdminResourceCard({
  title,
  description,
  href,
  date,
  badge,
  order,
  onEdit,
  onDelete,
  className
}: AdminResourceCardProps) {
  return (
    <Link href={href} className={className}>
      <Card className="group h-full flex flex-col hover:shadow-md transition-all duration-200 border-muted-foreground/20 hover:border-primary/50">
        <CardHeader className="flex-1">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            {badge && (
              <div className="shrink-0">
                {badge}
              </div>
            )}
          </div>
          {description && (
            <CardDescription className="line-clamp-2 mt-2">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between border-t pt-4 mt-2">
            <div className="flex flex-col gap-1">
              {order !== undefined && (
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Order: {order}
                </span>
              )}
              {date && (
                <span className="text-xs text-muted-foreground">
                  {date}
                </span>
              )}
            </div>
            <div className="flex gap-1" onClick={(e) => e.preventDefault()}>
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit();
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
