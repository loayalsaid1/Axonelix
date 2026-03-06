'use client';

import { useState } from 'react';
import { ModulesList } from '@/components/admin/materials/modules-list';
import { RecentMaterialsList } from '@/components/admin/materials/recent-materials-list';
import { Button } from '@/components/ui/button';
import { Plus, History } from 'lucide-react';
import QuickCreateLessonDialog from '@/components/admin/dialogs/quick-create-lesson-dialog';

export default function MaterialsPage() {
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showRecent, setShowRecent] = useState(true);

  return (
    <div className="p-8 space-y-8">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Materials</h1>
          <p className="text-muted-foreground mt-1">
            Manage your learning modules, subjects, chapters, and lessons
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowRecent(!showRecent)}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            {showRecent ? 'Hide' : 'Show'} Recent
          </Button>
          <Button onClick={() => setShowQuickCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Quick Create Lesson
          </Button>
        </div>
      </div>

      {/* Quick Create Dialog */}
      <QuickCreateLessonDialog
        open={showQuickCreate}
        onOpenChange={setShowQuickCreate}
        onLessonCreated={() => {
          // Optionally refresh recent materials here
        }}
      />

      {/* Recent Materials Section */}
      {showRecent && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recently Edited Lessons</h2>
          <RecentMaterialsList limit={6} />
        </div>
      )}

      {/* All Modules Section */}
      <div>
        <ModulesList />
      </div>
    </div>
  );
}
