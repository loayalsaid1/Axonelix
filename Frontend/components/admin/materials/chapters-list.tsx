'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, HelpCircle } from 'lucide-react';
import { useChapters } from '@/hooks/admin/use-chapters';
import { AdminEmptyState } from '@/components/admin/shared/admin-empty-state';
import { AdminLoadingGrid } from '@/components/admin/shared/admin-loading-grid';
import { AdminResourceCard } from '@/components/admin/shared/admin-resource-card';
import CreateChapterDialog from '@/components/admin/dialogs/create-chapter-dialog';
import EditChapterDialog from '@/components/admin/dialogs/edit-chapter-dialog';
import CreateLessonDialog from '@/components/admin/dialogs/create-lesson-dialog';

interface ChaptersListProps {
  moduleId: string;
  subjectId: string;
}

export function ChaptersList({ moduleId, subjectId }: ChaptersListProps) {
  const { chapters, loading, deleteChapter, refetch } = useChapters(subjectId);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateMiscLessonDialog, setShowCreateMiscLessonDialog] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;
    await deleteChapter(chapterId);
  };

  const handleLessonCreated = () => {
    setShowCreateMiscLessonDialog(false);
    refetch(); // Refetch chapters might show the new misc chapter if it was created
  };

  const handleChapterCreated = () => {
    setShowCreateDialog(false);
    refetch();
  };

  const handleEditChapter = (chapterId: string) => {
    setEditingChapterId(chapterId);
    setShowEditDialog(true);
  };

  const handleChapterUpdated = () => {
    setShowEditDialog(false);
    setEditingChapterId(null);
    refetch();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Chapters</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateMiscLessonDialog(true)} className="gap-2">
            <HelpCircle className="h-4 w-4" />
            New Misc Lesson
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Chapter
          </Button>
        </div>
      </div>

      <CreateChapterDialog
        subjectId={subjectId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onChapterCreated={handleChapterCreated}
      />

      <EditChapterDialog
        chapterId={editingChapterId}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onChapterUpdated={handleChapterUpdated}
      />

      <CreateLessonDialog
        subjectId={subjectId}
        isMisc={true}
        open={showCreateMiscLessonDialog}
        onOpenChange={setShowCreateMiscLessonDialog}
        onLessonCreated={handleLessonCreated}
      />

      {loading ? (
        <AdminLoadingGrid />
      ) : chapters.length === 0 ? (
        <AdminEmptyState
          title="No chapters yet"
          description="Create your first chapter to organize lessons"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter) => (
            <AdminResourceCard
              key={chapter.id}
              title={chapter.name}
              description={chapter.description ?? undefined}
              href={`/admin/materials/${moduleId}/${subjectId}/${chapter.id}`}
              date={new Date(chapter.createdAt).toLocaleDateString()}
              order={chapter.orderIndex ?? undefined}
              badge={
                chapter.isMiscellaneous && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 shrink-0">
                    Misc
                  </span>
                )
              }
              onEdit={() => handleEditChapter(chapter.id)}
              onDelete={() => handleDeleteChapter(chapter.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
