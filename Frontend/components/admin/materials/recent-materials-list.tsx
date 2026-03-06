'use client';

import { useRecentMaterials } from '@/hooks/admin/use-recent-materials';
import { AdminLoadingGrid } from '@/components/admin/shared/admin-loading-grid';
import { AdminEmptyState } from '@/components/admin/shared/admin-empty-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { buildMaterialUrl, getMaterialBreadcrumb } from '@/lib/admin-db';

interface RecentMaterialsListProps {
  limit?: number;
}

export function RecentMaterialsList({ limit = 10 }: RecentMaterialsListProps) {
  const { materials, loading } = useRecentMaterials(limit);

  if (loading) {
    return <AdminLoadingGrid count={6} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />;
  }

  if (materials.length === 0) {
    return (
      <AdminEmptyState
        title="No recent lessons"
        description="Recently edited lessons will appear here"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {materials.map((lesson) => {
        const url = buildMaterialUrl(lesson);
        const breadcrumb = getMaterialBreadcrumb(lesson);

        return (
          <Link key={lesson.id} href={url}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-2">
                  <div className="bg-orange-500 p-2 rounded-lg flex-shrink-0">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base line-clamp-1">{lesson.name}</CardTitle>
                    {breadcrumb && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{breadcrumb}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {lesson.description && (
                  <CardDescription className="text-sm line-clamp-2 mb-2">
                    {lesson.description}
                  </CardDescription>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Updated {new Date(lesson.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
