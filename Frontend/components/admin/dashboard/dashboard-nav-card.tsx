import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardNavCardProps {
  href: string;
  title: string;
  description: string;
  content: string;
  footer?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'green' | 'default';
  className?: string;
}

const colorStyles = {
  default: {
    border: 'hover:border-gray-200',
    iconBg: 'bg-gray-100 group-hover:bg-gray-200',
    text: 'text-gray-600'
  },
  blue: {
    border: 'hover:border-blue-200',
    iconBg: 'bg-blue-100 group-hover:bg-blue-200',
    text: 'text-blue-600'
  },
  green: {
    border: 'hover:border-green-200',
    iconBg: 'bg-green-100 group-hover:bg-green-200',
    text: 'text-green-600'
  }
};

export function DashboardNavCard({
  href,
  title,
  description,
  content,
  footer,
  icon: Icon,
  variant = 'default',
  className
}: DashboardNavCardProps) {
  const styles = colorStyles[variant];

  return (
    <Link href={href} className={className}>
      <Card className={cn(
        "cursor-pointer hover:shadow-xl transition-all duration-300 h-full group",
        styles.border
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-xl">{title}</CardTitle>
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
              styles.iconBg
            )}>
              <Icon className={cn("h-6 w-6", styles.text)} />
            </div>
          </div>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {content}
          </p>
          {footer && (
            <div className={cn("mt-4 text-xs font-medium", styles.text)}>
              {footer}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
